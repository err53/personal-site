import { Button } from "./ui/Button";
import {
  FaXTwitter,
  FaLinkedinIn,
  FaInstagram,
  FaGithub,
  FaMedium,
} from "react-icons/fa6";
import { usePostHog } from "posthog-js/react";

export const Socials = () => {
  const posthog = usePostHog();

  return (
    <div className="md:justify-self-end">
      <h2 className="pb-3 text-3xl font-semibold md:text-right">Socials</h2>
      <div className="flex flex-wrap gap-2 md:justify-end">
        <Button
          label="Twitter"
          href="https://twitter.com/err_53"
          onClick={() =>
            posthog.capture("social_clicked", { platform: "twitter" })
          }
        >
          <FaXTwitter className="size-10" />
        </Button>
        <Button
          label="LinkedIn"
          href="https://www.linkedin.com/in/jasonhuang03/"
          onClick={() =>
            posthog.capture("social_clicked", { platform: "linkedin" })
          }
        >
          <FaLinkedinIn className="size-10" />
        </Button>
        <Button
          label="Instagram"
          href="https://www.instagram.com/the.err53/"
          onClick={() =>
            posthog.capture("social_clicked", { platform: "instagram" })
          }
        >
          <FaInstagram className="size-10" />
        </Button>
        <Button
          label="Github"
          href="https://github.com/err53"
          onClick={() =>
            posthog.capture("social_clicked", { platform: "github" })
          }
        >
          <FaGithub className="size-10" />
        </Button>
        <Button
          label="Medium"
          href="https://err53.medium.com/"
          onClick={() =>
            posthog.capture("social_clicked", { platform: "medium" })
          }
        >
          <FaMedium className="size-10" />
        </Button>
      </div>
    </div>
  );
};
