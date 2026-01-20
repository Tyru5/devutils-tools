import { useState, useMemo } from "react";
import Textarea from "./shared/Textarea";

interface DiffLine {
  type: "equal" | "insert" | "delete";
  lineNumber: { left?: number; right?: number };
  content: string;
}

// Simple line-by-line diff algorithm
function computeDiff(left: string, right: string): DiffLine[] {
  const leftLines = left.split("\n");
  const rightLines = right.split("\n");

  // LCS-based diff
  const m = leftLines.length;
  const n = rightLines.length;

  // Build LCS table
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (leftLines[i - 1] === rightLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to find diff
  const result: DiffLine[] = [];
  let i = m,
    j = n;
  const temp: DiffLine[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && leftLines[i - 1] === rightLines[j - 1]) {
      temp.push({
        type: "equal",
        lineNumber: { left: i, right: j },
        content: leftLines[i - 1],
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      temp.push({
        type: "insert",
        lineNumber: { right: j },
        content: rightLines[j - 1],
      });
      j--;
    } else {
      temp.push({
        type: "delete",
        lineNumber: { left: i },
        content: leftLines[i - 1],
      });
      i--;
    }
  }

  return temp.reverse();
}

export default function DiffChecker() {
  const [leftText, setLeftText] = useState("");
  const [rightText, setRightText] = useState("");
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);

  const diff = useMemo(() => {
    let left = leftText;
    let right = rightText;

    if (ignoreCase) {
      left = left.toLowerCase();
      right = right.toLowerCase();
    }

    if (ignoreWhitespace) {
      left = left.replace(/\s+/g, " ").trim();
      right = right.replace(/\s+/g, " ").trim();
    }

    return computeDiff(left, right);
  }, [leftText, rightText, ignoreWhitespace, ignoreCase]);

  const stats = useMemo(() => {
    const additions = diff.filter((d) => d.type === "insert").length;
    const deletions = diff.filter((d) => d.type === "delete").length;
    const unchanged = diff.filter((d) => d.type === "equal").length;
    return { additions, deletions, unchanged };
  }, [diff]);

  const clear = () => {
    setLeftText("");
    setRightText("");
  };

  const swap = () => {
    const temp = leftText;
    setLeftText(rightText);
    setRightText(temp);
  };

  const getLineClass = (type: DiffLine["type"]) => {
    switch (type) {
      case "insert":
        return "bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500";
      case "delete":
        return "bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500";
      default:
        return "bg-gray-50 dark:bg-gray-800/50";
    }
  };

  const getLinePrefix = (type: DiffLine["type"]) => {
    switch (type) {
      case "insert":
        return "+";
      case "delete":
        return "-";
      default:
        return " ";
    }
  };

  return (
    <div className="space-y-4">
      {/* Options */}
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={ignoreWhitespace}
            onChange={(e) => setIgnoreWhitespace(e.target.checked)}
            className="rounded border-gray-300 dark:border-gray-600"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Ignore whitespace
          </span>
        </label>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={ignoreCase}
            onChange={(e) => setIgnoreCase(e.target.checked)}
            className="rounded border-gray-300 dark:border-gray-600"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Ignore case
          </span>
        </label>
        <button
          onClick={swap}
          className="rounded-md bg-gray-200 px-3 py-1 text-sm transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
        >
          ⇄ Swap
        </button>
      </div>

      {/* Input Areas */}
      <div className="grid gap-4 md:grid-cols-2">
        <Textarea
          value={leftText}
          onChange={setLeftText}
          placeholder="Original text..."
          label="Original"
          rows={10}
        />
        <Textarea
          value={rightText}
          onChange={setRightText}
          placeholder="Modified text..."
          label="Modified"
          rows={10}
        />
      </div>

      {/* Stats */}
      {(leftText || rightText) && (
        <div className="flex items-center gap-4 text-sm">
          <span className="text-green-600 dark:text-green-400">
            +{stats.additions} addition{stats.additions !== 1 ? "s" : ""}
          </span>
          <span className="text-red-600 dark:text-red-400">
            -{stats.deletions} deletion{stats.deletions !== 1 ? "s" : ""}
          </span>
          <span className="text-gray-500 dark:text-gray-400">
            {stats.unchanged} unchanged
          </span>
        </div>
      )}

      {/* Diff Output */}
      {(leftText || rightText) && (
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="border-b border-gray-200 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
            Diff Output
          </div>
          <div className="max-h-96 overflow-y-auto">
            {diff.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                Enter text in both fields to see the diff
              </div>
            ) : (
              <div className="font-mono text-sm">
                {diff.map((line, index) => (
                  <div
                    key={index}
                    className={`flex ${getLineClass(line.type)}`}
                  >
                    <div className="w-8 flex-shrink-0 select-none border-r border-gray-200 py-1 text-center text-gray-400 dark:border-gray-700 dark:text-gray-500">
                      {line.lineNumber.left || ""}
                    </div>
                    <div className="w-8 flex-shrink-0 select-none border-r border-gray-200 py-1 text-center text-gray-400 dark:border-gray-700 dark:text-gray-500">
                      {line.lineNumber.right || ""}
                    </div>
                    <div
                      className={`w-6 flex-shrink-0 select-none py-1 text-center ${
                        line.type === "insert"
                          ? "text-green-600"
                          : line.type === "delete"
                            ? "text-red-600"
                            : "text-gray-400"
                      }`}
                    >
                      {getLinePrefix(line.type)}
                    </div>
                    <div className="flex-1 overflow-x-auto whitespace-pre px-2 py-1">
                      {line.content || "\u00A0"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Identical Check */}
      {leftText &&
        rightText &&
        stats.additions === 0 &&
        stats.deletions === 0 && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center dark:border-green-800 dark:bg-green-900/20">
            <span className="font-medium text-green-700 dark:text-green-400">
              ✓ Texts are identical
            </span>
          </div>
        )}

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={clear}
          className="px-4 py-2 text-gray-600 transition-colors hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
