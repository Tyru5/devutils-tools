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
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode("encode")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === "encode"
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
            }`}
          >
            Encode
          </button>
          <button
            onClick={() => setMode("decode")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === "decode"
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
            }`}
          >
            Decode
          </button>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-neutral-500">Type:</span>
          <button
            onClick={() => setEncodeType("component")}
            className={`rounded-md px-2 py-1 transition-colors ${
              encodeType === "component"
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
            }`}
            title="Encodes all special characters including / ? & ="
          >
            Component
          </button>
          <button
            onClick={() => setEncodeType("full")}
            className={`rounded-md px-2 py-1 transition-colors ${
              encodeType === "full"
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
            }`}
            title="Preserves URL structure characters like / ? & ="
          >
            Full URL
          </button>
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
            mode === "encode"
              ? "Enter text or URL to encode..."
              : "Enter encoded URL to decode..."
          }
          label={mode === "encode" ? "Input" : "Encoded URL"}
          rows={8}
          className={error ? "border-red-500 dark:border-red-500" : ""}
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

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button onClick={handleConvert} className="btn btn-primary">
          {mode === "encode" ? "Encode" : "Decode"}
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

      <p className="text-xs text-neutral-500">
        <strong>Component:</strong> Encodes all special characters (use for
        query parameters). <strong>Full URL:</strong> Preserves URL structure
        like <code>/</code>, <code>?</code>, <code>&</code>.
      </p>
    </div>
  );
}
