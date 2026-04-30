import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  bank_name: string | null;
  account_number: string | null;
  account_holder_name: string | null;
  iban: string | null;
  whatsapp_number: string | null;
  telegram_link: string | null;
  is_active: boolean;
}

const AdminPaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState({
    method_type: "bank_transfer",
    bank_name: "",
    account_number: "",
    account_holder_name: "",
    iban: "",
    whatsapp_number: "",
    telegram_link: "",
    is_active: true,
  });

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
      setPaymentMethods(data || []);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const methodData = {
      method_type: formData.method_type,
      bank_name: formData.bank_name || null,
      account_number: formData.account_number || null,
      account_holder_name: formData.account_holder_name || null,
      iban: formData.iban || null,
      whatsapp_number: formData.whatsapp_number || null,
      telegram_link: formData.telegram_link || null,
      is_active: formData.is_active,
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
      bank_name: method.bank_name || "",
      account_number: method.account_number || "",
      account_holder_name: method.account_holder_name || "",
      iban: method.iban || "",
      whatsapp_number: method.whatsapp_number || "",
      telegram_link: method.telegram_link || "",
      is_active: method.is_active ?? true,
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
    setFormData({
      method_type: "bank_transfer",
      bank_name: "",
      account_number: "",
      account_holder_name: "",
      iban: "",
      whatsapp_number: "",
      telegram_link: "",
      is_active: true,
    });
  };

  const getMethodTypeLabel = (type: string) => {
    switch (type) {
      case "bank_transfer":
        return "تحويل بنكي";
      case "binance_usdt":
        return "باينانس USDT (TRC-20)";
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
          <DialogContent className="max-w-lg">
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
                    <SelectItem value="binance_usdt">باينانس USDT (TRC-20)</SelectItem>
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
                    <Label>الشبكة</Label>
                    <Input
                      value={formData.bank_name}
                      onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                      placeholder="مثال: TRC-20 (TRX)"
                    />
                  </div>
                  <div>
                    <Label>عنوان المحفظة (USDT Address)</Label>
                    <Input
                      value={formData.account_number}
                      onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                      placeholder="TFQAqn3fYQjU5W7WWWomVFvv62asLwWsjR"
                      className="font-mono text-xs"
                    />
                  </div>
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
                      {getMethodTypeLabel(method.method_type)}
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
                        <p>{method.bank_name}</p>
                        <p className="font-mono text-xs break-all">العنوان: {method.account_number}</p>
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
