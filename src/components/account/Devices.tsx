"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export type DeviceRow = {
  id: string;
  name: string;
  client: string | null;
  created_at: string;
  last_used_at: string | null;
};

const when = (iso: string) =>
  new Date(iso).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" });

/** The computers signed in to the account, each with a way to sign it out. */
export function Devices({ devices }: { devices: DeviceRow[] }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState<string | null>(null);
  const [error, setError] = useState("");

  const signOut = async (row: DeviceRow) => {
    setConfirming(null);
    const { error: err } = await createClient().rpc("revoke_api_key", { p_id: row.id });
    if (err) setError("Couldn't sign that computer out. Try again.");
    else router.refresh();
  };

  if (devices.length === 0) {
    return <p className="acct-note">No computers are signed in. Sign in from the Vythea app or terminal to see them here.</p>;
  }

  return (
    <>
      <ul className="acct-list">
        {devices.map((d) => (
          <li key={d.id}>
            <div className="grow">
              <b>{d.name}</b>
              <small>
                Signed in {when(d.created_at)} · {d.last_used_at ? `last used ${when(d.last_used_at)}` : "not used yet"}
              </small>
            </div>
            {confirming === d.id ? (
              <span>
                <button type="button" className="btn btn-fill btn-xs" onClick={() => signOut(d)}>
                  Sign out
                </button>{" "}
                <button type="button" className="btn btn-line btn-xs" onClick={() => setConfirming(null)}>
                  Keep
                </button>
              </span>
            ) : (
              <button type="button" className="btn btn-line btn-xs" onClick={() => setConfirming(d.id)}>
                Sign out
              </button>
            )}
          </li>
        ))}
      </ul>
      {error && (
        <p className="lg-hint" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
