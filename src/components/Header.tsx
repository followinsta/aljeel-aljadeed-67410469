import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Menu, X, TrendingUp, LogIn, LogOut, User, FileText, BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { href: "#home", label: "الرئيسية" },
    { href: "#packages", label: "الباقات" },
    { href: "#business", label: "رجال الأعمال" },
    { href: "#about", label: "من نحن" },
    { href: "#contact", label: "تواصل معنا" },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  const handleNavClick = (href: string) => {
    const elementId = href.replace("#", "");
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/" + href);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-gold rounded-xl flex items-center justify-center shadow-gold">
              <TrendingUp className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient-gold">الجيل الجديد</h1>
              <p className="text-xs text-muted-foreground">للاستثمار</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
                className="text-muted-foreground hover:text-foreground transition-colors duration-300 font-medium cursor-pointer"
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/subscription-policy"
              className="text-muted-foreground hover:text-foreground transition-colors duration-300 font-medium"
            >
              سياسة الاشتراك
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="outline" size="sm" className="gap-2">
                      <User className="w-4 h-4" />
                      لوحة التحكم
                    </Button>
                  </Link>
                )}
                {!isAdmin && (
                  <Link to="/investor-dashboard">
                    <Button variant="outline" size="sm" className="gap-2">
                      <BarChart3 className="w-4 h-4" />
                      حسابي
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
                  <LogOut className="w-4 h-4" />
                  خروج
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="gold" className="gap-2">
                  <LogIn className="w-4 h-4" />
                  تسجيل الدخول
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-foreground"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-card border-t border-border">
          <nav className="container mx-auto px-4 py-6 flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => { e.preventDefault(); handleNavClick(link.href); setIsMenuOpen(false); }}
                className="text-muted-foreground hover:text-foreground transition-colors duration-300 font-medium py-2 cursor-pointer"
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/subscription-policy"
              onClick={() => setIsMenuOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors duration-300 font-medium py-2"
            >
              سياسة الاشتراك
            </Link>
            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full gap-2">
                      <User className="w-4 h-4" />
                      لوحة التحكم
                    </Button>
                  </Link>
                )}
                {!isAdmin && (
                  <Link to="/investor-dashboard" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full gap-2">
                      <BarChart3 className="w-4 h-4" />
                      حسابي
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" onClick={handleSignOut} className="w-full gap-2 mt-2">
                  <LogOut className="w-4 h-4" />
                  تسجيل الخروج
                </Button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                <Button variant="gold" className="w-full mt-4 gap-2">
                  <LogIn className="w-4 h-4" />
                  تسجيل الدخول
                </Button>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
