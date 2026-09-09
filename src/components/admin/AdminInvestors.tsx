import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search,
  User,
  Phone,
  CreditCard,
  Calendar,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Eye,
  Hash
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CURRENCIES, currencyShort } from "@/lib/currencies";

interface Investor {
  id: string;
  full_name: string;
  phone: string | null;
  bank_account_number: string | null;
  iban: string | null;
  bank_name: string | null;
  subscription_amount: number;
  daily_profit: number;
  subscription_duration_months: number;
  subscription_duration_days: number;
  subscription_start_date: string;
  total_accumulated_profit: number;
  is_active: boolean;
  email: string | null;
  notes: string | null;
  linked_customer_id: string | null;
  withdraw_button_enabled?: boolean;
  withdraw_button_text?: string | null;
  withdraw_action_button_enabled?: boolean;
  withdraw_action_button_text?: string | null;
  withdraw_action_button_url?: string | null;
  currency?: string | null;
  fees_section_visible?: boolean;
}

interface CustomerProfile {
  id: string;
  user_id: string;
  customer_id: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
}

interface InvestorFee {
  id: string;
  investor_id: string;
  fee_type: string;
  is_paid: boolean;
  amount: number | null;
}

const FEE_TYPES = [
  "رسوم تحويل الارباح",
  "رسوم الشبكه",
  "رسوم إنشاء المحفظة",
  "رسوم إدارة المحفظة",
  "رسوم أتعاب الموظف والمعاملات الأدارية",
  "رسوم عدم النشاط",
  "رسوم منصة الوسيط",
  "الرسوم الضريبية"
];

const AdminInvestors = () => {
  const { toast } = useToast();
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [filteredInvestors, setFilteredInvestors] = useState<Investor[]>([]);
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingInvestor, setEditingInvestor] = useState<Investor | null>(null);
  const [viewingInvestor, setViewingInvestor] = useState<Investor | null>(null);
  const [investorFees, setInvestorFees] = useState<InvestorFee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFeeTypes, setSelectedFeeTypes] = useState<string[]>([]);
  const [customFees, setCustomFees] = useState<string[]>([]);
  const [newCustomFee, setNewCustomFee] = useState("");
  const [linkedCustomerId, setLinkedCustomerId] = useState("");
  const [foundCustomer, setFoundCustomer] = useState<CustomerProfile | null>(null);
  
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    bank_account_number: "",
    iban: "",
    bank_name: "",
    subscription_amount: "",
    daily_profit: "",
    subscription_duration_months: "4",
    subscription_duration_days: "120",
    subscription_start_date: new Date().toISOString().split("T")[0],
    is_active: true,
    email: "",
    notes: "",
    is_previous_subscriber: false,
    previous_accumulated_profit: "0",
    withdraw_button_enabled: false,
    withdraw_button_text: "",
    withdraw_action_button_enabled: false,
    withdraw_action_button_text: "",
    withdraw_action_button_url: "",
    notification_bar_enabled: false,
    notification_bar_text: "",
    auto_enable_withdraw_after_24h: false,
    currency: "SAR",
    fees_section_visible: true
  });

  useEffect(() => {
    fetchInvestors();
    fetchCustomers();
  }, []);

  useEffect(() => {
    const filtered = investors.filter(inv => 
      inv.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.phone && inv.phone.includes(searchTerm)) ||
      (inv.email && inv.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (inv.linked_customer_id && inv.linked_customer_id.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredInvestors(filtered);
  }, [searchTerm, investors]);

  const fetchCustomers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*");
    
    if (data) {
      setCustomers(data);
    }
  };

  const lookupCustomer = (customerId: string) => {
    const customer = customers.find(c => c.customer_id?.toLowerCase() === customerId.toLowerCase());
    if (customer) {
      setFoundCustomer(customer);
      setFormData(prev => ({
        ...prev,
        full_name: customer.full_name || prev.full_name,
        email: customer.email || prev.email,
        phone: customer.phone || prev.phone
      }));
      toast({ title: "تم العثور على العميل", description: `تم ملء بيانات العميل: ${customer.full_name}` });
    } else {
      setFoundCustomer(null);
      toast({ title: "غير موجود", description: "لم يتم العثور على عميل بهذا الرقم", variant: "destructive" });
    }
  };

  const fetchInvestors = async () => {
    const { data, error } = await supabase
      .from("investors")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setInvestors(data);
      setFilteredInvestors(data);
    }
    setIsLoading(false);
  };

  const fetchInvestorFees = async (investorId: string): Promise<InvestorFee[]> => {
    const { data } = await supabase
      .from("investor_fees")
      .select("*")
      .eq("investor_id", investorId);
    
    const fees = data || [];
    setInvestorFees(fees);
    return fees;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // الأرباح السابقة: تُؤخذ من الحقل دائماً سواء عند الإضافة (إذا فُعّل خيار مشترك سابق) أو عند التعديل
    const previousProfit = editingInvestor
      ? (parseFloat(formData.previous_accumulated_profit) || 0)
      : (formData.is_previous_subscriber ? (parseFloat(formData.previous_accumulated_profit) || 0) : 0);
    
    const investorData = {
      full_name: formData.full_name,
      phone: formData.phone || null,
      bank_account_number: formData.bank_account_number || null,
      iban: formData.iban || null,
      bank_name: formData.bank_name || null,
      subscription_amount: parseFloat(formData.subscription_amount) || 0,
      daily_profit: parseFloat(formData.daily_profit) || 0,
      subscription_duration_months: parseInt(formData.subscription_duration_months) || 4,
      subscription_duration_days: parseInt(formData.subscription_duration_days) || 120,
      subscription_start_date: formData.subscription_start_date,
      is_active: formData.is_active,
      email: formData.email || null,
      notes: formData.notes || null,
      total_accumulated_profit: previousProfit,
      linked_customer_id: linkedCustomerId || null,
      withdraw_button_enabled: formData.withdraw_button_enabled,
      withdraw_button_text: formData.withdraw_button_text || null,
      withdraw_action_button_enabled: formData.withdraw_action_button_enabled,
      withdraw_action_button_text: formData.withdraw_action_button_text || null,
      withdraw_action_button_url: formData.withdraw_action_button_url || null,
      notification_bar_enabled: formData.notification_bar_enabled,
      notification_bar_text: formData.notification_bar_text || null,
      auto_enable_withdraw_after_24h: formData.auto_enable_withdraw_after_24h
    };

    if (editingInvestor) {
      const { error } = await supabase
        .from("investors")
        .update(investorData)
        .eq("id", editingInvestor.id);

      if (error) {
        toast({ title: "خطأ", description: "فشل تحديث بيانات المستثمر", variant: "destructive" });
        return;
      }

      // Update fees
      await updateInvestorFees(editingInvestor.id);

      toast({ title: "تم التحديث", description: "تم تحديث بيانات المستثمر بنجاح" });
    } else {
      const { data, error } = await supabase
        .from("investors")
        .insert([investorData])
        .select()
        .single();

      if (error) {
        toast({ title: "خطأ", description: "فشل إضافة المستثمر", variant: "destructive" });
        return;
      }

      // Add selected fees + custom fees
      const allFees = [...selectedFeeTypes, ...customFees];
      if (allFees.length > 0 && data) {
        const feesToInsert = allFees.map(feeType => ({
          investor_id: data.id,
          fee_type: feeType,
          is_paid: false
        }));
        await supabase.from("investor_fees").insert(feesToInsert);
      }

      // إنشاء سجل أرباح للمشترك السابق - الأرباح السابقة قيمة ثابتة فقط
      // لا نقوم بحسابها تلقائياً

      toast({ title: "تمت الإضافة", description: "تم إضافة المستثمر بنجاح" });
    }

    resetForm();
    setIsDialogOpen(false);
    fetchInvestors();
  };

  // تم إزالة generateProfitHistory لأن الأرباح السابقة تُحدد يدوياً فقط

  const updateInvestorFees = async (investorId: string) => {
    // Fetch current fees to preserve is_paid status
    const { data: currentFees } = await supabase
      .from("investor_fees")
      .select("*")
      .eq("investor_id", investorId);
    
    // Delete existing fees
    await supabase.from("investor_fees").delete().eq("investor_id", investorId);
    
    // Insert new fees (selected + custom)
    const allFees = [...selectedFeeTypes, ...customFees];
    if (allFees.length > 0) {
      const feesToInsert = allFees.map(feeType => ({
        investor_id: investorId,
        fee_type: feeType,
        is_paid: currentFees?.find(f => f.fee_type === feeType)?.is_paid || false
      }));
      await supabase.from("investor_fees").insert(feesToInsert);
    }
  };

  const handleEdit = async (investor: Investor) => {
    setEditingInvestor(investor);
    setFormData({
      full_name: investor.full_name,
      phone: investor.phone || "",
      bank_account_number: investor.bank_account_number || "",
      iban: investor.iban || "",
      bank_name: investor.bank_name || "",
      subscription_amount: investor.subscription_amount.toString(),
      daily_profit: investor.daily_profit.toString(),
      subscription_duration_months: investor.subscription_duration_months.toString(),
      subscription_duration_days: investor.subscription_duration_days.toString(),
      subscription_start_date: investor.subscription_start_date,
      is_active: investor.is_active,
      email: investor.email || "",
      notes: investor.notes || "",
      is_previous_subscriber: false,
      previous_accumulated_profit: investor.total_accumulated_profit.toString(),
      withdraw_button_enabled: investor.withdraw_button_enabled || false,
      withdraw_button_text: investor.withdraw_button_text || "",
      withdraw_action_button_enabled: (investor as any).withdraw_action_button_enabled || false,
      withdraw_action_button_text: (investor as any).withdraw_action_button_text || "",
      withdraw_action_button_url: (investor as any).withdraw_action_button_url || "",
      notification_bar_enabled: (investor as any).notification_bar_enabled || false,
      notification_bar_text: (investor as any).notification_bar_text || "",
      auto_enable_withdraw_after_24h: (investor as any).auto_enable_withdraw_after_24h || false
    });
    
    setLinkedCustomerId(investor.linked_customer_id || "");
    if (investor.linked_customer_id) {
      const customer = customers.find(c => c.customer_id === investor.linked_customer_id);
      setFoundCustomer(customer || null);
    }
    
    const fees = await fetchInvestorFees(investor.id);
    const feeTypes = fees.map(f => f.fee_type);
    setSelectedFeeTypes(feeTypes.filter(t => FEE_TYPES.includes(t)));
    setCustomFees(feeTypes.filter(t => !FEE_TYPES.includes(t)));
    setIsDialogOpen(true);
  };

  const handleView = async (investor: Investor) => {
    setViewingInvestor(investor);
    await fetchInvestorFees(investor.id);
    setIsViewDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المستثمر؟")) return;

    const { error } = await supabase.from("investors").delete().eq("id", id);

    if (error) {
      toast({ title: "خطأ", description: "فشل حذف المستثمر", variant: "destructive" });
      return;
    }

    toast({ title: "تم الحذف", description: "تم حذف المستثمر بنجاح" });
    fetchInvestors();
  };

  const toggleFeePaid = async (feeId: string, currentStatus: boolean) => {
    await supabase
      .from("investor_fees")
      .update({ is_paid: !currentStatus, paid_at: !currentStatus ? new Date().toISOString() : null })
      .eq("id", feeId);
    
    if (viewingInvestor) {
      await fetchInvestorFees(viewingInvestor.id);
    }
    toast({ title: "تم التحديث", description: `تم ${!currentStatus ? 'تأكيد' : 'إلغاء'} الدفع` });
  };

  const resetForm = () => {
    setFormData({
      full_name: "",
      phone: "",
      bank_account_number: "",
      iban: "",
      bank_name: "",
      subscription_amount: "",
      daily_profit: "",
      subscription_duration_months: "4",
      subscription_duration_days: "120",
      subscription_start_date: new Date().toISOString().split("T")[0],
      is_active: true,
      email: "",
      notes: "",
      is_previous_subscriber: false,
      previous_accumulated_profit: "0",
      withdraw_button_enabled: false,
      withdraw_button_text: "",
      withdraw_action_button_enabled: false,
      withdraw_action_button_text: "",
      withdraw_action_button_url: "",
      notification_bar_enabled: false,
      notification_bar_text: "",
      auto_enable_withdraw_after_24h: false
    });
    setEditingInvestor(null);
    setSelectedFeeTypes([]);
    setCustomFees([]);
    setNewCustomFee("");
    setInvestorFees([]);
    setLinkedCustomerId("");
    setFoundCustomer(null);
  };

  const formatNumber = (num: number) => num.toLocaleString("ar-SA");

  const activeInvestors = investors.filter(i => i.is_active).length;

  if (isLoading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">إجمالي المستثمرين</p>
                <p className="text-2xl font-bold">{formatNumber(investors.length)}</p>
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
                <p className="text-muted-foreground text-sm">المستثمرين النشطين</p>
                <p className="text-2xl font-bold text-green-500">{formatNumber(activeInvestors)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">إجمالي الاستثمارات</p>
                <p className="text-2xl font-bold text-accent">
                  {formatNumber(investors.reduce((sum, i) => sum + i.subscription_amount, 0))} ريال
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Add */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="بحث بالاسم أو الهاتف أو البريد..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button variant="gold" className="gap-2">
              <Plus className="w-4 h-4" />
              إضافة مستثمر
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingInvestor ? "تعديل بيانات المستثمر" : "إضافة مستثمر جديد"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Customer ID Lookup */}
              <div className="bg-primary/10 rounded-lg p-4 border border-primary/30">
                <Label className="text-primary font-bold">ربط بحساب عميل (اختياري)</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="أدخل رقم العميل مثل GI-0001"
                    value={linkedCustomerId}
                    onChange={(e) => setLinkedCustomerId(e.target.value.toUpperCase())}
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => lookupCustomer(linkedCustomerId)}
                    disabled={!linkedCustomerId}
                  >
                    بحث
                  </Button>
                </div>
                {foundCustomer && (
                  <div className="mt-2 p-2 bg-green-500/10 rounded border border-green-500/30 text-green-600 text-sm">
                    ✓ تم العثور على: {foundCustomer.full_name} ({foundCustomer.email})
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>الاسم الكامل *</Label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>رقم الهاتف</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label>البريد الإلكتروني</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label>اسم البنك</Label>
                  <Input
                    value={formData.bank_name}
                    onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>رقم الحساب</Label>
                  <Input
                    value={formData.bank_account_number}
                    onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
                  />
                </div>
                <div>
                  <Label>الآيبان</Label>
                  <Input
                    value={formData.iban}
                    onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                  />
                </div>
                <div>
                  <Label>مبلغ الاشتراك *</Label>
                  <Input
                    type="number"
                    value={formData.subscription_amount}
                    onChange={(e) => setFormData({ ...formData, subscription_amount: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>الربح اليومي *</Label>
                  <Input
                    type="number"
                    value={formData.daily_profit}
                    onChange={(e) => setFormData({ ...formData, daily_profit: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>مدة الاشتراك (أشهر)</Label>
                  <Input
                    type="number"
                    value={formData.subscription_duration_months}
                    onChange={(e) => setFormData({ ...formData, subscription_duration_months: e.target.value })}
                  />
                </div>
                <div>
                  <Label>مدة الاشتراك (أيام)</Label>
                  <Input
                    type="number"
                    value={formData.subscription_duration_days}
                    onChange={(e) => setFormData({ ...formData, subscription_duration_days: e.target.value })}
                  />
                </div>
                <div>
                  <Label>تاريخ بداية الاشتراك</Label>
                  <Input
                    type="date"
                    value={formData.subscription_start_date}
                    onChange={(e) => setFormData({ ...formData, subscription_start_date: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label>نشط</Label>
                </div>
              </div>

              {!editingInvestor && (
                <div className="flex items-center gap-2 p-3 bg-secondary/30 rounded-lg">
                  <Checkbox
                    checked={formData.is_previous_subscriber}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_previous_subscriber: !!checked })}
                  />
                  <Label>مشترك سابق (لديه أرباح متراكمة سابقة)</Label>
                </div>
              )}

              {(formData.is_previous_subscriber || editingInvestor) && (
                <div className="bg-primary/10 p-4 rounded-lg border border-primary/30">
                  <Label className="text-primary font-bold">الأرباح المتراكمة السابقة</Label>
                  <p className="text-xs text-muted-foreground mb-2">هذه القيمة تُحدد يدوياً ولا تُحسب تلقائياً</p>
                  <Input
                    type="number"
                    value={formData.previous_accumulated_profit}
                    onChange={(e) => setFormData({ ...formData, previous_accumulated_profit: e.target.value })}
                    placeholder="0"
                  />
                </div>
              )}

              {/* Fee Types Selection */}
              <div>
                <Label className="mb-3 block">أنواع الرسوم المطلوبة</Label>
                <div className="space-y-2">
                  {FEE_TYPES.map((feeType) => (
                    <div key={feeType} className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedFeeTypes.includes(feeType)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedFeeTypes([...selectedFeeTypes, feeType]);
                          } else {
                            setSelectedFeeTypes(selectedFeeTypes.filter(f => f !== feeType));
                          }
                        }}
                      />
                      <Label className="font-normal">{feeType}</Label>
                    </div>
                  ))}
                </div>

                {/* Custom Fees */}
                <div className="mt-4 p-3 bg-secondary/30 rounded-lg space-y-3">
                  <Label className="font-bold">رسوم مخصصة (اكتب الرسم بنفسك)</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="اكتب اسم الرسم..."
                      value={newCustomFee}
                      onChange={(e) => setNewCustomFee(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const trimmed = newCustomFee.trim();
                          if (trimmed && !customFees.includes(trimmed) && !FEE_TYPES.includes(trimmed)) {
                            setCustomFees([...customFees, trimmed]);
                            setNewCustomFee("");
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const trimmed = newCustomFee.trim();
                        if (trimmed && !customFees.includes(trimmed) && !FEE_TYPES.includes(trimmed)) {
                          setCustomFees([...customFees, trimmed]);
                          setNewCustomFee("");
                        }
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      إضافة
                    </Button>
                  </div>
                  {customFees.length > 0 && (
                    <div className="space-y-2">
                      {customFees.map((fee) => (
                        <div key={fee} className="flex items-center justify-between p-2 bg-background rounded border border-border">
                          <span className="text-sm">{fee}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setCustomFees(customFees.filter(f => f !== fee))}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label>ملاحظات</Label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="border border-border rounded-lg p-4 space-y-3 bg-secondary/20">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.withdraw_button_enabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, withdraw_button_enabled: checked })}
                  />
                  <Label className="cursor-pointer">تفعيل زر "سحب الأرباح" للمستثمر</Label>
                </div>
                {formData.withdraw_button_enabled && (
                  <div>
                    <Label>النص الذي يظهر عند الضغط على الزر</Label>
                    <Input
                      placeholder="اكتب الرسالة التي تظهر للمستثمر عند الضغط على زر سحب الأرباح"
                      value={formData.withdraw_button_text}
                      onChange={(e) => setFormData({ ...formData, withdraw_button_text: e.target.value })}
                    />

                    <div className="mt-4 border-t border-border pt-3 space-y-3">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={formData.withdraw_action_button_enabled}
                          onCheckedChange={(checked) => setFormData({ ...formData, withdraw_action_button_enabled: checked })}
                        />
                        <Label className="cursor-pointer">تفعيل زر داخلي يوجّه إلى رابط (واتساب/تلقرام/دفع)</Label>
                      </div>
                      {formData.withdraw_action_button_enabled && (
                        <>
                          <div>
                            <Label>اسم الزر</Label>
                            <Input
                              placeholder="مثال: تواصل عبر واتساب"
                              value={formData.withdraw_action_button_text}
                              onChange={(e) => setFormData({ ...formData, withdraw_action_button_text: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>الرابط</Label>
                            <Input
                              placeholder="https://wa.me/..."
                              value={formData.withdraw_action_button_url}
                              onChange={(e) => setFormData({ ...formData, withdraw_action_button_url: e.target.value })}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="border border-border rounded-lg p-4 space-y-3 bg-secondary/20">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.notification_bar_enabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, notification_bar_enabled: checked })}
                  />
                  <Label className="cursor-pointer">تفعيل شريط إشعار متحرك في لوحة المستثمر</Label>
                </div>
                {formData.notification_bar_enabled && (
                  <div>
                    <Label>نص الإشعار (يظهر بشكل متحرك)</Label>
                    <Input
                      placeholder="مثال: اكتمل دفع الرسم"
                      value={formData.notification_bar_text}
                      onChange={(e) => setFormData({ ...formData, notification_bar_text: e.target.value })}
                    />
                  </div>
                )}
              </div>

              <div className="border border-border rounded-lg p-4 bg-secondary/20">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.auto_enable_withdraw_after_24h}
                    onCheckedChange={(checked) => setFormData({ ...formData, auto_enable_withdraw_after_24h: checked })}
                  />
                  <Label className="cursor-pointer">تفعيل زر سحب الأرباح تلقائياً بعد 24 ساعة (يظهر بنص: اجراء غير مكتمل - رسوم غير مدفوعه)</Label>
                </div>
              </div>

              <Button type="submit" variant="gold" className="w-full">
                {editingInvestor ? "تحديث" : "إضافة"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>


      {/* Investors List */}
      <div className="grid gap-4">
        {filteredInvestors.map((investor) => (
          <Card key={investor.id} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${investor.is_active ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                    <User className={`w-6 h-6 ${investor.is_active ? 'text-green-500' : 'text-red-500'}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{investor.full_name}</h3>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      {investor.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {investor.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <CreditCard className="w-3 h-3" />
                        {formatNumber(investor.subscription_amount)} ريال
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {formatNumber(investor.daily_profit)} ريال/يوم
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {investor.subscription_start_date}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="text-left ml-4">
                    <p className="text-muted-foreground text-xs">الأرباح المتراكمة</p>
                    <p className="text-accent font-bold">{formatNumber(investor.total_accumulated_profit)} ريال</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleView(investor)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(investor)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(investor.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredInvestors.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          لا يوجد مستثمرين
        </div>
      )}

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>تفاصيل المستثمر</DialogTitle>
          </DialogHeader>
          {viewingInvestor && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground text-sm">الاسم</p>
                  <p className="font-medium">{viewingInvestor.full_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">الهاتف</p>
                  <p className="font-medium">{viewingInvestor.phone || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">مبلغ الاشتراك</p>
                  <p className="font-medium">{formatNumber(viewingInvestor.subscription_amount)} ريال</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">الربح اليومي</p>
                  <p className="font-medium text-accent">{formatNumber(viewingInvestor.daily_profit)} ريال</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">الأرباح المتراكمة</p>
                  <p className="font-medium text-primary">{formatNumber(viewingInvestor.total_accumulated_profit)} ريال</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">تاريخ البداية</p>
                  <p className="font-medium">{viewingInvestor.subscription_start_date}</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold mb-3">حالة الرسوم (اضغط لتغيير الحالة)</h4>
                <div className="space-y-2">
                  {investorFees.map((fee) => (
                    <div
                      key={fee.id}
                      onClick={() => toggleFeePaid(fee.id, fee.is_paid)}
                      className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors"
                    >
                      <span>{fee.fee_type}</span>
                      {fee.is_paid ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-500" />
                      )}
                    </div>
                  ))}
                  {investorFees.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">لا توجد رسوم مسجلة</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminInvestors;
