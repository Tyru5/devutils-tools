import LZString from "lz-string";

const { compressToEncodedURIComponent, decompressFromEncodedURIComponent } =
  LZString;

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const V3_HASH_PREFIX = "#mdv3=";
const V2_HASH_PREFIX = "#mdv2=";
const V1_HASH_PREFIX = "#md=";

export const MAX_MARKDOWN_SHARE_URL_LENGTH = 8_192;
export const MARKDOWN_SHARE_FILE_NAME = "markdown-preview.devutils-share";

type MarkdownShareFilePayload = {
  v: 1;
  tool: "markdown-preview";
  encoding: "deflate-raw-base64url" | "gzip-base64url" | "lz-string-uri";
  content: string;
};

function hasCompressionStreams() {
  return (
    typeof CompressionStream !== "undefined" &&
    typeof DecompressionStream !== "undefined"
  );
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(base64Url: string): Uint8Array {
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(base64 + padding);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

async function deflateRawCompress(input: string): Promise<Uint8Array> {
  if (!hasCompressionStreams()) {
    throw new Error("Compression streams are not available in this browser");
  }

  const stream = new CompressionStream("deflate-raw");
  const writer = stream.writable.getWriter();
  // Start reading BEFORE writing to avoid deadlock — the readable side
  // must be consumed concurrently or the writable side can stall.
  const responsePromise = new Response(stream.readable).arrayBuffer();
  await writer.write(textEncoder.encode(input));
  await writer.close();
  const compressed = await responsePromise;
  return new Uint8Array(compressed);
}

async function deflateRawDecompress(input: Uint8Array): Promise<string> {
  if (!hasCompressionStreams()) {
    throw new Error("Decompression streams are not available in this browser");
  }

  const stream = new DecompressionStream("deflate-raw");
  const writer = stream.writable.getWriter();
  // Start reading BEFORE writing to avoid deadlock — the readable side
  // must be consumed concurrently or the writable side can stall.
  const responsePromise = new Response(stream.readable).arrayBuffer();
  const copy = new Uint8Array(input.length);
  copy.set(input);
  await writer.write(copy);
  await writer.close();
  const decompressed = await responsePromise;
  return textDecoder.decode(decompressed);
}

// Keep gzip decompression for backward compatibility with V2 URLs
async function gzipDecompress(input: Uint8Array): Promise<string> {
  if (!hasCompressionStreams()) {
    throw new Error("Decompression streams are not available in this browser");
  }

  const stream = new DecompressionStream("gzip");
  const writer = stream.writable.getWriter();
  const responsePromise = new Response(stream.readable).arrayBuffer();
  const copy = new Uint8Array(input.length);
  copy.set(input);
  await writer.write(copy);
  await writer.close();
  const decompressed = await responsePromise;
  return textDecoder.decode(decompressed);
}

export async function encodeMarkdownToHash(markdown: string): Promise<{
  hash: string;
  urlSafeLength: number;
}> {
  if (!hasCompressionStreams()) {
    const compressed = compressToEncodedURIComponent(markdown);
    const hash = `${V1_HASH_PREFIX}${compressed}`;
    return { hash, urlSafeLength: hash.length };
  }

  // deflate-raw skips gzip's 10-byte header + 8-byte footer = 18 bytes saved
  const compressed = await deflateRawCompress(markdown);
  const encoded = toBase64Url(compressed);
  const hash = `${V3_HASH_PREFIX}${encoded}`;
  return { hash, urlSafeLength: hash.length };
}

export async function decodeMarkdownFromHash(
  hash: string,
): Promise<string | null> {
  // V3: deflate-raw + base64url (current)
  if (hash.startsWith(V3_HASH_PREFIX)) {
    if (!hasCompressionStreams()) return null;

    try {
      const encoded = hash.slice(V3_HASH_PREFIX.length);
      if (!encoded) return null;
      const compressed = fromBase64Url(encoded);
      return await deflateRawDecompress(compressed);
    } catch {
      return null;
    }
  }

  // V2: gzip + base64url (backward compat)
  if (hash.startsWith(V2_HASH_PREFIX)) {
    if (!hasCompressionStreams()) return null;

    try {
      const encoded = hash.slice(V2_HASH_PREFIX.length);
      if (!encoded) return null;
      const compressed = fromBase64Url(encoded);
      return await gzipDecompress(compressed);
    } catch {
      return null;
    }
  }

  // V1: lz-string (backward compat)
  if (hash.startsWith(V1_HASH_PREFIX)) {
    try {
      return decompressFromEncodedURIComponent(
        hash.slice(V1_HASH_PREFIX.length),
      );
    } catch {
      return null;
    }
  }

  return null;
}

export async function buildShareFile(markdown: string): Promise<File> {
  const payload: MarkdownShareFilePayload = hasCompressionStreams()
    ? {
        v: 1,
        tool: "markdown-preview",
        encoding: "deflate-raw-base64url",
        content: toBase64Url(await deflateRawCompress(markdown)),
      }
    : {
        v: 1,
        tool: "markdown-preview",
        encoding: "lz-string-uri",
        content: compressToEncodedURIComponent(markdown),
      };

  return new File([JSON.stringify(payload)], MARKDOWN_SHARE_FILE_NAME, {
    type: "application/json",
  });
}

export async function parseShareFile(fileText: string): Promise<string> {
  let payload: unknown;
  try {
    payload = JSON.parse(fileText);
  } catch {
    throw new Error("Invalid share file JSON");
  }

  if (
    typeof payload !== "object" ||
    payload === null ||
    !("v" in payload) ||
    payload.v !== 1 ||
    !("tool" in payload) ||
    payload.tool !== "markdown-preview" ||
    !("encoding" in payload) ||
    (payload.encoding !== "deflate-raw-base64url" &&
      payload.encoding !== "gzip-base64url" &&
      payload.encoding !== "lz-string-uri") ||
    !("content" in payload) ||
    typeof payload.content !== "string"
  ) {
    throw new Error("Unsupported share file format");
  }

  if (payload.encoding === "lz-string-uri") {
    const decompressed = decompressFromEncodedURIComponent(payload.content);
    if (decompressed === null) {
      throw new Error("Invalid lz-string share payload");
    }
    return decompressed;
  }

  if (!hasCompressionStreams()) {
    throw new Error("Cannot load compressed share file without stream support");
  }
  const compressed = fromBase64Url(payload.content);
  if (payload.encoding === "deflate-raw-base64url") {
    return deflateRawDecompress(compressed);
  }
  return gzipDecompress(compressed);
}

export function isShareHash(hash: string): boolean {
  return (
    hash.startsWith(V3_HASH_PREFIX) ||
    hash.startsWith(V2_HASH_PREFIX) ||
    hash.startsWith(V1_HASH_PREFIX)
  );
}
