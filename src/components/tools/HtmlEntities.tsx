import { useState } from "react";
import Textarea from "./shared/Textarea";
import CopyButton from "./shared/CopyButton";

type Mode = "encode" | "decode";

const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "/": "&#x2F;",
  "`": "&#x60;",
  "=": "&#x3D;",
  " ": "&nbsp;",
  "©": "&copy;",
  "®": "&reg;",
  "™": "&trade;",
  "€": "&euro;",
  "£": "&pound;",
  "¥": "&yen;",
  "¢": "&cent;",
  "§": "&sect;",
  "°": "&deg;",
  "±": "&plusmn;",
  "×": "&times;",
  "÷": "&divide;",
  "≠": "&ne;",
  "≤": "&le;",
  "≥": "&ge;",
  "∞": "&infin;",
  "←": "&larr;",
  "→": "&rarr;",
  "↑": "&uarr;",
  "↓": "&darr;",
  "♠": "&spades;",
  "♣": "&clubs;",
  "♥": "&hearts;",
  "♦": "&diams;",
};

const REVERSE_ENTITIES: Record<string, string> = Object.fromEntries(
  Object.entries(HTML_ENTITIES).map(([k, v]) => [v, k]),
);

function encodeHtmlEntities(str: string, encodeAll: boolean): string {
  if (encodeAll) {
    return str
      .split("")
      .map((char) => {
        const code = char.charCodeAt(0);
        if (code > 127 || HTML_ENTITIES[char]) {
          return HTML_ENTITIES[char] || `&#${code};`;
        }
        return char;
      })
      .join("");
  }

  return str.replace(/[&<>"']/g, (char) => HTML_ENTITIES[char] || char);
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&[a-zA-Z]+;/g, (entity) => REVERSE_ENTITIES[entity] || entity)
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)))
    .replace(/&#x([a-fA-F0-9]+);/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16)),
    );
}

export default function HtmlEntities() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<Mode>("encode");
  const [encodeAll, setEncodeAll] = useState(false);

  const handleConvert = () => {
    if (!input.trim()) {
      setOutput("");
      return;
    }

    if (mode === "encode") {
      setOutput(encodeHtmlEntities(input, encodeAll));
    } else {
      setOutput(decodeHtmlEntities(input));
    }
  };

  const handleSwap = () => {
    setMode(mode === "encode" ? "decode" : "encode");
    setInput(output);
    setOutput(input);
  };

  const clear = () => {
    setInput("");
    setOutput("");
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

        {mode === "encode" && (
          <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
            <input
              type="checkbox"
              checked={encodeAll}
              onChange={(e) => setEncodeAll(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-600"
            />
            Encode all characters (including Unicode)
          </label>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Textarea
          value={input}
          onChange={setInput}
          placeholder={
            mode === "encode"
              ? "Enter text to encode...\nExample: <div>Hello & World</div>"
              : "Enter HTML entities to decode...\nExample: &lt;div&gt;Hello &amp; World&lt;/div&gt;"
          }
          label={mode === "encode" ? "Text" : "HTML Entities"}
          rows={8}
        />
        <Textarea
          value={output}
          readOnly
          placeholder={
            mode === "encode" ? "Encoded output..." : "Decoded text..."
          }
          label={mode === "encode" ? "HTML Entities" : "Text"}
          rows={8}
        />
      </div>

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

      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Common HTML Entities
        </p>
        <div className="grid grid-cols-4 gap-2 text-xs sm:grid-cols-6 md:grid-cols-8">
          {Object.entries(HTML_ENTITIES)
            .slice(0, 16)
            .map(([char, entity]) => (
              <div
                key={entity}
                className="rounded bg-neutral-100 p-1.5 text-center dark:bg-neutral-800"
              >
                <span className="block font-mono text-neutral-700 dark:text-neutral-300">
                  {char === " " ? "␣" : char}
                </span>
                <span className="block text-neutral-500">{entity}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
