import { useState } from "react";
import YAML from "yaml";
import Textarea from "./shared/Textarea";

interface OpenApiSpec {
  openapi?: string;
  swagger?: string;
  info?: {
    title?: string;
    version?: string;
    description?: string;
  };
  servers?: Array<{ url: string; description?: string }>;
  paths?: Record<string, Record<string, PathItem>>;
}

interface PathItem {
  summary?: string;
  description?: string;
  operationId?: string;
  tags?: string[];
  parameters?: Parameter[];
  requestBody?: {
    description?: string;
    content?: Record<string, { schema?: Schema }>;
  };
  responses?: Record<
    string,
    { description?: string; content?: Record<string, { schema?: Schema }> }
  >;
}

interface Parameter {
  name: string;
  in: string;
  required?: boolean;
  description?: string;
  schema?: Schema;
}

interface Schema {
  type?: string;
  format?: string;
  properties?: Record<string, Schema>;
  items?: Schema;
  $ref?: string;
}

const METHOD_COLORS: Record<string, string> = {
  get: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  post: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  put: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  patch:
    "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  delete: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

const EXAMPLE_SPEC = `openapi: 3.0.0
info:
  title: Sample API
  version: 1.0.0
  description: A sample API for demonstration
servers:
  - url: https://api.example.com/v1
paths:
  /users:
    get:
      summary: List all users
      tags: [Users]
      responses:
        '200':
          description: Success
    post:
      summary: Create a user
      tags: [Users]
      requestBody:
        content:
          application/json:
            schema:
              type: object
  /users/{id}:
    get:
      summary: Get user by ID
      tags: [Users]
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string`;

export default function OpenApiViewer() {
  const [input, setInput] = useState("");
  const [spec, setSpec] = useState<OpenApiSpec | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

  const parse = () => {
    if (!input.trim()) {
      setSpec(null);
      setError(null);
      return;
    }

    try {
      let parsed: OpenApiSpec;
      if (input.trim().startsWith("{")) {
        parsed = JSON.parse(input);
      } else {
        parsed = YAML.parse(input);
      }

      if (!parsed.openapi && !parsed.swagger) {
        throw new Error("Invalid OpenAPI/Swagger specification");
      }

      setSpec(parsed);
      setError(null);
      setExpandedPaths(new Set());
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to parse specification",
      );
      setSpec(null);
    }
  };

  const loadExample = () => {
    setInput(EXAMPLE_SPEC);
    setError(null);
  };

  const togglePath = (pathKey: string) => {
    const newExpanded = new Set(expandedPaths);
    if (newExpanded.has(pathKey)) {
      newExpanded.delete(pathKey);
    } else {
      newExpanded.add(pathKey);
    }
    setExpandedPaths(newExpanded);
  };

  const clear = () => {
    setInput("");
    setSpec(null);
    setError(null);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              OpenAPI/Swagger Spec (YAML or JSON)
            </label>
            <button
              onClick={loadExample}
              className="text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            >
              Load example
            </button>
          </div>
          <Textarea
            value={input}
            onChange={(val) => {
              setInput(val);
              setError(null);
            }}
            placeholder="Paste your OpenAPI spec here..."
            rows={20}
            className={error ? "border-red-500 dark:border-red-500" : ""}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button onClick={parse} className="btn btn-primary">
              Parse
            </button>
            <button onClick={clear} className="btn btn-ghost">
              Clear
            </button>
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
              {error}
            </div>
          )}

          {spec && (
            <div className="space-y-4">
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {spec.info?.title || "Untitled API"}
                    </h3>
                    <p className="text-sm text-neutral-500">
                      Version {spec.info?.version || "N/A"} •{" "}
                      {spec.openapi
                        ? `OpenAPI ${spec.openapi}`
                        : `Swagger ${spec.swagger}`}
                    </p>
                  </div>
                </div>
                {spec.info?.description && (
                  <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                    {spec.info.description}
                  </p>
                )}
                {spec.servers && spec.servers.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-neutral-500">
                      Servers
                    </p>
                    {spec.servers.map((server, i) => (
                      <code
                        key={i}
                        className="mt-1 block text-xs text-neutral-700 dark:text-neutral-300"
                      >
                        {server.url}
                      </code>
                    ))}
                  </div>
                )}
              </div>

              {spec.paths && (
                <div className="space-y-2">
                  <h4 className="font-medium text-neutral-700 dark:text-neutral-300">
                    Endpoints ({Object.keys(spec.paths).length})
                  </h4>
                  {Object.entries(spec.paths).map(([path, methods]) => (
                    <div
                      key={path}
                      className="rounded border border-neutral-200 dark:border-neutral-700"
                    >
                      <button
                        onClick={() => togglePath(path)}
                        className="flex w-full items-center justify-between p-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      >
                        <code className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {path}
                        </code>
                        <div className="flex gap-1">
                          {Object.keys(methods)
                            .filter((m) => m !== "parameters")
                            .map((method) => (
                              <span
                                key={method}
                                className={`rounded px-2 py-0.5 text-xs font-medium uppercase ${
                                  METHOD_COLORS[method] ||
                                  "bg-neutral-100 text-neutral-700"
                                }`}
                              >
                                {method}
                              </span>
                            ))}
                        </div>
                      </button>
                      {expandedPaths.has(path) && (
                        <div className="border-t border-neutral-200 p-3 dark:border-neutral-700">
                          {Object.entries(methods)
                            .filter(([m]) => m !== "parameters")
                            .map(([method, details]) => (
                              <div key={method} className="mb-3 last:mb-0">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`rounded px-2 py-0.5 text-xs font-medium uppercase ${
                                      METHOD_COLORS[method] || "bg-neutral-100"
                                    }`}
                                  >
                                    {method}
                                  </span>
                                  <span className="text-sm text-neutral-700 dark:text-neutral-300">
                                    {(details as PathItem).summary ||
                                      "No summary"}
                                  </span>
                                </div>
                                {(details as PathItem).tags && (
                                  <div className="mt-1 flex gap-1">
                                    {(details as PathItem).tags?.map((tag) => (
                                      <span
                                        key={tag}
                                        className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs dark:bg-neutral-800"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
