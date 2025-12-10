import { TrendingUp } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-gold rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-bold text-gradient-gold">الجيل الجديد</h3>
              <p className="text-xs text-muted-foreground">للاستثمار</p>
            </div>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6">
            <a href="#packages" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              الباقات
            </a>
            <a href="#business" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              رجال الأعمال
            </a>
            <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              من نحن
            </a>
            <a href="#contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              تواصل معنا
            </a>
          </nav>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © 2024 الجيل الجديد. جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
