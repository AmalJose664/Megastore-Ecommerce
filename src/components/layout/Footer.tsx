import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Instagram, Twitter, Facebook, Youtube } from "lucide-react";

const footerLinks = {
  shop: [
    { name: "All Products", path: "/products" },
    { name: "New Arrivals", path: "/products?filter=new" },
    { name: "Best Sellers", path: "/products?filter=bestsellers" },
    { name: "Sale", path: "/products?filter=sale" },
  ],
  company: [
    { name: "About Us", path: "/about" },
    { name: "Careers", path: "/careers" },
    { name: "Press", path: "/press" },
    { name: "Sustainability", path: "/sustainability" },
  ],
  support: [
    { name: "Help Center", path: "/help" },
    { name: "Shipping & Returns", path: "/shipping" },
    { name: "Size Guide", path: "/size-guide" },
    { name: "Contact Us", path: "/contact" },
  ],
};

const socialLinks = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Youtube, href: "#", label: "Youtube" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="container py-12 lg:py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="font-display text-2xl font-semibold">
              e-commerce
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Crafting exceptional products for the modern lifestyle. Quality,
              sustainability, and design at the heart of everything we do.
            </p>

            {/* Newsletter */}
            <div className="mt-6">
              <h4 className="font-medium">Subscribe to our newsletter</h4>
              <div className="mt-2 flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 rounded-lg border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button className="gradient-primary rounded-lg px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:scale-[1.02]">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold">Shop</h4>
            <ul className="mt-4 space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold">Company</h4>
            <ul className="mt-4 space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold">Support</h4>
            <ul className="mt-4 space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>© 2024 e-commerce. All rights reserved.</span>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                aria-label={social.label}
              >
                <social.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
