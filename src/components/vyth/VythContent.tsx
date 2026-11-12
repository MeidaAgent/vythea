// Markup ported from the original page.
import { CaChip } from "@/components/ui/CaChip";
import Link from "next/link";
import { SwapNotice } from "@/components/vyth/SwapNotice";
import { Wordmark } from "@/components/brand/Wordmark";

export function VythContent() {
  return (
    <main id="main" className="vyth">
      <section className="l-hero">
        <div className="shell l-hero-in">
          <Link href="/" className="l-home" aria-label="Vythea home">
            <Wordmark />
          </Link>
          <div className="l-hero-copy">
            <p className="micro">VYTH // The Vythea token · not live yet</p>
            <h1 className="l-title">
              Stake it.
              <br />
              Spend it.
              <br />
              Burn it.
            </h1>
            <p className="l-sub">
              VYTH turns into the thing you actually use: AI credit, every day, for the agent and Vythea
              Cloud.
            </p>
            <div className="l-cta">
              <a href="#buy" className="btn btn-fill">
                Launch status
              </a>
              <CaChip />
            </div>
          </div>
          <img
            className="l-coin reveal"
            src="/assets/art/vyth/vyth-coin.png"
            alt=""
            width="1100"
            height="1320"
          />
        </div>
      </section>
      <section id="perks" className="l-perks">
        <div className="shell">
          <p className="micro">What it gets you</p>
          <h2>
            Five perks.
            <br />
            No fine print.
          </h2>
          <ol className="l-list">
            <li className="l-perk">
              <figure className="l-art reveal">
                <img src="/assets/art/vyth/vyth-atlas.png" alt="" loading="lazy" />
              </figure>
              <div className="l-copy">
                <p className="micro">[ 01 ] Stake</p>
                <h3>Stake for AI credit</h3>
                <p className="l-body">
                  Lock VYTH and it earns 20% a year of its dollar value, paid as Vythea credit: models, Cloud,
                  everything credit buys.
                </p>
              </div>
            </li>
            <li className="l-perk">
              <figure className="l-art reveal">
                <img src="/assets/art/vyth/vyth-helios.png" alt="" loading="lazy" />
              </figure>
              <div className="l-copy">
                <p className="micro">[ 02 ] Daily</p>
                <h3>A fresh allowance, every sunrise</h3>
                <p className="l-body">
                  The credit lands as a daily allowance that resets at 00:00 UTC, and it is spent before any
                  credit you bought.
                </p>
              </div>
            </li>
            <li className="l-perk">
              <figure className="l-art reveal">
                <img src="/assets/art/vyth/vyth-glass.png" alt="" loading="lazy" />
              </figure>
              <div className="l-copy">
                <p className="micro">[ 03 ] Lock</p>
                <h3>90 days, rolling</h3>
                <p className="l-body">
                  A stake locks for 90 days and renews itself. Turn renewal off and your VYTH comes back when
                  the lock ends.
                </p>
              </div>
            </li>
            <li className="l-perk">
              <figure className="l-art reveal">
                <img src="/assets/art/vyth/vyth-coin2.png" alt="" loading="lazy" />
              </figure>
              <div className="l-copy">
                <p className="micro">[ 04 ] Spend</p>
                <h3>Pay with VYTH, full value</h3>
                <p className="l-body">
                  Buy credit with VYTH from your account wallet. You get the whole value as credit, once the
                  chain confirms the transfer.
                </p>
              </div>
            </li>
            <li className="l-perk">
              <figure className="l-art reveal">
                <img src="/assets/art/vyth/vyth-fire.png" alt="" loading="lazy" />
              </figure>
              <div className="l-copy">
                <p className="micro">[ 05 ] Burn</p>
                <h3>Every week, a public burn</h3>
                <p className="l-body">
                  10% of the VYTH spent on credit, and 10% of any stake left early, goes to the dead address
                  in one transaction a week.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>
      <section id="how" className="l-flow">
        <img className="l-bust reveal" src="/assets/art/vyth/vyth-bust.png" alt="" loading="lazy" />
        <div className="shell">
          <p className="micro">How it works</p>
          <h2>Three moves.</h2>
          <ol className="l-steps">
            <li>
              <b>01</b>
              <span>Hold</span>
              <p>VYTH in your Vythea account wallet: Settings › Wallet, or vythea wallet.</p>
            </li>
            <li>
              <b>02</b>
              <span>Stake</span>
              <p>From the dashboard. A 90-day lock that renews itself.</p>
            </li>
            <li>
              <b>03</b>
              <span>Spend</span>
              <p>Every day the allowance pays for the agent and Cloud first.</p>
            </li>
          </ol>
        </div>
      </section>
      <section id="buy" className="l-trade">
        <div className="shell l-trade-in">
          <div className="l-trade-head">
            <p className="micro">Where to get it</p>
            <h2>Not live yet.</h2>
            <p className="l-trade-sub">
              VYTH has not launched. There is no contract, no pool and no market for it today, so there is
              nothing to buy. When it launches, the network, the contract address and where to get it will be
              published on this page first.
            </p>
          </div>
          <SwapNotice />
          <div className="l-trade-facts">
            <CaChip full className="l-ca" />
            <div className="l-token">
              <div>
                <span className="micro">Network</span>
                <b>To be announced</b>
                <em>Published here at launch</em>
              </div>
              <div>
                <span className="micro">Contract</span>
                <b>Not deployed</b>
                <em>Any address offered today is not VYTH.</em>
              </div>
              <div>
                <span className="micro">Markets</span>
                <b>None</b>
                <em>No pool or listing exists yet</em>
              </div>
            </div>
            <p className="l-soon">
              Markets will be listed on this page as they open; nowhere else is official.
            </p>
          </div>
        </div>
      </section>
      <section className="l-fine">
        <div className="shell l-fine-in">
          <p className="micro">Good to know</p>
          <ul>
            <li>{"Staking rewards are Vythea credit, not tokens or cash. Credit can't be withdrawn."}</li>
            <li>
              Rewards are capped per account and in total each day. Leaving a stake early burns 10% of it.
            </li>
            <li>
              {
                "VYTH's price can go down as well as up. Nothing here is investment advice, and it may not be available where you live."
              }
            </li>
            <li>VYTH is not available yet. Nobody from Vythea will ask you to send funds for it.</li>
            <li>
              <Link href="/tokenomics">Tokenomics: the buyback, the burns and the public record.</Link>
            </li>
            <li className="l-credit">
              Art: public-domain works from The Metropolitan Museum of Art, the National Gallery of Art and
              Wikimedia Commons, dithered by Vythea.
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}
