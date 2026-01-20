export interface Tool {
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  keywords: string[];
  category: "encode-decode" | "format" | "generate" | "convert" | "validate";
  icon: string;
}

export const tools: Tool[] = [
  {
    slug: "json-formatter",
    name: "JSON Formatter & Validator",
    description:
      "Format, validate, and minify JSON instantly. Syntax highlighting and error detection included.",
    shortDescription: "Format & validate JSON",
    keywords: [
      "json formatter",
      "json validator",
      "json beautifier",
      "format json online",
    ],
    category: "format",
    icon: "{ }",
  },
  {
    slug: "base64",
    name: "Base64 Encode/Decode",
    description:
      "Encode text to Base64 or decode Base64 to text. Supports UTF-8 and binary data.",
    shortDescription: "Encode & decode Base64",
    keywords: ["base64 encode", "base64 decode", "base64 converter"],
    category: "encode-decode",
    icon: "🔤",
  },
  {
    slug: "uuid-generator",
    name: "UUID Generator",
    description:
      "Generate random UUIDs (v4) instantly. Bulk generation supported.",
    shortDescription: "Generate UUIDs",
    keywords: ["uuid generator", "guid generator", "random uuid"],
    category: "generate",
    icon: "🎲",
  },
  {
    slug: "url-encoder",
    name: "URL Encode/Decode",
    description:
      "Encode special characters for URLs or decode percent-encoded strings.",
    shortDescription: "Encode & decode URLs",
    keywords: [
      "url encode",
      "url decode",
      "percent encoding",
      "urlencode online",
    ],
    category: "encode-decode",
    icon: "🔗",
  },
  {
    slug: "timestamp-converter",
    name: "Unix Timestamp Converter",
    description:
      "Convert Unix timestamps to human-readable dates and vice versa. Supports seconds and milliseconds.",
    shortDescription: "Convert timestamps",
    keywords: ["unix timestamp", "epoch converter", "timestamp to date"],
    category: "convert",
    icon: "⏱️",
  },
  {
    slug: "hash-generator",
    name: "Hash Generator",
    description:
      "Generate MD5, SHA-1, SHA-256, and SHA-512 hashes from text. All processing happens locally.",
    shortDescription: "Generate hashes",
    keywords: ["md5 hash", "sha256 generator", "hash calculator"],
    category: "generate",
    icon: "#️⃣",
  },
  {
    slug: "jwt-decoder",
    name: "JWT Decoder",
    description:
      "Decode and inspect JSON Web Tokens. View header, payload, and verify expiration.",
    shortDescription: "Decode JWTs",
    keywords: ["jwt decoder", "jwt debugger", "decode jwt token"],
    category: "encode-decode",
    icon: "🎫",
  },
  {
    slug: "regex-tester",
    name: "Regex Tester",
    description:
      "Test regular expressions with real-time matching and capture group highlighting.",
    shortDescription: "Test regex patterns",
    keywords: ["regex tester", "regex101", "regular expression tester"],
    category: "validate",
    icon: ".*",
  },
  {
    slug: "diff-checker",
    name: "Diff Checker",
    description:
      "Compare two texts and see differences highlighted. Line-by-line diff view.",
    shortDescription: "Compare text differences",
    keywords: ["diff checker", "text compare", "diff tool online"],
    category: "validate",
    icon: "↔️",
  },
  {
    slug: "color-converter",
    name: "Color Converter",
    description:
      "Convert between HEX, RGB, and HSL color formats. Live color preview included.",
    shortDescription: "Convert color formats",
    keywords: ["hex to rgb", "color converter", "hsl to hex"],
    category: "convert",
    icon: "🎨",
  },
];

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}

export function getRelatedTools(slug: string, limit = 3): Tool[] {
  const current = getToolBySlug(slug);
  if (!current) return [];

  return tools
    .filter((t) => t.slug !== slug && t.category === current.category)
    .slice(0, limit);
}

export const categoryNames: Record<Tool["category"], string> = {
  "encode-decode": "Encode / Decode",
  format: "Format",
  generate: "Generate",
  convert: "Convert",
  validate: "Validate & Compare",
};
