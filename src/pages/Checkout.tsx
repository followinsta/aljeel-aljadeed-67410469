import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  TrendingUp, 
  Calendar, 
  Banknote, 
  Building2, 
  CreditCard,
  MessageCircle,
  Send
} from "lucide-react";

interface Package {
  id: string;
  package_number: number;
  investment_amount: number;
  daily_profit: number;
  investment_period_days: number;
  is_business: boolean;
  name: string | null;
  description: string | null;
}

interface PaymentMethod {
  id: string;
  method_type: string;
  bank_name: string | null;
  account_number: string | null;
  account_holder_name: string | null;
  iban: string | null;
  whatsapp_number: string | null;
  telegram_link: string | null;
}

interface SiteSetting {
  key: string;
  value: string | null;
}

interface UserProfile {
  customer_id: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
}

const Checkout = () => {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pkg, setPkg] = useState<Package | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetchData();
  }, [packageId, user]);

  const fetchData = async () => {
    // Fetch package
    const { data: packageData } = await supabase
      .from("packages")
      .select("*")
      .eq("id", packageId)
      .single();

    if (packageData) {
      setPkg(packageData);
    }

    // Fetch payment methods
    const { data: paymentData } = await supabase
      .from("payment_methods")
      .select("*")
      .eq("is_active", true);

    if (paymentData) {
      setPaymentMethods(paymentData);
    }

    // Fetch settings
    const { data: settingsData } = await supabase
      .from("site_settings")
      .select("*");

    if (settingsData) {
      const settingsMap: Record<string, string> = {};
      settingsData.forEach((s: SiteSetting) => {
        if (s.value) settingsMap[s.key] = s.value;
      });
      setSettings(settingsMap);
    }

    // Fetch user profile if logged in
    if (user) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("customer_id, full_name, email, phone")
        .eq("user_id", user.id)
        .single();

      if (profileData) {
        setUserProfile(profileData);
      }
    }

    setLoading(false);
  };

  const createSubscriptionRequest = async () => {
    if (!user || !pkg) return;

    const { error } = await supabase
      .from("subscription_requests")
      .insert({
        user_id: user.id,
        customer_id: userProfile?.customer_id,
        full_name: userProfile?.full_name || user.email || "مجهول",
        email: userProfile?.email || user.email,
        phone: userProfile?.phone,
        package_id: pkg.id,
        package_name: pkg.name || `باقة رقم ${pkg.package_number}`,
        package_amount: pkg.investment_amount,
        status: "pending"
      });

    if (!error) {
      toast.success("تم إرسال طلب الاشتراك بنجاح");
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString("ar-SA");
  };

  const handleWhatsAppReceipt = async () => {
    await createSubscriptionRequest();
    const whatsappNumber = settings.whatsapp_number || "966545189624";
    // Remove any non-digit characters
    const cleanNumber = whatsappNumber.replace(/[^\d]/g, '');
    const customerIdText = userProfile?.customer_id ? ` - رقم العميل: ${userProfile.customer_id}` : '';
    const message = pkg 
      ? `مرحباً، أريد إرسال إيصال التحويل للباقة رقم ${pkg.package_number} - مبلغ ${formatNumber(pkg.investment_amount)} ريال${customerIdText}`
      : "مرحباً، أريد إرسال إيصال التحويل";
    window.open(`https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleTelegramReceipt = async () => {
    await createSubscriptionRequest();
    // Direct to T.me/aljeil
    window.open("https://t.me/aljeil", "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">جاري التحميل...</div>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground mb-4">الباقة غير موجودة</p>
          <Button onClick={() => navigate("/packages")}>العودة للباقات</Button>
        </div>
      </div>
    );
  }

  const totalProfit = pkg.daily_profit * (pkg.investment_period_days || 120);
  const totalReturn = pkg.investment_amount + totalProfit;

  const bankMethods = paymentMethods.filter(m => m.method_type === "bank_transfer" || m.method_type === "bank");

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <section className="py-24 pt-32">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back button */}
          <Button
            variant="ghost"
            onClick={() => navigate("/packages")}
            className="mb-8 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            العودة للباقات
          </Button>

          <h1 className="text-3xl font-bold mb-8 text-center">
            {settings.checkout_title ? (
              <>{settings.checkout_title.split(' ')[0]} <span className="text-gradient-gold">{settings.checkout_title.split(' ').slice(1).join(' ')}</span></>
            ) : (
              <>إتمام <span className="text-gradient-gold">الاشتراك</span></>
            )}
          </h1>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Package Details */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-primary" />
                  تفاصيل الباقة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-secondary/50 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-muted-foreground">
                      {pkg.is_business ? "باقة رجال الأعمال" : "باقة الاستثمار"}
                    </span>
                    <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm">
                      #{pkg.package_number}
                    </span>
                  </div>

                  {pkg.name && (
                    <h3 className="text-xl font-bold mb-4">{pkg.name}</h3>
                  )}

                  <div className="text-center mb-4">
                    <p className="text-muted-foreground text-sm">مبلغ الاستثمار</p>
                    <p className="text-3xl font-bold text-gradient-gold">
                      {formatNumber(pkg.investment_amount)} ريال
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">مدة الاشتراك</span>
                    </div>
                    <span className="font-bold">{pkg.investment_period_days || 120} يوم</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-accent" />
                      <span className="text-muted-foreground">الربح اليومي</span>
                    </div>
                    <span className="font-bold text-accent">{formatNumber(pkg.daily_profit)} ريال</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">مجموع الربح</span>
                    </div>
                    <span className="font-bold text-primary">{formatNumber(totalProfit)} ريال</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gradient-gold/20 rounded-lg border border-primary/30">
                    <span className="text-foreground font-medium">إجمالي المبلغ المسترد</span>
                    <span className="font-bold text-gradient-gold text-lg">{formatNumber(totalReturn)} ريال</span>
                  </div>
                </div>

                {pkg.description && (
                  <p className="text-muted-foreground text-sm mt-4">{pkg.description}</p>
                )}
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  طرق الدفع
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Only show bank section if contact_only_mode is false and there are bank methods */}
                {settings.contact_only_mode !== "true" && bankMethods.length > 0 && (
                  <div className="space-y-4">
                    {bankMethods.map((method) => (
                      <div key={method.id} className="bg-secondary/50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Building2 className="w-5 h-5 text-primary" />
                          <span className="font-bold">{method.bank_name}</span>
                        </div>
                        
                        {method.account_holder_name && (
                          <div className="mb-2">
                            <p className="text-muted-foreground text-xs">اسم صاحب الحساب</p>
                            <p className="font-medium">{method.account_holder_name}</p>
                          </div>
                        )}

                        {method.account_number && (
                          <div className="mb-2">
                            <p className="text-muted-foreground text-xs">رقم الحساب</p>
                            <p className="font-mono font-medium">{method.account_number}</p>
                          </div>
                        )}

                        {method.iban && (
                          <div>
                            <p className="text-muted-foreground text-xs">الآيبان</p>
                            <p className="font-mono font-medium text-sm">{method.iban}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Send Receipt Buttons */}
                <div className="pt-4 border-t border-border space-y-3">
                  <p className="text-center text-muted-foreground text-sm mb-4">
                    {settings.checkout_subtitle || "بعد التحويل، أرسل إيصال التحويل عبر:"}
                  </p>

                  <Button 
                    variant="default" 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={handleWhatsAppReceipt}
                  >
                    <MessageCircle className="w-5 h-5 ml-2" />
                    {settings.whatsapp_button_text || "إرسال الإيصال عبر واتساب"}
                  </Button>

                  <Button 
                    variant="default" 
                    className="w-full bg-blue-500 hover:bg-blue-600"
                    onClick={handleTelegramReceipt}
                  >
                    <Send className="w-5 h-5 ml-2" />
                    {settings.telegram_button_text || "إرسال الإيصال عبر تلقرام"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Checkout;
