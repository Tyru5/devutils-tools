import { useState } from "react";
import cronstrue from "cronstrue";
import { CronExpressionParser } from "cron-parser";
import CopyButton from "./shared/CopyButton";

const COMMON_EXPRESSIONS = [
  { expr: "* * * * *", desc: "Every minute" },
  { expr: "0 * * * *", desc: "Every hour" },
  { expr: "0 0 * * *", desc: "Every day at midnight" },
  { expr: "0 0 * * 0", desc: "Every Sunday at midnight" },
  { expr: "0 0 1 * *", desc: "First day of every month" },
  { expr: "*/5 * * * *", desc: "Every 5 minutes" },
  { expr: "0 9-17 * * 1-5", desc: "Every hour 9am-5pm, Mon-Fri" },
  { expr: "0 0 * * 1-5", desc: "Midnight on weekdays" },
];

export default function CronParser() {
  const [expression, setExpression] = useState("0 0 * * *");
  const [description, setDescription] = useState("");
  const [nextRuns, setNextRuns] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const parse = (expr: string) => {
    setExpression(expr);

    if (!expr.trim()) {
      setDescription("");
      setNextRuns([]);
      setError(null);
      return;
    }

    try {
      const humanReadable = cronstrue.toString(expr, {
        throwExceptionOnParseError: true,
        use24HourTimeFormat: false,
      });
      setDescription(humanReadable);

      const interval = CronExpressionParser.parse(expr);
      const runs: string[] = [];
      for (let i = 0; i < 5; i++) {
        const next = interval.next();
        runs.push(next.toDate().toLocaleString());
      }
      setNextRuns(runs);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid cron expression");
      setDescription("");
      setNextRuns([]);
    }
  };

  const clear = () => {
    setExpression("");
    setDescription("");
    setNextRuns([]);
    setError(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Cron Expression
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={expression}
            onChange={(e) => parse(e.target.value)}
            placeholder="* * * * *"
            className={`input flex-1 font-mono text-lg ${
              error ? "border-red-500 dark:border-red-500" : ""
            }`}
          />
          <button onClick={() => parse(expression)} className="btn btn-primary">
            Parse
          </button>
          <button onClick={clear} className="btn btn-ghost">
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2 text-center text-xs">
        {["Minute", "Hour", "Day (Month)", "Month", "Day (Week)"].map(
          (label, i) => (
            <div key={label}>
              <div className="rounded bg-neutral-100 px-2 py-1 font-mono dark:bg-neutral-800">
                {expression.split(/\s+/)[i] || "*"}
              </div>
              <div className="mt-1 text-neutral-500">{label}</div>
            </div>
          ),
        )}
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      {description && (
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-sm font-medium text-neutral-500">Human Readable</p>
          <p className="mt-1 text-lg text-neutral-900 dark:text-neutral-100">
            {description}
          </p>
        </div>
      )}

      {nextRuns.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Next 5 Runs
          </p>
          <div className="space-y-1">
            {nextRuns.map((run, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded bg-neutral-100 px-3 py-2 text-sm dark:bg-neutral-800"
              >
                <span className="font-mono text-neutral-400">{i + 1}.</span>
                <span className="text-neutral-700 dark:text-neutral-300">
                  {run}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Common Expressions
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {COMMON_EXPRESSIONS.map(({ expr, desc }) => (
            <button
              key={expr}
              onClick={() => parse(expr)}
              className="flex items-center justify-between rounded border border-neutral-200 px-3 py-2 text-left text-sm transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              <span className="font-mono text-neutral-900 dark:text-neutral-100">
                {expr}
              </span>
              <span className="text-neutral-500">{desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
