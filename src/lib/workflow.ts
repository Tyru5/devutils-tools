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

export function generateId(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function getWorkflows(): Workflow[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
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

export function encodeWorkflowToUrl(steps: WorkflowStep[]): string {
  const transformIds = steps.map((s) => s.transformId);
  const encoded = btoa(JSON.stringify(transformIds));
  return encoded;
}

export function decodeWorkflowFromUrl(encoded: string): TransformType[] {
  try {
    const decoded = atob(encoded);
    return JSON.parse(decoded);
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

export async function executeTransform(
  transformId: TransformType,
  input: string,
): Promise<string> {
  switch (transformId) {
    case "base64-encode":
      return btoa(unescape(encodeURIComponent(input)));

    case "base64-decode":
      return decodeURIComponent(escape(atob(input.trim())));

    case "url-encode":
      return encodeURIComponent(input);

    case "url-decode":
      return decodeURIComponent(input);

    case "json-format":
      return JSON.stringify(JSON.parse(input), null, 2);

    case "json-minify":
      return JSON.stringify(JSON.parse(input));

    case "json-parse":
      return JSON.stringify(JSON.parse(input), null, 2);

    case "html-encode": {
      const div = document.createElement("div");
      div.textContent = input;
      return div.innerHTML;
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
        String.fromCharCode(parseInt(code, 10)),
      );
      result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, code) =>
        String.fromCharCode(parseInt(code, 16)),
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
      return input.split("").reverse().join("");

    case "escape":
      return input
        .replace(/\\/g, "\\\\")
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r")
        .replace(/\t/g, "\\t")
        .replace(/"/g, '\\"');

    case "unescape":
      return input
        .replace(/\\"/g, '"')
        .replace(/\\t/g, "\t")
        .replace(/\\r/g, "\r")
        .replace(/\\n/g, "\n")
        .replace(/\\\\/g, "\\");

    case "jwt-decode": {
      const parts = input.trim().split(".");
      if (parts.length !== 3) throw new Error("Invalid JWT format");
      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
      return JSON.stringify(JSON.parse(decoded), null, 2);
    }

    case "yaml-to-json": {
      const YAML = await import("yaml");
      const parsed = YAML.parse(input);
      return JSON.stringify(parsed, null, 2);
    }

    case "json-to-yaml": {
      const YAML = await import("yaml");
      const parsed = JSON.parse(input);
      return YAML.stringify(parsed);
    }

    case "csv-to-json": {
      const Papa = await import("papaparse");
      const result = Papa.default.parse(input, { header: true });
      return JSON.stringify(result.data, null, 2);
    }

    case "toml-to-json": {
      const TOML = await import("smol-toml");
      const parsed = TOML.parse(input);
      return JSON.stringify(parsed, null, 2);
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

export function getTransformsByCategory(
  category: Transform["category"],
): Transform[] {
  return transforms.filter((t) => t.category === category);
}
