# Vythea gateway: what the database already does

The dashboard reads these tables; the gateway (`api.vythea.com`) only has to call two functions
with the Supabase **service role** key (server side only, never in the app or the site).

## For each request

1. Hash the key from the `Authorization: Bearer vy-...` header with SHA-256 (hex).
2. `rpc gateway_verify_key(p_hash)` returns one row, or nothing if the key is unknown or revoked:
   `user_id, key_id, rpm_limit, daily_limit_usd, credits_usd, spent_today_usd`.
   - Reject with 401 when there is no row.
   - Enforce `rpm_limit` in the gateway (per `key_id`, per minute).
   - Reject with 429 when `spent_today_usd >= daily_limit_usd`.
   - For models with `tier = 'paid'` (table `models`), reject with 402 when `credits_usd <= 0`.
3. Forward the request to the upstream provider using your own provider key.
4. `rpc gateway_record_usage(p_key_id, p_model, p_in, p_out, p_cost, p_status)` after the response.
   It stores the usage row, stamps `last_used_at` and subtracts `p_cost` from the balance.

## Tables

| Table | Who writes | Notes |
|---|---|---|
| `api_keys` | dashboard (`create_api_key`, `revoke_api_key`) | only the SHA-256 hash is stored |
| `models` | you, in the Supabase editor | set `input_per_m` / `output_per_m` (USD per 1M tokens); prices are empty until you do |
| `usage_events` | gateway (`gateway_record_usage`) | one row per request |
| `profiles.credits_usd` | gateway (usage) and you (top-ups) | add a `credit_ledger` row for every top-up |
| `credit_ledger` | you or the payment webhook | shows in Billing |

Users can read their own rows only (row level security). The two `gateway_*` functions are
executable by the service role only.
