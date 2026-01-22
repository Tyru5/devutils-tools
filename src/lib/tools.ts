export interface Tool {
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  keywords: string[];
  category:
    | "encode-decode"
    | "format"
    | "generate"
    | "convert"
    | "validate"
    | "security";
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
  {
    slug: "markdown-preview",
    name: "Markdown Preview",
    description: "Live markdown editor with real-time preview. GFM supported.",
    shortDescription: "Preview markdown",
    keywords: [
      "markdown editor",
      "markdown preview",
      "md to html",
      "markdown renderer",
    ],
    category: "format",
    icon: "M↓",
  },
  {
    slug: "lorem-ipsum",
    name: "Lorem Ipsum Generator",
    description:
      "Generate placeholder text for designs and mockups. Configurable paragraphs, sentences, or words.",
    shortDescription: "Generate placeholder text",
    keywords: ["lorem ipsum", "placeholder text", "dummy text", "lipsum"],
    category: "generate",
    icon: "📝",
  },
  {
    slug: "number-base",
    name: "Number Base Converter",
    description:
      "Convert numbers between binary, decimal, hexadecimal, and octal. Supports large numbers.",
    shortDescription: "Convert number bases",
    keywords: [
      "binary converter",
      "hex to decimal",
      "octal converter",
      "base converter",
    ],
    category: "convert",
    icon: "🔢",
  },
  {
    slug: "text-case",
    name: "Text Case Converter",
    description:
      "Convert text between camelCase, snake_case, kebab-case, PascalCase, CONSTANT_CASE, and more.",
    shortDescription: "Convert text case",
    keywords: [
      "camelcase",
      "snake case",
      "kebab case",
      "text case converter",
      "slugify",
    ],
    category: "convert",
    icon: "Aa",
  },
  {
    slug: "password-generator",
    name: "Password Generator",
    description:
      "Generate secure random passwords with configurable length and character sets. Includes strength meter.",
    shortDescription: "Generate secure passwords",
    keywords: [
      "password generator",
      "random password",
      "secure password",
      "strong password",
    ],
    category: "security",
    icon: "🔐",
  },
  {
    slug: "html-entities",
    name: "HTML Entity Encoder/Decoder",
    description:
      "Encode special characters to HTML entities or decode entities back to characters.",
    shortDescription: "Encode/decode HTML entities",
    keywords: [
      "html entities",
      "html encode",
      "html decode",
      "special characters",
    ],
    category: "encode-decode",
    icon: "&lt;",
  },
  {
    slug: "backslash-escape",
    name: "Backslash Escape/Unescape",
    description:
      "Escape or unescape special characters like newlines, tabs, and quotes for use in strings.",
    shortDescription: "Escape/unescape strings",
    keywords: [
      "escape string",
      "unescape string",
      "backslash escape",
      "string escape",
    ],
    category: "encode-decode",
    icon: "\\\\",
  },
  {
    slug: "chmod-calculator",
    name: "chmod Calculator",
    description:
      "Convert between symbolic (rwxr-xr-x) and numeric (755) Unix file permissions.",
    shortDescription: "Calculate file permissions",
    keywords: [
      "chmod calculator",
      "file permissions",
      "unix permissions",
      "rwx to number",
    ],
    category: "convert",
    icon: "🔒",
  },
  {
    slug: "epoch-batch",
    name: "Epoch Batch Converter",
    description:
      "Convert multiple Unix timestamps at once. Paste a list and get human-readable dates.",
    shortDescription: "Batch convert timestamps",
    keywords: [
      "batch timestamp",
      "multiple timestamps",
      "epoch batch",
      "bulk timestamp converter",
    ],
    category: "convert",
    icon: "📅",
  },
  {
    slug: "yaml-json",
    name: "YAML ↔ JSON Converter",
    description:
      "Convert between YAML and JSON formats. Perfect for Kubernetes configs and CI/CD pipelines.",
    shortDescription: "Convert YAML & JSON",
    keywords: [
      "yaml to json",
      "json to yaml",
      "yaml converter",
      "kubernetes yaml",
    ],
    category: "convert",
    icon: "📄",
  },
  {
    slug: "csv-json",
    name: "CSV ↔ JSON Converter",
    description:
      "Convert CSV to JSON arrays or JSON back to CSV. Handles headers and custom delimiters.",
    shortDescription: "Convert CSV & JSON",
    keywords: ["csv to json", "json to csv", "csv converter", "csv parser"],
    category: "convert",
    icon: "📊",
  },
  {
    slug: "toml-json",
    name: "TOML ↔ JSON Converter",
    description:
      "Convert between TOML and JSON formats. Common for Rust and Python config files.",
    shortDescription: "Convert TOML & JSON",
    keywords: ["toml to json", "json to toml", "toml converter", "cargo toml"],
    category: "convert",
    icon: "⚙️",
  },
  {
    slug: "cron-parser",
    name: "Cron Expression Parser",
    description:
      "Parse and explain cron expressions in plain English. Shows next scheduled run times.",
    shortDescription: "Parse cron expressions",
    keywords: ["cron parser", "cron expression", "crontab", "cron schedule"],
    category: "validate",
    icon: "⏰",
  },
  {
    slug: "jsonpath-tester",
    name: "JSONPath Tester",
    description:
      "Test JSONPath expressions against JSON data. Find and extract nested values easily.",
    shortDescription: "Test JSONPath queries",
    keywords: ["jsonpath", "json query", "jsonpath tester", "json selector"],
    category: "validate",
    icon: "🔍",
  },
  {
    slug: "unicode-inspector",
    name: "Unicode Inspector",
    description:
      "Inspect Unicode characters. View code points, names, UTF-8 bytes, and character properties.",
    shortDescription: "Inspect Unicode chars",
    keywords: ["unicode", "code point", "utf-8", "character inspector"],
    category: "validate",
    icon: "🔤",
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
  security: "Security & Crypto",
};
