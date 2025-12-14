import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FileText } from "lucide-react";

const SubscriptionPolicy = () => {
  const [policyContent, setPolicyContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);

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

  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.match(/^\d+\./)) {
        // Section title
        return (
          <h3 key={index} className="text-xl font-bold text-foreground mt-8 mb-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <span className="text-primary font-bold">{line.match(/^\d+/)?.[0]}</span>
            </div>
            {line.replace(/^\d+\.\s*/, '')}
          </h3>
        );
      } else if (line.startsWith('•') || line.startsWith('-')) {
        // Bullet point
        return (
          <p key={index} className="flex items-start gap-2 text-muted-foreground mb-2 pr-6">
            <span className="text-primary mt-1">•</span>
            <span>{line.replace(/^[•-]\s*/, '')}</span>
          </p>
        );
      } else if (line.trim()) {
        // Regular paragraph or title
        if (index === 0) {
          return null; // Skip main title, we show it separately
        }
        return (
          <p key={index} className="text-muted-foreground mb-2">{line}</p>
        );
      }
      return null;
    });
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <section className="py-24 pt-32 flex items-center justify-center">
          <div className="text-foreground">جاري التحميل...</div>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <section className="py-24 pt-32">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-secondary px-4 py-2 rounded-full mb-6">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">الشروط والأحكام</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              سياسة <span className="text-gradient-gold">الاشتراك</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              سياسة الاشتراك في مؤسسة الاستثمار
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-8">
            {formatContent(policyContent)}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default SubscriptionPolicy;
