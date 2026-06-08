import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Save, 
  Phone, 
  CreditCard, 
  MessageCircle, 
  Send,
  Globe,
  Palette,
  FileText
} from "lucide-react";
import { toast } from "sonner";

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    whatsapp_number: "966545189624",
    telegram_link: "https://t.me/NEWJEEL",
    contact_only_mode: true,
    checkout_title: "إتمام الاشتراك",
    checkout_subtitle: "بعد التحويل، أرسل إيصال التحويل عبر:",
    whatsapp_button_text: "إرسال الإيصال عبر واتساب",
    telegram_button_text: "إرسال الإيصال عبر تلقرام",
    site_name: "الجيل الجديد للاستثمار",
    site_description: "أفضل منصة استثمارية في المملكة العربية السعودية",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("contact");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from("site_settings")
      .select("*");

    if (!error && data) {
      const settingsMap: Record<string, string> = {};
      data.forEach((setting) => {
        settingsMap[setting.key] = setting.value || "";
      });
      setSettings({
        whatsapp_number: settingsMap.whatsapp_number || "966545189624",
        telegram_link: settingsMap.telegram_link || "https://t.me/NEWJEEL",
        contact_only_mode: settingsMap.contact_only_mode === "true",
        checkout_title: settingsMap.checkout_title || "إتمام الاشتراك",
        checkout_subtitle: settingsMap.checkout_subtitle || "بعد التحويل، أرسل إيصال التحويل عبر:",
        whatsapp_button_text: settingsMap.whatsapp_button_text || "إرسال الإيصال عبر واتساب",
        telegram_button_text: settingsMap.telegram_button_text || "إرسال الإيصال عبر تلقرام",
        site_name: settingsMap.site_name || "الجيل الجديد للاستثمار",
        site_description: settingsMap.site_description || "أفضل منصة استثمارية في المملكة العربية السعودية",
      });
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);

    const settingsToSave = Object.entries(settings).map(([key, value]) => ({
      key,
      value: typeof value === "boolean" ? value.toString() : value,
    }));

    for (const setting of settingsToSave) {
      const { data: existing } = await supabase
        .from("site_settings")
        .select("id")
        .eq("key", setting.key)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("site_settings")
          .update({ value: setting.value })
          .eq("key", setting.key);
      } else {
        await supabase.from("site_settings").insert([setting]);
      }
    }

    toast.success("تم حفظ الإعدادات بنجاح");
    setIsSaving(false);
  };

  if (isLoading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">إعدادات الموقع الشاملة</h2>

      <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            التواصل
          </TabsTrigger>
          <TabsTrigger value="checkout" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            واجهة الدفع
          </TabsTrigger>
          <TabsTrigger value="site" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            الموقع
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                إعدادات التواصل
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>رقم الواتساب</Label>
                <Input
                  value={settings.whatsapp_number}
                  onChange={(e) =>
                    setSettings({ ...settings, whatsapp_number: e.target.value })
                  }
                  placeholder="966xxxxxxxxx"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  أدخل الرقم بدون علامة + (مثال: 966545189624)
                </p>
              </div>

              <div>
                <Label>رابط تلقرام للإيصالات</Label>
                <Input
                  value={settings.telegram_link}
                  onChange={(e) =>
                    setSettings({ ...settings, telegram_link: e.target.value })
                  }
                  placeholder="https://t.me/username"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  الحساب الذي سيتم إرسال الإيصالات إليه
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checkout">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                إعدادات واجهة الدفع
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                <div>
                  <Label>وضع التواصل فقط</Label>
                  <p className="text-sm text-muted-foreground">
                    عند التفعيل، يتم إخفاء الحسابات البنكية ويظهر فقط أزرار التواصل
                  </p>
                </div>
                <Switch
                  checked={settings.contact_only_mode}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, contact_only_mode: checked })
                  }
                />
              </div>

              <div>
                <Label>عنوان صفحة الدفع</Label>
                <Input
                  value={settings.checkout_title}
                  onChange={(e) =>
                    setSettings({ ...settings, checkout_title: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>النص التوضيحي لإرسال الإيصال</Label>
                <Input
                  value={settings.checkout_subtitle}
                  onChange={(e) =>
                    setSettings({ ...settings, checkout_subtitle: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-green-500" />
                    نص زر الواتساب
                  </Label>
                  <Input
                    value={settings.whatsapp_button_text}
                    onChange={(e) =>
                      setSettings({ ...settings, whatsapp_button_text: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <Send className="w-4 h-4 text-blue-500" />
                    نص زر تلقرام
                  </Label>
                  <Input
                    value={settings.telegram_button_text}
                    onChange={(e) =>
                      setSettings({ ...settings, telegram_button_text: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="site">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                إعدادات الموقع
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>اسم الموقع</Label>
                <Input
                  value={settings.site_name}
                  onChange={(e) =>
                    setSettings({ ...settings, site_name: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>وصف الموقع</Label>
                <Textarea
                  value={settings.site_description}
                  onChange={(e) =>
                    setSettings({ ...settings, site_description: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Button onClick={handleSave} disabled={isSaving} className="w-full" variant="gold">
        <Save className="w-4 h-4 ml-2" />
        {isSaving ? "جاري الحفظ..." : "حفظ جميع الإعدادات"}
      </Button>
    </div>
  );
};

export default AdminSettings;