import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { TrendingUp, Crown } from "lucide-react";

interface PackageCardProps {
  id?: string;
  packageNumber: number;
  investment: number;
  dailyProfit: number;
  isBusinessPackage?: boolean;
  featured?: boolean;
}

const PackageCard = ({
  id,
  packageNumber,
  investment,
  dailyProfit,
  isBusinessPackage = false,
  featured = false,
}: PackageCardProps) => {
  const navigate = useNavigate();
  const formatNumber = (num: number) => {
    return num.toLocaleString("ar-SA");
  };

  const monthlyProfit = dailyProfit * 30;
  const totalProfit = dailyProfit * 120; // 4 months

  return (
    <div
      className={cn(
        "relative group rounded-2xl p-6 transition-all duration-500 hover:scale-105",
        "bg-gradient-card border border-border/50",
        "hover:border-primary/50 shadow-card hover:shadow-gold",
        featured && "border-primary/70 scale-105"
      )}
    >
      {/* Featured badge */}
      {featured && (
        <div className="absolute -top-3 right-4 bg-gradient-gold text-primary-foreground px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
          <Crown className="w-4 h-4" />
          الأكثر طلباً
        </div>
      )}

      {/* Package number */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-muted-foreground text-sm">
          {isBusinessPackage ? "باقة رجال الأعمال" : "باقة الاستثمار"}
        </span>
        <span className="bg-secondary px-3 py-1 rounded-full text-xs font-medium">
          #{packageNumber}
        </span>
      </div>

      {/* Investment amount */}
      <div className="mb-6">
        <p className="text-muted-foreground text-sm mb-2">مبلغ الاستثمار</p>
        <p className="text-3xl font-bold text-gradient-gold">
          {formatNumber(investment)} <span className="text-lg">ريال</span>
        </p>
      </div>

      {/* Daily profit */}
      <div className="bg-secondary/50 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-accent" />
          <span className="text-muted-foreground text-sm">الربح اليومي</span>
        </div>
        <p className="text-2xl font-bold text-accent">
          {formatNumber(dailyProfit)} <span className="text-sm">ريال/يوم</span>
        </p>
      </div>

      {/* Stats */}
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

      {/* Duration */}
      <div className="text-center mb-6">
        <span className="text-muted-foreground text-sm">مدة الاستثمار: </span>
        <span className="text-foreground font-medium">4 أشهر</span>
      </div>

      {/* CTA */}
      <Button variant="gold" className="w-full" onClick={() => id ? navigate(`/checkout/${id}`) : navigate("/packages")}>
        ابدأ الاستثمار الآن
      </Button>

      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </div>
  );
};

export default PackageCard;
