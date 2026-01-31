import { useState, useCallback } from "react";
import Textarea from "./shared/Textarea";
import CopyButton from "./shared/CopyButton";

interface ConversionOptions {
  rootName: string;
  useExport: boolean;
  useReadonly: boolean;
  useType: boolean;
  optionalProperties: boolean;
}

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

interface GeneratedInterface {
  name: string;
  properties: { key: string; type: string }[];
}

interface InferTypeOptions {
  value: JsonValue;
  key: string;
  interfaces: Map<string, GeneratedInterface>;
  parentPath: string;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function sanitizePropertyName(key: string): string {
  // Check if the key needs to be quoted (contains special chars or starts with number)
  if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)) {
    return key;
  }
  return `"${key.replace(/"/g, '\\"')}"`;
}

function sanitizeInterfaceName(name: string): string {
  // Remove invalid characters and ensure it starts with a letter
  let sanitized = name.replace(/[^a-zA-Z0-9_]/g, "");
  if (/^[0-9]/.test(sanitized)) {
    sanitized = "_" + sanitized;
  }
  return capitalize(sanitized) || "UnnamedType";
}

function inferType({
  value,
  key,
  interfaces,
  parentPath,
}: InferTypeOptions): string {
  if (value === null) {
    return "null";
  }

  if (typeof value === "string") {
    return "string";
  }

  if (typeof value === "number") {
    return "number";
  }

  if (typeof value === "boolean") {
    return "boolean";
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "unknown[]";
    }

    // Collect all types in the array
    const elementTypes = new Set<string>();
    const objectShapes: { [key: string]: JsonValue }[] = [];

    for (const item of value) {
      if (item !== null && typeof item === "object" && !Array.isArray(item)) {
        objectShapes.push(item);
      } else {
        elementTypes.add(inferType({ value: item, key, interfaces, parentPath }));
      }
    }

    // If we have objects, merge them into a single interface
    if (objectShapes.length > 0) {
      const mergedShape = mergeObjectShapes(objectShapes);
      const interfaceName = sanitizeInterfaceName(key);
      const uniqueName = getUniqueInterfaceName(interfaceName, interfaces);

      const properties: { key: string; type: string }[] = [];
      for (const [propKey, propValues] of Object.entries(mergedShape)) {
        // Infer types for all values and deduplicate
        const propTypes = new Set<string>();
        for (const val of propValues) {
          propTypes.add(inferType({ value: val, key: propKey, interfaces, parentPath: `${parentPath}.${key}` }));
        }
        const typeArray = Array.from(propTypes);
        const propType = typeArray.length === 1 ? typeArray[0] : typeArray.join(" | ");
        properties.push({ key: propKey, type: propType });
      }

      interfaces.set(uniqueName, { name: uniqueName, properties });
      elementTypes.add(uniqueName);
    }

    const typesArray = Array.from(elementTypes);
    if (typesArray.length === 1) {
      return `${typesArray[0]}[]`;
    }
    return `(${typesArray.join(" | ")})[]`;
  }

  if (typeof value === "object") {
    const interfaceName = sanitizeInterfaceName(key);
    const uniqueName = getUniqueInterfaceName(interfaceName, interfaces);

    const properties: { key: string; type: string }[] = [];
    for (const [propKey, propValue] of Object.entries(value)) {
      properties.push({
        key: propKey,
        type: inferType({
          value: propValue,
          key: propKey,
          interfaces,
          parentPath: `${parentPath}.${key}`,
        }),
      });
    }

    interfaces.set(uniqueName, { name: uniqueName, properties });
    return uniqueName;
  }

  return "unknown";
}

function mergeObjectShapes(
  shapes: { [key: string]: JsonValue }[]
): { [key: string]: JsonValue[] } {
  const merged: { [key: string]: JsonValue[] } = {};

  for (const shape of shapes) {
    for (const [key, value] of Object.entries(shape)) {
      if (!(key in merged)) {
        merged[key] = [value];
      } else {
        merged[key].push(value);
      }
    }
  }

  return merged;
}

function getUniqueInterfaceName(
  baseName: string,
  interfaces: Map<string, GeneratedInterface>
): string {
  if (!interfaces.has(baseName)) {
    return baseName;
  }

  let counter = 2;
  while (interfaces.has(`${baseName}${counter}`)) {
    counter++;
  }
  return `${baseName}${counter}`;
}

function generateTypeScript(
  json: JsonValue,
  options: ConversionOptions
): string {
  const interfaces = new Map<string, GeneratedInterface>();

  // Start inference from the root
  const rootType = inferType({ value: json, key: options.rootName, interfaces, parentPath: "" });

  // Build the output
  const lines: string[] = [];
  const prefix = options.useExport ? "export " : "";
  const readonly = options.useReadonly ? "readonly " : "";
  const optional = options.optionalProperties ? "?" : "";

  // Output nested interfaces first (in reverse order of discovery for proper dependency order)
  const interfaceList = Array.from(interfaces.values()).reverse();

  // Filter out the root interface to add it last
  const rootInterface = interfaceList.find((i) => i.name === options.rootName);
  const nestedInterfaces = interfaceList.filter(
    (i) => i.name !== options.rootName
  );

  for (const iface of nestedInterfaces) {
    if (options.useType) {
      lines.push(`${prefix}type ${iface.name} = {`);
    } else {
      lines.push(`${prefix}interface ${iface.name} {`);
    }

    for (const prop of iface.properties) {
      const propName = sanitizePropertyName(prop.key);
      lines.push(`  ${readonly}${propName}${optional}: ${prop.type};`);
    }

    lines.push("}");
    lines.push("");
  }

  // Handle root type
  if (rootInterface) {
    if (options.useType) {
      lines.push(`${prefix}type ${rootInterface.name} = {`);
    } else {
      lines.push(`${prefix}interface ${rootInterface.name} {`);
    }

    for (const prop of rootInterface.properties) {
      const propName = sanitizePropertyName(prop.key);
      lines.push(`  ${readonly}${propName}${optional}: ${prop.type};`);
    }

    lines.push("}");
  } else if (typeof json !== "object" || json === null || Array.isArray(json)) {
    // Root is a primitive or array, create a type alias
    lines.push(`${prefix}type ${options.rootName} = ${rootType};`);
  }

  return lines.join("\n");
}

export default function JsonToTypescript() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<ConversionOptions>({
    rootName: "Root",
    useExport: false,
    useReadonly: false,
    useType: false,
    optionalProperties: false,
  });

  const convert = useCallback(() => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const typescript = generateTypeScript(parsed, options);
      setOutput(typescript);
      setError(null);
    } catch (e) {
      if (e instanceof SyntaxError) {
        setError(`Invalid JSON: ${e.message}`);
      } else {
        setError(e instanceof Error ? e.message : "Conversion failed");
      }
      setOutput("");
    }
  }, [input, options]);

  const clear = () => {
    setInput("");
    setOutput("");
    setError(null);
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    if (error) setError(null);
  };

  const updateOption = <K extends keyof ConversionOptions>(
    key: K,
    value: ConversionOptions[K]
  ) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Textarea
          value={input}
          onChange={handleInputChange}
          placeholder="Paste your JSON here..."
          label="JSON Input"
          rows={14}
          className={error ? "border-red-500 dark:border-red-500" : ""}
        />
        <Textarea
          value={output}
          readOnly
          placeholder="TypeScript interfaces will appear here..."
          label="TypeScript Output"
          rows={14}
        />
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button onClick={convert} className="btn btn-primary">
          Convert
        </button>
        <CopyButton text={output} disabled={!output} />
        <button onClick={clear} className="btn btn-ghost">
          Clear
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-md border border-neutral-200 bg-neutral-50 p-3 text-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center gap-2">
          <label
            htmlFor="rootName"
            className="text-neutral-600 dark:text-neutral-400"
          >
            Root name:
          </label>
          <input
            id="rootName"
            type="text"
            value={options.rootName}
            onChange={(e) => updateOption("rootName", e.target.value || "Root")}
            className="w-24 rounded border border-neutral-300 bg-white px-2 py-1 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:focus:border-neutral-500"
          />
        </div>

        <label className="flex cursor-pointer items-center gap-1.5">
          <input
            type="checkbox"
            checked={options.useExport}
            onChange={(e) => updateOption("useExport", e.target.checked)}
            className="size-4 rounded border-neutral-300 dark:border-neutral-700"
          />
          <span className="text-neutral-600 dark:text-neutral-400">Export</span>
        </label>

        <label className="flex cursor-pointer items-center gap-1.5">
          <input
            type="checkbox"
            checked={options.useType}
            onChange={(e) => updateOption("useType", e.target.checked)}
            className="size-4 rounded border-neutral-300 dark:border-neutral-700"
          />
          <span className="text-neutral-600 dark:text-neutral-400">
            Use type instead of interface
          </span>
        </label>

        <label className="flex cursor-pointer items-center gap-1.5">
          <input
            type="checkbox"
            checked={options.useReadonly}
            onChange={(e) => updateOption("useReadonly", e.target.checked)}
            className="size-4 rounded border-neutral-300 dark:border-neutral-700"
          />
          <span className="text-neutral-600 dark:text-neutral-400">
            Readonly
          </span>
        </label>

        <label className="flex cursor-pointer items-center gap-1.5">
          <input
            type="checkbox"
            checked={options.optionalProperties}
            onChange={(e) =>
              updateOption("optionalProperties", e.target.checked)
            }
            className="size-4 rounded border-neutral-300 dark:border-neutral-700"
          />
          <span className="text-neutral-600 dark:text-neutral-400">
            Optional properties
          </span>
        </label>
      </div>
    </div>
  );
}
