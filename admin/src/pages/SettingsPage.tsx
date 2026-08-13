import React, { useState, useEffect } from 'react';
import { Save, User, Bell, Shield, Globe, Info } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { settingService } from '@/services/settingService';
import { SiteSettings } from '@/types';

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    siteName: 'MegaStore',
    siteDescription: 'Your one-stop destination for modern e-commerce shopping.',
    contactEmail: 'support@megastore.com',
    contactPhone: '+1 (800) 123-4567',
    address: '123 E-Commerce Way, Tech City, TC 10001',
    currencySymbol: '₹',
    logoUrl: '',
    socialLinks: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: '',
      youtube: '',
    },
    metaTitle: 'MegaStore - Modern E-Commerce Platform',
    metaKeywords: 'ecommerce, shopping, online store, deals',
  });

  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  useEffect(() => {
    fetchSiteSettings();
  }, []);

  const fetchSiteSettings = async () => {
    setIsLoadingSettings(true);
    const data = await settingService.getSettings();
    if (data) {
      setSiteSettings({
        ...data,
        socialLinks: {
          facebook: data.socialLinks?.facebook || '',
          twitter: data.socialLinks?.twitter || '',
          instagram: data.socialLinks?.instagram || '',
          linkedin: data.socialLinks?.linkedin || '',
          youtube: data.socialLinks?.youtube || '',
        },
      });
    }
    setIsLoadingSettings(false);
  };
  
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    lowStock: true,
    newUsers: false,
    marketing: false,
  });

  const handleSaveProfile = () => {
    toast({
      title: 'Profile updated',
      description: 'Your profile has been saved successfully.',
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: 'Notifications updated',
      description: 'Your notification preferences have been saved.',
    });
  };

  const handleSaveSiteSettings = async () => {
    const updated = await settingService.updateSettings(siteSettings);
    if (updated) {
      toast({
        title: 'Site settings updated',
        description: 'Store settings and contact details saved successfully.',
      });
    } else {
      toast({
        title: 'Error',
        description: 'Failed to update site settings.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Settings"
        description="Manage site details, store preferences, and admin profile"
      />

      <Tabs defaultValue="site" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="site" className="gap-2">
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">Site Info</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        {/* Site Settings Tab */}
        <TabsContent value="site">
          <div className="card-elevated p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" /> Store & Site Information
              </h2>
              <p className="text-sm text-muted-foreground">
                Configure brand name, description, contact information, and social links displayed across the store.
              </p>
            </div>

            {isLoadingSettings ? (
              <div className="py-8 text-center">Loading site settings...</div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name *</Label>
                    <Input
                      id="siteName"
                      value={siteSettings.siteName}
                      onChange={(e) => setSiteSettings((prev) => ({ ...prev, siteName: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currencySymbol">Currency Symbol *</Label>
                    <Input
                      id="currencySymbol"
                      value={siteSettings.currencySymbol}
                      onChange={(e) => setSiteSettings((prev) => ({ ...prev, currencySymbol: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    rows={3}
                    value={siteSettings.siteDescription}
                    onChange={(e) => setSiteSettings((prev) => ({ ...prev, siteDescription: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={siteSettings.contactEmail}
                      onChange={(e) => setSiteSettings((prev) => ({ ...prev, contactEmail: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input
                      id="contactPhone"
                      value={siteSettings.contactPhone}
                      onChange={(e) => setSiteSettings((prev) => ({ ...prev, contactPhone: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Physical Address</Label>
                  <Input
                    id="address"
                    value={siteSettings.address}
                    onChange={(e) => setSiteSettings((prev) => ({ ...prev, address: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logoUrl">Logo Image URL</Label>
                  <Input
                    id="logoUrl"
                    placeholder="https://..."
                    value={siteSettings.logoUrl || ''}
                    onChange={(e) => setSiteSettings((prev) => ({ ...prev, logoUrl: e.target.value }))}
                  />
                </div>

                <div className="space-y-3 pt-2 border-t border-border">
                  <h3 className="text-sm font-semibold text-foreground">Social Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs">Instagram</Label>
                      <Input
                        placeholder="https://instagram.com/yourstore"
                        value={siteSettings.socialLinks?.instagram || ''}
                        onChange={(e) =>
                          setSiteSettings((prev) => ({
                            ...prev,
                            socialLinks: { ...prev.socialLinks, instagram: e.target.value },
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Facebook</Label>
                      <Input
                        placeholder="https://facebook.com/yourstore"
                        value={siteSettings.socialLinks?.facebook || ''}
                        onChange={(e) =>
                          setSiteSettings((prev) => ({
                            ...prev,
                            socialLinks: { ...prev.socialLinks, facebook: e.target.value },
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Twitter / X</Label>
                      <Input
                        placeholder="https://x.com/yourstore"
                        value={siteSettings.socialLinks?.twitter || ''}
                        onChange={(e) =>
                          setSiteSettings((prev) => ({
                            ...prev,
                            socialLinks: { ...prev.socialLinks, twitter: e.target.value },
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">YouTube</Label>
                      <Input
                        placeholder="https://youtube.com/yourstore"
                        value={siteSettings.socialLinks?.youtube || ''}
                        onChange={(e) =>
                          setSiteSettings((prev) => ({
                            ...prev,
                            socialLinks: { ...prev.socialLinks, youtube: e.target.value },
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={handleSaveSiteSettings}>
                  <Save className="w-4 h-4 mr-2" /> Save Site Information
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="card-elevated p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold">Profile Information</h2>
              <p className="text-sm text-muted-foreground">Update your personal details</p>
            </div>
            
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={e => setProfile(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={e => setProfile(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>

            <Button onClick={handleSaveProfile}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <div className="card-elevated p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold">Notification Preferences</h2>
              <p className="text-sm text-muted-foreground">Choose what notifications you receive</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Order Updates</p>
                  <p className="text-sm text-muted-foreground">Get notified when orders are placed or updated</p>
                </div>
                <Switch
                  checked={notifications.orderUpdates}
                  onCheckedChange={checked => setNotifications(prev => ({ ...prev, orderUpdates: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Low Stock Alerts</p>
                  <p className="text-sm text-muted-foreground">Get notified when products are running low</p>
                </div>
                <Switch
                  checked={notifications.lowStock}
                  onCheckedChange={checked => setNotifications(prev => ({ ...prev, lowStock: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">New User Registrations</p>
                  <p className="text-sm text-muted-foreground">Get notified when new users sign up</p>
                </div>
                <Switch
                  checked={notifications.newUsers}
                  onCheckedChange={checked => setNotifications(prev => ({ ...prev, newUsers: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Marketing Emails</p>
                  <p className="text-sm text-muted-foreground">Receive tips and product updates</p>
                </div>
                <Switch
                  checked={notifications.marketing}
                  onCheckedChange={checked => setNotifications(prev => ({ ...prev, marketing: checked }))}
                />
              </div>
            </div>

            <Button onClick={handleSaveNotifications}>
              <Save className="w-4 h-4 mr-2" />
              Save Preferences
            </Button>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <div className="card-elevated p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold">Security Settings</h2>
              <p className="text-sm text-muted-foreground">Manage your account security</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" placeholder="Enter current password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" placeholder="Enter new password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" placeholder="Confirm new password" />
              </div>
            </div>

            <Button>
              <Save className="w-4 h-4 mr-2" />
              Update Password
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
