import type { CSSProperties } from "react";

const CAPS = [
  {
    art: "agent",
    tag: "#01 Agent",
    title: "Does the work",
    body: "Real files, real commands, the web, and a browser beside the chat. It asks before anything that matters.",
  },
  {
    art: "memory",
    tag: "#02 Memory",
    title: "Written to disk",
    body: "Plain text you can open, edit and delete. A file, not a black box.",
  },
  {
    art: "auto",
    tag: "#03 Auto mode",
    title: "Asks less, safely",
    body: "A judge on your own model decides what would otherwise ask; commands can run confined by the OS.",
  },
  {
    art: "delegate",
    tag: "#04 Delegate",
    title: "Splits the work",
    body: "Helpers that work side by side and share a task list, and workflows that run many agents.",
  },
  {
    art: "chat",
    tag: "#05 Chat apps",
    title: "Answers your phone",
    body: "Telegram, Discord and Slack, with files and voice notes, even with no window open.",
  },
  {
    art: "extend",
    tag: "#06 Extend",
    title: "Speaks your stack",
    body: "MCP servers over HTTP and OAuth, plugins from git, skills, and Zed or JetBrains over ACP.",
  },
];

export function Capabilities() {
  return (
    <section className="band paper" id="capabilities">
      <div className="shell">
        <div className="band-top">
          <p className="micro">Capabilities</p>
          <h2>
            What it does
            <br />
            while you work.
          </h2>
        </div>
        <div className="caps">
          {CAPS.map((cap) => (
            <article className="cap" key={cap.art}>
              {/* The engraving is a mask: the plate takes the ink colour of the band it sits on. */}
              <div
                className="cap-art near"
                aria-hidden="true"
                style={{ "--art": `url(/assets/art/cap-${cap.art}.png)` } as CSSProperties}
              />
              <p className="cap-tag">
                <span className="label">{cap.tag}</span>
              </p>
              <h3>{cap.title}</h3>
              <p className="cap-b">{cap.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
