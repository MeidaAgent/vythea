"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export type KeyRow = {
  id: string;
  name: string;
  prefix: string;
  created_at: string;
  last_used_at: string | null;
  rpm_limit: number;
  daily_limit_usd: number;
};

const day = (iso: string) =>
  new Date(iso).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" });

export function Keys({ initial, username }: { initial: KeyRow[]; username: string }) {
  const router = useRouter();
  const [keys, setKeys] = useState(initial);
  const [name, setName] = useState("");
  const [secret, setSecret] = useState("");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  /** The key whose Revoke button was pressed and is waiting for a yes or no. */
  const [confirming, setConfirming] = useState<string | null>(null);

  const reload = async () => {
    const { data } = await createClient()
      .from("api_keys")
      .select("id,name,prefix,created_at,last_used_at,rpm_limit,daily_limit_usd")
      .is("revoked_at", null)
      .order("created_at", { ascending: false });
    if (data) setKeys(data);
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || busy) return;
    setBusy(true);
    setError("");
    const { data, error: err } = await createClient().rpc("create_api_key", { p_name: name.trim() });
    setBusy(false);
    if (err || typeof data !== "string") {
      setError(
        err?.message.includes("limit")
          ? "You've reached 5 keys. Revoke one first."
          : "Couldn't create the key. Try again.",
      );
      return;
    }
    setSecret(data);
    setCopied(false);
    setName("");
    await reload();
  };

  const revoke = async (row: KeyRow) => {
    setConfirming(null);
    const { error: err } = await createClient().rpc("revoke_api_key", { p_id: row.id });
    if (err) setError("Couldn't revoke the key. Try again.");
    else await reload();
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
    } catch {
      setError("Couldn't copy. Select the key and copy it by hand.");
    }
  };

  const signOut = async () => {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <>
      <p className="acct-who">
        Signed in as <b>{username}</b>
        <button type="button" className="btn btn-line btn-xs" onClick={signOut}>
          Sign out
        </button>
      </p>

      <p className="acct-note">
        The Vythea gateway isn&apos;t open yet. You can create keys now; they start working when it launches.
      </p>

      {secret && (
        <div className="acct-secret" role="status">
          <p>Copy this key now. For your safety it is shown only once.</p>
          <code>{secret}</code>
          <button type="button" className="btn btn-ink btn-xs" onClick={copy}>
            {copied ? "Copied" : "Copy key"}
          </button>{" "}
          <button type="button" className="btn btn-line btn-xs" onClick={() => setSecret("")}>
            Done
          </button>
        </div>
      )}

      <form className="acct-new" onSubmit={create}>
        <label>
          <span className="micro">Key name</span>
          <input
            value={name}
            maxLength={60}
            placeholder="Laptop, CI, side project…"
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <button
          type="submit"
          className="btn btn-ink"
          disabled={busy || !name.trim()}
          style={{ alignSelf: "flex-end" }}
        >
          {busy ? "Creating…" : "Create key"}
        </button>
      </form>
      {error && (
        <p className="acct-error" role="alert">
          {error}
        </p>
      )}

      {keys.length === 0 ? (
        <p className="acct-empty">No keys yet. Name one above to create it.</p>
      ) : (
        <ul className="acct-list">
          {keys.map((k) => (
            <li key={k.id}>
              <div className="grow">
                <b>{k.name}</b>
                <small>
                  {k.prefix}… · created {day(k.created_at)} ·{" "}
                  {k.last_used_at ? `used ${day(k.last_used_at)}` : "not used yet"}
                </small>
                <small>
                  {k.rpm_limit} requests/min · ${Number(k.daily_limit_usd).toFixed(2)}/day limit
                </small>
              </div>
              {confirming === k.id ? (
                <div className="acct-confirm" role="alertdialog" aria-label={`Revoke ${k.name}?`}>
                  <span>Revoke &ldquo;{k.name}&rdquo;? Anything using it stops working.</span>
                  <button type="button" className="btn btn-ink btn-xs" onClick={() => revoke(k)}>
                    Yes, revoke
                  </button>
                  <button type="button" className="btn btn-line btn-xs" onClick={() => setConfirming(null)}>
                    Keep it
                  </button>
                </div>
              ) : (
                <button type="button" className="btn btn-line btn-xs" onClick={() => setConfirming(k.id)}>
                  Revoke
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
