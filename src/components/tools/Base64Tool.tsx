import { useState } from "react";
import Textarea from "./shared/Textarea";
import CopyButton from "./shared/CopyButton";

type Mode = "encode" | "decode";

export default function Base64Tool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<Mode>("encode");
  const [error, setError] = useState<string | null>(null);

  const handleConvert = () => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }

    try {
      if (mode === "encode") {
        const encoded = btoa(unescape(encodeURIComponent(input)));
        setOutput(encoded);
      } else {
        const decoded = decodeURIComponent(escape(atob(input.trim())));
        setOutput(decoded);
      }
      setError(null);
    } catch (e) {
      setError(mode === "decode" ? "Invalid Base64 string" : "Encoding failed");
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

      <div className="grid gap-4 md:grid-cols-2">
        <Textarea
          value={input}
          onChange={(val) => {
            setInput(val);
            setError(null);
          }}
          placeholder={
            mode === "encode"
              ? "Enter text to encode..."
              : "Enter Base64 to decode..."
          }
          label={mode === "encode" ? "Text" : "Base64"}
          rows={10}
          className={error ? "border-red-500 dark:border-red-500" : ""}
        />
        <Textarea
          value={output}
          readOnly
          placeholder={
            mode === "encode" ? "Base64 output..." : "Decoded text..."
          }
          label={mode === "encode" ? "Base64" : "Text"}
          rows={10}
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
    </div>
  );
}
