import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { TrendingUp, Crown, Sparkles, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface Package {
  id: string;
  package_number: number;
  investment_amount: number;
  daily_profit: number;
  investment_period_days: number;
  is_business: boolean;
  is_featured: boolean;
  name: string | null;
  description: string | null;
  image_url: string | null;
}

const Packages = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    const { data, error } = await supabase
      .from("packages")
      .select("*")
      .eq("is_active", true)
      .order("package_number", { ascending: true });

    if (!error && data) {
      setPackages(data);
    }
    setLoading(false);
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString("ar-SA");
  };

  const regularPackages = packages.filter((p) => !p.is_business);
  const businessPackages = packages.filter((p) => p.is_business);

  const handleSubscribe = (pkg: Package) => {
    navigate(`/checkout/${pkg.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <section className="py-24 pt-32">
        <div className="container mx-auto px-4">
          {/* Back button */}
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-8 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            العودة للرئيسية
          </Button>

          {/* Section header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-secondary px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">جميع باقات الاستثمار</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              اختر <span className="text-gradient-gold">باقتك</span> المناسبة
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              باقات متنوعة تناسب جميع المستثمرين. ابدأ برأس مال صغير واحصل على أرباح يومية مضمونة
            </p>
          </div>

          {/* Regular Packages */}
          {regularPackages.length > 0 && (
            <>
              <h2 className="text-2xl font-bold mb-8 text-center">باقات الاستثمار</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16">
                {regularPackages.map((pkg) => (
                  <PackageCardDisplay
                    key={pkg.id}
                    pkg={pkg}
                    onSubscribe={() => handleSubscribe(pkg)}
                    formatNumber={formatNumber}
                  />
                ))}
              </div>
            </>
          )}

          {/* Business Packages */}
          {businessPackages.length > 0 && (
            <>
              <h2 className="text-2xl font-bold mb-8 text-center text-gradient-gold">باقات رجال الأعمال</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {businessPackages.map((pkg) => (
                  <PackageCardDisplay
                    key={pkg.id}
                    pkg={pkg}
                    onSubscribe={() => handleSubscribe(pkg)}
                    formatNumber={formatNumber}
                  />
                ))}
              </div>
            </>
          )}

          {packages.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">لا توجد باقات متاحة حالياً</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
};

interface PackageCardDisplayProps {
  pkg: Package;
  onSubscribe: () => void;
  formatNumber: (num: number) => string;
}

const PackageCardDisplay = ({ pkg, onSubscribe, formatNumber }: PackageCardDisplayProps) => {
  const monthlyProfit = pkg.daily_profit * 30;
  const totalProfit = pkg.daily_profit * (pkg.investment_period_days || 120);

  return (
    <div
      className={cn(
        "relative group rounded-2xl p-6 transition-all duration-500 hover:scale-105",
        "bg-gradient-card border border-border/50",
        "hover:border-primary/50 shadow-card hover:shadow-gold",
        pkg.is_featured && "border-primary/70 scale-105"
      )}
    >
      {pkg.is_featured && (
        <div className="absolute -top-3 right-4 bg-gradient-gold text-primary-foreground px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
          <Crown className="w-4 h-4" />
          الأكثر طلباً
        </div>
      )}

      {pkg.image_url && (
        <div className="mb-4 rounded-xl overflow-hidden">
          <img src={pkg.image_url} alt={pkg.name || ""} className="w-full h-32 object-cover" />
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <span className="text-muted-foreground text-sm">
          {pkg.is_business ? "باقة رجال الأعمال" : "باقة الاستثمار"}
        </span>
        <span className="bg-secondary px-3 py-1 rounded-full text-xs font-medium">
          #{pkg.package_number}
        </span>
      </div>

      {pkg.name && (
        <h3 className="text-lg font-bold mb-2">{pkg.name}</h3>
      )}

      <div className="mb-6">
        <p className="text-muted-foreground text-sm mb-2">مبلغ الاستثمار</p>
        <p className="text-3xl font-bold text-gradient-gold">
          {formatNumber(pkg.investment_amount)} <span className="text-lg">ريال</span>
        </p>
      </div>

      <div className="bg-secondary/50 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-accent" />
          <span className="text-muted-foreground text-sm">الربح اليومي</span>
        </div>
        <p className="text-2xl font-bold text-accent">
          {formatNumber(pkg.daily_profit)} <span className="text-sm">ريال/يوم</span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 text-center">
        <div className="bg-secondary/30 rounded-lg p-3">
          <p className="text-muted-foreground text-xs mb-1">الربح الشهري</p>
          <p className="text-foreground font-bold">{formatNumber(monthlyProfit)} ﷼</p>
        </div>
        <div className="bg-secondary/30 rounded-lg p-3">
          <p className="text-muted-foreground text-xs mb-1">إجمالي الربح</p>
          <p className="text-primary font-bold">{formatNumber(totalProfit)} ﷼</p>
        </div>
      </div>

      <div className="text-center mb-6">
        <span className="text-muted-foreground text-sm">مدة الاستثمار: </span>
        <span className="text-foreground font-medium">{pkg.investment_period_days || 120} يوم</span>
      </div>

      <Button variant="gold" className="w-full" onClick={onSubscribe}>
        ابدأ الاستثمار الآن
      </Button>

      <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </div>
  );
};

export default Packages;
