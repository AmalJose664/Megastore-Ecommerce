import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchSiteSettings } from "@/lib/api";

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  currencySymbol: string;
  logoUrl?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  metaTitle?: string;
  metaKeywords?: string;
}

const defaultSettings: SiteSettings = {
  siteName: "MegaStore",
  siteDescription: "Your one-stop destination for modern e-commerce shopping.",
  contactEmail: "support@megastore.com",
  contactPhone: "+1 (800) 123-4567",
  address: "123 E-Commerce Way, Tech City, TC 10001",
  currencySymbol: "₹",
  logoUrl: "",
  socialLinks: {
    facebook: "",
    twitter: "",
    instagram: "",
    linkedin: "",
    youtube: "",
  },
  metaTitle: "MegaStore - Premium Online Shopping",
  metaKeywords: "ecommerce, shopping, online store, deals",
};

interface SettingsContextType {
  settings: SiteSettings;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  isLoading: true,
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetchSiteSettings();
        if (response && response.success && response.data) {
          setSettings((prev) => ({
            ...prev,
            ...response.data,
            socialLinks: {
              ...prev.socialLinks,
              ...(response.data.socialLinks || {}),
            },
          }));

          if (response.data.siteName || response.data.metaTitle) {
            document.title = response.data.metaTitle || response.data.siteName;
          }
        }
      } catch (err) {
        console.error("Failed to fetch site settings:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSiteSettings = () => useContext(SettingsContext);
