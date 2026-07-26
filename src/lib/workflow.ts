export type TransformType =
  | "base64-encode"
  | "base64-decode"
  | "url-encode"
  | "url-decode"
  | "json-format"
  | "json-minify"
  | "json-parse"
  | "html-encode"
  | "html-decode"
  | "hash-md5"
  | "hash-sha1"
  | "hash-sha256"
  | "hash-sha512"
  | "uppercase"
  | "lowercase"
  | "trim"
  | "reverse"
  | "escape"
  | "unescape"
  | "jwt-decode"
  | "yaml-to-json"
  | "json-to-yaml"
  | "csv-to-json"
  | "toml-to-json"
  | "json-to-toml";

export interface Transform {
  id: TransformType;
  name: string;
  description: string;
  category: "encode" | "decode" | "format" | "hash" | "text" | "convert";
  inputType: "text" | "json" | "any";
  outputType: "text" | "json" | "any";
}

export const transforms: Transform[] = [
  {
    id: "base64-encode",
    name: "Base64 Encode",
    description: "Encode text to Base64",
    category: "encode",
    inputType: "text",
    outputType: "text",
  },
  {
    id: "base64-decode",
    name: "Base64 Decode",
    description: "Decode Base64 to text",
    category: "decode",
    inputType: "text",
    outputType: "text",
  },
  {
    id: "url-encode",
    name: "URL Encode",
    description: "Encode special URL characters",
    category: "encode",
    inputType: "text",
    outputType: "text",
  },
  {
    id: "url-decode",
    name: "URL Decode",
    description: "Decode URL-encoded string",
    category: "decode",
    inputType: "text",
    outputType: "text",
  },
  {
    id: "json-format",
    name: "JSON Format",
    description: "Format JSON with indentation",
    category: "format",
    inputType: "json",
    outputType: "json",
  },
  {
    id: "json-minify",
    name: "JSON Minify",
    description: "Minify JSON (remove whitespace)",
    category: "format",
    inputType: "json",
    outputType: "json",
  },
  {
    id: "json-parse",
    name: "JSON Parse",
    description: "Parse JSON string (for escaped JSON)",
    category: "format",
    inputType: "text",
    outputType: "json",
  },
  {
    id: "html-encode",
    name: "HTML Encode",
    description: "Encode HTML entities",
    category: "encode",
    inputType: "text",
    outputType: "text",
  },
  {
    id: "html-decode",
    name: "HTML Decode",
    description: "Decode HTML entities",
    category: "decode",
    inputType: "text",
    outputType: "text",
  },
  {
    id: "hash-md5",
    name: "MD5 Hash",
    description: "Generate MD5 hash",
    category: "hash",
    inputType: "text",
    outputType: "text",
  },
  {
    id: "hash-sha1",
    name: "SHA-1 Hash",
    description: "Generate SHA-1 hash",
    category: "hash",
    inputType: "text",
    outputType: "text",
  },
  {
    id: "hash-sha256",
    name: "SHA-256 Hash",
    description: "Generate SHA-256 hash",
    category: "hash",
    inputType: "text",
    outputType: "text",
  },
  {
    id: "hash-sha512",
    name: "SHA-512 Hash",
    description: "Generate SHA-512 hash",
    category: "hash",
    inputType: "text",
    outputType: "text",
  },
  {
    id: "uppercase",
    name: "Uppercase",
    description: "Convert to uppercase",
    category: "text",
    inputType: "text",
    outputType: "text",
  },
  {
    id: "lowercase",
    name: "Lowercase",
    description: "Convert to lowercase",
    category: "text",
    inputType: "text",
    outputType: "text",
  },
  {
    id: "trim",
    name: "Trim",
    description: "Remove leading/trailing whitespace",
    category: "text",
    inputType: "text",
    outputType: "text",
  },
  {
    id: "reverse",
    name: "Reverse",
    description: "Reverse the string",
    category: "text",
    inputType: "text",
    outputType: "text",
  },
  {
    id: "escape",
    name: "Escape String",
    description: "Escape special characters",
    category: "encode",
    inputType: "text",
    outputType: "text",
  },
  {
    id: "unescape",
    name: "Unescape String",
    description: "Unescape special characters",
    category: "decode",
    inputType: "text",
    outputType: "text",
  },
  {
    id: "jwt-decode",
    name: "JWT Decode",
    description: "Decode JWT payload",
    category: "decode",
    inputType: "text",
    outputType: "json",
  },
  {
    id: "yaml-to-json",
    name: "YAML to JSON",
    description: "Convert YAML to JSON",
    category: "convert",
    inputType: "text",
    outputType: "json",
  },
  {
    id: "json-to-yaml",
    name: "JSON to YAML",
    description: "Convert JSON to YAML",
    category: "convert",
    inputType: "json",
    outputType: "text",
  },
  {
    id: "csv-to-json",
    name: "CSV to JSON",
    description: "Convert CSV to JSON array",
    category: "convert",
    inputType: "text",
    outputType: "json",
  },
  {
    id: "toml-to-json",
    name: "TOML to JSON",
    description: "Convert TOML to JSON",
    category: "convert",
    inputType: "text",
    outputType: "json",
  },
  {
    id: "json-to-toml",
    name: "JSON to TOML",
    description: "Convert JSON to TOML",
    category: "convert",
    inputType: "json",
    outputType: "text",
  },
];

const transformIds = new Set<TransformType>(
  transforms.map((transform) => transform.id),
);

function isTransformType(value: unknown): value is TransformType {
  return typeof value === "string" && transformIds.has(value as TransformType);
}

export interface WorkflowStep {
  id: string;
  transformId: TransformType;
  output?: string;
  error?: string;
}

export interface Workflow {
  id: string;
  name: string;
  steps: WorkflowStep[];
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = "devutils-workflows";

function isWorkflow(value: unknown): value is Workflow {
  if (typeof value !== "object" || value === null) return false;

  const workflow = value as Partial<Workflow>;
  return (
    typeof workflow.id === "string" &&
    workflow.id.length > 0 &&
    typeof workflow.name === "string" &&
    workflow.name.length > 0 &&
    typeof workflow.createdAt === "number" &&
    Number.isFinite(workflow.createdAt) &&
    typeof workflow.updatedAt === "number" &&
    Number.isFinite(workflow.updatedAt) &&
    Array.isArray(workflow.steps) &&
    workflow.steps.length > 0 &&
    workflow.steps.every(
      (step) =>
        typeof step === "object" &&
        step !== null &&
        typeof step.id === "string" &&
        step.id.length > 0 &&
        isTransformType(step.transformId) &&
        (step.output === undefined || typeof step.output === "string") &&
        (step.error === undefined || typeof step.error === "string"),
    )
  );
}

export function generateId(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function getWorkflows(): Workflow[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(data);
  } catch {
    throw new Error("Saved workflows contain invalid data.");
  }

  if (!Array.isArray(parsed) || !parsed.every(isWorkflow)) {
    throw new Error("Saved workflows are corrupted or no longer supported.");
  }
  return parsed;
}

export function saveWorkflow(workflow: Workflow): void {
  const workflows = getWorkflows();
  const index = workflows.findIndex((w) => w.id === workflow.id);
  if (index >= 0) {
    workflows[index] = { ...workflow, updatedAt: Date.now() };
  } else {
    workflows.push(workflow);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workflows));
}

export function deleteWorkflow(id: string): void {
  const workflows = getWorkflows().filter((w) => w.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workflows));
}

export function clearWorkflows(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function encodeWorkflowToUrl(steps: WorkflowStep[]): string {
  const transformIds = steps.map((s) => s.transformId);
  const encoded = btoa(JSON.stringify(transformIds));
  return encoded;
}

export function decodeWorkflowFromUrl(encoded: string): TransformType[] {
  try {
    const decoded = atob(encoded);
    const parsed: unknown = JSON.parse(decoded);
    return Array.isArray(parsed) &&
      parsed.length > 0 &&
      parsed.every(isTransformType)
      ? parsed
      : [];
  } catch {
    return [];
  }
}

async function hashText(
  text: string,
  algorithm: "MD5" | "SHA-1" | "SHA-256" | "SHA-512",
): Promise<string> {
  if (algorithm === "MD5") {
    const { md5 } = await import("./md5");
    return md5(text);
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function unescapeString(input: string): string {
  const escapeCharacters: Record<string, string> = {
    '"': '"',
    n: "\n",
    r: "\r",
    t: "\t",
    "\\": "\\",
  };
  let result = "";

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    const escaped = input[index + 1];
    if (
      character === "\\" &&
      escaped !== undefined &&
      escaped in escapeCharacters
    ) {
      result += escapeCharacters[escaped];
      index += 1;
    } else {
      result += character;
    }
  }

  return result;
}

function stringifyFiniteJson(value: unknown): string {
  const json = JSON.stringify(
    value,
    (_, nestedValue: unknown) => {
      if (typeof nestedValue === "number" && !Number.isFinite(nestedValue)) {
        throw new Error("JSON cannot represent non-finite numbers");
      }
      return nestedValue;
    },
    2,
  );
  if (json === undefined)
    throw new Error("Value cannot be represented as JSON");
  return json;
}

export async function executeTransform(
  transformId: TransformType,
  input: string,
): Promise<string> {
  switch (transformId) {
    case "base64-encode": {
      const bytes = new TextEncoder().encode(input);
      const binString = Array.from(bytes, (b) => String.fromCodePoint(b)).join(
        "",
      );
      return btoa(binString);
    }

    case "base64-decode": {
      const binString = atob(input.trim());
      const bytes = Uint8Array.from(binString, (c) => c.charCodeAt(0));
      return new TextDecoder().decode(bytes);
    }

    case "url-encode":
      return encodeURIComponent(input);

    case "url-decode":
      return decodeURIComponent(input);

    case "json-format":
      return JSON.stringify(JSON.parse(input), null, 2);

    case "json-minify":
      return JSON.stringify(JSON.parse(input));

    case "json-parse": {
      const parsed = JSON.parse(input);
      const unwrapped =
        typeof parsed === "string" ? JSON.parse(parsed) : parsed;
      return JSON.stringify(unwrapped, null, 2);
    }

    case "html-encode": {
      return input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }

    case "html-decode": {
      const htmlEntities: Record<string, string> = {
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&quot;": '"',
        "&#39;": "'",
        "&apos;": "'",
        "&nbsp;": "\u00A0",
      };
      let result = input;
      for (const [entity, char] of Object.entries(htmlEntities)) {
        result = result.split(entity).join(char);
      }
      result = result.replace(/&#(\d+);/g, (_, code) =>
        String.fromCodePoint(parseInt(code, 10)),
      );
      result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, code) =>
        String.fromCodePoint(parseInt(code, 16)),
      );
      return result;
    }

    case "hash-md5":
      return hashText(input, "MD5");

    case "hash-sha1":
      return hashText(input, "SHA-1");

    case "hash-sha256":
      return hashText(input, "SHA-256");

    case "hash-sha512":
      return hashText(input, "SHA-512");

    case "uppercase":
      return input.toUpperCase();

    case "lowercase":
      return input.toLowerCase();

    case "trim":
      return input.trim();

    case "reverse":
      return Array.from(input).reverse().join("");

    case "escape":
      return input
        .replace(/\\/g, "\\\\")
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r")
        .replace(/\t/g, "\\t")
        .replace(/"/g, '\\"');

    case "unescape":
      return unescapeString(input);

    case "jwt-decode": {
      const parts = input.trim().split(".");
      if (parts.length !== 3) throw new Error("Invalid JWT format");
      const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const padded = payload.padEnd(
        payload.length + ((4 - (payload.length % 4)) % 4),
        "=",
      );
      const decoded = new TextDecoder().decode(
        Uint8Array.from(atob(padded), (c) => c.charCodeAt(0)),
      );
      return JSON.stringify(JSON.parse(decoded), null, 2);
    }

    case "yaml-to-json": {
      const YAML = await import("yaml");
      const parsed = YAML.parse(input);
      return stringifyFiniteJson(parsed);
    }

    case "json-to-yaml": {
      const YAML = await import("yaml");
      const parsed = JSON.parse(input);
      return YAML.stringify(parsed);
    }

    case "csv-to-json": {
      const Papa = await import("papaparse");
      const result = Papa.default.parse(input, {
        header: true,
        delimiter: ",",
        skipEmptyLines: true,
      });
      if (result.errors.length > 0) {
        throw new Error(result.errors.map((error) => error.message).join("; "));
      }
      return JSON.stringify(result.data, null, 2);
    }

    case "toml-to-json": {
      const TOML = await import("smol-toml");
      const parsed = TOML.parse(input);
      return stringifyFiniteJson(parsed);
    }

    case "json-to-toml": {
      const TOML = await import("smol-toml");
      const parsed = JSON.parse(input);
      return TOML.stringify(parsed);
    }

    default:
      throw new Error(`Unknown transform: ${transformId}`);
  }
}

export function getTransformById(id: TransformType): Transform | undefined {
  return transforms.find((t) => t.id === id);
}

export async function executeWorkflow(
  steps: WorkflowStep[],
  input: string,
): Promise<WorkflowStep[]> {
  let currentInput = input;
  const results: WorkflowStep[] = steps.map(({ id, transformId }) => ({
    id,
    transformId,
  }));

  for (let index = 0; index < results.length; index += 1) {
    try {
      const output = await executeTransform(
        results[index].transformId,
        currentInput,
      );
      results[index] = { ...results[index], output };
      currentInput = output;
    } catch (error) {
      results[index] = {
        ...results[index],
        error: error instanceof Error ? error.message : "Transform failed",
      };
      break;
    }
  }

  return results;
}

export function getTransformsByCategory(
  category: Transform["category"],
): Transform[] {
  return transforms.filter((t) => t.category === category);
}
