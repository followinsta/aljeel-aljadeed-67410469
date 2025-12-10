import { Shield, Clock, Headphones, Award } from "lucide-react";

const AboutSection = () => {
  const features = [
    {
      icon: Shield,
      title: "أمان وموثوقية",
      description: "نضمن لك حماية كاملة لاستثماراتك مع أعلى معايير الأمان",
    },
    {
      icon: Clock,
      title: "أرباح يومية",
      description: "احصل على أرباحك يومياً دون أي تأخير أو تعقيدات",
    },
    {
      icon: Headphones,
      title: "دعم على مدار الساعة",
      description: "فريق دعم متخصص متاح 24/7 للإجابة على استفساراتك",
    },
    {
      icon: Award,
      title: "خبرة طويلة",
      description: "سنوات من الخبرة في مجال الاستثمار وإدارة الأموال",
    },
  ];

  return (
    <section id="about" className="py-24 bg-background relative">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <span className="text-primary font-medium mb-4 block">من نحن</span>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              مؤسسة <span className="text-gradient-gold">الجيل الجديد</span> للاستثمار
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              نحن مؤسسة سعودية رائدة في مجال الاستثمار، نقدم لعملائنا فرص استثمارية متميزة 
              مع عوائد مجزية. نؤمن بأن كل فرد يستحق فرصة لتنمية أمواله وتحقيق أحلامه المالية.
            </p>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              مقرنا الرئيسي في المملكة العربية السعودية، ونعمل وفق أعلى معايير الشفافية 
              والمصداقية لضمان راحة بال عملائنا.
            </p>

            {/* Stats inline */}
            <div className="flex gap-8">
              <div>
                <p className="text-3xl font-bold text-gradient-gold">4</p>
                <p className="text-sm text-muted-foreground">أشهر مدة الاستثمار</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gradient-gold">13</p>
                <p className="text-sm text-muted-foreground">باقة استثمارية</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gradient-gold">24/7</p>
                <p className="text-sm text-muted-foreground">دعم متواصل</p>
              </div>
            </div>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-card border border-border/50 rounded-2xl p-6 hover:border-primary/50 transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
