/**
 * SAMPLE DATA. The original page reads its price list live from the Vythea API; that feed
 * is not part of this front-end build. These rows are placeholders that show the table's
 * shape — they are not real models or real prices. Replace `MODELS` with your own source.
 */
export type Kind = "chat" | "image" | "speech" | "search";

export type Model =
  | {
      kind: "chat";
      id: string;
      maker: string;
      /** USD per million tokens. */
      price: { input: number; output: number; pro?: { input: number; output: number }; retail?: { input: number; output: number } };
    }
  | {
      kind: Exclude<Kind, "chat">;
      id: string;
      maker: string;
      price: { usd: number; unit: string; pro?: number };
    };

export const KIND_LABEL: Record<Kind, string> = {
  chat: "Text",
  image: "Images",
  speech: "Speech",
  search: "Search",
};

export const MODELS: Model[] = [
  { kind: "chat", id: "sample-large", maker: "Maker A", price: { input: 2.4, output: 9.6, pro: { input: 2.1, output: 8.4 }, retail: { input: 3, output: 12 } } },
  { kind: "chat", id: "sample-fast", maker: "Maker A", price: { input: 0.2, output: 0.8, pro: { input: 0.18, output: 0.7 }, retail: { input: 0.25, output: 1 } } },
  { kind: "chat", id: "sample-reasoner", maker: "Maker B", price: { input: 1.1, output: 4.4, retail: { input: 1.25, output: 5 } } },
  { kind: "chat", id: "sample-mini", maker: "Maker B", price: { input: 0.09, output: 0.36, pro: { input: 0.08, output: 0.32 } } },
  { kind: "chat", id: "sample-open-70b", maker: "Maker C", price: { input: 0.5, output: 0.7 } },
  { kind: "image", id: "sample-image-1", maker: "Maker A", price: { usd: 0.03, unit: "image", pro: 0.027 } },
  { kind: "image", id: "sample-image-hd", maker: "Maker C", price: { usd: 0.06, unit: "image" } },
  { kind: "speech", id: "sample-voice", maker: "Maker B", price: { usd: 0.012, unit: "minute", pro: 0.01 } },
  { kind: "search", id: "sample-search", maker: "Maker C", price: { usd: 0.004, unit: "query" } },
];
