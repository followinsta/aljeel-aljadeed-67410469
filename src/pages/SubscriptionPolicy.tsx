import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  UserCheck, 
  Clock, 
  RefreshCw, 
  Banknote, 
  Shield 
} from "lucide-react";

const SubscriptionPolicy = () => {
  const policies = [
    {
      icon: UserCheck,
      title: "شروط الأهلية للاشتراك",
      items: [
        "تقديم بيانات صحيحة ودقيقة عند التسجيل.",
        "الالتزام بشروط المؤسسة وسياسات الاستثمار."
      ]
    },
    {
      icon: FileText,
      title: "خطوات فتح الحساب الاستثماري",
      items: [
        "ارسال البيانات المطلوبة لتسجيل الاشتراك.",
        "رفع الهوية أو المستندات المطلوبة (عند الحاجة).",
        "الموافقة على اتفاقية الاستخدام وسياسة الخصوصية.",
        "تفعيل الحساب بعد المراجعة."
      ]
    },
    {
      icon: Clock,
      title: "مدة تفعيل الحساب",
      items: [
        "تتم مراجعة الطلب خلال 12-24 ساعة عمل.",
        "قد يتم طلب معلومات إضافية إذا لزم الأمر."
      ]
    },
    {
      icon: RefreshCw,
      title: "تحديث البيانات",
      items: [
        "يلتزم المستثمر بتحديث بياناته في حال تغيّرها.",
        "للمؤسسة الحق في طلب التحقق من الهوية لضمان الأمان."
      ]
    },
    {
      icon: Banknote,
      title: "سياسة الرسوم",
      items: [
        "قد يترتب على بعض الخدمات رسوم موضحة في سياسة الرسوم.",
        "يتم إبلاغ المستخدم بأي رسوم قبل البدء في الخدمة.",
        "لا يتم خصم أي مبلغ بدون موافقة المستخدم."
      ]
    },
    {
      icon: Shield,
      title: "إيقاف أو تعليق الحساب",
      items: [
        "للمؤسسة الحق في تعليق الحساب عند وجود نشاط غير قانوني أو مخالف للشروط."
      ]
    }
  ];

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

          <div className="space-y-6">
            {policies.map((policy, index) => (
              <Card key={index} className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <policy.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span>{index + 1}. {policy.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 pr-6">
                    {policy.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-2 text-muted-foreground">
                        <span className="text-primary mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default SubscriptionPolicy;
