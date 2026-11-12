import type { Metadata } from "next";
import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PriceList } from "@/components/price/PriceList";
import "@/styles/price.css";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "What every hosted model costs on Vythea: text per million tokens, images, video, speech and search, and Vythea Cloud hosting by the second.",
};

// Vythea Cloud: USD per MB of memory per second awake, and storage past the free GB.
const PER_MB_SECOND = 23e-7;
const STORAGE_PER_GB = 0.1;
const FREE_GB = 1;

const hourly = (mb: number) => (mb / 1024) * PER_MB_SECOND * 3600;
const monthly = (mb: number, hoursADay: number) => hourly(mb) * hoursADay * 30;
const usd = (n: number) => "$" + (n >= 0.01 ? n.toFixed(2) : n.toFixed(3));

const SIZES = [128, 256, 512, 1024, 2048, 4096].map((mb) => ({
  mb,
  label: mb < 1024 ? `${mb} MB` : `${mb / 1024} GB`,
  hour: hourly(mb),
}));

const EXAMPLES = [
  {
    what: "A website or API",
    size: "512 MB",
    use: "Visited now and then, about 30 minutes awake a day",
    cost: monthly(512, 0.5),
  },
  {
    what: "Minecraft, Java and Bedrock",
    size: "2 GB",
    use: "Friends play an hour a day",
    cost: monthly(2048, 1),
  },
  {
    what: "Minecraft, Java and Bedrock",
    size: "2 GB",
    use: "Evenings, about 3 hours a day",
    cost: monthly(2048, 3),
  },
  { what: "A Postgres database", size: "512 MB", use: "Used by an app 4 hours a day", cost: monthly(512, 4) },
  {
    what: "A Discord or Telegram bot",
    size: "128 MB",
    use: "Online day and night, as a bot must be",
    cost: monthly(128, 24),
  },
];

export default function PricePage() {
  return (
    <>
      <main id="main" className="price paper">
        <div className="shell price-in">
          <Link href="/" className="price-home" aria-label="Vythea home">
            <Wordmark />
          </Link>
          <p className="micro">Pricing</p>
          <h1 className="price-title">
            Every model,
            <br />
            one price list.
          </h1>
          <p className="price-sub">
            What each hosted model costs on Vythea. Prices follow the live market, so they are often far below
            the maker&apos;s own. You pay from your credit only for what you use; with your own ChatGPT or
            Claude account, Vythea adds nothing.
          </p>

          <PriceList />

          <section id="cloud" className="cl">
            <p className="micro">Vythea Cloud</p>
            <h2 className="cl-title">
              Pay while it runs.
              <br />
              Asleep is free.
            </h2>
            <p className="price-sub">
              Ask for a website, a bot, a database or a game server and Vythea Cloud hosts it. There is no
              plan and no server to rent: it wakes when someone visits or joins, sleeps a few minutes after
              the last one leaves, and you pay by the second only while it is awake, from your credit.
            </p>
            <div className="cl-points">
              <div>
                <b>By the second</b>
                <span>
                  {usd(hourly(1024))} an hour for each GB of memory it is given, counted only while it runs.
                </span>
              </div>
              <div>
                <b>Asleep costs nothing</b>
                <span>
                  No memory, no CPU, no charge. The address stays the same; the next visit or join wakes it.
                </span>
              </div>
              <div>
                <b>{FREE_GB} GB of storage free</b>
                <span>
                  Each one keeps its files. Past the first GB, ${STORAGE_PER_GB.toFixed(2)} a GB a month.
                </span>
              </div>
            </div>

            <h3 className="cl-h">What a month looks like</h3>
            <div className="pr-wrap">
              <table className="pr-table">
                <thead>
                  <tr>
                    <th>What</th>
                    <th>Memory</th>
                    <th>How it is used</th>
                    <th className="num">A month</th>
                  </tr>
                </thead>
                <tbody>
                  {EXAMPLES.map((e) => (
                    <tr key={e.what + e.use}>
                      <td>{e.what}</td>
                      <td className="mute">{e.size}</td>
                      <td className="mute">{e.use}</td>
                      <td className="num">{usd(e.cost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="cl-note">
              Months of 30 days, before storage past the free GB. Something that must answer at once all day
              can be kept up instead of sleeping; then every hour counts, so a 2 GB game server kept up all
              month is {usd(monthly(2048, 24))}.
            </p>

            <h3 className="cl-h">By size</h3>
            <div className="pr-wrap">
              <table className="pr-table">
                <thead>
                  <tr>
                    <th>Memory</th>
                    <th className="num">An hour awake</th>
                    <th className="num">A day awake</th>
                  </tr>
                </thead>
                <tbody>
                  {SIZES.map((s) => (
                    <tr key={s.mb}>
                      <td>{s.label}</td>
                      <td className="num">{usd(s.hour)}</td>
                      <td className="num">{usd(s.hour * 24)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="cl-h">Good to know</h3>
            <ul className="cl-list">
              <li>
                Waking takes a moment: a website a few seconds, a Minecraft server about a minute. Players who
                join while it starts are told to join again.
              </li>
              <li>The chat that builds it is paid like any chat, by its tokens.</li>
              <li>
                Each one runs alone, with its own memory, address and files. One that keeps crashing as it
                starts gets a run that tries to fix it.
              </li>
              <li>See what runs, and stop or start it, in the app or the dashboard.</li>
            </ul>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
