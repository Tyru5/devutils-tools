import { useState, useCallback } from "react";
import Textarea from "./shared/Textarea";
import CopyButton from "./shared/CopyButton";

type IndentStyle = "2" | "4" | "tab";

export default function JsonFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [indent, setIndent] = useState<IndentStyle>("2");

  const getIndent = (style: IndentStyle): string | number => {
    switch (style) {
      case "2":
        return 2;
      case "4":
        return 4;
      case "tab":
        return "\t";
    }
  };

  const format = useCallback(() => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }

    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, getIndent(indent)));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
      setOutput("");
    }
  }, [input, indent]);

  const minify = useCallback(() => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }

    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
      setOutput("");
    }
  }, [input]);

  const clear = () => {
    setInput("");
    setOutput("");
    setError(null);
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    if (error) setError(null);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Textarea
          value={input}
          onChange={handleInputChange}
          placeholder="Paste your JSON here..."
          label="Input"
          rows={14}
          className={error ? "border-red-500 dark:border-red-500" : ""}
        />
        <Textarea
          value={output}
          readOnly
          placeholder="Formatted JSON will appear here..."
          label="Output"
          rows={14}
        />
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button onClick={format} className="btn btn-primary">
          Format
        </button>
        <button onClick={minify} className="btn btn-secondary">
          Minify
        </button>
        <CopyButton text={output} disabled={!output} />
        <button onClick={clear} className="btn btn-ghost">
          Clear
        </button>

        <div className="ml-auto flex items-center gap-2 text-sm">
          <span className="text-neutral-500">Indent:</span>
          {(["2", "4", "tab"] as const).map((style) => (
            <button
              key={style}
              onClick={() => setIndent(style)}
              className={`rounded-md px-2 py-1 text-sm transition-colors ${
                indent === style
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
              }`}
            >
              {style === "tab" ? "Tab" : style}
            </button>
          ))}
        </div>
      </div>

      {input && !error && (
        <div className="flex items-center gap-1.5 text-sm text-neutral-500">
          <svg
            className="size-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          Valid JSON
        </div>
      )}
    </div>
  );
}
