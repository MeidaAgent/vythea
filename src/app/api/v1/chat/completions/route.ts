import { chatCompletions } from "@/lib/gateway/chat";
import { preflight } from "@/lib/gateway/http";

// Edge, so an answer can stream for minutes instead of hitting a serverless function's time limit.
export const runtime = "edge";
export const dynamic = "force-dynamic";

export const POST = chatCompletions;
export const OPTIONS = preflight;
