"use client";

import { usePostHogEvent } from "../utils/usePostHogEvent";

export const Button: React.FC<{
  label: string;
  href: string;
  children: React.ReactNode;
}> = ({ label, href, children }) => {
  const trackClick = usePostHogEvent("social_link_clicked", {
    platform: label.toLowerCase(),
    url: href,
  });

  return (
    <a
      aria-label={label}
      href={href}
      onClick={trackClick}
      className={
        "hover:bg-accent hover:text-accent-foreground border p-3 shadow-md transition-all duration-300 active:shadow-none"
      }
    >
      {children}
    </a>
  );
};
