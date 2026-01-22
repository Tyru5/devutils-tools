import { useState } from "react";
import { JSONPath } from "jsonpath-plus";
import Textarea from "./shared/Textarea";
import CopyButton from "./shared/CopyButton";

const EXAMPLE_JSON = `{
  "store": {
    "books": [
      { "title": "The Great Gatsby", "author": "F. Scott Fitzgerald", "price": 10.99 },
      { "title": "1984", "author": "George Orwell", "price": 8.99 },
      { "title": "To Kill a Mockingbird", "author": "Harper Lee", "price": 12.99 }
    ],
    "location": "New York"
  }
}`;

const EXAMPLE_PATHS = [
  { path: "$.store.books[*].title", desc: "All book titles" },
  { path: "$.store.books[0]", desc: "First book" },
  { path: "$.store.books[?(@.price < 10)]", desc: "Books under $10" },
  { path: "$..author", desc: "All authors (recursive)" },
  { path: "$.store.books.length", desc: "Number of books" },
];

export default function JsonPathTester() {
  const [json, setJson] = useState(EXAMPLE_JSON);
  const [path, setPath] = useState("$.store.books[*].title");
  const [result, setResult] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [matchCount, setMatchCount] = useState(0);

  const query = () => {
    if (!json.trim() || !path.trim()) {
      setResult("");
      setError(null);
      setMatchCount(0);
      return;
    }

    try {
      const parsed = JSON.parse(json);
      const matches = JSONPath({ path, json: parsed, wrap: true });

      setMatchCount(matches.length);
      setResult(JSON.stringify(matches, null, 2));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Query failed");
      setResult("");
      setMatchCount(0);
    }
  };

  const clear = () => {
    setJson("");
    setPath("");
    setResult("");
    setError(null);
    setMatchCount(0);
  };

  const loadExample = () => {
    setJson(EXAMPLE_JSON);
    setPath("$.store.books[*].title");
    setError(null);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              JSON
            </label>
            <button
              onClick={loadExample}
              className="text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            >
              Load example
            </button>
          </div>
          <Textarea
            value={json}
            onChange={(val) => {
              setJson(val);
              setError(null);
            }}
            placeholder='{"key": "value"}'
            rows={14}
            className={
              error?.includes("JSON")
                ? "border-red-500 dark:border-red-500"
                : ""
            }
          />
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              JSONPath Expression
            </label>
            <input
              type="text"
              value={path}
              onChange={(e) => {
                setPath(e.target.value);
                setError(null);
              }}
              placeholder="$.store.books[*].title"
              className={`input w-full font-mono ${
                error && !error.includes("JSON")
                  ? "border-red-500 dark:border-red-500"
                  : ""
              }`}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button onClick={query} className="btn btn-primary">
              Query
            </button>
            <CopyButton text={result} disabled={!result} />
            <button onClick={clear} className="btn btn-ghost">
              Clear
            </button>
            {matchCount > 0 && (
              <span className="text-sm text-neutral-500">
                {matchCount} match{matchCount !== 1 ? "es" : ""}
              </span>
            )}
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
              {error}
            </div>
          )}

          {result && (
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Result
              </label>
              <Textarea value={result} readOnly rows={8} />
            </div>
          )}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Example Paths
        </p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {EXAMPLE_PATHS.map(({ path: p, desc }) => (
            <button
              key={p}
              onClick={() => setPath(p)}
              className="rounded border border-neutral-200 px-3 py-2 text-left text-sm transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              <span className="block font-mono text-neutral-900 dark:text-neutral-100">
                {p}
              </span>
              <span className="text-neutral-500">{desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
