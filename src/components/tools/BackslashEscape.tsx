import { useState } from "react";
import Textarea from "./shared/Textarea";
import CopyButton from "./shared/CopyButton";

type Mode = "escape" | "unescape";

const ESCAPE_MAP: Record<string, string> = {
  "\\": "\\\\",
  "\n": "\\n",
  "\r": "\\r",
  "\t": "\\t",
  '"': '\\"',
  "'": "\\'",
  "\0": "\\0",
  "\b": "\\b",
  "\f": "\\f",
  "\v": "\\v",
};

const UNESCAPE_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(ESCAPE_MAP).map(([k, v]) => [v, k]),
);

function escapeString(str: string): string {
  return str
    .split("")
    .map((char) => ESCAPE_MAP[char] || char)
    .join("");
}

function unescapeString(str: string): string {
  let result = "";
  let i = 0;

  while (i < str.length) {
    if (str[i] === "\\" && i + 1 < str.length) {
      const twoChar = str.slice(i, i + 2);
      if (UNESCAPE_MAP[twoChar]) {
        result += UNESCAPE_MAP[twoChar];
        i += 2;
        continue;
      }

      if (str[i + 1] === "u" && i + 5 < str.length) {
        const hex = str.slice(i + 2, i + 6);
        if (/^[0-9a-fA-F]{4}$/.test(hex)) {
          result += String.fromCharCode(parseInt(hex, 16));
          i += 6;
          continue;
        }
      }

      if (str[i + 1] === "x" && i + 3 < str.length) {
        const hex = str.slice(i + 2, i + 4);
        if (/^[0-9a-fA-F]{2}$/.test(hex)) {
          result += String.fromCharCode(parseInt(hex, 16));
          i += 4;
          continue;
        }
      }
    }

    result += str[i];
    i++;
  }

  return result;
}

export default function BackslashEscape() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<Mode>("escape");
  const [error, setError] = useState<string | null>(null);

  const handleConvert = () => {
    if (!input) {
      setOutput("");
      setError(null);
      return;
    }

    try {
      if (mode === "escape") {
        setOutput(escapeString(input));
      } else {
        setOutput(unescapeString(input));
      }
      setError(null);
    } catch (e) {
      setError("Invalid escape sequence");
      setOutput("");
    }
  };

  const handleSwap = () => {
    setMode(mode === "escape" ? "unescape" : "escape");
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
          onClick={() => setMode("escape")}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            mode === "escape"
              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
              : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
          }`}
        >
          Escape
        </button>
        <button
          onClick={() => setMode("unescape")}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            mode === "unescape"
              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
              : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
          }`}
        >
          Unescape
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
            mode === "escape"
              ? "Enter text with special characters...\nLine 1\nLine 2\t(tab)"
              : "Enter escaped string...\nLine 1\\nLine 2\\t(tab)"
          }
          label={mode === "escape" ? "Raw Text" : "Escaped String"}
          rows={8}
          className={error ? "border-red-500 dark:border-red-500" : ""}
        />
        <Textarea
          value={output}
          readOnly
          placeholder={
            mode === "escape" ? "Escaped output..." : "Unescaped text..."
          }
          label={mode === "escape" ? "Escaped String" : "Raw Text"}
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
          {mode === "escape" ? "Escape" : "Unescape"}
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

      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Common Escape Sequences
        </p>
        <div className="grid grid-cols-3 gap-2 text-xs sm:grid-cols-4 md:grid-cols-6">
          {[
            { seq: "\\n", desc: "Newline" },
            { seq: "\\t", desc: "Tab" },
            { seq: "\\r", desc: "Carriage return" },
            { seq: "\\\\", desc: "Backslash" },
            { seq: '\\"', desc: "Double quote" },
            { seq: "\\'", desc: "Single quote" },
            { seq: "\\0", desc: "Null" },
            { seq: "\\b", desc: "Backspace" },
            { seq: "\\f", desc: "Form feed" },
            { seq: "\\v", desc: "Vertical tab" },
            { seq: "\\xNN", desc: "Hex (2 digits)" },
            { seq: "\\uNNNN", desc: "Unicode (4 digits)" },
          ].map(({ seq, desc }) => (
            <div
              key={seq}
              className="rounded bg-neutral-100 p-1.5 text-center dark:bg-neutral-800"
            >
              <span className="block font-mono text-neutral-700 dark:text-neutral-300">
                {seq}
              </span>
              <span className="block text-neutral-500">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
