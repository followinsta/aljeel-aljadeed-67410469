import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, CreditCard, MessageSquare, Settings } from "lucide-react";
import AdminPackages from "@/components/admin/AdminPackages";
import AdminPaymentMethods from "@/components/admin/AdminPaymentMethods";
import AdminComments from "@/components/admin/AdminComments";
import AdminSettings from "@/components/admin/AdminSettings";

const Admin = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate("/auth");
    }
  }, [user, isAdmin, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">جاري التحميل...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">لوحة تحكم المدير</h1>
          <p className="text-muted-foreground mt-2">إدارة الباقات والتعليقات وطرق الدفع</p>
        </div>

        <Tabs defaultValue="packages" className="w-full" dir="rtl">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="packages" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">الباقات</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">طرق الدفع</span>
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">التعليقات</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">الإعدادات</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="packages">
            <AdminPackages />
          </TabsContent>

          <TabsContent value="payments">
            <AdminPaymentMethods />
          </TabsContent>

          <TabsContent value="comments">
            <AdminComments />
          </TabsContent>

          <TabsContent value="settings">
            <AdminSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
