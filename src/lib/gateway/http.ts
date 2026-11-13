const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

/** Headers every gateway answer carries, plus whatever the answer adds. */
export const cors = (extra: Record<string, string> = {}) => ({ ...CORS, ...extra });

/** An error in the shape OpenAI-compatible tools expect. */
export function fail(status: number, code: string, message: string, extra: Record<string, string> = {}) {
  const type = status >= 500 ? "server_error" : "invalid_request_error";
  return new Response(JSON.stringify({ error: { message, type, code } }), {
    status,
    headers: cors({ "Content-Type": "application/json", "Cache-Control": "no-store", ...extra }),
  });
}

export const preflight = () => new Response(null, { status: 204, headers: cors() });
