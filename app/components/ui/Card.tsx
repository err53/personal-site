export const Card: React.FC<{
  label: string;
  href: string;
  children: React.ReactNode;
}> = ({ label, href, children }) => (
  <a
    aria-label={label}
    href={href}
    className="hover:bg-accent hover:text-accent-foreground flex h-full flex-col justify-between border shadow-md active:shadow-none"
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
