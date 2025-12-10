import PackageCard from "./PackageCard";
import { Crown } from "lucide-react";

const BusinessPackagesSection = () => {
  const packages = [
    { number: 6, investment: 6000, profit: 2800 },
    { number: 7, investment: 8000, profit: 3800 },
    { number: 8, investment: 10000, profit: 4600 },
    { number: 9, investment: 20000, profit: 9500, featured: true },
    { number: 10, investment: 30000, profit: 14600 },
    { number: 11, investment: 40000, profit: 19000 },
    { number: 12, investment: 50000, profit: 24600 },
  ];

  return (
    <section id="business" className="py-24 bg-gradient-hero relative">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 px-4 py-2 rounded-full mb-6">
            <Crown className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">باقات رجال الأعمال</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            باقات <span className="text-gradient-gold">VIP</span> للمستثمرين الكبار
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            استثمارات ضخمة وأرباح استثنائية. مصممة خصيصاً لرجال الأعمال والمستثمرين المحترفين
          </p>
        </div>

        {/* Packages grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.number}
              packageNumber={pkg.number}
              investment={pkg.investment}
              dailyProfit={pkg.profit}
              isBusinessPackage
              featured={pkg.featured}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BusinessPackagesSection;
