import Link from "next/link";

/** A dashboard page whose feature isn't open yet: says so plainly and points to what is. */
export function Soon({
  kicker,
  title,
  text,
  note,
}: {
  kicker: string;
  title: string;
  text: string;
  note?: string;
}) {
  return (
    <div>
      <div className="dash-top">
        <p className="micro">{kicker}</p>
        <h1 className="dash-title">{title}</h1>
        <p className="dash-sub">{text}</p>
      </div>
      {note && <p className="acct-note">{note}</p>}
      <p className="acct-more">
        <Link href="/dashboard/keys" className="btn btn-line btn-xs">
          Your API keys
        </Link>{" "}
        <Link href="/dashboard/download" className="btn btn-line btn-xs">
          Get the app
        </Link>
      </p>
    </div>
  );
}
