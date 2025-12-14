import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import PackageCard from "./PackageCard";
import { Sparkles } from "lucide-react";

interface Package {
  id: string;
  package_number: number;
  investment_amount: number;
  daily_profit: number;
  is_featured: boolean;
  is_business: boolean;
}

const PackagesSection = () => {
  const [packages, setPackages] = useState<Package[]>([]);

  useEffect(() => {
    const fetchPackages = async () => {
      const { data } = await supabase
        .from("packages")
        .select("*")
        .eq("is_active", true)
        .eq("is_business", false)
        .order("package_number", { ascending: true });
      if (data) setPackages(data);
    };
    fetchPackages();
  }, []);

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
              key={pkg.id}
              id={pkg.id}
              packageNumber={pkg.package_number}
              investment={pkg.investment_amount}
              dailyProfit={pkg.daily_profit}
              featured={pkg.is_featured}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PackagesSection;
