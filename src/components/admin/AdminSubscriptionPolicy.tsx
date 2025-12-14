import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, FileText } from "lucide-react";
import { toast } from "sonner";

const AdminSubscriptionPolicy = () => {
  const [policyContent, setPolicyContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPolicy();
  }, []);

  const fetchPolicy = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "subscription_policy")
      .maybeSingle();

    if (data?.value) {
      setPolicyContent(data.value);
    } else {
      // Default policy content
      setPolicyContent(`سياسة الاشتراك في مؤسسة الاستثمار

1. شروط الأهلية للاشتراك
• تقديم بيانات صحيحة ودقيقة عند التسجيل.
• الالتزام بشروط المؤسسة وسياسات الاستثمار.

2. خطوات فتح الحساب الاستثماري
• ارسال البيانات المطلوبة لتسجيل الاشتراك.
• رفع الهوية أو المستندات المطلوبة (عند الحاجة).
• الموافقة على اتفاقية الاستخدام وسياسة الخصوصية.
• تفعيل الحساب بعد المراجعة.

3. مدة تفعيل الحساب
• تتم مراجعة الطلب خلال 12-24 ساعة عمل.
• قد يتم طلب معلومات إضافية إذا لزم الأمر.

4. تحديث البيانات
• يلتزم المستثمر بتحديث بياناته في حال تغيّرها.
• للمؤسسة الحق في طلب التحقق من الهوية لضمان الأمان.

5. سياسة الرسوم
• قد يترتب على بعض الخدمات رسوم موضحة في سياسة الرسوم.
• يتم إبلاغ المستخدم بأي رسوم قبل البدء في الخدمة.
• لا يتم خصم أي مبلغ بدون موافقة المستخدم.

6. إيقاف أو تعليق الحساب
• للمؤسسة الحق في تعليق الحساب عند وجود نشاط غير قانوني أو مخالف للشروط.`);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);

    const { data: existing } = await supabase
      .from("site_settings")
      .select("id")
      .eq("key", "subscription_policy")
      .maybeSingle();

    if (existing) {
      await supabase
        .from("site_settings")
        .update({ value: policyContent })
        .eq("key", "subscription_policy");
    } else {
      await supabase.from("site_settings").insert([{ key: "subscription_policy", value: policyContent }]);
    }

    toast.success("تم حفظ سياسة الاشتراك بنجاح");
    setIsSaving(false);
  };

  if (isLoading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            تعديل سياسة الاشتراك
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={policyContent}
            onChange={(e) => setPolicyContent(e.target.value)}
            placeholder="أدخل سياسة الاشتراك هنا..."
            rows={20}
            className="font-mono text-sm"
            dir="rtl"
          />
          
          <Button onClick={handleSave} disabled={isSaving} className="w-full">
            <Save className="w-4 h-4 ml-2" />
            {isSaving ? "جاري الحفظ..." : "حفظ سياسة الاشتراك"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSubscriptionPolicy;
