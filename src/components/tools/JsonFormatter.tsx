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
    // Auto-clear error when typing
    if (error) setError(null);
  };

  return (
    <div className="space-y-4">
      {/* Input/Output Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <Textarea
          value={input}
          onChange={handleInputChange}
          placeholder="Paste your JSON here..."
          label="Input"
          rows={14}
          className={error ? "border-red-500 focus:ring-red-500" : ""}
        />
        <Textarea
          value={output}
          readOnly
          placeholder="Formatted JSON will appear here..."
          label="Output"
          rows={14}
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={format}
          className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
        >
          Format
        </button>
        <button
          onClick={minify}
          className="rounded-md bg-gray-600 px-4 py-2 font-medium text-white transition-colors hover:bg-gray-700"
        >
          Minify
        </button>
        <CopyButton text={output} disabled={!output} />
        <button
          onClick={clear}
          className="px-4 py-2 text-gray-600 transition-colors hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Clear
        </button>

        {/* Indent Options */}
        <div className="ml-auto flex items-center gap-2 text-sm">
          <span className="text-gray-500 dark:text-gray-400">Indent:</span>
          {(["2", "4", "tab"] as const).map((style) => (
            <button
              key={style}
              onClick={() => setIndent(style)}
              className={`rounded px-2 py-1 transition-colors ${
                indent === style
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              }`}
            >
              {style === "tab" ? "Tab" : style}
            </button>
          ))}
        </div>
      </div>

      {/* Status */}
      {input && !error && (
        <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
          <svg
            className="h-4 w-4"
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
