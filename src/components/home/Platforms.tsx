import Link from "next/link";

const PLATFORMS = [
  { art: "mac", name: "macOS", req: "13+, Apple silicon", kind: ".dmg" },
  { art: "win", name: "Windows", req: "11, x64", kind: ".zip" },
  { art: "linux", name: "Linux", req: "x64, glibc 2.31+", kind: ".tar.gz" },
];

const STORES = [
  { os: "iOS", name: "App Store" },
  { os: "Android", name: "Google Play" },
];

export function Platforms() {
  return (
    <section className="band blue" id="platforms">
      <div className="shell">
        <div className="band-top">
          <p className="micro">Platforms</p>
          <h2>
            One build
            <br />
            per desk.
          </h2>
        </div>
        <div className="plats">
          {PLATFORMS.map((p) => (
            <article className="plat" key={p.art}>
              <div className="plat-art">
                <img src={`/assets/art/plat-${p.art}.png`} alt="" width={480} height={360} loading="lazy" />
                <h3>{p.name}</h3>
              </div>
              <p className="plat-req">{p.req}</p>
              <Link className="btn btn-invert" href="/dashboard/download">
                <span>
                  Download <bdi>{p.kind}</bdi>
                </span>
                <em>install</em>
              </Link>
            </article>
          ))}
        </div>
        <div className="phones">
          <div className="phones-text">
            <p className="micro">On your phone</p>
            <p className="phones-line">Native apps are coming.</p>
          </div>
          <div className="stores">
            {STORES.map((s) => (
              <span className="store" key={s.name} aria-label={`${s.name}, Coming soon`}>
                <span className="store-os">{s.os}</span>
                <span className="store-name">{s.name}</span>
                <em>Coming soon</em>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
