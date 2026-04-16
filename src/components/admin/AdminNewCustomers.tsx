import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Search,
  User,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Package,
  Hash,
  Bell,
  X
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface SubscriptionRequest {
  id: string;
  user_id: string | null;
  customer_id: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  package_id: string | null;
  package_name: string | null;
  package_amount: number | null;
  status: string;
  notes: string | null;
  created_at: string;
  processed_at: string | null;
}

interface CustomerProfile {
  id: string;
  user_id: string;
  customer_id: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
}

const AdminNewCustomers = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'requests' | 'customers'>('requests');

  const [newNotifications, setNewNotifications] = useState<CustomerProfile[]>([]);

  useEffect(() => {
    fetchData();

    // Subscribe to realtime new customer registrations
    const channel = supabase
      .channel('new-customers')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profiles',
        },
        (payload) => {
          const newCustomer = payload.new as CustomerProfile;
          setNewNotifications(prev => [newCustomer, ...prev]);
          setCustomers(prev => [newCustomer, ...prev]);
          toast({
            title: "🔔 عميل جديد!",
            description: `${newCustomer.full_name || 'عميل جديد'} - ${newCustomer.customer_id || ''} - ${newCustomer.phone || 'بدون هاتف'}`,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    
    // Fetch subscription requests
    const { data: requestsData } = await supabase
      .from("subscription_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (requestsData) {
      setRequests(requestsData);
    }

    // Fetch all customer profiles
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (profilesData) {
      setCustomers(profilesData);
    }

    setIsLoading(false);
  };

  const updateRequestStatus = async (requestId: string, status: string) => {
    const { error } = await supabase
      .from("subscription_requests")
      .update({ 
        status, 
        processed_at: new Date().toISOString() 
      })
      .eq("id", requestId);

    if (error) {
      toast({ title: "خطأ", description: "فشل تحديث حالة الطلب", variant: "destructive" });
      return;
    }

    toast({ title: "تم التحديث", description: `تم تغيير حالة الطلب إلى ${status === 'approved' ? 'موافق عليه' : status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}` });
    fetchData();
  };

  const filteredRequests = requests.filter(req => 
    req.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (req.email && req.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (req.customer_id && req.customer_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredCustomers = customers.filter(cust => 
    (cust.full_name && cust.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (cust.email && cust.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (cust.customer_id && cust.customer_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">موافق عليه</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/30">مرفوض</Badge>;
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">قيد المراجعة</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  if (isLoading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">إجمالي العملاء</p>
                <p className="text-2xl font-bold">{customers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">طلبات جديدة</p>
                <p className="text-2xl font-bold text-yellow-500">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">طلبات موافق عليها</p>
                <p className="text-2xl font-bold text-green-500">{requests.filter(r => r.status === 'approved').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">طلبات مرفوضة</p>
                <p className="text-2xl font-bold text-red-500">{requests.filter(r => r.status === 'rejected').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Registration Notifications */}
      {newNotifications.length > 0 && (
        <Card className="bg-primary/5 border-primary/30">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                إشعارات التسجيل الجديدة ({newNotifications.length})
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setNewNotifications([])}>
                <X className="w-4 h-4" />
                مسح الكل
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {newNotifications.map((notif, idx) => (
              <div key={notif.id || idx} className="flex flex-wrap items-center gap-3 p-3 bg-background rounded-lg border border-border">
                <Badge className="bg-primary/20 text-primary border-primary/30 gap-1">
                  <Hash className="w-3 h-3" />
                  {notif.customer_id || 'جاري التوليد...'}
                </Badge>
                <span className="flex items-center gap-1 text-sm font-medium">
                  <User className="w-3 h-3 text-muted-foreground" />
                  {notif.full_name || 'بدون اسم'}
                </span>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Mail className="w-3 h-3" />
                  {notif.email || 'بدون بريد'}
                </span>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Phone className="w-3 h-3" />
                  {notif.phone || 'بدون هاتف'}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}


      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'requests' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          طلبات الاشتراك {pendingCount > 0 && <Badge variant="destructive" className="mr-2">{pendingCount}</Badge>}
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'customers' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          جميع العملاء
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="بحث بالاسم أو البريد أو رقم العميل..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-10"
        />
      </div>

      {/* Subscription Requests Tab */}
      {activeTab === 'requests' && (
        <div className="grid gap-4">
          {filteredRequests.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="p-8 text-center text-muted-foreground">
                لا توجد طلبات اشتراك
              </CardContent>
            </Card>
          ) : (
            filteredRequests.map((request) => (
              <Card key={request.id} className="bg-card border-border hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold">{request.full_name}</span>
                        {request.customer_id && (
                          <Badge variant="outline" className="gap-1">
                            <Hash className="w-3 h-3" />
                            {request.customer_id}
                          </Badge>
                        )}
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {request.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {request.email}
                          </span>
                        )}
                        {request.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {request.phone}
                          </span>
                        )}
                        {request.package_name && (
                          <span className="flex items-center gap-1">
                            <Package className="w-3 h-3" />
                            {request.package_name}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(request.created_at)}
                        </span>
                      </div>
                    </div>
                    
                    {request.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-500/30 text-green-500 hover:bg-green-500/10"
                          onClick={() => updateRequestStatus(request.id, 'approved')}
                        >
                          <CheckCircle2 className="w-4 h-4 ml-1" />
                          موافقة
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                          onClick={() => updateRequestStatus(request.id, 'rejected')}
                        >
                          <XCircle className="w-4 h-4 ml-1" />
                          رفض
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* All Customers Tab */}
      {activeTab === 'customers' && (
        <div className="grid gap-4">
          {filteredCustomers.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="p-8 text-center text-muted-foreground">
                لا يوجد عملاء مسجلين
              </CardContent>
            </Card>
          ) : (
            filteredCustomers.map((customer) => (
              <Card key={customer.id} className="bg-card border-border hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold">{customer.full_name || 'بدون اسم'}</span>
                        {customer.customer_id && (
                          <Badge variant="outline" className="gap-1 bg-primary/10 text-primary border-primary/30">
                            <Hash className="w-3 h-3" />
                            {customer.customer_id}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {customer.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {customer.email}
                          </span>
                        )}
                        {customer.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {customer.phone}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(customer.created_at)}
                        </span>
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setIsViewDialogOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4 ml-1" />
                      عرض التفاصيل
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Customer Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تفاصيل العميل</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">رقم العميل</p>
                  <p className="font-semibold text-primary">{selectedCustomer.customer_id || 'غير متوفر'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الاسم</p>
                  <p className="font-semibold">{selectedCustomer.full_name || 'غير متوفر'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                  <p className="font-semibold">{selectedCustomer.email || 'غير متوفر'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">رقم الهاتف</p>
                  <p className="font-semibold">{selectedCustomer.phone || 'غير متوفر'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">تاريخ التسجيل</p>
                  <p className="font-semibold">{formatDate(selectedCustomer.created_at)}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminNewCustomers;