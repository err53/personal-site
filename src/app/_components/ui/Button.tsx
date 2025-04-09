export const Button: React.FC<{
  label: string;
  href: string;
  children: React.ReactNode;
}> = ({ label, href, children }) => (
  <a
    aria-label={label}
    href={href}
    className={
      "border p-3 shadow-md transition-all duration-300 hover:bg-accent hover:text-accent-foreground active:shadow-none"
    }
  >
    {children}
  </a>
);
