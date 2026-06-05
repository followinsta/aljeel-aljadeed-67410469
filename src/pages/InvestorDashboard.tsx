import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  TrendingUp, 
  Calendar, 
  Banknote, 
  User,
  Clock,
  CheckCircle2,
  XCircle,
  History,
  Wallet
} from "lucide-react";

interface Investor {
  id: string;
  full_name: string;
  phone: string | null;
  bank_account_number: string | null;
  iban: string | null;
  bank_name: string | null;
  subscription_amount: number;
  daily_profit: number;
  subscription_duration_months: number;
  subscription_duration_days: number;
  subscription_start_date: string;
  total_accumulated_profit: number;
  is_active: boolean;
  email: string | null;
  withdraw_button_enabled?: boolean;
  withdraw_button_text?: string | null;
  withdraw_action_button_enabled?: boolean;
  withdraw_action_button_text?: string | null;
  withdraw_action_button_url?: string | null;
  notification_bar_enabled?: boolean;
  notification_bar_text?: string | null;
  auto_enable_withdraw_after_24h?: boolean;
}

interface InvestorFee {
  id: string;
  fee_type: string;
  is_paid: boolean;
  amount: number | null;
}

interface ProfitHistory {
  id: string;
  profit_amount: number;
  profit_date: string;
  cumulative_profit: number;
}

const InvestorDashboard = () => {
  const navigate = useNavigate();
  const [investor, setInvestor] = useState<Investor | null>(null);
  const [fees, setFees] = useState<InvestorFee[]>([]);
  const [profitHistory, setProfitHistory] = useState<ProfitHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);

  useEffect(() => {
    fetchInvestorData();
  }, []);

  const fetchInvestorData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    // Fetch investor data
    const { data: investorData } = await supabase
      .from("investors")
      .select("*")
      .eq("email", user.email)
      .maybeSingle();

    if (investorData) {
      setInvestor(investorData);

      // Fetch fees
      const { data: feesData } = await supabase
        .from("investor_fees")
        .select("*")
        .eq("investor_id", investorData.id);

      if (feesData) {
        setFees(feesData);
      }

      // Fetch profit history
      const { data: historyData } = await supabase
        .from("investor_profit_history")
        .select("*")
        .eq("investor_id", investorData.id)
        .order("profit_date", { ascending: false })
        .limit(30);

      if (historyData) {
        setProfitHistory(historyData);
      }
    }

    setLoading(false);
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString("ar-SA");
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ar-SA");
  };

  const calculateDaysRemaining = () => {
    if (!investor) return 0;
    const startDate = new Date(investor.subscription_start_date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + investor.subscription_duration_days);
    const today = new Date();
    const remaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, remaining);
  };

  const calculateDaysPassed = () => {
    if (!investor) return 0;
    const startDate = new Date(investor.subscription_start_date);
    const today = new Date();
    const passed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, passed);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">جاري التحميل...</div>
      </div>
    );
  }

  if (!investor) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <section className="py-24 pt-32">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold mb-4">لا يوجد حساب استثماري</h1>
            <p className="text-muted-foreground mb-6">لم يتم العثور على حساب استثماري مرتبط ببريدك الإلكتروني</p>
            <Button onClick={() => navigate("/packages")}>استعرض الباقات</Button>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  const daysPassed = calculateDaysPassed();
  const daysRemaining = calculateDaysRemaining();
  const totalExpectedProfit = investor.daily_profit * investor.subscription_duration_days;
  
  // الأرباح المتراكمة = الأرباح السابقة (المحددة يدوياً) + الأرباح اليومية * الأيام المنقضية
  const calculatedProfit = investor.daily_profit * daysPassed;
  const currentProfit = investor.total_accumulated_profit + calculatedProfit;

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      {investor.notification_bar_enabled && investor.notification_bar_text && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-primary/90 text-primary-foreground py-2 overflow-hidden border-y border-primary">
          <div className="animate-marquee font-bold">
            {investor.notification_bar_text}
          </div>
        </div>
      )}

      <section className="py-24 pt-32">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Welcome Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              مرحباً <span className="text-gradient-gold">{investor.full_name}</span>
            </h1>
            <p className="text-muted-foreground">لوحة متابعة استثمارك</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Banknote className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-muted-foreground text-sm">مبلغ الاستثمار</span>
                </div>
                <p className="text-2xl font-bold text-gradient-gold">
                  {formatNumber(investor.subscription_amount)} ريال
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-accent" />
                  </div>
                  <span className="text-muted-foreground text-sm">الأرباح المتراكمة</span>
                </div>
                <p className="text-2xl font-bold text-accent">
                  {formatNumber(currentProfit)} ريال
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-green-500" />
                  </div>
                  <span className="text-muted-foreground text-sm">الأيام المتبقية</span>
                </div>
                <p className="text-2xl font-bold text-green-500">
                  {daysRemaining} يوم
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-500" />
                  </div>
                  <span className="text-muted-foreground text-sm">الربح اليومي</span>
                </div>
                <p className="text-2xl font-bold text-blue-500">
                  {formatNumber(investor.daily_profit)} ريال
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Investment Details */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  تفاصيل الاشتراك
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
                  <span className="text-muted-foreground">تاريخ البداية</span>
                  <span className="font-medium">{formatDate(investor.subscription_start_date)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
                  <span className="text-muted-foreground">مدة الاشتراك</span>
                  <span className="font-medium">{investor.subscription_duration_days} يوم</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
                  <span className="text-muted-foreground">الأيام المنقضية</span>
                  <span className="font-medium">{daysPassed} يوم</span>
                </div>
                {investor.total_accumulated_profit > 0 && (
                  <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
                    <span className="text-muted-foreground">الأرباح السابقة</span>
                    <span className="font-medium text-accent">{formatNumber(investor.total_accumulated_profit)} ريال</span>
                  </div>
                )}
                <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
                  <span className="text-muted-foreground">أرباح الفترة الحالية</span>
                  <span className="font-medium text-accent">{formatNumber(calculatedProfit)} ريال</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gradient-gold/10 rounded-lg border border-primary/30">
                  <span className="text-foreground font-medium">إجمالي الربح المتوقع</span>
                  <span className="font-bold text-primary">{formatNumber(totalExpectedProfit + investor.total_accumulated_profit)} ريال</span>
                </div>
              </CardContent>
            </Card>

            {/* Fees Status */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-primary" />
                  حالة الرسوم
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {fees.length > 0 ? (
                  fees.map((fee) => (
                    <div key={fee.id} className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
                      <span className="text-foreground">{fee.fee_type}</span>
                      {fee.is_paid ? (
                        <div className="flex items-center gap-2 text-green-500">
                          <CheckCircle2 className="w-5 h-5" />
                          <span>مدفوع</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-500">
                          <XCircle className="w-5 h-5" />
                          <span>غير مدفوع</span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">لا توجد رسوم مسجلة</p>
                )}
              </CardContent>
            </Card>
          </div>

          {(() => {
            const hoursSinceStart = (Date.now() - new Date(investor.subscription_start_date).getTime()) / (1000 * 60 * 60);
            const autoEnabled = investor.auto_enable_withdraw_after_24h && hoursSinceStart >= 24;
            const showButton = investor.withdraw_button_enabled || autoEnabled;
            if (!showButton) return null;
            const buttonLabel = autoEnabled && !investor.withdraw_button_enabled
              ? "اجراء غير مكتمل - رسوم غير مدفوعه"
              : "سحب الأرباح";
            return (
              <div className="mb-8 flex justify-center">
                <Button
                  variant="gold"
                  size="lg"
                  className="gap-2"
                  onClick={() => setShowWithdrawDialog(true)}
                >
                  <Wallet className="w-5 h-5" />
                  {buttonLabel}
                </Button>
              </div>
            );
          })()}

          <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
            <DialogContent dir="rtl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-primary" />
                  سحب الأرباح
                </DialogTitle>
              </DialogHeader>
              <div className="py-4 text-foreground whitespace-pre-wrap leading-relaxed">
                {investor.withdraw_button_text || "لا توجد تعليمات حالياً، يرجى التواصل مع الإدارة."}
              </div>
              {investor.withdraw_action_button_enabled && investor.withdraw_action_button_url && (
                <Button
                  variant="gold"
                  className="w-full"
                  onClick={() => window.open(investor.withdraw_action_button_url!, "_blank", "noopener,noreferrer")}
                >
                  {investor.withdraw_action_button_text || "انتقال"}
                </Button>
              )}
            </DialogContent>
          </Dialog>

          {/* Profit History */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                سجل الأرباح اليومية
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profitHistory.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {profitHistory.map((record) => (
                    <div key={record.id} className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
                      <span className="text-muted-foreground">{formatDate(record.profit_date)}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-accent font-medium">+{formatNumber(record.profit_amount)} ريال</span>
                        <span className="text-muted-foreground text-sm">
                          الإجمالي: {formatNumber(record.cumulative_profit)} ريال
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">لا توجد أرباح مسجلة بعد</p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default InvestorDashboard;
