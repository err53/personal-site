"use client";

import classNames from "classnames";
import { usePostHogEvent } from "../utils/usePostHogEvent";

type CardType = "project" | "resume";

type CardEventProperties = {
  project: {
    project: string;
    url: string;
  };
  resume: {
    format: string;
    url: string;
  };
};

export const Card: React.FC<{
  label?: string;
  href: string;
  className?: string;
  children: React.ReactNode;
  type: CardType;
}> = ({ label, href, className, children, type }) => {
  const getEventConfig = (
    type: CardType,
  ): { eventName: string; properties: CardEventProperties[typeof type] } => {
    switch (type) {
      case "project":
        return {
          eventName: "project_clicked",
          properties: {
            project: label ?? "unknown",
            url: href,
          },
        };
      case "resume":
        return {
          eventName: "resume_clicked",
          properties: {
            format: label ?? "unknown",
            url: href,
          },
        };
      default:
        const _exhaustiveCheck: never = type;
        return _exhaustiveCheck;
    }
  };

  const { eventName, properties } = getEventConfig(type);
  const trackClick = usePostHogEvent(eventName, properties);

  return (
    <a
      aria-label={label}
      href={href}
      onClick={trackClick}
      className={classNames(
        "hover:bg-accent hover:text-accent-foreground flex h-full flex-col justify-between border shadow-md transition-all duration-300 active:shadow-none",
        className,
      )}
    >
      {children}
    </a>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <div className="m-6">{children}</div>;

export const CardSubtitle: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <p className="mx-6 mb-6">{children}</p>;
