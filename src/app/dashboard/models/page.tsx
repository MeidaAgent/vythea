import type { Metadata } from "next";
import { Soon } from "@/components/account/Soon";
import { requireUser } from "@/lib/account";
import { fmtUsd } from "@/lib/format";

export const metadata: Metadata = { title: "Models" };

type Model = {
  id: string;
  name: string;
  provider: string;
  tier: "free" | "paid";
  input_per_m: number | null;
  output_per_m: number | null;
};

export default async function ModelsPage() {
  const me = await requireUser("/dashboard/models");
  if (!me) {
    return (
      <Soon
        kicker="Models"
        title="Not available yet."
        text="Accounts aren't switched on for this site yet."
      />
    );
  }

  const { data } = await me.supabase
    .from("models")
    .select("id,name,provider,tier,input_per_m,output_per_m")
    .order("sort");
  const models = (data ?? []) as Model[];

  return (
    <div>
      <div className="dash-top">
        <p className="micro">Models</p>
        <h1 className="dash-title">One endpoint.</h1>
        <p className="dash-sub">The models your keys can call. Use the model id in your requests.</p>
      </div>

      {models.length === 0 ? (
        <p className="acct-note">No models are listed yet.</p>
      ) : (
        <div className="acct-scroll">
          <table className="acct-table">
            <thead>
              <tr>
                <th>Model</th>
                <th>Id</th>
                <th>Access</th>
                <th>Price per 1M tokens (in / out)</th>
              </tr>
            </thead>
            <tbody>
              {models.map((m) => (
                <tr key={m.id}>
                  <td>
                    {m.name}
                    <small>{m.provider}</small>
                  </td>
                  <td>
                    <code>{m.id}</code>
                  </td>
                  <td>{m.tier === "free" ? "Free tier" : "Paid credit"}</td>
                  <td>
                    {m.input_per_m == null || m.output_per_m == null
                      ? "Price soon"
                      : `${fmtUsd(Number(m.input_per_m))} / ${fmtUsd(Number(m.output_per_m))}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
