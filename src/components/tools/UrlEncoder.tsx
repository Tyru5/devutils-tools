import { useState } from "react";
import Textarea from "./shared/Textarea";
import CopyButton from "./shared/CopyButton";

type Mode = "encode" | "decode";
type EncodeType = "component" | "full";

export default function UrlEncoder() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<Mode>("encode");
  const [encodeType, setEncodeType] = useState<EncodeType>("component");
  const [error, setError] = useState<string | null>(null);

  const handleConvert = () => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }

    try {
      if (mode === "encode") {
        const encoded =
          encodeType === "component"
            ? encodeURIComponent(input)
            : encodeURI(input);
        setOutput(encoded);
      } else {
        const decoded =
          encodeType === "component"
            ? decodeURIComponent(input)
            : decodeURI(input);
        setOutput(decoded);
      }
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid input");
      setOutput("");
    }
  };

  const handleSwap = () => {
    setMode(mode === "encode" ? "decode" : "encode");
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
      {/* Mode Toggle */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode("encode")}
            className={`rounded-md px-4 py-2 font-medium transition-colors ${
              mode === "encode"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            Encode
          </button>
          <button
            onClick={() => setMode("decode")}
            className={`rounded-md px-4 py-2 font-medium transition-colors ${
              mode === "decode"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            Decode
          </button>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500 dark:text-gray-400">Type:</span>
          <button
            onClick={() => setEncodeType("component")}
            className={`rounded px-2 py-1 transition-colors ${
              encodeType === "component"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            }`}
            title="Encodes all special characters including / ? & ="
          >
            Component
          </button>
          <button
            onClick={() => setEncodeType("full")}
            className={`rounded px-2 py-1 transition-colors ${
              encodeType === "full"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            }`}
            title="Preserves URL structure characters like / ? & ="
          >
            Full URL
          </button>
        </div>
      </div>

      {/* Input/Output */}
      <div className="grid gap-4 md:grid-cols-2">
        <Textarea
          value={input}
          onChange={(val) => {
            setInput(val);
            setError(null);
          }}
          placeholder={
            mode === "encode"
              ? "Enter text or URL to encode..."
              : "Enter encoded URL to decode..."
          }
          label={mode === "encode" ? "Input" : "Encoded URL"}
          rows={8}
          className={error ? "border-red-500" : ""}
        />
        <Textarea
          value={output}
          readOnly
          placeholder={
            mode === "encode" ? "Encoded output..." : "Decoded output..."
          }
          label={mode === "encode" ? "Encoded" : "Decoded"}
          rows={8}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleConvert}
          className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
        >
          {mode === "encode" ? "Encode" : "Decode"}
        </button>
        <button
          onClick={handleSwap}
          disabled={!output}
          className="rounded-md bg-gray-200 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          ⇄ Swap
        </button>
        <CopyButton text={output} disabled={!output} />
        <button
          onClick={clear}
          className="px-4 py-2 text-gray-600 transition-colors hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Clear
        </button>
      </div>

      {/* Help text */}
      <div className="text-xs text-gray-500 dark:text-gray-400">
        <strong>Component:</strong> Encodes all special characters (use for
        query parameters). <strong>Full URL:</strong> Preserves URL structure
        like <code>/</code>, <code>?</code>, <code>&</code>.
      </div>
    </div>
  );
}
