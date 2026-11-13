import type { Metadata } from "next";
import { SignOutButton } from "@/components/account/SignOutButton";
import { Soon } from "@/components/account/Soon";
import { requireUser, signInMethods, walletAddress } from "@/lib/account";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const me = await requireUser("/dashboard/settings");
  if (!me) {
    return (
      <Soon
        kicker="Settings"
        title="Not available yet."
        text="Accounts aren't switched on for this site yet."
      />
    );
  }

  const avatar = me.user.user_metadata?.avatar_url as string | undefined;
  const wallet = walletAddress(me.user);
  const joined = new Date(me.user.created_at).toLocaleDateString("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div>
      <div className="dash-top">
        <p className="micro">Settings</p>
        <h1 className="dash-title">Your account.</h1>
        <p className="dash-sub">
          You sign in with GitHub, email or a wallet, so there is no password to manage here.
        </p>
      </div>

      <div className="acct-profile">
        {avatar && <img src={avatar} alt="" width={64} height={64} referrerPolicy="no-referrer" />}
        <dl>
          <div>
            <dt className="micro">Account</dt>
            <dd>{me.name}</dd>
          </div>
          {me.user.email && (
            <div>
              <dt className="micro">Email</dt>
              <dd>{me.user.email}</dd>
            </div>
          )}
          {wallet && (
            <div>
              <dt className="micro">Wallet</dt>
              <dd>{wallet}</dd>
            </div>
          )}
          <div>
            <dt className="micro">Sign-in</dt>
            <dd>{signInMethods(me.user).join(", ")}</dd>
          </div>
          <div>
            <dt className="micro">Joined</dt>
            <dd>{joined}</dd>
          </div>
        </dl>
      </div>

      <p className="acct-more">
        <SignOutButton />
      </p>
    </div>
  );
}
