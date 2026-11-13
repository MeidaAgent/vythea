import Link from "next/link";

const ITEMS = [
  {
    tag: "Tasks",
    title: "Keeps going without you",
    body: "Ask in the chat and the task runs on our servers in a container of its own. Close the app or the laptop; the answer waits for you.",
  },
  {
    tag: "Services",
    title: "Stays online",
    body: "Say keep it running and it stays up: a scheduler, a webhook, a watcher. Restarted if it stops, billed by the hour from your credit.",
  },
  {
    tag: "Apps",
    title: "A link of its own",
    body: "A web app gets its own address on vythea.com, wakes on the first visit and sleeps when nobody is looking.",
  },
];

export function CloudSection() {
  return (
    <section className="band deep" id="cloud">
      <div className="shell">
        <div className="band-top">
          <p className="micro">Vythea Cloud</p>
          <h2>
            Close the laptop.
            <br />
            It keeps working.
          </h2>
        </div>
        <div className="cloud-grid">
          <div className="cloud-items">
            {ITEMS.map((item) => (
              <article className="cloud-item" key={item.tag}>
                <p className="micro cloud-tag">{item.tag}</p>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
          <div className="cloud-chat" aria-label="An example">
            <p className="say you">
              <span className="micro">You</span>
              Watch my shop&apos;s stock every hour and email me when anything runs low. Keep it running.
            </p>
            <p className="say agent">
              <span className="micro">Vythea</span>
              <span>
                Built and tested <code>stock.js</code>: it read your stock and sent a test email. It now keeps
                running in Vythea Cloud (256 MB). See what it prints, stop or restart it under Cloud.
              </span>
            </p>
            <p className="say status">
              <i />
              stock-watch · online · about $1.50 a month
            </p>
          </div>
        </div>
        <div className="cloud-foot">
          <p>Comes with Pro. Compute is about $6 per GB a month from your credit, charged by the second.</p>
          <div className="cloud-ctas">
            <Link className="btn btn-fill" href="/docs/cloud">
              <span>How it works</span>
            </Link>
            <Link className="btn btn-hollow" href="/price#cloud">
              <span>Cloud prices</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
