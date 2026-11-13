import type { Metadata } from "next";
import { ModelBrowser, type Model } from "@/components/account/ModelBrowser";
import { Soon } from "@/components/account/Soon";
import { requireUser } from "@/lib/account";

export const metadata: Metadata = { title: "Models" };

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
    .select(
      "id,name,provider,tier,context_k,output_k,knows_to,tools,reasoning,vision,input_per_m,output_per_m",
    )
    .order("sort");
  const models = (data ?? []) as Model[];

  return (
    <div>
      <div className="dash-top">
        <p className="micro">Models</p>
        <h1 className="dash-title">One endpoint.</h1>
        <p className="dash-sub">
          The models your keys can call. Copy a model id and use it in your requests.
        </p>
      </div>

      {models.length === 0 ? (
        <p className="acct-note">No models are listed yet.</p>
      ) : (
        <ModelBrowser models={models} />
      )}
    </div>
  );
}
