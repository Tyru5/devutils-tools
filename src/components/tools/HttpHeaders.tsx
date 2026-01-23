import { useState } from "react";
import Textarea from "./shared/Textarea";

interface ParsedHeader {
  name: string;
  value: string;
  description: string;
  category: string;
}

const HEADER_DESCRIPTIONS: Record<
  string,
  { description: string; category: string }
> = {
  "content-type": {
    description: "Media type of the resource",
    category: "Content",
  },
  "content-length": {
    description: "Size of the response body in bytes",
    category: "Content",
  },
  "content-encoding": {
    description: "Compression algorithm used",
    category: "Content",
  },
  "cache-control": {
    description: "Caching directives for the response",
    category: "Caching",
  },
  expires: {
    description: "Date/time after which response is stale",
    category: "Caching",
  },
  etag: {
    description: "Unique identifier for resource version",
    category: "Caching",
  },
  "last-modified": {
    description: "Date of last modification",
    category: "Caching",
  },
  age: {
    description: "Time in seconds the object was in proxy cache",
    category: "Caching",
  },
  "access-control-allow-origin": {
    description: "Allowed origins for CORS",
    category: "CORS",
  },
  "access-control-allow-methods": {
    description: "Allowed HTTP methods for CORS",
    category: "CORS",
  },
  "access-control-allow-headers": {
    description: "Allowed request headers for CORS",
    category: "CORS",
  },
  "access-control-max-age": {
    description: "How long CORS preflight can be cached",
    category: "CORS",
  },
  "access-control-allow-credentials": {
    description: "Whether credentials are allowed",
    category: "CORS",
  },
  "strict-transport-security": {
    description: "Enforce HTTPS connections (HSTS)",
    category: "Security",
  },
  "content-security-policy": {
    description: "Control resources the browser can load",
    category: "Security",
  },
  "x-frame-options": {
    description: "Prevent clickjacking attacks",
    category: "Security",
  },
  "x-content-type-options": {
    description: "Prevent MIME type sniffing",
    category: "Security",
  },
  "x-xss-protection": {
    description: "XSS filter (deprecated)",
    category: "Security",
  },
  "referrer-policy": {
    description: "Control referrer information sent",
    category: "Security",
  },
  "permissions-policy": {
    description: "Control browser features",
    category: "Security",
  },
  authorization: {
    description: "Credentials for authentication",
    category: "Auth",
  },
  "www-authenticate": {
    description: "Authentication method required",
    category: "Auth",
  },
  cookie: { description: "Stored cookies sent to server", category: "Auth" },
  "set-cookie": { description: "Set a cookie on the client", category: "Auth" },
  location: { description: "Redirect URL", category: "Redirect" },
  host: { description: "Host and port of the server", category: "Request" },
  "user-agent": {
    description: "Client application identifier",
    category: "Request",
  },
  accept: {
    description: "Media types the client accepts",
    category: "Request",
  },
  "accept-encoding": {
    description: "Encodings the client accepts",
    category: "Request",
  },
  "accept-language": {
    description: "Languages the client accepts",
    category: "Request",
  },
  connection: {
    description: "Control options for the connection",
    category: "Connection",
  },
  "keep-alive": {
    description: "Parameters for persistent connections",
    category: "Connection",
  },
  "transfer-encoding": {
    description: "Form of encoding for transfer",
    category: "Transfer",
  },
  date: {
    description: "Date and time the message was sent",
    category: "General",
  },
  server: {
    description: "Information about the server software",
    category: "General",
  },
  vary: {
    description: "Headers used for content negotiation",
    category: "General",
  },
};

function parseHeaders(text: string): ParsedHeader[] {
  const lines = text.split("\n").filter((l) => l.trim());
  const headers: ParsedHeader[] = [];

  for (const line of lines) {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;

    const name = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();
    const nameLower = name.toLowerCase();
    const info = HEADER_DESCRIPTIONS[nameLower] || {
      description: "Custom header",
      category: "Custom",
    };

    headers.push({
      name,
      value,
      description: info.description,
      category: info.category,
    });
  }

  return headers;
}

const CATEGORY_COLORS: Record<string, string> = {
  Content: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  Caching: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  CORS: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  Security: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  Auth: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  Request:
    "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  Custom:
    "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400",
};

const EXAMPLE = `content-type: application/json; charset=utf-8
cache-control: max-age=3600, public
strict-transport-security: max-age=31536000; includeSubDomains
access-control-allow-origin: *
x-content-type-options: nosniff
x-frame-options: DENY`;

export default function HttpHeaders() {
  const [input, setInput] = useState("");
  const [headers, setHeaders] = useState<ParsedHeader[]>([]);

  const parse = () => {
    setHeaders(parseHeaders(input));
  };

  const loadExample = () => {
    setInput(EXAMPLE);
    setHeaders(parseHeaders(EXAMPLE));
  };

  const clear = () => {
    setInput("");
    setHeaders([]);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              HTTP Headers
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
            onChange={setInput}
            placeholder="Paste HTTP headers here (one per line)..."
            rows={12}
          />
        </div>

        <div className="space-y-2">
          {headers.length > 0 ? (
            headers.map((header, i) => (
              <div
                key={i}
                className="rounded border border-neutral-200 p-3 dark:border-neutral-700"
              >
                <div className="flex items-start justify-between gap-2">
                  <code className="font-mono text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {header.name}
                  </code>
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${
                      CATEGORY_COLORS[header.category] || CATEGORY_COLORS.Custom
                    }`}
                  >
                    {header.category}
                  </span>
                </div>
                <p className="mt-1 break-all font-mono text-xs text-neutral-600 dark:text-neutral-400">
                  {header.value}
                </p>
                <p className="mt-2 text-xs text-neutral-500">
                  {header.description}
                </p>
              </div>
            ))
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-neutral-500">
              Parsed headers will appear here
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button onClick={parse} className="btn btn-primary">
          Parse
        </button>
        <button onClick={clear} className="btn btn-ghost">
          Clear
        </button>
        {headers.length > 0 && (
          <span className="text-sm text-neutral-500">
            {headers.length} header{headers.length !== 1 ? "s" : ""} parsed
          </span>
        )}
      </div>
    </div>
  );
}
