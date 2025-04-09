export const Button: React.FC<{
  label: string;
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}> = ({ label, href, children, onClick }) => (
  <a
    aria-label={label}
    href={href}
    className={
      "hover:bg-accent hover:text-accent-foreground border p-3 shadow-md transition-all duration-300 active:shadow-none"
    }
    onClick={onClick}
  >
    {children}
  </a>
);
