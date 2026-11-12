// Markup ported from the original page.
import { CaChip } from "@/components/ui/CaChip";
import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";

export function TokenomicsContent() {
  return (
    <main id="main" className="tk">
      <section className="tk-scroll">
        <div className="tk-stage top" aria-hidden="true">
          <img
            className="tk-art tk-open on"
            src="/assets/art/tokenomics/flammarion.png"
            alt=""
            width="1400"
            height="1164"
          />
          <img
            className="tk-art"
            src="/assets/art/tokenomics/ouroboros.png"
            style={{ objectPosition: "50% 60%" }}
            alt=""
            loading="lazy"
          />
          <img
            className="tk-art"
            src="/assets/art/tokenomics/phoenix.png"
            style={{ objectPosition: "50% 40%" }}
            alt=""
            loading="lazy"
          />
          <img
            className="tk-art"
            src="/assets/art/tokenomics/serpent.png"
            style={{ objectPosition: "50% 50%" }}
            alt=""
            loading="lazy"
          />
          <div className="tk-shade" />
          <p className="tk-count micro" style={{ display: "none" }}>
            00 / 03
          </p>
        </div>
        <div className="tk-steps">
          <div className="tk-step tk-first" data-i="0">
            <div className="shell">
              <Link href="/" className="tk-home" aria-label="Vythea home">
                <Wordmark />
              </Link>
              <p className="micro">VYTH // Tokenomics · planned, not live yet</p>
              <h1 className="tk-title">
                Use it.
                <br />
                Buy it back.
                <br />
                Burn it.
              </h1>
              <p className="tk-body">
                VYTH is tied to how much Vythea is used: half of the margin on hosted models buys it back, and
                spending it or leaving a stake early burns it, in public.
              </p>
              <CaChip />
            </div>
          </div>
          <div className="tk-step" data-i="1">
            <div className="shell">
              <p className="micro">In // Buyback</p>
              <p className="tk-figure">50%</p>
              <h2>Usage buys it back</h2>
              <p className="tk-body">
                Vythea takes a small margin on hosted-model usage. Half of that margin buys VYTH on the
                market. The more the agent is used, the more VYTH is bought.
              </p>
            </div>
          </div>
          <div className="tk-step" data-i="2">
            <div className="shell">
              <p className="micro">Out // Spend</p>
              <p className="tk-figure">10%</p>
              <h2>Spending burns it</h2>
              <p className="tk-body">
                Pay for credit with VYTH and you get its full value as credit. A tenth of the VYTH paid goes
                to the dead address; the rest pays for what that credit is spent on: hosted models, APIs and
                Cloud.
              </p>
            </div>
          </div>
          <div className="tk-step" data-i="3">
            <div className="shell">
              <p className="micro">Hold // Stake</p>
              <p className="tk-figure">20%</p>
              <h2>Holding pays in credit</h2>
              <p className="tk-body">
                Staked VYTH earns 20% a year of its dollar value as Vythea credit, every day, for models and
                Cloud. The lock is 90 days and renews itself; leaving early burns 10%. Rewards are credit, so
                staking mints no VYTH.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="tk-supply">
        <div className="shell">
          <p className="micro">Supply</p>
          <h2>
            One billion.
            <br />
            Never more.
          </h2>
          <dl className="tk-stats">
            <div>
              <dt className="micro">Total supply</dt>
              <dd>1,000,000,000</dd>
              <span>Fixed at mint</span>
            </div>
            <div>
              <dt className="micro">Burned so far</dt>
              <dd>–</dd>
              <span>Sent to the dead address</span>
            </div>
            <div>
              <dt className="micro">Left</dt>
              <dd>–</dd>
              <span>Total less burned</span>
            </div>
            <div>
              <dt className="micro">New VYTH from staking</dt>
              <dd>0</dd>
              <span>Rewards are paid in credit</span>
            </div>
          </dl>
          <ol className="tk-life">
            <li>
              <b className="micro">01</b>
              <span>Mint</span>
              <p>
                All 1,000,000,000 VYTH will be minted once, at launch. There is no mint function after that.
              </p>
            </li>
            <li>
              <b className="micro">02</b>
              <span>Launch</span>
              <p>Where and how VYTH launches has not been announced. It will be published here first.</p>
            </li>
            <li>
              <b className="micro">03</b>
              <span>Liquidity</span>
              <p>The pool and how its liquidity is locked will be listed here before trading opens.</p>
            </li>
            <li>
              <b className="micro">04</b>
              <span>Cycle</span>
              <p>
                From then on usage buys VYTH back and spending burns it, so the supply in circulation only
                goes one way.
              </p>
            </li>
          </ol>
          <table className="tk-table tk-rules">
            <thead>
              <tr>
                <th>Flow</th>
                <th className="num">Share</th>
                <th>From</th>
                <th>Goes to</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Buyback</td>
                <td className="num">50%</td>
                <td>{"Vythea's margin on hosted-model usage"}</td>
                <td>VYTH bought on the market</td>
              </tr>
              <tr>
                <td>Spend burn</td>
                <td className="num">10%</td>
                <td>VYTH paid for credit</td>
                <td>The dead address, weekly</td>
              </tr>
              <tr>
                <td>Running costs</td>
                <td className="num">90%</td>
                <td>VYTH paid for credit</td>
                <td>The treasury, which pays for the models, APIs and Cloud that credit is spent on</td>
              </tr>
              <tr>
                <td>Exit burn</td>
                <td className="num">10%</td>
                <td>A stake left before its 90 days</td>
                <td>The dead address, weekly</td>
              </tr>
              <tr>
                <td>Staking reward</td>
                <td className="num">20% / yr</td>
                <td>{"The staked VYTH's dollar value"}</td>
                <td>Your account, as daily credit</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section className="tk-launch">
        <div className="shell">
          <p className="micro">Launch</p>
          <h2>
            Not launched
            <br />
            yet.
          </h2>
          <CaChip full className="tk-ca" />
          <dl className="tk-facts">
            <div>
              <dt className="micro">Launchpad</dt>
              <dd>To be announced</dd>
            </div>
            <div>
              <dt className="micro">Network</dt>
              <dd>To be announced</dd>
            </div>
            <div>
              <dt className="micro">Contract</dt>
              <dd>
                {"Not deployed "}
                <span>· any address offered today is not VYTH</span>
              </dd>
            </div>
            <div>
              <dt className="micro">Burns go to</dt>
              <dd>
                {"The dead address "}
                <span>· once VYTH is live</span>
              </dd>
            </div>
          </dl>
        </div>
      </section>
      <section className="tk-record">
        <div className="shell">
          <p className="micro">Public record</p>
          <h2>Every burn, on chain.</h2>
          <p className="tk-body">
            Once VYTH is live, burns will go out once a week in one transaction to the dead address, and
            buybacks will be listed here the same way, each with its transaction.
          </p>
          <p className="tk-note">Nothing to show yet: VYTH has not launched.</p>
          <p className="tk-links">
            <Link href="/vyth">Staking and perks</Link>
          </p>
        </div>
      </section>
      <section className="tk-fine">
        <div className="shell tk-fine-in">
          <p className="micro">Good to know</p>
          <ul>
            <li>{"Staking rewards are Vythea credit, not tokens or cash. Credit can't be withdrawn."}</li>
            <li>The buyback follows usage: no margin, no buyback. Nothing here promises a price.</li>
            <li>
              {
                "VYTH's price can go down as well as up. Nothing here is investment advice, and it may not be available where you live."
              }
            </li>
            <li className="tk-credit">
              Art: Camille Flammarion (1888), an ouroboros engraving (17th c.), the Aberdeen Bestiary (12th
              c.) and Theodoros Pelecanos (1478), all public domain via Wikimedia Commons, dithered by Vythea.
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}
