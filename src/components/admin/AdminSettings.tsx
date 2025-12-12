import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Save } from "lucide-react";
import { toast } from "sonner";

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    whatsapp_number: "966545189624",
    telegram_link: "https://t.me/+2uEtg05UmVc0Yjk0",
    contact_only_mode: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
        telegram_link: settingsMap.telegram_link || "https://t.me/+2uEtg05UmVc0Yjk0",
        contact_only_mode: settingsMap.contact_only_mode === "true",
      });
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);

    const settingsToSave = [
      { key: "whatsapp_number", value: settings.whatsapp_number },
      { key: "telegram_link", value: settings.telegram_link },
      { key: "contact_only_mode", value: settings.contact_only_mode.toString() },
    ];

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
      <h2 className="text-xl font-bold">إعدادات الموقع</h2>

      <Card>
        <CardHeader>
          <CardTitle>إعدادات التواصل</CardTitle>
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
            <Label>رابط قناة التلقرام</Label>
            <Input
              value={settings.telegram_link}
              onChange={(e) =>
                setSettings({ ...settings, telegram_link: e.target.value })
              }
              placeholder="https://t.me/username"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>إعدادات الدفع</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>وضع التواصل فقط</Label>
              <p className="text-sm text-muted-foreground">
                عند التفعيل، سيتم توجيه المستخدمين للتواصل بدلاً من الدفع المباشر
              </p>
            </div>
            <Switch
              checked={settings.contact_only_mode}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, contact_only_mode: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={isSaving} className="w-full">
        <Save className="w-4 h-4 ml-2" />
        {isSaving ? "جاري الحفظ..." : "حفظ الإعدادات"}
      </Button>
    </div>
  );
};

export default AdminSettings;
