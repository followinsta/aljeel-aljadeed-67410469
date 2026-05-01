import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Building2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaymentMethod {
  id: string;
  method_type: string;
  display_name: string | null;
  note: string | null;
  bank_name: string | null;
  account_number: string | null;
  account_holder_name: string | null;
  iban: string | null;
  whatsapp_number: string | null;
  telegram_link: string | null;
  is_active: boolean;
  custom_field_1_label: string | null;
  custom_field_1_value: string | null;
  custom_field_2_label: string | null;
  custom_field_2_value: string | null;
  custom_field_3_label: string | null;
  custom_field_3_value: string | null;
  custom_field_4_label: string | null;
  custom_field_4_value: string | null;
}

const emptyForm = {
  method_type: "bank_transfer",
  display_name: "",
  note: "",
  bank_name: "",
  account_number: "",
  account_holder_name: "",
  iban: "",
  whatsapp_number: "",
  telegram_link: "",
  is_active: true,
  custom_field_1_label: "",
  custom_field_1_value: "",
  custom_field_2_label: "",
  custom_field_2_value: "",
  custom_field_3_label: "",
  custom_field_3_value: "",
  custom_field_4_label: "",
  custom_field_4_value: "",
};

const AdminPaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    const { data, error } = await supabase
      .from("payment_methods")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("خطأ في تحميل طرق الدفع");
    } else {
      setPaymentMethods((data || []) as PaymentMethod[]);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const methodData = {
      method_type: formData.method_type,
      display_name: formData.display_name || null,
      note: formData.note || null,
      bank_name: formData.bank_name || null,
      account_number: formData.account_number || null,
      account_holder_name: formData.account_holder_name || null,
      iban: formData.iban || null,
      whatsapp_number: formData.whatsapp_number || null,
      telegram_link: formData.telegram_link || null,
      is_active: formData.is_active,
      custom_field_1_label: formData.custom_field_1_label || null,
      custom_field_1_value: formData.custom_field_1_value || null,
      custom_field_2_label: formData.custom_field_2_label || null,
      custom_field_2_value: formData.custom_field_2_value || null,
      custom_field_3_label: formData.custom_field_3_label || null,
      custom_field_3_value: formData.custom_field_3_value || null,
      custom_field_4_label: formData.custom_field_4_label || null,
      custom_field_4_value: formData.custom_field_4_value || null,
    };

    if (editingMethod) {
      const { error } = await supabase
        .from("payment_methods")
        .update(methodData)
        .eq("id", editingMethod.id);

      if (error) {
        toast.error("خطأ في تحديث طريقة الدفع");
      } else {
        toast.success("تم تحديث طريقة الدفع بنجاح");
        fetchPaymentMethods();
        setIsDialogOpen(false);
        resetForm();
      }
    } else {
      const { error } = await supabase.from("payment_methods").insert([methodData]);

      if (error) {
        toast.error("خطأ في إضافة طريقة الدفع");
      } else {
        toast.success("تم إضافة طريقة الدفع بنجاح");
        fetchPaymentMethods();
        setIsDialogOpen(false);
        resetForm();
      }
    }
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
    setFormData({
      method_type: method.method_type,
      display_name: method.display_name || "",
      note: method.note || "",
      bank_name: method.bank_name || "",
      account_number: method.account_number || "",
      account_holder_name: method.account_holder_name || "",
      iban: method.iban || "",
      whatsapp_number: method.whatsapp_number || "",
      telegram_link: method.telegram_link || "",
      is_active: method.is_active ?? true,
      custom_field_1_label: method.custom_field_1_label || "",
      custom_field_1_value: method.custom_field_1_value || "",
      custom_field_2_label: method.custom_field_2_label || "",
      custom_field_2_value: method.custom_field_2_value || "",
      custom_field_3_label: method.custom_field_3_label || "",
      custom_field_3_value: method.custom_field_3_value || "",
      custom_field_4_label: method.custom_field_4_label || "",
      custom_field_4_value: method.custom_field_4_value || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف طريقة الدفع هذه؟")) return;

    const { error } = await supabase.from("payment_methods").delete().eq("id", id);

    if (error) {
      toast.error("خطأ في حذف طريقة الدفع");
    } else {
      toast.success("تم حذف طريقة الدفع بنجاح");
      fetchPaymentMethods();
    }
  };

  const resetForm = () => {
    setEditingMethod(null);
    setFormData(emptyForm);
  };

  const getMethodTypeLabel = (type: string) => {
    switch (type) {
      case "bank_transfer":
        return "تحويل بنكي";
      case "binance_usdt":
        return "باينانس / عملة رقمية";
      case "custom":
        return "طريقة مخصصة";
      case "whatsapp":
        return "واتساب";
      case "telegram":
        return "تلقرام";
      default:
        return type;
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">إدارة طرق الدفع</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              إضافة طريقة دفع
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingMethod ? "تعديل طريقة الدفع" : "إضافة طريقة دفع جديدة"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>نوع الدفع</Label>
                <Select
                  value={formData.method_type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, method_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                    <SelectItem value="binance_usdt">باينانس / عملة رقمية</SelectItem>
                    <SelectItem value="custom">طريقة دفع مخصصة (4 حقول حرة)</SelectItem>
                    <SelectItem value="whatsapp">واتساب</SelectItem>
                    <SelectItem value="telegram">تلقرام</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.method_type === "bank_transfer" && (
                <>
                  <div>
                    <Label>اسم البنك</Label>
                    <Input
                      value={formData.bank_name}
                      onChange={(e) =>
                        setFormData({ ...formData, bank_name: e.target.value })
                      }
                      placeholder="مثال: البنك الأهلي السعودي"
                    />
                  </div>
                  <div>
                    <Label>اسم صاحب الحساب</Label>
                    <Input
                      value={formData.account_holder_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          account_holder_name: e.target.value,
                        })
                      }
                      placeholder="اسم صاحب الحساب"
                    />
                  </div>
                  <div>
                    <Label>رقم الحساب</Label>
                    <Input
                      value={formData.account_number}
                      onChange={(e) =>
                        setFormData({ ...formData, account_number: e.target.value })
                      }
                      placeholder="رقم الحساب البنكي"
                    />
                  </div>
                  <div>
                    <Label>رقم الآيبان (IBAN)</Label>
                    <Input
                      value={formData.iban}
                      onChange={(e) =>
                        setFormData({ ...formData, iban: e.target.value })
                      }
                      placeholder="SA0000000000000000000000"
                    />
                  </div>
                </>
              )}

              {formData.method_type === "binance_usdt" && (
                <>
                  <div>
                    <Label>اسم طريقة الدفع (يظهر للعميل)</Label>
                    <Input
                      value={formData.display_name}
                      onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                      placeholder="مثال: التحويل عبر باينانس USDT"
                    />
                  </div>
                  <div>
                    <Label>الشبكة</Label>
                    <Input
                      value={formData.bank_name}
                      onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                      placeholder="مثال: TRC-20 (TRX)"
                    />
                  </div>
                  <div>
                    <Label>ملاحظة (اختياري - تظهر تحت الشبكة)</Label>
                    <Textarea
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      placeholder="مثال: يمكن استلام BTC أو ETH عبر نفس العنوان"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label>عنوان المحفظة</Label>
                    <Input
                      value={formData.account_number}
                      onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                      placeholder="TFQAqn3fYQjU5W7WWWomVFvv62asLwWsjR"
                      className="font-mono text-xs"
                    />
                  </div>
                </>
              )}

              {formData.method_type === "custom" && (
                <>
                  <div>
                    <Label>اسم طريقة الدفع (يظهر للعميل)</Label>
                    <Input
                      value={formData.display_name}
                      onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                      placeholder="مثال: تحويل ويسترن يونيون"
                    />
                  </div>
                  <div>
                    <Label>ملاحظة (اختياري)</Label>
                    <Textarea
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      placeholder="ملاحظة تظهر للعميل"
                      rows={2}
                    />
                  </div>
                  {[1, 2, 3, 4].map((n) => {
                    const labelKey = `custom_field_${n}_label` as keyof typeof formData;
                    const valueKey = `custom_field_${n}_value` as keyof typeof formData;
                    return (
                      <div key={n} className="grid grid-cols-2 gap-2 p-3 bg-secondary/30 rounded">
                        <div>
                          <Label className="text-xs">عنوان الحقل {n}</Label>
                          <Input
                            value={formData[labelKey] as string}
                            onChange={(e) => setFormData({ ...formData, [labelKey]: e.target.value })}
                            placeholder="مثال: رقم الحساب"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">القيمة {n}</Label>
                          <Input
                            value={formData[valueKey] as string}
                            onChange={(e) => setFormData({ ...formData, [valueKey]: e.target.value })}
                            placeholder="القيمة"
                          />
                        </div>
                      </div>
                    );
                  })}
                  <p className="text-xs text-muted-foreground">
                    اترك الحقل فارغاً لعدم إظهاره. كل الحقول اختيارية.
                  </p>
                </>
              )}

              {formData.method_type === "whatsapp" && (
                <div>
                  <Label>رقم الواتساب</Label>
                  <Input
                    value={formData.whatsapp_number}
                    onChange={(e) =>
                      setFormData({ ...formData, whatsapp_number: e.target.value })
                    }
                    placeholder="966xxxxxxxxx"
                  />
                </div>
              )}

              {formData.method_type === "telegram" && (
                <div>
                  <Label>رابط التلقرام</Label>
                  <Input
                    value={formData.telegram_link}
                    onChange={(e) =>
                      setFormData({ ...formData, telegram_link: e.target.value })
                    }
                    placeholder="https://t.me/username"
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                />
                <Label>مفعّلة</Label>
              </div>

              <Button type="submit" className="w-full">
                {editingMethod ? "تحديث" : "إضافة"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {paymentMethods.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              لا توجد طرق دفع حالياً. قم بإضافة طريقة دفع جديدة.
            </CardContent>
          </Card>
        ) : (
          paymentMethods.map((method) => (
            <Card key={method.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold">
                      {method.display_name || getMethodTypeLabel(method.method_type)}
                    </h3>
                    {method.method_type === "bank_transfer" && (
                      <div className="text-sm text-muted-foreground">
                        <p>{method.bank_name}</p>
                        <p>الحساب: {method.account_number}</p>
                        {method.iban && <p>IBAN: {method.iban}</p>}
                      </div>
                    )}
                    {method.method_type === "binance_usdt" && (
                      <div className="text-sm text-muted-foreground">
                        <p>الشبكة: {method.bank_name}</p>
                        {method.note && <p className="text-xs italic">{method.note}</p>}
                        <p className="font-mono text-xs break-all">العنوان: {method.account_number}</p>
                      </div>
                    )}
                    {method.method_type === "custom" && (
                      <div className="text-sm text-muted-foreground space-y-0.5">
                        {method.note && <p className="text-xs italic">{method.note}</p>}
                        {[1, 2, 3, 4].map((n) => {
                          const label = (method as any)[`custom_field_${n}_label`];
                          const value = (method as any)[`custom_field_${n}_value`];
                          if (!label && !value) return null;
                          return <p key={n} className="text-xs">{label}: <span className="font-mono">{value}</span></p>;
                        })}
                      </div>
                    )}
                    {method.method_type === "whatsapp" && (
                      <p className="text-sm text-muted-foreground">
                        {method.whatsapp_number}
                      </p>
                    )}
                    {method.method_type === "telegram" && (
                      <p className="text-sm text-muted-foreground">
                        {method.telegram_link}
                      </p>
                    )}
                    {!method.is_active && (
                      <span className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded">
                        غير مفعّلة
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(method)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(method.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminPaymentMethods;
