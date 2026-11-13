import { admin } from "@/lib/gateway/admin";

/** The public repository people star to unlock the free requests. */
export const STAR_REPO = process.env.NEXT_PUBLIC_STAR_REPO ?? "MeidaAgent/vythea";
export const STAR_URL = `https://github.com/${STAR_REPO}`;

/** A GitHub account must be at least this old, so a brand-new throwaway account can't claim. */
const MIN_AGE_DAYS = 7;

export type ClaimResult = "ok" | "nostar" | "young" | "taken" | "failed";

const gh = (path: string, token: string) =>
  fetch(`https://api.github.com${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "User-Agent": "vythea-site" },
    cache: "no-store",
  });

/** Whether this GitHub account has starred the repository. */
async function hasStarred(token: string, githubId: number) {
  const direct = await gh(`/user/starred/${STAR_REPO}`, token);
  if (direct.status === 204) return true;
  if (direct.status === 404) return false;
  // The direct check wasn't allowed for this token: read the repository's stargazers instead (a public list).
  for (let page = 1; page <= 20; page++) {
    const res = await gh(`/repos/${STAR_REPO}/stargazers?per_page=100&page=${page}`, token);
    if (!res.ok) throw new Error(`github ${res.status}`);
    const people = (await res.json()) as { id: number }[];
    if (people.some((p) => p.id === githubId)) return true;
    if (people.length < 100) return false;
  }
  return false;
}

/**
 * Unlocks the free requests for `userId` if the GitHub account behind `token` has starred the repository.
 * The token is used for these checks only and is never stored.
 */
export async function claimFree(userId: string, token: string | null | undefined): Promise<ClaimResult> {
  if (!token) return "failed";
  try {
    const me = await gh("/user", token);
    if (!me.ok) return "failed";
    const profile = (await me.json()) as { id: number; login: string; created_at: string };
    const ageDays = (Date.now() - new Date(profile.created_at).getTime()) / 86_400_000;
    if (!(ageDays >= MIN_AGE_DAYS)) return "young";
    if (!(await hasStarred(token, profile.id))) return "nostar";

    const { data, error } = await admin().rpc("claim_free", {
      p_user: userId,
      p_github_id: String(profile.id),
      p_login: profile.login,
    });
    if (error) return "failed";
    return data === true ? "ok" : "taken";
  } catch {
    return "failed";
  }
}
