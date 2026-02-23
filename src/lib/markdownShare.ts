import LZString from "lz-string";

const { compressToEncodedURIComponent, decompressFromEncodedURIComponent } =
  LZString;

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const V2_HASH_PREFIX = "#mdv2=";
const V1_HASH_PREFIX = "#md=";

export const MAX_MARKDOWN_SHARE_URL_LENGTH = 8_192;
export const MARKDOWN_SHARE_FILE_NAME = "markdown-preview.devutils-share";

type MarkdownShareFilePayload = {
  v: 1;
  tool: "markdown-preview";
  encoding: "gzip-base64url" | "lz-string-uri";
  content: string;
};

function hasGzipStreams() {
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

async function gzipCompress(input: string): Promise<Uint8Array> {
  if (!hasGzipStreams()) {
    throw new Error(
      "Gzip compression streams are not available in this browser",
    );
  }

  const stream = new CompressionStream("gzip");
  const writer = stream.writable.getWriter();
  await writer.write(textEncoder.encode(input));
  await writer.close();
  const compressed = await new Response(stream.readable).arrayBuffer();
  return new Uint8Array(compressed);
}

async function gzipDecompress(input: Uint8Array): Promise<string> {
  if (!hasGzipStreams()) {
    throw new Error(
      "Gzip decompression streams are not available in this browser",
    );
  }

  const stream = new DecompressionStream("gzip");
  const writer = stream.writable.getWriter();
  const copy = new Uint8Array(input.length);
  copy.set(input);
  await writer.write(copy);
  await writer.close();
  const decompressed = await new Response(stream.readable).arrayBuffer();
  return textDecoder.decode(decompressed);
}

export async function encodeMarkdownToHash(markdown: string): Promise<{
  hash: string;
  urlSafeLength: number;
}> {
  if (!hasGzipStreams()) {
    const compressed = compressToEncodedURIComponent(markdown);
    const hash = `${V1_HASH_PREFIX}${compressed}`;
    return { hash, urlSafeLength: hash.length };
  }

  const compressed = await gzipCompress(markdown);
  const encoded = toBase64Url(compressed);
  const hash = `${V2_HASH_PREFIX}${encoded}`;
  return { hash, urlSafeLength: hash.length };
}

export async function decodeMarkdownFromHash(
  hash: string,
): Promise<string | null> {
  if (hash.startsWith(V2_HASH_PREFIX)) {
    if (!hasGzipStreams()) return null;

    try {
      const encoded = hash.slice(V2_HASH_PREFIX.length);
      if (!encoded) return null;
      const compressed = fromBase64Url(encoded);
      return await gzipDecompress(compressed);
    } catch {
      return null;
    }
  }

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
  const payload: MarkdownShareFilePayload = hasGzipStreams()
    ? {
        v: 1,
        tool: "markdown-preview",
        encoding: "gzip-base64url",
        content: toBase64Url(await gzipCompress(markdown)),
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
    (payload.encoding !== "gzip-base64url" &&
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

  if (!hasGzipStreams()) {
    throw new Error("Cannot load gzip share file without stream support");
  }
  const compressed = fromBase64Url(payload.content);
  return gzipDecompress(compressed);
}

export function isShareHash(hash: string): boolean {
  return hash.startsWith(V2_HASH_PREFIX) || hash.startsWith(V1_HASH_PREFIX);
}
