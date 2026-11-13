export const LEGAL_UPDATED = "13 November 2026";
export const CONTACT = "support@vythea.com";

/** A block is a paragraph, or a list when it is an array of strings. */
type Block = string | string[];
export type LegalDoc = {
  slug: "terms" | "privacy" | "refunds";
  title: string;
  description: string;
  intro: string;
  sections: { heading: string; blocks: Block[] }[];
};

export const TERMS: LegalDoc = {
  slug: "terms",
  title: "Terms of Service",
  description: "The rules for using Vythea: accounts, API keys, acceptable use and limits.",
  intro:
    "Vythea is an AI agent app with a website, an account area and, once it opens, a gateway to AI models. These terms apply when you use any of them. By creating an account or using an API key you agree to them. If you do not, please do not use the service.",
  sections: [
    {
      heading: "Your account",
      blocks: [
        "You sign in with GitHub, an email link or a wallet. You are responsible for everything that happens under your account and for keeping your API keys secret.",
        `We store only a hash of each key, so we cannot show a key again. If you lose one, revoke it and create a new one. If you think a key has leaked, revoke it at once and tell us at ${CONTACT}.`,
      ],
    },
    {
      heading: "Acceptable use",
      blocks: [
        "You agree not to:",
        [
          "break the law or use Vythea to harm others, including fraud, harassment, malware, or sexual content involving minors;",
          "attack, overload or probe the service, or try to get around limits, billing or access controls;",
          "share one key among many people or resell access without our written agreement.",
        ],
        "We may limit, suspend or revoke access that breaks these rules or puts the service or other people at risk.",
      ],
    },
    {
      heading: "Limits and credit",
      blocks: [
        "Each API key has a requests-per-minute limit and a daily spending limit, shown in your dashboard. Paid models draw on credit, which you add in advance with USDT or USDC; see the Refund Policy.",
      ],
    },
    {
      heading: "Models and third parties",
      blocks: [
        "Requests to models are processed by the model providers we route to, under their own terms. Model output can be wrong, so check it before you rely on it, and do not send information you are not allowed to share.",
      ],
    },
    {
      heading: "Alpha service",
      blocks: [
        "Vythea is in alpha. Features change or go away, and the service can be interrupted. To the extent the law allows, we provide it as it is, without promises about availability or results.",
      ],
    },
    {
      heading: "The VYTH token",
      blocks: [
        "The VYTH token is not live. Nothing on this website is an offer to sell, a solicitation, or financial, investment, legal or tax advice. Any future token launch will be announced on our official channels and will have its own terms and risk disclosures. Be wary of anyone who claims to sell VYTH before then.",
      ],
    },
    {
      heading: "Liability",
      blocks: [
        "To the extent the law allows, Vythea is not liable for indirect or consequential losses, and our total liability for any claim is limited to the amount you paid us for the service in the 12 months before the claim.",
      ],
    },
    {
      heading: "Changes and contact",
      blocks: [
        `We may update these terms. The date at the top shows the latest version, and continuing to use the service after a change means you accept it. Questions: ${CONTACT}.`,
      ],
    },
  ],
};

export const PRIVACY: LegalDoc = {
  slug: "privacy",
  title: "Privacy Policy",
  description: "What Vythea collects, why, who handles it, and how to have it deleted.",
  intro:
    "This page explains what personal data Vythea collects, why, and who handles it. We keep it to what the service needs, we do not sell personal data, and we do not run advertising.",
  sections: [
    {
      heading: "What we collect",
      blocks: [
        [
          "Account: your GitHub username and avatar and your email address if you sign in with GitHub or email, or your wallet address if you sign in with a wallet.",
          "API keys: a name you choose, a short prefix and a hash of the key. The full key is shown once, when you create it, and is not stored.",
          "Usage: for each request through the gateway, the time, the model, token counts, the cost and which key made it.",
          "Credit: your balance and the history of changes to it.",
          "Technical: standard server logs kept by our hosting provider, such as IP address, browser and the pages requested.",
        ],
      ],
    },
    {
      heading: "Prompts and replies",
      blocks: [
        "When the gateway opens, your request is forwarded to the model provider you chose and the reply is returned to you. We do not keep the text of your prompts or replies in our database; it stores usage figures only. Providers may handle the text under their own policies.",
      ],
    },
    {
      heading: "How we use it",
      blocks: [
        "To run your account, enforce limits, keep the service safe, prevent abuse and answer your questions. We do not use it for advertising and we do not sell it.",
      ],
    },
    {
      heading: "Cookies and local storage",
      blocks: [
        "We use only the essential cookies that keep you signed in. There are no advertising or analytics cookies. Your browser also remembers your language choice on your own device.",
      ],
    },
    {
      heading: "Who handles your data",
      blocks: [
        [
          "Supabase, which hosts accounts and our database.",
          "Vercel, which hosts the website.",
          "GitHub, only if you choose to sign in with it.",
          "The model providers, and OpenRouter, the routing service we use to reach them, for the requests you send.",
        ],
      ],
    },
    {
      heading: "Keeping and deleting data",
      blocks: [
        `We keep account data for as long as your account exists. To have your account and its data deleted, write to ${CONTACT} from the email on the account, or tell us the GitHub username or wallet address you signed in with.`,
      ],
    },
    {
      heading: "Your rights and contact",
      blocks: [
        `You can ask us for a copy of your data, to correct it, or to delete it. Write to ${CONTACT}. We may update this policy; the date at the top shows the latest version.`,
      ],
    },
  ],
};

export const REFUNDS: LegalDoc = {
  slug: "refunds",
  title: "Refund Policy",
  description: "How credit payments and refunds work at Vythea.",
  intro: "This page covers payments and refunds for Vythea.",
  sections: [
    {
      heading: "Adding credit",
      blocks: [
        "Credit is prepaid. You add it by sending USDT or USDC on a network shown at checkout, and it is added to your balance once the payment is confirmed. Pro and Team plans are not on sale yet, and the free tier needs no payment details.",
      ],
    },
    {
      heading: "Payments on a blockchain",
      blocks: [
        "A payment on a blockchain can't be reversed once it is confirmed. Send the exact amount shown, on the network shown. If a payment did not add credit, or you sent the wrong amount or used the wrong network, write to us with the transaction hash and we will look into it.",
      ],
    },
    {
      heading: "A charge you did not expect",
      blocks: [`If you ever see a charge you did not expect, write to ${CONTACT} and we will look into it.`],
    },
    {
      heading: "The VYTH token",
      blocks: ["Vythea does not sell the VYTH token. Nothing on this page refers to token purchases."],
    },
  ],
};
