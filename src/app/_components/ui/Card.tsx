import classNames from "classnames";

export const Card: React.FC<{
  label?: string;
  href: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}> = ({ label, href, className, children, onClick }) => (
  <a
    aria-label={label}
    href={href}
    className={classNames(
      "hover:bg-accent hover:text-accent-foreground flex h-full flex-col justify-between border shadow-md transition-all duration-300 active:shadow-none",
      className,
    )}
    onClick={onClick}
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
