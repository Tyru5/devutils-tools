import { useState } from "react";
import * as jose from "jose";
import Textarea from "./shared/Textarea";
import CopyButton from "./shared/CopyButton";

type Algorithm = "HS256" | "HS384" | "HS512";

const ALGORITHMS: Algorithm[] = ["HS256", "HS384", "HS512"];

const DEFAULT_PAYLOAD = JSON.stringify(
  {
    sub: "1234567890",
    name: "John Doe",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  },
  null,
  2,
);

export default function JwtGenerator() {
  const [payload, setPayload] = useState(DEFAULT_PAYLOAD);
  const [secret, setSecret] = useState("your-256-bit-secret");
  const [algorithm, setAlgorithm] = useState<Algorithm>("HS256");
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    try {
      const claims = JSON.parse(payload);
      const secretKey = new TextEncoder().encode(secret);

      const jwt = await new jose.SignJWT(claims)
        .setProtectedHeader({ alg: algorithm, typ: "JWT" })
        .sign(secretKey);

      setToken(jwt);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate JWT");
      setToken("");
    }
  };

  const addClaim = (key: string, value: unknown) => {
    try {
      const claims = JSON.parse(payload);
      claims[key] = value;
      setPayload(JSON.stringify(claims, null, 2));
    } catch {
      setError("Invalid JSON in payload");
    }
  };

  const setExpiry = (seconds: number) => {
    addClaim("exp", Math.floor(Date.now() / 1000) + seconds);
  };

  const clear = () => {
    setPayload(DEFAULT_PAYLOAD);
    setSecret("your-256-bit-secret");
    setToken("");
    setError(null);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Secret Key
            </label>
            <input
              type="text"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Enter your secret key..."
              className="input w-full font-mono"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Algorithm
            </label>
            <div className="flex gap-2">
              {ALGORITHMS.map((alg) => (
                <button
                  key={alg}
                  onClick={() => setAlgorithm(alg)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    algorithm === alg
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                      : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
                  }`}
                >
                  {alg}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Payload (JSON)
              </label>
              <div className="flex gap-2 text-xs">
                <button
                  onClick={() => setExpiry(3600)}
                  className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                >
                  +1h
                </button>
                <button
                  onClick={() => setExpiry(86400)}
                  className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                >
                  +1d
                </button>
                <button
                  onClick={() => setExpiry(604800)}
                  className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                >
                  +7d
                </button>
              </div>
            </div>
            <Textarea
              value={payload}
              onChange={setPayload}
              placeholder='{"sub": "1234567890"}'
              rows={10}
              className={
                error?.includes("JSON")
                  ? "border-red-500 dark:border-red-500"
                  : ""
              }
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Generated JWT
          </label>
          <Textarea
            value={token}
            readOnly
            placeholder="Generated token will appear here..."
            rows={14}
          />
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button onClick={generate} className="btn btn-primary">
          Generate JWT
        </button>
        <CopyButton text={token} disabled={!token} />
        <button onClick={clear} className="btn btn-ghost">
          Clear
        </button>
      </div>

      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          <strong>Security Note:</strong> This tool generates JWTs client-side
          for testing purposes. Never expose your production secret keys in a
          browser.
        </p>
      </div>
    </div>
  );
}
