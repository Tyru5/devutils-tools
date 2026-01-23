import { useState, useEffect } from "react";
import { html, parse } from "diff2html";
import Textarea from "./shared/Textarea";

const EXAMPLE_DIFF = `diff --git a/src/App.tsx b/src/App.tsx
index a1b2c3d..e4f5g6h 100644
--- a/src/App.tsx
+++ b/src/App.tsx
@@ -1,10 +1,12 @@
 import React from 'react';
+import { useState } from 'react';
 
 function App() {
+  const [count, setCount] = useState(0);
+
   return (
     <div className="App">
-      <h1>Hello World</h1>
+      <h1>Hello World - Count: {count}</h1>
+      <button onClick={() => setCount(c => c + 1)}>Increment</button>
     </div>
   );
 }`;

type OutputFormat = "line-by-line" | "side-by-side";

export default function GitDiffViewer() {
  const [input, setInput] = useState("");
  const [htmlOutput, setHtmlOutput] = useState("");
  const [format, setFormat] = useState<OutputFormat>("line-by-line");
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    additions: number;
    deletions: number;
  } | null>(null);

  const renderDiff = (diffText: string) => {
    if (!diffText.trim()) {
      setHtmlOutput("");
      setError(null);
      setStats(null);
      return;
    }

    try {
      const parsed = parse(diffText);

      let additions = 0;
      let deletions = 0;
      parsed.forEach((file) => {
        file.blocks.forEach((block) => {
          block.lines.forEach((line) => {
            if (line.type === "insert") additions++;
            if (line.type === "delete") deletions++;
          });
        });
      });
      setStats({ additions, deletions });

      const output = html(parsed, {
        drawFileList: true,
        matching: "lines",
        outputFormat: format,
      });
      setHtmlOutput(output);
      setError(null);
    } catch (e) {
      setError("Invalid diff format. Paste a unified diff (git diff output).");
      setHtmlOutput("");
      setStats(null);
    }
  };

  useEffect(() => {
    renderDiff(input);
  }, [input, format]);

  const loadExample = () => {
    setInput(EXAMPLE_DIFF);
  };

  const clear = () => {
    setInput("");
    setHtmlOutput("");
    setError(null);
    setStats(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFormat("line-by-line")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              format === "line-by-line"
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
            }`}
          >
            Unified
          </button>
          <button
            onClick={() => setFormat("side-by-side")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              format === "side-by-side"
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
            }`}
          >
            Side by Side
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadExample}
            className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            Load example
          </button>
          <button onClick={clear} className="btn btn-ghost">
            Clear
          </button>
        </div>
      </div>

      <Textarea
        value={input}
        onChange={setInput}
        placeholder="Paste git diff output here..."
        label="Diff Input"
        rows={8}
      />

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      {stats && (
        <div className="flex items-center gap-4 text-sm">
          <span className="text-green-600 dark:text-green-400">
            +{stats.additions} additions
          </span>
          <span className="text-red-600 dark:text-red-400">
            -{stats.deletions} deletions
          </span>
        </div>
      )}

      {htmlOutput && (
        <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700">
          <style>
            {`
              .d2h-wrapper { font-family: ui-monospace, monospace; font-size: 12px; }
              .d2h-file-header { background: rgb(245, 245, 245); padding: 8px 12px; border-bottom: 1px solid #e5e5e5; }
              .dark .d2h-file-header { background: rgb(38, 38, 38); border-color: #404040; }
              .d2h-file-name { font-weight: 600; }
              .d2h-code-line { padding: 0 12px; white-space: pre-wrap; word-break: break-all; }
              .d2h-code-line-ctn { padding: 2px 8px; }
              .d2h-ins { background: #e6ffec; }
              .dark .d2h-ins { background: #1a3d1a; }
              .d2h-del { background: #ffebe9; }
              .dark .d2h-del { background: #4d1a1a; }
              .d2h-info { background: #f0f0f0; color: #666; }
              .dark .d2h-info { background: #333; color: #999; }
              .d2h-code-line-prefix { user-select: none; color: #888; }
              .d2h-file-list-wrapper { display: none; }
              .d2h-diff-table { width: 100%; border-collapse: collapse; }
              .d2h-diff-tbody tr { border-top: 1px solid #e5e5e5; }
              .dark .d2h-diff-tbody tr { border-color: #404040; }
            `}
          </style>
          <div dangerouslySetInnerHTML={{ __html: htmlOutput }} />
        </div>
      )}
    </div>
  );
}
