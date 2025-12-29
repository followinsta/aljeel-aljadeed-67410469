import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone, Hash, Lock, Save, Loader2 } from "lucide-react";

interface UserProfile {
  id: string;
  user_id: string;
  customer_id: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: "",
    phone: ""
  });
  
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    if (user) {
      fetchProfile();
    }
  }, [user, authLoading, navigate]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!error && data) {
      setProfile(data);
      setFormData({
        full_name: data.full_name || "",
        phone: data.phone || ""
      });
    }
    setLoading(false);
  };

  const handleSaveProfile = async () => {
    if (!user || !profile) return;
    
    setSaving(true);
    
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: formData.full_name,
        phone: formData.phone
      })
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "خطأ", description: "فشل حفظ البيانات", variant: "destructive" });
    } else {
      toast({ title: "تم الحفظ", description: "تم تحديث بياناتك بنجاح" });
      fetchProfile();
    }
    
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: "خطأ", description: "كلمتا المرور غير متطابقتين", variant: "destructive" });
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast({ title: "خطأ", description: "كلمة المرور يجب أن تكون 6 أحرف على الأقل", variant: "destructive" });
      return;
    }
    
    setChangingPassword(true);
    
    const { error } = await supabase.auth.updateUser({
      password: passwordData.newPassword
    });

    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "تم التغيير", description: "تم تغيير كلمة المرور بنجاح" });
      setPasswordData({ newPassword: "", confirmPassword: "" });
    }
    
    setChangingPassword(false);
  };

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <section className="py-24 pt-32">
          <div className="container mx-auto px-4 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground mt-4">جاري التحميل...</p>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <section className="py-24 pt-32">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">بروفايلي</h1>
            <p className="text-muted-foreground">إدارة بياناتك الشخصية</p>
          </div>

          {/* Customer ID Card */}
          {profile?.customer_id && (
            <Card className="bg-gradient-gold/10 border-primary/30 mb-6">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Hash className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">رقم العميل الخاص بك</span>
                </div>
                <p className="text-3xl font-bold text-primary">{profile.customer_id}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  استخدم هذا الرقم عند التواصل معنا لتفعيل حسابك
                </p>
              </CardContent>
            </Card>
          )}

          {/* Profile Form */}
          <Card className="bg-card border-border mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                البيانات الشخصية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  البريد الإلكتروني
                </Label>
                <Input 
                  value={user.email || ""} 
                  disabled 
                  className="bg-secondary/50"
                />
                <p className="text-xs text-muted-foreground mt-1">لا يمكن تغيير البريد الإلكتروني</p>
              </div>
              
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  الاسم الكامل
                </Label>
                <Input 
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="أدخل اسمك الكامل"
                />
              </div>
              
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  رقم الهاتف
                </Label>
                <Input 
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="05xxxxxxxx"
                  dir="ltr"
                />
              </div>
              
              <Button 
                onClick={handleSaveProfile} 
                disabled={saving}
                className="w-full gap-2"
                variant="gold"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                حفظ البيانات
              </Button>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                تغيير كلمة المرور
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="mb-2">كلمة المرور الجديدة</Label>
                <Input 
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="أدخل كلمة المرور الجديدة"
                />
              </div>
              
              <div>
                <Label className="mb-2">تأكيد كلمة المرور</Label>
                <Input 
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="أعد إدخال كلمة المرور"
                />
              </div>
              
              <Button 
                onClick={handleChangePassword} 
                disabled={changingPassword || !passwordData.newPassword}
                className="w-full gap-2"
                variant="outline"
              >
                {changingPassword ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                تغيير كلمة المرور
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Profile;
