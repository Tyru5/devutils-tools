import { useState } from "react";
import beautify from "js-beautify";
import Textarea from "./shared/Textarea";
import CopyButton from "./shared/CopyButton";

type Mode = "html" | "xml";

export default function HtmlFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<Mode>("html");
  const [indentSize, setIndentSize] = useState(2);
  const [wrapLineLength, setWrapLineLength] = useState(120);
  const [error, setError] = useState<string | null>(null);

  const formatCode = () => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }

    try {
      const formatted = beautify.html(input, {
        indent_size: indentSize,
        wrap_line_length: wrapLineLength,
        preserve_newlines: true,
        max_preserve_newlines: 2,
        indent_inner_html: true,
        extra_liners: [],
        unformatted: mode === "xml" ? [] : ["code", "pre", "textarea"],
        content_unformatted: mode === "xml" ? [] : ["pre", "textarea"],
      });
      setOutput(formatted);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Formatting failed");
      setOutput("");
    }
  };

  const minify = () => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }

    try {
      const minified = input
        .replace(/<!--[\s\S]*?-->/g, "")
        .replace(/>\s+</g, "><")
        .replace(/\s+/g, " ")
        .trim();
      setOutput(minified);
      setError(null);
    } catch (e) {
      setError("Minification failed");
      setOutput("");
    }
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
            onClick={() => setMode("html")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === "html"
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
            }`}
          >
            HTML
          </button>
          <button
            onClick={() => setMode("xml")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === "xml"
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
            }`}
          >
            XML
          </button>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Indent
          </label>
          <select
            value={indentSize}
            onChange={(e) => setIndentSize(parseInt(e.target.value))}
            className="input w-20"
          >
            <option value={2}>2</option>
            <option value={4}>4</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Wrap at
          </label>
          <select
            value={wrapLineLength}
            onChange={(e) => setWrapLineLength(parseInt(e.target.value))}
            className="input w-24"
          >
            <option value={80}>80</option>
            <option value={120}>120</option>
            <option value={0}>No wrap</option>
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
            mode === "html"
              ? "<div><p>Hello World</p></div>"
              : '<?xml version="1.0"?><root><item>Value</item></root>'
          }
          label={`Input ${mode.toUpperCase()}`}
          rows={14}
          className={error ? "border-red-500 dark:border-red-500" : ""}
        />
        <Textarea
          value={output}
          readOnly
          placeholder={`Formatted ${mode.toUpperCase()}...`}
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
        <button onClick={formatCode} className="btn btn-primary">
          Format
        </button>
        <button onClick={minify} className="btn btn-secondary">
          Minify
        </button>
        <CopyButton text={output} disabled={!output} />
        <button onClick={clear} className="btn btn-ghost">
          Clear
        </button>
      </div>
    </div>
  );
}
