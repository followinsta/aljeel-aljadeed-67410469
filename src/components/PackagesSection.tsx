import PackageCard from "./PackageCard";
import { Sparkles } from "lucide-react";

const PackagesSection = () => {
  const packages = [
    { number: 0, investment: 500, profit: 200 },
    { number: 1, investment: 1000, profit: 450 },
    { number: 2, investment: 2000, profit: 990, featured: true },
    { number: 3, investment: 3000, profit: 1450 },
    { number: 4, investment: 4000, profit: 1990 },
    { number: 5, investment: 5000, profit: 2460 },
  ];

  return (
    <section id="packages" className="py-24 bg-background relative">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-secondary px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">باقات الاستثمار والأرباح</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            اختر <span className="text-gradient-gold">باقتك</span> المناسبة
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            باقات متنوعة تناسب جميع المستثمرين. ابدأ برأس مال صغير واحصل على أرباح يومية مضمونة
          </p>
        </div>

        {/* Packages grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.number}
              packageNumber={pkg.number}
              investment={pkg.investment}
              dailyProfit={pkg.profit}
              featured={pkg.featured}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PackagesSection;
