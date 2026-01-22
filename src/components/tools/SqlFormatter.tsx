import { useState } from "react";
import { format } from "sql-formatter";
import Textarea from "./shared/Textarea";
import CopyButton from "./shared/CopyButton";

type Dialect =
  | "sql"
  | "postgresql"
  | "mysql"
  | "mariadb"
  | "sqlite"
  | "transactsql"
  | "bigquery"
  | "redshift";

const DIALECTS: { value: Dialect; label: string }[] = [
  { value: "sql", label: "Standard SQL" },
  { value: "postgresql", label: "PostgreSQL" },
  { value: "mysql", label: "MySQL" },
  { value: "mariadb", label: "MariaDB" },
  { value: "sqlite", label: "SQLite" },
  { value: "transactsql", label: "SQL Server" },
  { value: "bigquery", label: "BigQuery" },
  { value: "redshift", label: "Redshift" },
];

export default function SqlFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [dialect, setDialect] = useState<Dialect>("sql");
  const [tabWidth, setTabWidth] = useState(2);
  const [uppercase, setUppercase] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatSql = () => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }

    try {
      const formatted = format(input, {
        language: dialect,
        tabWidth,
        keywordCase: uppercase ? "upper" : "preserve",
        linesBetweenQueries: 2,
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
        .replace(/--.*$/gm, "")
        .replace(/\/\*[\s\S]*?\*\//g, "")
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
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Dialect
          </label>
          <select
            value={dialect}
            onChange={(e) => setDialect(e.target.value as Dialect)}
            className="input"
          >
            {DIALECTS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Indent
          </label>
          <select
            value={tabWidth}
            onChange={(e) => setTabWidth(parseInt(e.target.value))}
            className="input w-20"
          >
            <option value={2}>2</option>
            <option value={4}>4</option>
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
          <input
            type="checkbox"
            checked={uppercase}
            onChange={(e) => setUppercase(e.target.checked)}
            className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-600"
          />
          Uppercase keywords
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Textarea
          value={input}
          onChange={(val) => {
            setInput(val);
            setError(null);
          }}
          placeholder="SELECT * FROM users WHERE id = 1"
          label="Input SQL"
          rows={14}
          className={error ? "border-red-500 dark:border-red-500" : ""}
        />
        <Textarea
          value={output}
          readOnly
          placeholder="Formatted SQL..."
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
        <button onClick={formatSql} className="btn btn-primary">
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
