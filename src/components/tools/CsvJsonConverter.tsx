import { useState } from "react";
import Papa from "papaparse";
import Textarea from "./shared/Textarea";
import CopyButton from "./shared/CopyButton";

type Mode = "csv-to-json" | "json-to-csv";

export default function CsvJsonConverter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<Mode>("csv-to-json");
  const [error, setError] = useState<string | null>(null);
  const [hasHeader, setHasHeader] = useState(true);
  const [delimiter, setDelimiter] = useState(",");

  const convert = () => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }

    try {
      if (mode === "csv-to-json") {
        const result = Papa.parse(input, {
          header: hasHeader,
          skipEmptyLines: true,
          delimiter: delimiter || ",",
        });

        if (result.errors.length > 0) {
          setError(result.errors[0].message);
          setOutput("");
          return;
        }

        setOutput(JSON.stringify(result.data, null, 2));
      } else {
        const data = JSON.parse(input);
        if (!Array.isArray(data)) {
          setError("JSON must be an array of objects");
          setOutput("");
          return;
        }

        const csv = Papa.unparse(data, {
          delimiter: delimiter || ",",
        });
        setOutput(csv);
      }
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed");
      setOutput("");
    }
  };

  const handleSwap = () => {
    setMode(mode === "csv-to-json" ? "json-to-csv" : "csv-to-json");
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
            onClick={() => setMode("csv-to-json")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === "csv-to-json"
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
            }`}
          >
            CSV → JSON
          </button>
          <button
            onClick={() => setMode("json-to-csv")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === "json-to-csv"
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
            }`}
          >
            JSON → CSV
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-neutral-600 dark:text-neutral-400">
              Delimiter:
            </label>
            <select
              value={delimiter}
              onChange={(e) => setDelimiter(e.target.value)}
              className="input w-24"
            >
              <option value=",">Comma (,)</option>
              <option value=";">Semicolon (;)</option>
              <option value="\t">Tab</option>
              <option value="|">Pipe (|)</option>
            </select>
          </div>

          {mode === "csv-to-json" && (
            <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
              <input
                type="checkbox"
                checked={hasHeader}
                onChange={(e) => setHasHeader(e.target.checked)}
                className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-600"
              />
              First row is header
            </label>
          )}
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
            mode === "csv-to-json"
              ? "name,age,city\nJohn,30,New York\nJane,25,Los Angeles"
              : '[{"name":"John","age":30},{"name":"Jane","age":25}]'
          }
          label={mode === "csv-to-json" ? "CSV" : "JSON"}
          rows={12}
          className={error ? "border-red-500 dark:border-red-500" : ""}
        />
        <Textarea
          value={output}
          readOnly
          placeholder={
            mode === "csv-to-json" ? "JSON output..." : "CSV output..."
          }
          label={mode === "csv-to-json" ? "JSON" : "CSV"}
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
