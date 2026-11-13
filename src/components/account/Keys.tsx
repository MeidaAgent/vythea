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

  const reload = async () => {
    const { data } = await createClient()
      .from("api_keys")
      .select("id,name,prefix,created_at,last_used_at")
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
    if (!confirm(`Revoke "${row.name}"? Anything using it stops working.`)) return;
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
              </div>
              <button type="button" className="btn btn-line btn-xs" onClick={() => revoke(k)}>
                Revoke
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
