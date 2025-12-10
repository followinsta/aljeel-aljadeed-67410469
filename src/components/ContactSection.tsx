import { Button } from "./ui/button";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";

const ContactSection = () => {
  return (
    <section id="contact" className="py-24 bg-gradient-hero relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-primary font-medium mb-4 block">تواصل معنا</span>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            هل أنت مستعد <span className="text-gradient-gold">للبدء؟</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-12 max-w-2xl mx-auto">
            فريقنا متاح للإجابة على جميع استفساراتك ومساعدتك في اختيار الباقة المناسبة لك
          </p>

          {/* Contact methods */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-card border border-border/50 rounded-2xl p-6 hover:border-primary/50 transition-all duration-300">
              <div className="w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Phone className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-bold mb-2">اتصل بنا</h3>
              <p className="text-muted-foreground text-sm">+966 XX XXX XXXX</p>
            </div>

            <div className="bg-card border border-border/50 rounded-2xl p-6 hover:border-primary/50 transition-all duration-300">
              <div className="w-14 h-14 bg-accent/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-7 h-7 text-accent" />
              </div>
              <h3 className="font-bold mb-2">واتساب</h3>
              <p className="text-muted-foreground text-sm">تواصل مباشر وسريع</p>
            </div>

            <div className="bg-card border border-border/50 rounded-2xl p-6 hover:border-primary/50 transition-all duration-300">
              <div className="w-14 h-14 bg-secondary rounded-xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-7 h-7 text-foreground" />
              </div>
              <h3 className="font-bold mb-2">الموقع</h3>
              <p className="text-muted-foreground text-sm">المملكة العربية السعودية</p>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="hero" size="xl">
              ابدأ الاستثمار الآن
            </Button>
            <Button variant="outline" size="xl">
              <MessageCircle className="w-5 h-5 ml-2" />
              تواصل عبر واتساب
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
