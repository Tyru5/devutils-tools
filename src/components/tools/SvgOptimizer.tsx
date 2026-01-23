import { useState } from "react";
import { optimize } from "svgo/browser";
import Textarea from "./shared/Textarea";
import CopyButton from "./shared/CopyButton";

interface OptimizationResult {
  original: number;
  optimized: number;
  savings: number;
  percentage: number;
}

export default function SvgOptimizer() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<OptimizationResult | null>(null);
  const [removeComments, setRemoveComments] = useState(true);
  const [removeMetadata, setRemoveMetadata] = useState(true);
  const [removeViewBox, setRemoveViewBox] = useState(false);
  const [prettify, setPrettify] = useState(false);

  const optimizeSvg = () => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      setStats(null);
      return;
    }

    try {
      const result = optimize(input, {
        multipass: true,
        js2svg: {
          indent: prettify ? 2 : 0,
          pretty: prettify,
        },
      });

      const original = new Blob([input]).size;
      const optimized = new Blob([result.data]).size;
      const savings = original - optimized;

      setOutput(result.data);
      setStats({
        original,
        optimized,
        savings,
        percentage: Math.round((savings / original) * 100),
      });
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Optimization failed");
      setOutput("");
      setStats(null);
    }
  };

  const clear = () => {
    setInput("");
    setOutput("");
    setError(null);
    setStats(null);
  };

  const download = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "optimized.svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
          <input
            type="checkbox"
            checked={removeComments}
            onChange={(e) => setRemoveComments(e.target.checked)}
            className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-600"
          />
          Remove comments
        </label>
        <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
          <input
            type="checkbox"
            checked={removeMetadata}
            onChange={(e) => setRemoveMetadata(e.target.checked)}
            className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-600"
          />
          Remove metadata
        </label>
        <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
          <input
            type="checkbox"
            checked={prettify}
            onChange={(e) => setPrettify(e.target.checked)}
            className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-600"
          />
          Prettify output
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Textarea
            value={input}
            onChange={(val) => {
              setInput(val);
              setError(null);
              setStats(null);
            }}
            placeholder='<svg xmlns="http://www.w3.org/2000/svg">...</svg>'
            label="Input SVG"
            rows={12}
            className={error ? "border-red-500 dark:border-red-500" : ""}
          />
          {input && (
            <div className="flex items-center justify-center rounded border border-dashed border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
              <div
                className="max-h-32 max-w-full"
                dangerouslySetInnerHTML={{ __html: input }}
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Textarea
            value={output}
            readOnly
            placeholder="Optimized SVG..."
            label="Output"
            rows={12}
          />
          {output && (
            <div className="flex items-center justify-center rounded border border-dashed border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
              <div
                className="max-h-32 max-w-full"
                dangerouslySetInnerHTML={{ __html: output }}
              />
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      {stats && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-xs text-neutral-500">Original</p>
            <p className="font-mono text-lg text-neutral-900 dark:text-neutral-100">
              {stats.original.toLocaleString()} bytes
            </p>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-xs text-neutral-500">Optimized</p>
            <p className="font-mono text-lg text-neutral-900 dark:text-neutral-100">
              {stats.optimized.toLocaleString()} bytes
            </p>
          </div>
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950">
            <p className="text-xs text-green-600 dark:text-green-400">Saved</p>
            <p className="font-mono text-lg text-green-700 dark:text-green-300">
              {stats.savings.toLocaleString()} bytes ({stats.percentage}%)
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button onClick={optimizeSvg} className="btn btn-primary">
          Optimize
        </button>
        <button
          onClick={download}
          disabled={!output}
          className="btn btn-secondary disabled:cursor-not-allowed disabled:opacity-40"
        >
          Download
        </button>
        <CopyButton text={output} disabled={!output} />
        <button onClick={clear} className="btn btn-ghost">
          Clear
        </button>
      </div>
    </div>
  );
}
