// Markup ported from the original page.
import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";

export function BenchmarkContent() {
  return (
    <main id="main" className="bench">
      <section className="b-hero">
        <div className="shell">
          <Link href="/" className="b-home" aria-label="Vythea home">
            <Wordmark />
          </Link>
          <p className="micro">Benchmark // Written in Rust</p>
          <h1 className="b-title">
            Fast is
            <br />a feature.
          </h1>
          <p className="b-sub">
            Vythea is one native binary. No runtime to boot, no interpreter warming up, no garbage collector
            between you and the answer. Here is what that buys, measured.
          </p>
          <div className="b-plate" aria-hidden="true" />
          <ul className="b-stats">
            <li>
              <p className="micro">Cold start</p>
              <p className="b-num">
                <bdi dir="ltr">
                  7.65<span>ms</span>
                </bdi>
              </p>
              <p className="b-x">
                Launch the terminal app to a ready prompt, 500 sessions on disk, in a pseudo-terminal
              </p>
            </li>
            <li>
              <p className="micro">Memory at idle</p>
              <p className="b-num">
                <bdi dir="ltr">
                  9.52<span>MB</span>
                </bdi>
              </p>
              <p className="b-x">Resident set size at that ready prompt</p>
            </li>
            <li>
              <p className="micro">Parse a 10k-event stream</p>
              <p className="b-num">
                <bdi dir="ltr">
                  13.2<span>ms</span>
                </bdi>
              </p>
              <p className="b-x">A long reply, a word at a time, from a local server</p>
            </li>
          </ul>
        </div>
      </section>
      <section className="b-board">
        <div className="shell">
          <div className="b-head">
            <div>
              <p className="micro">Speed // median of 7 runs</p>
              <h2>Every hot path.</h2>
            </div>
            <p className="b-hb-sub">
              {
                "What a person waits for, and what grows with the history: the core's bench and the terminal's, each held to a checked-in baseline, so a slower build fails the bench. No model is called; this is the harness alone."
              }
            </p>
          </div>
          <ol className="b-rows">
            <li className="b-row ours">
              <span className="b-rank">[ 01 ]</span>
              <span className="b-name">
                Cold start<em>terminal_start_ms</em>
              </span>
              <span className="b-bar">
                <i style={{ width: "47.09153587884044%" }} />
              </span>
              <span className="b-val">
                <bdi dir="ltr">
                  7.65<small>ms</small>
                </bdi>
              </span>
              <span className="b-rel">
                Launch the terminal app to a ready prompt, 500 sessions on disk, in a pseudo-terminal
              </span>
            </li>
            <li className="b-row ours">
              <span className="b-rank">[ 02 ]</span>
              <span className="b-name">
                Memory at idle<em>terminal_rss_mb</em>
              </span>
              <span className="b-bar">
                <i style={{ width: "49.46592370961186%" }} />
              </span>
              <span className="b-val">
                <bdi dir="ltr">
                  9.52<small>MB</small>
                </bdi>
              </span>
              <span className="b-rel">Resident set size at that ready prompt</span>
            </li>
            <li className="b-row ours">
              <span className="b-rank">[ 03 ]</span>
              <span className="b-name">
                List 500 sessions<em>listing_500_ms</em>
              </span>
              <span className="b-bar">
                <i style={{ width: "29.1829333687044%" }} />
              </span>
              <span className="b-val">
                <bdi dir="ltr">
                  1.47<small>ms</small>
                </bdi>
              </span>
              <span className="b-rel">Load the session list from its index</span>
            </li>
            <li className="b-row ours">
              <span className="b-rank">[ 04 ]</span>
              <span className="b-name">
                List 5,000 sessions<em>listing_5000_ms</em>
              </span>
              <span className="b-bar">
                <i style={{ width: "55.102999566398125%" }} />
              </span>
              <span className="b-val">
                <bdi dir="ltr">
                  16.0<small>ms</small>
                </bdi>
              </span>
              <span className="b-rel">The same, with some 90 MB of sessions on disk</span>
            </li>
            <li className="b-row ours">
              <span className="b-rank">[ 05 ]</span>
              <span className="b-name">
                Search 5,000 sessions<em>search_5000_ms</em>
              </span>
              <span className="b-bar">
                <i style={{ width: "75.21500429404794%" }} />
              </span>
              <span className="b-val">
                <bdi dir="ltr">
                  102<small>ms</small>
                </bdi>
              </span>
              <span className="b-rel">Full-text, a common word and a rare one, top 20 hits</span>
            </li>
            <li className="b-row ours">
              <span className="b-rank">[ 06 ]</span>
              <span className="b-name">
                Open a 10k-message session<em>load_10k_ms</em>
              </span>
              <span className="b-bar">
                <i style={{ width: "51.79705018265314%" }} />
              </span>
              <span className="b-val">
                <bdi dir="ltr">
                  11.8<small>ms</small>
                </bdi>
              </span>
              <span className="b-rel">Read a long day of tool calls in from disk</span>
            </li>
            <li className="b-row ours">
              <span className="b-rank">[ 07 ]</span>
              <span className="b-name">
                Fit a 200k context<em>window_start_10k_ms</em>
              </span>
              <span className="b-bar">
                <i style={{ width: "17.941762575056554%" }} />
              </span>
              <span className="b-val">
                <bdi dir="ltr">
                  0.522<small>ms</small>
                </bdi>
              </span>
              <span className="b-rel">Place a 200k-token window over those 10,000 messages</span>
            </li>
            <li className="b-row ours">
              <span className="b-rank">[ 08 ]</span>
              <span className="b-name">
                Parse a 10k-event stream<em>stream_10k_events_ms</em>
              </span>
              <span className="b-bar">
                <i style={{ width: "53.01434828014624%" }} />
              </span>
              <span className="b-val">
                <bdi dir="ltr">
                  13.2<small>ms</small>
                </bdi>
              </span>
              <span className="b-rel">A long reply, a word at a time, from a local server</span>
            </li>
          </ol>
          <p className="b-hb-foot">
            Bars on a log scale, 0.1 ms to 1 s. Other agent harnesses will be timed on the same machine with
            the same data; their rows land here when they are measured, not before.
          </p>
        </div>
      </section>
      <section className="b-hb">
        <div className="shell">
          <div className="b-head">
            <div>
              <p className="micro">Harness-Bench // 106 agent tasks</p>
              <h2>
                Fast, and it
                <br />
                gets it right.
              </h2>
            </div>
            <p className="b-hb-sub">
              {
                "Speed means nothing if the work is wrong. On Harness-Bench, real tasks from files and git to email triage and code debugging, graded by the paper's own judge, Vythea's best run tops every configuration the paper reports, and beats the paper's average harness on the same model by 15 to 27 points."
              }
            </p>
          </div>
          <div className="b-same">
            <article className="b-pair">
              <p className="micro">Same model · DeepSeek V4 Flash</p>
              <div className="b-pair-row">
                <span>{"Paper's average harness"}</span>
                <span className="b-pair-bar">
                  <i style={{ width: "35%" }} />
                </span>
                <b>57.5</b>
              </div>
              <div className="b-pair-row ours">
                <span>Vythea</span>
                <span className="b-pair-bar">
                  <i style={{ width: "88%" }} />
                </span>
                <b>84.0</b>
              </div>
              <p className="b-pair-x">+26.5 points</p>
            </article>
            <article className="b-pair">
              <p className="micro">Same model · Claude Sonnet 4.6</p>
              <div className="b-pair-row">
                <span>{"Paper's average harness"}</span>
                <span className="b-pair-bar">
                  <i style={{ width: "50.59999999999999%" }} />
                </span>
                <b>65.3</b>
              </div>
              <div className="b-pair-row ours">
                <span>Vythea</span>
                <span className="b-pair-bar">
                  <i style={{ width: "80.80000000000001%" }} />
                </span>
                <b>80.4</b>
              </div>
              <p className="b-pair-x">+15.1 points</p>
            </article>
          </div>
          <p className="micro b-hb-h">{"Ranked with the paper's best configurations"}</p>
          <ol className="b-rows">
            <li className="ours b-row">
              <span className="b-rank">[ 01 ]</span>
              <span className="b-name">
                Vythea<em>DeepSeek V4 Flash</em>
              </span>
              <span className="b-bar">
                <i style={{ width: "88%" }} />
              </span>
              <span className="b-val">
                <bdi dir="ltr">84.0</bdi>
              </span>
              <span className="b-rel">this run</span>
            </li>
            <li className="ours b-row">
              <span className="b-rank">[ 02 ]</span>
              <span className="b-name">
                Vythea<em>Muse Spark 1.3</em>
              </span>
              <span className="b-bar">
                <i style={{ width: "87.19999999999999%" }} />
              </span>
              <span className="b-val">
                <bdi dir="ltr">83.6</bdi>
              </span>
              <span className="b-rel">this run</span>
            </li>
            <li className="ours b-row">
              <span className="b-rank">[ 03 ]</span>
              <span className="b-name">
                Vythea<em>Claude Opus 5.5</em>
              </span>
              <span className="b-bar">
                <i style={{ width: "86.80000000000001%" }} />
              </span>
              <span className="b-val">
                <bdi dir="ltr">83.4</bdi>
              </span>
              <span className="b-rel">this run</span>
            </li>
            <li className="ours b-row">
              <span className="b-rank">[ 04 ]</span>
              <span className="b-name">
                Vythea<em>Claude Sonnet 5.5</em>
              </span>
              <span className="b-bar">
                <i style={{ width: "86.80000000000001%" }} />
              </span>
              <span className="b-val">
                <bdi dir="ltr">83.4</bdi>
              </span>
              <span className="b-rel">this run</span>
            </li>
            <li className="b-row">
              <span className="b-rank">[ 05 ]</span>
              <span className="b-name">
                NanoBot<em>GPT-5.4</em>
              </span>
              <span className="b-bar">
                <i style={{ width: "82.6%" }} />
              </span>
              <span className="b-val">
                <bdi dir="ltr">81.3</bdi>
              </span>
              <span className="b-rel">paper</span>
            </li>
            <li className="ours b-row">
              <span className="b-rank">[ 06 ]</span>
              <span className="b-name">
                Vythea<em>Claude Sonnet 4.6</em>
              </span>
              <span className="b-bar">
                <i style={{ width: "80.80000000000001%" }} />
              </span>
              <span className="b-val">
                <bdi dir="ltr">80.4</bdi>
              </span>
              <span className="b-rel">this run</span>
            </li>
            <li className="b-row">
              <span className="b-rank">[ 07 ]</span>
              <span className="b-name">
                Codex<em>GPT-5.4</em>
              </span>
              <span className="b-bar">
                <i style={{ width: "80.80000000000001%" }} />
              </span>
              <span className="b-val">
                <bdi dir="ltr">80.4</bdi>
              </span>
              <span className="b-rel">paper</span>
            </li>
            <li className="b-row">
              <span className="b-rank">[ 08 ]</span>
              <span className="b-name">
                Moltis<em>GPT-5.4</em>
              </span>
              <span className="b-bar">
                <i style={{ width: "68.80000000000001%" }} />
              </span>
              <span className="b-val">
                <bdi dir="ltr">74.4</bdi>
              </span>
              <span className="b-rel">paper</span>
            </li>
            <li className="b-row">
              <span className="b-rank">[ 09 ]</span>
              <span className="b-name">
                Hermes<em>GPT-5.4</em>
              </span>
              <span className="b-bar">
                <i style={{ width: "68%" }} />
              </span>
              <span className="b-val">
                <bdi dir="ltr">74.0</bdi>
              </span>
              <span className="b-rel">paper</span>
            </li>
            <li className="b-row">
              <span className="b-rank">[ 10 ]</span>
              <span className="b-name">
                OpenClaw<em>GPT-5.4</em>
              </span>
              <span className="b-bar">
                <i style={{ width: "58.599999999999994%" }} />
              </span>
              <span className="b-val">
                <bdi dir="ltr">69.3</bdi>
              </span>
              <span className="b-rel">paper</span>
            </li>
            <li className="b-row">
              <span className="b-rank">[ 11 ]</span>
              <span className="b-name">
                NullClaw<em>GPT-5.4</em>
              </span>
              <span className="b-bar">
                <i style={{ width: "57.800000000000004%" }} />
              </span>
              <span className="b-val">
                <bdi dir="ltr">68.9</bdi>
              </span>
              <span className="b-rel">paper</span>
            </li>
            <li className="b-row">
              <span className="b-rank">[ 12 ]</span>
              <span className="b-name">
                ZeroClaw<em>GPT-5.4</em>
              </span>
              <span className="b-bar">
                <i style={{ width: "28.59999999999999%" }} />
              </span>
              <span className="b-val">
                <bdi dir="ltr">54.3</bdi>
              </span>
              <span className="b-rel">paper</span>
            </li>
          </ol>
          <p className="micro b-hb-h">Work per task</p>
          <div className="b-scroll">
            <table className="b-table b-table-ink">
              <thead>
                <tr>
                  <th>Harness</th>
                  <th>Score</th>
                  <th>
                    Tokens<small>thousand / task</small>
                  </th>
                  <th>
                    Model calls<small>per task</small>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="ours">
                  <th>
                    Vythea<em>DeepSeek V4 Flash</em>
                  </th>
                  <td>84.0</td>
                  <td>112.7</td>
                  <td>9.0</td>
                </tr>
                <tr className="ours">
                  <th>
                    Vythea<em>Muse Spark 1.3</em>
                  </th>
                  <td>83.6</td>
                  <td>70.1</td>
                  <td>8.7</td>
                </tr>
                <tr className="ours">
                  <th>
                    Vythea<em>Claude Opus 5.5</em>
                  </th>
                  <td>83.4</td>
                  <td>50.1</td>
                  <td>7.1</td>
                </tr>
                <tr className="ours">
                  <th>
                    Vythea<em>Claude Sonnet 5.5</em>
                  </th>
                  <td>83.4</td>
                  <td>47.3</td>
                  <td>6.4</td>
                </tr>
                <tr className="ours">
                  <th>
                    Vythea<em>Claude Sonnet 4.6</em>
                  </th>
                  <td>80.4</td>
                  <td>86.2</td>
                  <td>11.3</td>
                </tr>
                <tr>
                  <th>
                    Codex<em>paper · mean of 8 models</em>
                  </th>
                  <td>80.4</td>
                  <td>86.1</td>
                  <td>5.0</td>
                </tr>
                <tr>
                  <th>
                    NanoBot<em>paper · mean of 8 models</em>
                  </th>
                  <td>76.2</td>
                  <td>68.7</td>
                  <td>7.3</td>
                </tr>
                <tr>
                  <th>
                    Hermes<em>paper · mean of 8 models</em>
                  </th>
                  <td>71.2</td>
                  <td>139.7</td>
                  <td>22.6</td>
                </tr>
                <tr>
                  <th>
                    Moltis<em>paper · mean of 8 models</em>
                  </th>
                  <td>68.8</td>
                  <td>134.9</td>
                  <td>8.0</td>
                </tr>
                <tr>
                  <th>
                    NullClaw<em>paper · mean of 8 models</em>
                  </th>
                  <td>64.4</td>
                  <td>175.1</td>
                  <td>12.1</td>
                </tr>
                <tr>
                  <th>
                    ZeroClaw<em>paper · mean of 8 models</em>
                  </th>
                  <td>61.4</td>
                  <td>133.2</td>
                  <td>8.6</td>
                </tr>
                <tr>
                  <th>
                    OpenClaw<em>paper · mean of 8 models</em>
                  </th>
                  <td>52.4</td>
                  <td>82.1</td>
                  <td>5.0</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="b-hb-foot">
            {
              "Scores 0 to 100, combining the task's outcome check, a security gate and the judge's rubric, as in the paper. Vythea: one run per task, over the tasks the judge graded (106 of 106 on Sonnet 4.6, 105 on DeepSeek V4 Flash). Paper figures are read off its Figure 3 and Table 2. Models differ between rows; the same-model comparison is above."
            }
          </p>
          <div className="b-hb-x">
            <p className="micro">Task explorer // all 106 tasks</p>
            <h3 className="b-h3">Every task, every note.</h3>
            <p className="b-hb-sub">
              {
                "Main against base, the build before the harness work. Select a row for the judge's note on both. The raw data is the file this table reads."
              }
            </p>
            <div className="hx">
              <p className="hx-empty">Loading the raw data…</p>
            </div>
          </div>
        </div>
      </section>
      <section className="b-hb b-swe">
        <div className="shell">
          <div className="b-head">
            <div>
              <p className="micro">SWE-bench Verified // 10 tasks</p>
              <h2>
                Tokens it takes
                <br />
                to solve.
              </h2>
            </div>
            <p className="b-hb-sub">
              {
                "The ten tasks OpenHuman's harness benchmark published, graded by the official SWE-bench evaluator, every harness on DeepSeek V4.1 Flash. Lower is better. Vythea solves all ten with the fewest tokens of any harness that does."
              }
            </p>
          </div>
          <p className="micro b-hb-h">Tokens per solved task · thousand</p>
          <ol className="b-rows">
            <li className="b-row">
              <span className="b-rank">[ 01 ]</span>
              <span className="b-name">
                Codex<em>published</em>
              </span>
              <span className="b-bar">
                <i style={{ width: "46.13546463020502%" }} />
              </span>
              <span className="b-val">
                <bdi dir="ltr">
                  370<small>k</small>
                </bdi>
              </span>
              <span className="b-rel">7/10 solved · 1.74¢</span>
            </li>
            <li className="ours b-row">
              <span className="b-rank">[ 02 ]</span>
              <span className="b-name">
                Vythea<em>round one</em>
              </span>
              <span className="b-bar">
                <i style={{ width: "46.871685446536645%" }} />
              </span>
              <span className="b-val">
                <bdi dir="ltr">
                  376<small>k</small>
                </bdi>
              </span>
              <span className="b-rel">10/10 solved · 0.81¢</span>
            </li>
            <li className="b-row">
              <span className="b-rank">[ 03 ]</span>
              <span className="b-name">
                OpenCode<em>published</em>
              </span>
              <span className="b-bar">
                <i style={{ width: "48.68540910168582%" }} />
              </span>
              <span className="b-val">
                <bdi dir="ltr">
                  390<small>k</small>
                </bdi>
              </span>
              <span className="b-rel">10/10 solved · 0.77¢</span>
            </li>
            <li className="b-row">
              <span className="b-rank">[ 04 ]</span>
              <span className="b-name">
                Claude Code<em>published</em>
              </span>
              <span className="b-bar">
                <i style={{ width: "53.350553413444146%" }} />
              </span>
              <span className="b-val">
                <bdi dir="ltr">
                  428<small>k</small>
                </bdi>
              </span>
              <span className="b-rel">10/10 solved · 3.51¢</span>
            </li>
            <li className="b-row">
              <span className="b-rank">[ 05 ]</span>
              <span className="b-name">
                OpenClaw<em>published</em>
              </span>
              <span className="b-bar">
                <i style={{ width: "55.204457255518534%" }} />
              </span>
              <span className="b-val">
                <bdi dir="ltr">
                  442<small>k</small>
                </bdi>
              </span>
              <span className="b-rel">9/10 solved · 1.07¢</span>
            </li>
            <li className="b-row">
              <span className="b-rank">[ 06 ]</span>
              <span className="b-name">
                Hermes<em>published</em>
              </span>
              <span className="b-bar">
                <i style={{ width: "60.108311808233196%" }} />
              </span>
              <span className="b-val">
                <bdi dir="ltr">
                  482<small>k</small>
                </bdi>
              </span>
              <span className="b-rel">10/10 solved · 0.82¢</span>
            </li>
            <li className="b-row">
              <span className="b-rank">[ 07 ]</span>
              <span className="b-name">
                DeepSeek harness<em>published</em>
              </span>
              <span className="b-bar">
                <i style={{ width: "92.88136862201924%" }} />
              </span>
              <span className="b-val">
                <bdi dir="ltr">
                  744<small>k</small>
                </bdi>
              </span>
              <span className="b-rel">10/10 solved · 1.29¢</span>
            </li>
            <li className="ours before b-row">
              <span className="b-rank">[ 08 ]</span>
              <span className="b-name">
                Vythea<em>baseline</em>
              </span>
              <span className="b-bar">
                <i style={{ width: "100%" }} />
              </span>
              <span className="b-val">
                <bdi dir="ltr">
                  801<small>k</small>
                </bdi>
              </span>
              <span className="b-rel">9/10 solved · 2.07¢</span>
            </li>
          </ol>
          <p className="micro b-hb-h">Vythea across models</p>
          <div className="b-scroll">
            <table className="b-table b-table-ink">
              <thead>
                <tr>
                  <th>Model</th>
                  <th>
                    Solved<small>of 10</small>
                  </th>
                  <th>
                    Tokens<small>thousand / solved</small>
                  </th>
                  <th>
                    Model calls<small>per task</small>
                  </th>
                  <th>
                    Cost<small>cents / solved</small>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>DeepSeek V4.1 Flash</th>
                  <td>10</td>
                  <td>740</td>
                  <td>24.0</td>
                  <td>1.27</td>
                </tr>
                <tr>
                  <th>Claude Haiku 5.5</th>
                  <td>9</td>
                  <td>64</td>
                  <td>5.8</td>
                  <td>1.72</td>
                </tr>
                <tr>
                  <th>Claude Sonnet 5.5</th>
                  <td>9</td>
                  <td>72</td>
                  <td>6.6</td>
                  <td>5.15</td>
                </tr>
                <tr>
                  <th>Kimi K2.7 Code</th>
                  <td>9</td>
                  <td>467</td>
                  <td>25.2</td>
                  <td>12.59</td>
                </tr>
                <tr>
                  <th>GLM-5.3 Flash</th>
                  <td>8</td>
                  <td>86</td>
                  <td>9.9</td>
                  <td>0.89</td>
                </tr>
                <tr>
                  <th>GPT-6 Luna</th>
                  <td>7</td>
                  <td>147</td>
                  <td>10.1</td>
                  <td>1.24</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="b-hb-foot">
            {
              "One run per task; a single task can take several times as many calls from one run to the next, and a later build's run came to 740k tokens per solved task (10/10, 1.27¢). Tokens are prompt plus output over all ten tasks, divided by the tasks solved. Cost is at DeepSeek's own prices for the DeepSeek rows, the published harnesses' web search included, and at each model's list price in the model table. The published harnesses ran with internet access; Vythea's runs were offline. Tokenizers differ between model families, so tokens compare the same model best. Every task: "
            }
            swe-bench.json.
          </p>
        </div>
      </section>
      <section className="b-hb b-tb">
        <div className="shell">
          <div className="b-head">
            <div>
              <p className="micro">Terminal-Bench 2.0 // 89 tasks</p>
              <h2>
                Tasks it finishes
                <br />
                in a terminal.
              </h2>
            </div>
            <p className="b-hb-sub">
              All 89 tasks of Terminal-Bench 2.0 through Harbor, with Vythea as the agent on each model, one
              trial per task. Scored out of all 89; higher is better.
            </p>
          </div>
          <p className="micro b-hb-h">Tasks passed · Vythea on each model</p>
          <ol className="b-rows">
            <li className="b-row ours">
              <span className="b-rank">[ 01 ]</span>
              <span className="b-name">
                Vythea<em>Claude Sonnet 5.5</em>
              </span>
              <span className="b-bar">
                <i style={{ width: "79.7752808988764%" }} />
              </span>
              <span className="b-val">
                <bdi dir="ltr">
                  79.8<small>%</small>
                </bdi>
              </span>
              <span className="b-rel">71/89 passed</span>
            </li>
            <li className="b-row ours">
              <span className="b-rank">[ 02 ]</span>
              <span className="b-name">
                Vythea<em>GPT-6.1 Sol</em>
              </span>
              <span className="b-bar">
                <i style={{ width: "78.65168539325843%" }} />
              </span>
              <span className="b-val">
                <bdi dir="ltr">
                  78.7<small>%</small>
                </bdi>
              </span>
              <span className="b-rel">70/89 passed</span>
            </li>
            <li className="b-row ours">
              <span className="b-rank">[ 03 ]</span>
              <span className="b-name">
                Vythea<em>Claude Opus 5.5</em>
              </span>
              <span className="b-bar">
                <i style={{ width: "76.40449438202246%" }} />
              </span>
              <span className="b-val">
                <bdi dir="ltr">
                  76.4<small>%</small>
                </bdi>
              </span>
              <span className="b-rel">68/89 passed</span>
            </li>
            <li className="b-row ours">
              <span className="b-rank">[ 04 ]</span>
              <span className="b-name">
                Vythea<em>GPT-6 Sol</em>
              </span>
              <span className="b-bar">
                <i style={{ width: "70.78651685393258%" }} />
              </span>
              <span className="b-val">
                <bdi dir="ltr">
                  70.8<small>%</small>
                </bdi>
              </span>
              <span className="b-rel">63/89 passed</span>
            </li>
            <li className="b-row ours">
              <span className="b-rank">[ 05 ]</span>
              <span className="b-name">
                Vythea<em>DeepSeek V4.1 Flash</em>
              </span>
              <span className="b-bar">
                <i style={{ width: "69.66292134831461%" }} />
              </span>
              <span className="b-val">
                <bdi dir="ltr">
                  69.7<small>%</small>
                </bdi>
              </span>
              <span className="b-rel">62/89 passed</span>
            </li>
            <li className="b-row ours">
              <span className="b-rank">[ 06 ]</span>
              <span className="b-name">
                Vythea<em>Claude Haiku 5.5</em>
              </span>
              <span className="b-bar">
                <i style={{ width: "65.1685393258427%" }} />
              </span>
              <span className="b-val">
                <bdi dir="ltr">
                  65.2<small>%</small>
                </bdi>
              </span>
              <span className="b-rel">58/89 passed</span>
            </li>
            <li className="b-row ours">
              <span className="b-rank">[ 07 ]</span>
              <span className="b-name">
                Vythea<em>Muse Spark 1.3</em>
              </span>
              <span className="b-bar">
                <i style={{ width: "53.93258426966292%" }} />
              </span>
              <span className="b-val">
                <bdi dir="ltr">
                  53.9<small>%</small>
                </bdi>
              </span>
              <span className="b-rel">48/89 passed</span>
            </li>
          </ol>
          <p className="b-hb-foot">
            {"Run 20 October 2026 with "}
            <code dir="ltr">Harbor 0.24</code>
            {
              ". The latest trial per task counts; a run that looked up a task's answers online counts as a fail, and trials lost to infrastructure (docker, provider outages) were run again. Claude models ran at high reasoning. Claude Opus 5.5 lost 9 security and biology tasks to its provider's safety filter, Sonnet 5.5 3 and Haiku 5.5 1; they count as fails. Grok 4.7 is left out until its run finishes."
            }
          </p>
        </div>
      </section>
      <section className="b-how">
        <div className="shell b-how-in">
          <div>
            <p className="micro">Method</p>
            <h2>How it was run.</h2>
          </div>
          <dl className="b-dl">
            <dt>Machine</dt>
            <dd>Mac mini (Mac16,10), Apple M4 (4P + 6E cores), 16 GB, macOS 26.2</dd>
            <dt>Build</dt>
            <dd>
              {"Release build, "}
              <code dir="ltr">cargo test --release -- --ignored</code>, nothing else running. Sessions are
              written for real, some 90 MB of them.
            </dd>
            <dt>Data</dt>
            <dd>
              Synthetic sessions with the shape of real ones: five turns of question, tool call, result and
              answer, plus one 10,000-message day of tool work. The stream comes from a local server, so no
              network is timed.
            </dd>
            <dt>SWE-bench</dt>
            <dd>
              {
                "SWE-bench Verified, the 10 tasks of OpenHuman's harness benchmark (tinyhumansai/openhuman-benchmarks), in its 4-CPU, 8 GB task container behind its metering proxy, graded by the official evaluator. Vythea runs headless, "
              }
              <code dir="ltr">vythea -p</code>
              {". Published rows are the rig's run of 2 October 2026."}
            </dd>
            <dt>Harness-Bench</dt>
            <dd>
              {
                "Qihoo360/harness-bench at commit 1025086, all 106 tasks, judged by Claude Sonnet 4.6 as in the paper. Rerun 13 October 2026 on Vythea main (847fa57c). Paper: "
              }
              <a href="https://arxiv.org/abs/2605.27922">arXiv 2605.27922</a>.
            </dd>
          </dl>
        </div>
      </section>
    </main>
  );
}
