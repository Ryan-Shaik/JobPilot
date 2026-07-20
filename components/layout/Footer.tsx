import Link from "next/link";

export function Footer() {
  const footerLinks = [
    { name: "Support", href: "#" },
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
    { name: "Cookie Policy", href: "#" },
  ];

  return (
    <footer className="w-full border-t border-border bg-surface py-8 px-6 mt-auto">
      <div className="flex flex-col md:flex-row items-center justify-between max-w-[1440px] w-full mx-auto gap-4">
        {/* Left Side */}
        <div className="flex flex-col items-center md:items-start gap-1">
          <span className="text-[19px] font-bold text-text-darkest leading-[28px]">
            JobPilot
          </span>
          <span className="text-xs text-text-muted leading-4">
            © 2024 JobPilot AI. All rights reserved. Precision in every search.
          </span>
        </div>

        {/* Right Side Links */}
        <div className="flex items-center gap-6 flex-wrap justify-center">
          {footerLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-xs text-text-secondary hover:text-text-primary transition-colors font-medium leading-4"
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
