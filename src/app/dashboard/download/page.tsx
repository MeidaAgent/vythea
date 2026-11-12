import type { Metadata } from "next";
import { Builds } from "@/components/dashboard/Builds";

export const metadata: Metadata = {
  title: "Download",
  description: "Get the Vythea app and terminal for macOS, Windows and Linux.",
};

export default function DownloadPage() {
  return (
    <div>
      <div className="dash-top">
        <p className="micro">Download</p>
        <h1 className="dash-title">Get the app.</h1>
        <p className="dash-sub">
          The app and the terminal come together. After installing, sign in when Vythea asks, or run{" "}
          <code>/login</code> in the terminal; this computer then shows under Devices.
        </p>
      </div>

      <Builds />

      <section className="dash-block phones">
        <h2 className="dash-h2">On your phone</h2>
        <p className="dash-sub">Native apps are coming.</p>
        <div className="dl-stores">
          {[
            ["iOS", "App Store"],
            ["Android", "Google Play"],
          ].map(([os, name]) => (
            <span key={name} className="dl-store" aria-label={`${name}, coming soon`}>
              <span className="micro">{os}</span>
              <span className="dl-store-name">{name}</span>
              <em>Coming soon</em>
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
