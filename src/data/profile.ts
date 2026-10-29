// Shared profile data. Used by the Socials section and the home page JSON-LD
// so the links stay in sync.

export const siteUrl = "https://www.jhuang.dev/";

export const socials = [
  { label: "X", href: "https://x.com/err_53" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/jhuang03/" },
  { label: "Instagram", href: "https://www.instagram.com/the.err53/" },
  { label: "Github", href: "https://github.com/err53" },
  { label: "Medium", href: "https://err53.medium.com/" },
  { label: "Last.fm", href: "https://www.last.fm/user/err53" },
] as const;

export type SocialLabel = (typeof socials)[number]["label"];

export const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Jason Huang",
  url: siteUrl,
  alternateName: ["err53", "error53", "json", "jhthenerd"],
  jobTitle: "Full-Stack Developer",
  sameAs: socials.map((s) => s.href),
};
