import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Instagram, Twitter, Facebook, Youtube } from "lucide-react";
import { useSiteSettings } from "@/context/SettingsContext";

const footerLinks = {
  shop: [
    { name: "All Products", path: "/products" },
    { name: "New Arrivals", path: "/products?filter=new" },
    { name: "Best Sellers", path: "/products?filter=bestsellers" },
    { name: "Sale", path: "/products?filter=sale" },
  ],
  company: [
    { name: "About Us", path: "/about" },
    { name: "Categories", path: "/categories" },
    { name: "Cart", path: "/cart" },
  ],
  support: [
    { name: "My Account", path: "/profile" },
    { name: "My Orders", path: "/orders" },
    { name: "Checkout", path: "/checkout" },
  ],
};

export function Footer() {
  const { settings } = useSiteSettings();

  const socialLinks = [
    { icon: Instagram, href: settings.socialLinks?.instagram || "#", label: "Instagram" },
    { icon: Twitter, href: settings.socialLinks?.twitter || "#", label: "Twitter" },
    { icon: Facebook, href: settings.socialLinks?.facebook || "#", label: "Facebook" },
    { icon: Youtube, href: settings.socialLinks?.youtube || "#", label: "Youtube" },
  ].filter((s) => s.href && s.href !== "#");

  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="container py-12 lg:py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="font-display text-2xl font-semibold flex items-center gap-2">
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt={settings.siteName} className="h-8 max-w-[160px] object-contain" />
              ) : (
                settings.siteName || "MegaStore"
              )}
            </Link>
            
            <p className="max-w-xs text-sm text-muted-foreground leading-relaxed">
              {settings.siteDescription || "Crafting exceptional products for the modern lifestyle. Quality, sustainability, and design."}
            </p>

            <div className="space-y-2 text-xs text-muted-foreground pt-2">
              {settings.contactEmail && (
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-primary" /> {settings.contactEmail}
                </p>
              )}
              {settings.contactPhone && (
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-primary" /> {settings.contactPhone}
                </p>
              )}
              {settings.address && (
                <p className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-primary" /> {settings.address}
                </p>
              )}
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
            <span>© {new Date().getFullYear()} {settings.siteName || "MegaStore"}. All rights reserved.</span>
          </div>

          {/* Social Links */}
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
