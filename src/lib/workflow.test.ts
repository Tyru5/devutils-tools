import { afterAll, beforeEach, describe, expect, test } from "bun:test";
import {
  clearWorkflows,
  decodeWorkflowFromUrl,
  deleteWorkflow,
  encodeWorkflowToUrl,
  executeTransform,
  executeWorkflow,
  getWorkflows,
  saveWorkflow,
  transforms,
  type TransformType,
  type Workflow,
} from "./workflow";

const transformCases: Array<[TransformType, string, string]> = [
  ["base64-encode", "✓ à la mode", "4pyTIMOgIGxhIG1vZGU="],
  ["base64-decode", "4pyTIMOgIGxhIG1vZGU=", "✓ à la mode"],
  ["url-encode", "a b+c", "a%20b%2Bc"],
  ["url-decode", "a%20b%2Bc", "a b+c"],
  ["json-format", '{"b":2,"a":1}', '{\n  "b": 2,\n  "a": 1\n}'],
  ["json-minify", '{ "a": 1 }', '{"a":1}'],
  ["json-parse", '"{\\"a\\":1}"', '{\n  "a": 1\n}'],
  ["html-encode", '<p title="a&b">', '&lt;p title="a&amp;b"&gt;'],
  ["html-decode", "&lt;p&gt;&#x1F600;&#33;&lt;/p&gt;", "<p>😀!</p>"],
  ["hash-md5", "hello", "5d41402abc4b2a76b9719d911017c592"],
  ["hash-sha1", "hello", "aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d"],
  [
    "hash-sha256",
    "hello",
    "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
  ],
  [
    "hash-sha512",
    "hello",
    "9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043",
  ],
  ["uppercase", "Hello", "HELLO"],
  ["lowercase", "Hello", "hello"],
  ["trim", "  hello\n", "hello"],
  ["reverse", "A😀B", "B😀A"],
  ["escape", 'a\n"b"\\', 'a\\n\\"b\\"\\\\'],
  ["unescape", 'a\\n\\"b\\"\\\\', 'a\n"b"\\'],
  [
    "jwt-decode",
    "eyJhbGciOiJub25lIn0.eyJzdWIiOiIxMjMifQ.",
    '{\n  "sub": "123"\n}',
  ],
  ["yaml-to-json", "a: 1", '{\n  "a": 1\n}'],
  ["json-to-yaml", '{"a":1}', "a: 1\n"],
  ["csv-to-json", "a,b\n1,2\n", '[\n  {\n    "a": "1",\n    "b": "2"\n  }\n]'],
  ["toml-to-json", "a = 1", '{\n  "a": 1\n}'],
  ["json-to-toml", '{"a":1}', "a = 1\n"],
];

describe("workflow transforms", () => {
  test("has a regression case for every registered transform", () => {
    expect(transformCases.map(([id]) => id).sort()).toEqual(
      transforms.map(({ id }) => id).sort(),
    );
  });

  for (const [id, input, expected] of transformCases) {
    test(id, async () => {
      expect(await executeTransform(id, input)).toBe(expected);
    });
  }

  test("accepts one-column CSV and blank lines", async () => {
    await expect(
      executeTransform("csv-to-json", "name\nAda\n\nLinus\n"),
    ).resolves.toBe(
      '[\n  {\n    "name": "Ada"\n  },\n  {\n    "name": "Linus"\n  }\n]',
    );
  });

  test("rejects malformed CSV", async () => {
    await expect(
      executeTransform("csv-to-json", 'a,b\n"unterminated,2'),
    ).rejects.toThrow();
  });

  test("reports invalid input instead of returning misleading output", async () => {
    await expect(executeTransform("json-format", "not json")).rejects.toThrow();
    await expect(executeTransform("base64-decode", "%%%")).rejects.toThrow();
    await expect(executeTransform("jwt-decode", "not-a-jwt")).rejects.toThrow(
      "Invalid JWT format",
    );
  });

  test("escape and unescape round trip ambiguous literal sequences", async () => {
    const input = 'literal \\n and \\t, quote " and trailing \\';
    const escaped = await executeTransform("escape", input);
    expect(await executeTransform("unescape", escaped)).toBe(input);
  });

  test("rejects non-finite YAML and TOML values that JSON cannot represent", async () => {
    await expect(
      executeTransform("yaml-to-json", "value: .inf"),
    ).rejects.toThrow("non-finite");
    await expect(
      executeTransform("toml-to-json", "value = inf"),
    ).rejects.toThrow("non-finite");
  });
});

describe("workflow execution", () => {
  test("passes each output to the next transform", async () => {
    const result = await executeWorkflow(
      [
        { id: "1", transformId: "trim" },
        { id: "2", transformId: "uppercase" },
      ],
      "  hello  ",
    );

    expect(result).toEqual([
      { id: "1", transformId: "trim", output: "hello" },
      { id: "2", transformId: "uppercase", output: "HELLO" },
    ]);
  });

  test("preserves an empty successful output", async () => {
    expect(
      await executeWorkflow([{ id: "1", transformId: "trim" }], "   "),
    ).toEqual([{ id: "1", transformId: "trim", output: "" }]);
  });

  test("stops at the first error and clears stale results", async () => {
    const result = await executeWorkflow(
      [
        { id: "1", transformId: "uppercase", output: "STALE" },
        { id: "2", transformId: "json-format", output: "STALE" },
        { id: "3", transformId: "lowercase", output: "STALE" },
      ],
      "not json",
    );

    expect(result[0].output).toBe("NOT JSON");
    expect(result[1].error).toBeString();
    expect(result[2]).toEqual({ id: "3", transformId: "lowercase" });
  });
});

describe("workflow sharing", () => {
  test("round trips registered transform IDs", () => {
    const steps = transforms.map(({ id }, index) => ({
      id: String(index),
      transformId: id,
    }));
    expect(decodeWorkflowFromUrl(encodeWorkflowToUrl(steps))).toEqual(
      steps.map(({ transformId }) => transformId),
    );
  });

  test("rejects malformed, empty, and unknown transform chains", () => {
    expect(decodeWorkflowFromUrl("not-base64")).toEqual([]);
    expect(decodeWorkflowFromUrl(btoa("[]"))).toEqual([]);
    expect(decodeWorkflowFromUrl(btoa('["not-a-transform"]'))).toEqual([]);
    expect(decodeWorkflowFromUrl(btoa('["trim",null]'))).toEqual([]);
  });
});

class MemoryStorage {
  data = new Map<string, string>();

  getItem(key: string) {
    return this.data.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.data.set(key, value);
  }

  removeItem(key: string) {
    this.data.delete(key);
  }
}

const originalWindow = globalThis.window;
const originalLocalStorage = globalThis.localStorage;
let storage: MemoryStorage;

describe("saved workflows", () => {
  beforeEach(() => {
    storage = new MemoryStorage();
    Object.defineProperty(globalThis, "window", {
      value: {},
      configurable: true,
    });
    Object.defineProperty(globalThis, "localStorage", {
      value: storage,
      configurable: true,
    });
  });

  afterAll(() => {
    Object.defineProperty(globalThis, "window", {
      value: originalWindow,
      configurable: true,
    });
    Object.defineProperty(globalThis, "localStorage", {
      value: originalLocalStorage,
      configurable: true,
    });
  });

  test("saves, updates, deletes, and clears workflows", () => {
    const workflow: Workflow = {
      id: "workflow-1",
      name: "Example",
      steps: [{ id: "step-1", transformId: "trim" }],
      createdAt: 1,
      updatedAt: 1,
    };

    saveWorkflow(workflow);
    expect(getWorkflows()).toEqual([workflow]);

    saveWorkflow({ ...workflow, name: "Updated" });
    expect(getWorkflows()).toHaveLength(1);
    expect(getWorkflows()[0].name).toBe("Updated");

    deleteWorkflow(workflow.id);
    expect(getWorkflows()).toEqual([]);

    saveWorkflow(workflow);
    clearWorkflows();
    expect(getWorkflows()).toEqual([]);
  });

  test("rejects corrupted and unsupported saved data", () => {
    storage.setItem("devutils-workflows", "not json");
    expect(() => getWorkflows()).toThrow("invalid data");

    storage.setItem(
      "devutils-workflows",
      JSON.stringify([
        {
          id: "workflow-1",
          name: "Bad",
          steps: [{ id: "step-1", transformId: "removed-transform" }],
          createdAt: 1,
          updatedAt: 1,
        },
      ]),
    );
    expect(() => getWorkflows()).toThrow("no longer supported");
  });

  test("surfaces storage write failures", () => {
    storage.setItem = () => {
      throw new Error("Quota exceeded");
    };
    expect(() =>
      saveWorkflow({
        id: "workflow-1",
        name: "Example",
        steps: [{ id: "step-1", transformId: "trim" }],
        createdAt: 1,
        updatedAt: 1,
      }),
    ).toThrow("Quota exceeded");
  });
});
