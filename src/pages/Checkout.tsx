import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  ArrowLeft,
  TrendingUp,
  Calendar,
  Banknote,
  Building2,
  CreditCard,
  MessageCircle,
  Send,
  Copy,
  Upload,
  CheckCircle2,
  Bitcoin,
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
  currency: string;
}

interface PaymentMethod {
  id: string;
  method_type: string;
  display_name: string | null;
  note: string | null;
  bank_name: string | null;
  account_number: string | null;
  account_holder_name: string | null;
  iban: string | null;
  whatsapp_number: string | null;
  telegram_link: string | null;
  custom_field_1_label: string | null;
  custom_field_1_value: string | null;
  custom_field_2_label: string | null;
  custom_field_2_value: string | null;
  custom_field_3_label: string | null;
  custom_field_3_value: string | null;
  custom_field_4_label: string | null;
  custom_field_4_value: string | null;
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
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [submittingReceipt, setSubmittingReceipt] = useState(false);
  const [receiptUploaded, setReceiptUploaded] = useState(false);
  const [pendingReceiptUrl, setPendingReceiptUrl] = useState<string | null>(null);
  const [pendingReceiptPath, setPendingReceiptPath] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [packageId, user]);

  const fetchData = async () => {
    const { data: packageData } = await supabase
      .from("packages").select("*").eq("id", packageId).single();
    if (packageData) setPkg(packageData as Package);

    const { data: paymentData } = await supabase
      .from("payment_methods").select("*").eq("is_active", true);
    if (paymentData) setPaymentMethods(paymentData);

    const { data: settingsData } = await supabase.from("site_settings").select("*");
    if (settingsData) {
      const map: Record<string, string> = {};
      settingsData.forEach((s: SiteSetting) => { if (s.value) map[s.key] = s.value; });
      setSettings(map);
    }

    if (user) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("customer_id, full_name, email, phone")
        .eq("user_id", user.id).single();
      if (profileData) setUserProfile(profileData);
    }

    setLoading(false);
  };

  const formatNumber = (num: number) => num.toLocaleString("ar-SA");
  const currencyLabel = pkg?.currency === "USD" ? "دولار" : "ريال";

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`تم نسخ ${label}`);
  };

  const handleWhatsAppReceipt = () => {
    const whatsappNumber = settings.whatsapp_number || "966545189624";
    const cleanNumber = whatsappNumber.replace(/[^\d]/g, '');
    const customerIdText = userProfile?.customer_id ? ` - رقم العميل: ${userProfile.customer_id}` : '';
    const message = pkg
      ? `مرحباً، أريد إرسال إيصال التحويل للباقة رقم ${pkg.package_number} - مبلغ ${formatNumber(pkg.investment_amount)} ${currencyLabel}${customerIdText}`
      : "مرحباً، أريد إرسال إيصال التحويل";
    window.open(`https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleTelegramReceipt = () => {
    window.open("https://t.me/aljeil", "_blank");
  };

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pkg) return;

    if (!user) {
      toast.error("يجب تسجيل الدخول لرفع الإيصال");
      navigate("/auth");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم الصورة يجب أن لا يتجاوز 5 ميجابايت");
      return;
    }

    setUploadingReceipt(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("payment-receipts")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("payment-receipts").getPublicUrl(fileName);

      setPendingReceiptUrl(urlData.publicUrl);
      setPendingReceiptPath(fileName);
      toast.success("تم رفع الصورة. اضغط 'إرسال الإيصال' لإكمال العملية");
    } catch (err: any) {
      toast.error(err.message || "خطأ في رفع الصورة");
    } finally {
      setUploadingReceipt(false);
    }
  };

  const handleSubmitReceipt = async () => {
    if (!pendingReceiptUrl || !pkg || !user) return;
    setSubmittingReceipt(true);
    try {
      const { error: insertError } = await supabase.from("payment_receipts").insert({
        user_id: user.id,
        customer_id: userProfile?.customer_id || null,
        full_name: userProfile?.full_name || "غير محدد",
        email: userProfile?.email || user.email || null,
        phone: userProfile?.phone || null,
        package_id: pkg.id,
        package_name: pkg.name || `باقة ${pkg.package_number}`,
        package_amount: pkg.investment_amount,
        currency: pkg.currency || "SAR",
        payment_method: pkg.currency === "USD" ? "binance_usdt" : "bank_transfer",
        receipt_image_url: pendingReceiptUrl,
        status: "pending",
      });

      if (insertError) throw insertError;

      setReceiptUploaded(true);
      setPendingReceiptUrl(null);
      setPendingReceiptPath(null);
      toast.success("تم إرسال الإيصال بنجاح! سيتم مراجعته من قبل الإدارة");
    } catch (err: any) {
      toast.error(err.message || "خطأ في إرسال الإيصال");
    } finally {
      setSubmittingReceipt(false);
    }
  };

  const handleCancelPendingReceipt = async () => {
    if (pendingReceiptPath) {
      await supabase.storage.from("payment-receipts").remove([pendingReceiptPath]);
    }
    setPendingReceiptUrl(null);
    setPendingReceiptPath(null);
    toast.info("تم إلغاء الصورة");
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
  const binanceMethods = paymentMethods.filter(m => m.method_type === "binance_usdt");
  const customMethods = paymentMethods.filter(m => m.method_type === "custom");
  const isUSD = pkg.currency === "USD";

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <section className="py-24 pt-32">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => navigate("/packages")}
            className="mb-8 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            العودة للباقات
          </Button>

          <h1 className="text-3xl font-bold mb-8 text-center">
            إتمام <span className="text-gradient-gold">الاشتراك</span>
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

                  {pkg.name && <h3 className="text-xl font-bold mb-4">{pkg.name}</h3>}

                  <div className="text-center mb-4">
                    <p className="text-muted-foreground text-sm">مبلغ الاستثمار</p>
                    <p className="text-3xl font-bold text-gradient-gold">
                      {formatNumber(pkg.investment_amount)} {currencyLabel}
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
                    <span className="font-bold text-accent">{formatNumber(pkg.daily_profit)} {currencyLabel}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">مجموع الربح</span>
                    </div>
                    <span className="font-bold text-primary">{formatNumber(totalProfit)} {currencyLabel}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gradient-gold/20 rounded-lg border border-primary/30">
                    <span className="text-foreground font-medium">إجمالي المبلغ المسترد</span>
                    <span className="font-bold text-gradient-gold text-lg">{formatNumber(totalReturn)} {currencyLabel}</span>
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
                {/* Binance USDT — available for all packages */}
                {binanceMethods.length > 0 && settings.contact_only_mode !== "true" && (
                  <div className="space-y-4">
                    {binanceMethods.map((method) => (
                      <div key={method.id} className="bg-secondary/50 rounded-xl p-4 border border-yellow-500/30">
                        <div className="flex items-center gap-2 mb-3">
                          <Bitcoin className="w-5 h-5 text-yellow-500" />
                          <span className="font-bold">{method.display_name || "التحويل عبر باينانس USDT"}</span>
                        </div>
                        <div className="mb-3">
                          <p className="text-muted-foreground text-xs mb-1">الشبكة</p>
                          <p className="font-medium text-yellow-500">{method.bank_name || "TRC-20 (TRX)"}</p>
                          {method.note && (
                            <p className="text-xs text-muted-foreground mt-1 italic">{method.note}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs mb-1">عنوان المحفظة</p>
                          <div className="flex items-center gap-2 bg-background/50 rounded p-2">
                            <p className="font-mono text-xs break-all flex-1">{method.account_number}</p>
                            <Button
                              size="sm"
                              variant="ghost"
                              type="button"
                              onClick={() => handleCopy(method.account_number || "", "العنوان")}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Custom Payment Methods */}
                {customMethods.length > 0 && settings.contact_only_mode !== "true" && (
                  <div className="space-y-4">
                    {customMethods.map((method) => (
                      <div key={method.id} className="bg-secondary/50 rounded-xl p-4 border border-primary/30">
                        <div className="flex items-center gap-2 mb-3">
                          <CreditCard className="w-5 h-5 text-primary" />
                          <span className="font-bold">{method.display_name || "طريقة دفع"}</span>
                        </div>
                        {method.note && (
                          <p className="text-xs text-muted-foreground mb-3 italic">{method.note}</p>
                        )}
                        <div className="space-y-2">
                          {[1, 2, 3, 4].map((n) => {
                            const label = (method as any)[`custom_field_${n}_label`];
                            const value = (method as any)[`custom_field_${n}_value`];
                            if (!label && !value) return null;
                            return (
                              <div key={n}>
                                <p className="text-muted-foreground text-xs mb-1">{label}</p>
                                <div className="flex items-center gap-2 bg-background/50 rounded p-2">
                                  <p className="font-mono text-xs break-all flex-1">{value}</p>
                                  {value && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      type="button"
                                      onClick={() => handleCopy(value, label || "القيمة")}
                                    >
                                      <Copy className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* SAR: Bank methods */}
                {!isUSD && settings.contact_only_mode !== "true" && bankMethods.length > 0 && (
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

                {/* Upload Receipt Section */}
                <div className="pt-4 border-t border-border space-y-3">
                  <Label className="block text-center font-bold">
                    📤 رفع صورة إيصال التحويل
                  </Label>
                  {receiptUploaded ? (
                    <div className="flex items-center justify-center gap-2 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-500">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-medium">تم رفع الإيصال بنجاح</span>
                    </div>
                  ) : user ? (
                    <div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleReceiptUpload}
                        disabled={uploadingReceipt}
                        className="cursor-pointer"
                      />
                      {uploadingReceipt && (
                        <p className="text-sm text-muted-foreground mt-2 text-center">
                          جاري الرفع...
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        ارفع صورة إيصال التحويل وستصل إلى لوحة تحكم الإدارة
                      </p>
                    </div>
                  ) : (
                    <div className="text-center p-3 bg-secondary/30 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">
                        يجب تسجيل الدخول لرفع الإيصال
                      </p>
                      <Button size="sm" onClick={() => navigate("/auth")}>
                        تسجيل الدخول
                      </Button>
                    </div>
                  )}
                </div>

                {/* Send Receipt Buttons */}
                <div className="pt-4 border-t border-border space-y-3">
                  <p className="text-center text-muted-foreground text-sm mb-4">
                    أو أرسل الإيصال مباشرة عبر:
                  </p>

                  <Button
                    variant="default"
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={handleWhatsAppReceipt}
                  >
                    <MessageCircle className="w-5 h-5 ml-2" />
                    إرسال الإيصال عبر واتساب
                  </Button>

                  <Button
                    variant="default"
                    className="w-full bg-blue-500 hover:bg-blue-600"
                    onClick={handleTelegramReceipt}
                  >
                    <Send className="w-5 h-5 ml-2" />
                    إكمال الاشتراك عبر تلقرام
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
