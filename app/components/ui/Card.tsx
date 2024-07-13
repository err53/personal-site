import classNames from "classnames";

export const Card: React.FC<{
  label?: string;
  href: string;
  className?: string;
  children: React.ReactNode;
}> = ({ label, href, className, children }) => (
  <a
    aria-label={label}
    href={href}
    className={classNames(
      "flex h-full flex-col justify-between border shadow-md transition-all duration-300 hover:bg-accent hover:text-accent-foreground active:shadow-none",
      className,
    )}
  >
    {children}
  </a>
);

export const CardHeader: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <div className="m-6">{children}</div>;

export const CardSubtitle: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <p className="mx-6 mb-6">{children}</p>;
