# Vythea gateway: what the database already does

The model is **prepaid credit**. A person's plan is Free (they bring their own keys) until they have credit;
hosted models are paid from `profiles.credits_usd`. The dashboard reads these tables; the gateway
(`api.vythea.com`) only has to call the functions below with the Supabase **service role** key (server side
only, never in the app or the site).

## For each request

1. Hash the key from `Authorization: Bearer ...` with SHA-256 (hex).
2. `rpc gateway_verify_key(p_hash)` returns one row, or nothing if the key is unknown or revoked:
   `user_id, key_id, plan, rpm_limit, daily_limit_usd, credits_usd, held_usd, spent_today_usd,
   requests_last_minute, in_flight`.
   - No row: reply 401.
   - `requests_last_minute >= rpm_limit`: reply 429.
   - `spent_today_usd >= daily_limit_usd`: reply 429.
   - `credits_usd - held_usd` is the credit that is really free to spend.
3. Work out the most the request could cost (the model's price in `models`, times its maximum output) and call
   `rpc gateway_reserve(p_key_id, p_max_cost)`. It returns a hold id, or fails with SQLSTATE `P0002`
   ("insufficient credit"): reply 402.
4. Forward to OpenRouter with the provider key.
5. On success, `rpc gateway_settle(p_hold_id, p_model, p_in, p_out, p_provider_cost, p_charged, p_status)`:
   it releases the hold, stores the usage row (with what the provider charged next to what the person was
   charged), stamps `last_used_at` and subtracts `p_charged` from the balance.
   `p_charged = p_provider_cost * (1 + markup)`, with the markup read from `settings`.
6. If the provider fails before answering, `rpc gateway_release(p_hold_id)` returns the held credit.

A hold expires after 15 minutes, so a crashed request never locks credit for good.

## Other functions

- `admin_add_credit(p_user, p_amount, p_reason)`: adds credit and writes the ledger row. For manual top-ups now
  and for the payment webhook later.

## Tables

| Table | Who writes | Notes |
|---|---|---|
| `api_keys` | dashboard (`create_api_key`, `revoke_api_key`) | only the SHA-256 hash is stored |
| `models` | you, in the Supabase editor | `input_per_m` / `output_per_m` are what a person pays; `provider_*_per_m` what the provider charges; every model is paid from credit |
| `usage_events` | gateway (`gateway_settle`) | one row per request, with `provider_cost_usd` |
| `credit_holds` | gateway (`gateway_reserve`, `gateway_settle`, `gateway_release`) | money set aside while a request runs; service role only |
| `profiles.credits_usd`, `profiles.plan` | gateway and you | plan is `free`, `pro` or `team` |
| `credit_ledger` | `admin_add_credit` | shows in Billing |
| `settings` | you | `markup` (0.20 means 20% over the provider's price); service role only |

Users can read their own rows only (row level security). Every `gateway_*` function and `admin_add_credit`
is executable by the service role only.
