import { useState } from "react";
import CopyButton from "./shared/CopyButton";

const LOREM_WORDS = [
  "lorem",
  "ipsum",
  "dolor",
  "sit",
  "amet",
  "consectetur",
  "adipiscing",
  "elit",
  "sed",
  "do",
  "eiusmod",
  "tempor",
  "incididunt",
  "ut",
  "labore",
  "et",
  "dolore",
  "magna",
  "aliqua",
  "enim",
  "ad",
  "minim",
  "veniam",
  "quis",
  "nostrud",
  "exercitation",
  "ullamco",
  "laboris",
  "nisi",
  "aliquip",
  "ex",
  "ea",
  "commodo",
  "consequat",
  "duis",
  "aute",
  "irure",
  "in",
  "reprehenderit",
  "voluptate",
  "velit",
  "esse",
  "cillum",
  "fugiat",
  "nulla",
  "pariatur",
  "excepteur",
  "sint",
  "occaecat",
  "cupidatat",
  "non",
  "proident",
  "sunt",
  "culpa",
  "qui",
  "officia",
  "deserunt",
  "mollit",
  "anim",
  "id",
  "est",
  "laborum",
  "perspiciatis",
  "unde",
  "omnis",
  "iste",
  "natus",
  "error",
  "voluptatem",
  "accusantium",
  "doloremque",
  "laudantium",
  "totam",
  "rem",
  "aperiam",
  "eaque",
  "ipsa",
  "quae",
  "ab",
  "illo",
  "inventore",
  "veritatis",
  "quasi",
  "architecto",
  "beatae",
  "vitae",
  "dicta",
  "explicabo",
  "nemo",
  "ipsam",
  "quia",
  "voluptas",
  "aspernatur",
  "aut",
  "odit",
  "fugit",
  "consequuntur",
  "magni",
  "dolores",
  "eos",
  "ratione",
  "sequi",
  "nesciunt",
  "neque",
  "porro",
  "quisquam",
  "nihil",
  "impedit",
  "quo",
  "minus",
];

type OutputType = "paragraphs" | "sentences" | "words";

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getRandomWord(): string {
  return LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];
}

function generateSentence(wordCount: number): string {
  const words = Array.from({ length: wordCount }, getRandomWord);
  words[0] = capitalize(words[0]);
  return words.join(" ") + ".";
}

function generateParagraph(sentenceCount: number): string {
  return Array.from({ length: sentenceCount }, () =>
    generateSentence(Math.floor(Math.random() * 8) + 8),
  ).join(" ");
}

export default function LoremIpsumGenerator() {
  const [count, setCount] = useState(3);
  const [outputType, setOutputType] = useState<OutputType>("paragraphs");
  const [output, setOutput] = useState("");
  const [startWithLorem, setStartWithLorem] = useState(true);

  const generate = () => {
    let result = "";

    if (outputType === "words") {
      const words = Array.from({ length: count }, getRandomWord);
      if (startWithLorem && words.length >= 2) {
        words[0] = "lorem";
        words[1] = "ipsum";
      }
      result = words.join(" ");
    } else if (outputType === "sentences") {
      const sentences = Array.from({ length: count }, () =>
        generateSentence(Math.floor(Math.random() * 8) + 8),
      );
      if (startWithLorem && sentences.length > 0) {
        sentences[0] =
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
      }
      result = sentences.join(" ");
    } else {
      const paragraphs = Array.from({ length: count }, () =>
        generateParagraph(Math.floor(Math.random() * 3) + 4),
      );
      if (startWithLorem && paragraphs.length > 0) {
        paragraphs[0] =
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. " +
          paragraphs[0].split(". ").slice(1).join(". ");
      }
      result = paragraphs.join("\n\n");
    }

    setOutput(result);
  };

  const clear = () => {
    setOutput("");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Generate
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) =>
                setCount(
                  Math.max(1, Math.min(100, parseInt(e.target.value) || 1)),
                )
              }
              className="input w-20"
            />
            <select
              value={outputType}
              onChange={(e) => setOutputType(e.target.value as OutputType)}
              className="input"
            >
              <option value="paragraphs">Paragraphs</option>
              <option value="sentences">Sentences</option>
              <option value="words">Words</option>
            </select>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
          <input
            type="checkbox"
            checked={startWithLorem}
            onChange={(e) => setStartWithLorem(e.target.checked)}
            className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-600"
          />
          Start with "Lorem ipsum"
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button onClick={generate} className="btn btn-primary">
          Generate
        </button>
        <CopyButton text={output} disabled={!output} />
        <button onClick={clear} className="btn btn-ghost" disabled={!output}>
          Clear
        </button>
      </div>

      {output && (
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
            {output}
          </p>
        </div>
      )}

      {output && (
        <p className="text-xs text-neutral-500">
          {output.split(/\s+/).length} words • {output.length} characters
        </p>
      )}
    </div>
  );
}
