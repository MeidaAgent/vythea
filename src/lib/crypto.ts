/**
 * Paying for credit with stablecoins. The site only ever READS the blockchain: it holds no keys. People
 * send USDT or USDC to one public receiving address; a top-up is an invoice with a unique amount, and a
 * payment counts when its transaction is confirmed and its amount matches an open invoice.
 */

/** Where payments are sent. Public by nature, so it is safe in the code; the env var can override it. */
export const PAY_ADDRESS = (
  process.env.PAYMENT_ADDRESS ?? "0x9e0349b03d77d3c273a6be1dc77beba66cddc184"
).toLowerCase();

export type ChainId = "base" | "bsc";

type Token = { symbol: "USDC" | "USDT"; contract: string; decimals: number };

export const CHAINS: Record<
  ChainId,
  { name: string; rpc: string; confirmations: number; tokens: Token[] }
> = {
  base: {
    name: "Base",
    rpc: process.env.BASE_RPC_URL ?? "https://mainnet.base.org",
    confirmations: 10,
    tokens: [{ symbol: "USDC", contract: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", decimals: 6 }],
  },
  bsc: {
    name: "BNB Chain",
    rpc: process.env.BSC_RPC_URL ?? "https://bsc-rpc.publicnode.com",
    confirmations: 15,
    tokens: [
      { symbol: "USDT", contract: "0x55d398326f99059ff775485246999027b3197955", decimals: 18 },
      { symbol: "USDC", contract: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", decimals: 18 },
    ],
  },
};

export const isChain = (value: unknown): value is ChainId => value === "base" || value === "bsc";

const TRANSFER = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

async function rpc<T>(url: string, method: string, params: unknown[]): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`rpc ${res.status}`);
  const body = (await res.json()) as { result?: T; error?: { message?: string } };
  if (body.error) throw new Error(body.error.message ?? "rpc error");
  return body.result as T;
}

type Receipt = {
  status: string;
  blockNumber: string;
  logs: { address: string; topics: string[]; data: string }[];
} | null;

export type Payment = { token: Token["symbol"]; from: string; amount: string };

/** A whole number of millionths as dollars with six decimals: 10003417n becomes "10.003417". */
const dollars = (micro: bigint) =>
  `${micro / 1_000_000n}.${(micro % 1_000_000n).toString().padStart(6, "0")}`;

export type Checked =
  | { state: "ok"; payments: Payment[] }
  | { state: "unknown" }
  | { state: "failed" }
  | { state: "none" }
  | { state: "waiting"; confirmations: number; needed: number };

/** What a transaction paid to our address: confirmed, and in a token we accept. */
export async function checkTransaction(chain: ChainId, tx: string): Promise<Checked> {
  const cfg = CHAINS[chain];
  const receipt = await rpc<Receipt>(cfg.rpc, "eth_getTransactionReceipt", [tx]);
  if (!receipt) return { state: "unknown" };
  if (receipt.status !== "0x1") return { state: "failed" };

  const head = BigInt(await rpc<string>(cfg.rpc, "eth_blockNumber", []));
  const confirmations = Number(head - BigInt(receipt.blockNumber)) + 1;
  if (confirmations < cfg.confirmations) {
    return { state: "waiting", confirmations: Math.max(confirmations, 0), needed: cfg.confirmations };
  }

  const payments: Payment[] = [];
  for (const log of receipt.logs) {
    const token = cfg.tokens.find((t) => t.contract === log.address.toLowerCase());
    if (!token || log.topics.length < 3 || log.topics[0] !== TRANSFER) continue;
    if (`0x${log.topics[2].slice(26)}`.toLowerCase() !== PAY_ADDRESS) continue;
    const raw = BigInt(log.data);
    // Tokens with 18 decimals count only when the amount is a whole number of millionths.
    const scale = 10n ** BigInt(token.decimals - 6);
    if (raw % scale !== 0n) continue;
    payments.push({
      token: token.symbol,
      from: `0x${log.topics[1].slice(26)}`.toLowerCase(),
      amount: dollars(raw / scale),
    });
  }
  return payments.length ? { state: "ok", payments } : { state: "none" };
}
