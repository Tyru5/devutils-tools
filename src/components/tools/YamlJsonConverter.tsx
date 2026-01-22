import { useState } from "react";
import YAML from "yaml";
import Textarea from "./shared/Textarea";
import CopyButton from "./shared/CopyButton";

type Mode = "yaml-to-json" | "json-to-yaml";

export default function YamlJsonConverter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<Mode>("yaml-to-json");
  const [error, setError] = useState<string | null>(null);
  const [indent, setIndent] = useState(2);

  const convert = () => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }

    try {
      if (mode === "yaml-to-json") {
        const parsed = YAML.parse(input);
        setOutput(JSON.stringify(parsed, null, indent));
      } else {
        const parsed = JSON.parse(input);
        setOutput(YAML.stringify(parsed, { indent }));
      }
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed");
      setOutput("");
    }
  };

  const handleSwap = () => {
    setMode(mode === "yaml-to-json" ? "json-to-yaml" : "yaml-to-json");
    setInput(output);
    setOutput(input);
    setError(null);
  };

  const clear = () => {
    setInput("");
    setOutput("");
    setError(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode("yaml-to-json")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === "yaml-to-json"
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
            }`}
          >
            YAML → JSON
          </button>
          <button
            onClick={() => setMode("json-to-yaml")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === "json-to-yaml"
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
            }`}
          >
            JSON → YAML
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-neutral-600 dark:text-neutral-400">
            Indent:
          </label>
          <select
            value={indent}
            onChange={(e) => setIndent(parseInt(e.target.value))}
            className="input w-20"
          >
            <option value={2}>2</option>
            <option value={4}>4</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Textarea
          value={input}
          onChange={(val) => {
            setInput(val);
            setError(null);
          }}
          placeholder={
            mode === "yaml-to-json"
              ? "name: John Doe\nage: 30\nhobbies:\n  - reading\n  - coding"
              : '{\n  "name": "John Doe",\n  "age": 30\n}'
          }
          label={mode === "yaml-to-json" ? "YAML" : "JSON"}
          rows={12}
          className={error ? "border-red-500 dark:border-red-500" : ""}
        />
        <Textarea
          value={output}
          readOnly
          placeholder={
            mode === "yaml-to-json" ? "JSON output..." : "YAML output..."
          }
          label={mode === "yaml-to-json" ? "JSON" : "YAML"}
          rows={12}
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
        <button
          onClick={handleSwap}
          disabled={!output}
          className="btn btn-secondary disabled:cursor-not-allowed disabled:opacity-40"
        >
          Swap
        </button>
        <CopyButton text={output} disabled={!output} />
        <button onClick={clear} className="btn btn-ghost">
          Clear
        </button>
      </div>
    </div>
  );
}
