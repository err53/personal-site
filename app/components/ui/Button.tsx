export const Button: React.FC<{
  label: string;
  href: string;
  children: React.ReactNode;
}> = ({ label, href, children }) => (
  <a
    aria-label={label}
    href={href}
    className="hover:bg-accent hover:text-accent-foreground border p-3 shadow-md active:shadow-none"
  >
    <div>{children}</div>
  </a>
);
