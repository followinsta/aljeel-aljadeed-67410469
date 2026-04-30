import { useEffect, useState, lazy, Suspense } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Package, CreditCard, MessageSquare, Settings, Users, FileText, Home, UserPlus, Receipt } from "lucide-react";

const AdminPackages = lazy(() => import("@/components/admin/AdminPackages"));
const AdminPaymentMethods = lazy(() => import("@/components/admin/AdminPaymentMethods"));
const AdminPaymentReceipts = lazy(() => import("@/components/admin/AdminPaymentReceipts"));
const AdminComments = lazy(() => import("@/components/admin/AdminComments"));
const AdminSettings = lazy(() => import("@/components/admin/AdminSettings"));
const AdminInvestors = lazy(() => import("@/components/admin/AdminInvestors"));
const AdminSubscriptionPolicy = lazy(() => import("@/components/admin/AdminSubscriptionPolicy"));
const AdminNewCustomers = lazy(() => import("@/components/admin/AdminNewCustomers"));

const TabFallback = () => (
  <div className="text-center py-12 text-muted-foreground">جاري التحميل...</div>
);

const Admin = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("new-customers");

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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">لوحة تحكم المدير</h1>
            <p className="text-muted-foreground mt-2">مستثمرين الجيل الجديد - إدارة شاملة</p>
          </div>
          <Link to="/">
            <Button variant="outline" className="gap-2">
              <Home className="w-4 h-4" />
              العودة للرئيسية
            </Button>
          </Link>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" dir="rtl">
          <TabsList className="grid w-full grid-cols-4 md:grid-cols-8 mb-8 h-auto">
            <TabsTrigger value="new-customers" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">العملاء الجدد</span>
            </TabsTrigger>
            <TabsTrigger value="investors" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">المستثمرين</span>
            </TabsTrigger>
            <TabsTrigger value="receipts" className="flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              <span className="hidden sm:inline">إيصالات التحويل</span>
            </TabsTrigger>
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
            <TabsTrigger value="policy" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">سياسة الاشتراك</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">الإعدادات</span>
            </TabsTrigger>
          </TabsList>

          <Suspense fallback={<TabFallback />}>
            {activeTab === "new-customers" && (
              <TabsContent value="new-customers" forceMount><AdminNewCustomers /></TabsContent>
            )}
            {activeTab === "investors" && (
              <TabsContent value="investors" forceMount><AdminInvestors /></TabsContent>
            )}
            {activeTab === "receipts" && (
              <TabsContent value="receipts" forceMount><AdminPaymentReceipts /></TabsContent>
            )}
            {activeTab === "packages" && (
              <TabsContent value="packages" forceMount><AdminPackages /></TabsContent>
            )}
            {activeTab === "payments" && (
              <TabsContent value="payments" forceMount><AdminPaymentMethods /></TabsContent>
            )}
            {activeTab === "comments" && (
              <TabsContent value="comments" forceMount><AdminComments /></TabsContent>
            )}
            {activeTab === "policy" && (
              <TabsContent value="policy" forceMount><AdminSubscriptionPolicy /></TabsContent>
            )}
            {activeTab === "settings" && (
              <TabsContent value="settings" forceMount><AdminSettings /></TabsContent>
            )}
          </Suspense>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
