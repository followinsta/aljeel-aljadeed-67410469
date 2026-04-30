import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Upload } from "lucide-react";
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

interface Package {
  id: string;
  package_number: number;
  investment_amount: number;
  daily_profit: number;
  investment_period_days: number;
  is_business: boolean;
  is_active: boolean;
  is_featured: boolean;
  image_url: string | null;
  description: string | null;
  name: string | null;
  currency: string;
}

const AdminPackages = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [formData, setFormData] = useState({
    package_number: 1,
    investment_amount: 0,
    daily_profit: 0,
    investment_period_days: 120,
    is_business: false,
    is_active: true,
    is_featured: false,
    image_url: "",
    description: "",
    name: "",
    currency: "SAR",
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    const { data, error } = await supabase
      .from("packages")
      .select("*")
      .order("package_number", { ascending: true });

    if (error) {
      toast.error("خطأ في تحميل الباقات");
    } else {
      setPackages(data || []);
    }
    setIsLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `package-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("packages")
      .upload(filePath, file);

    if (uploadError) {
      toast.error("خطأ في رفع الصورة");
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("packages").getPublicUrl(filePath);
    setFormData({ ...formData, image_url: data.publicUrl });
    setUploading(false);
    toast.success("تم رفع الصورة بنجاح");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const packageData = {
      package_number: formData.package_number,
      investment_amount: formData.investment_amount,
      daily_profit: formData.daily_profit,
      investment_period_days: formData.investment_period_days,
      is_business: formData.is_business,
      is_active: formData.is_active,
      is_featured: formData.is_featured,
      image_url: formData.image_url || null,
      description: formData.description || null,
      name: formData.name || null,
      currency: formData.currency,
    };

    if (editingPackage) {
      const { error } = await supabase
        .from("packages")
        .update(packageData)
        .eq("id", editingPackage.id);

      if (error) {
        toast.error("خطأ في تحديث الباقة");
      } else {
        toast.success("تم تحديث الباقة بنجاح");
        fetchPackages();
        setIsDialogOpen(false);
        resetForm();
      }
    } else {
      const { error } = await supabase.from("packages").insert([packageData]);

      if (error) {
        toast.error("خطأ في إضافة الباقة");
      } else {
        toast.success("تم إضافة الباقة بنجاح");
        fetchPackages();
        setIsDialogOpen(false);
        resetForm();
      }
    }
  };

  const handleEdit = (pkg: Package) => {
    setEditingPackage(pkg);
    setFormData({
      package_number: pkg.package_number,
      investment_amount: pkg.investment_amount,
      daily_profit: pkg.daily_profit,
      investment_period_days: pkg.investment_period_days || 120,
      is_business: pkg.is_business || false,
      is_active: pkg.is_active ?? true,
      is_featured: pkg.is_featured || false,
      image_url: pkg.image_url || "",
      description: pkg.description || "",
      name: pkg.name || "",
      currency: pkg.currency || "SAR",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الباقة؟")) return;

    const { error } = await supabase.from("packages").delete().eq("id", id);

    if (error) {
      toast.error("خطأ في حذف الباقة");
    } else {
      toast.success("تم حذف الباقة بنجاح");
      fetchPackages();
    }
  };

  const resetForm = () => {
    setEditingPackage(null);
    setFormData({
      package_number: packages.length + 1,
      investment_amount: 0,
      daily_profit: 0,
      investment_period_days: 120,
      is_business: false,
      is_active: true,
      is_featured: false,
      image_url: "",
      description: "",
      name: "",
      currency: "SAR",
    });
  };

  if (isLoading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">إدارة الباقات</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              إضافة باقة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPackage ? "تعديل الباقة" : "إضافة باقة جديدة"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>اسم الباقة</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="اسم الباقة"
                  />
                </div>
                <div>
                  <Label>رقم الباقة</Label>
                  <Input
                    type="number"
                    value={formData.package_number}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        package_number: parseInt(e.target.value),
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <Label>العملة</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SAR">الريال السعودي (SAR)</SelectItem>
                    <SelectItem value="USD">الدولار الأمريكي (USD)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>مبلغ الاستثمار ({formData.currency === "USD" ? "دولار" : "ريال"})</Label>
                  <Input
                    type="number"
                    value={formData.investment_amount}
                    onChange={(e) =>
                      setFormData({ ...formData, investment_amount: parseFloat(e.target.value) })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>الربح اليومي ({formData.currency === "USD" ? "دولار" : "ريال"})</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.daily_profit}
                    onChange={(e) =>
                      setFormData({ ...formData, daily_profit: parseFloat(e.target.value) })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <Label>مدة الاستثمار (أيام)</Label>
                <Input
                  type="number"
                  value={formData.investment_period_days}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      investment_period_days: parseInt(e.target.value),
                    })
                  }
                />
              </div>

              <div>
                <Label>الوصف</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="وصف الباقة"
                />
              </div>

              <div>
                <Label>صورة الباقة</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  {uploading && <span className="text-sm">جاري الرفع...</span>}
                </div>
                {formData.image_url && (
                  <img
                    src={formData.image_url}
                    alt="معاينة"
                    className="mt-2 w-32 h-32 object-cover rounded"
                  />
                )}
              </div>

              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_active: checked })
                    }
                  />
                  <Label>مفعّلة</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_business}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_business: checked })
                    }
                  />
                  <Label>باقة أعمال</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_featured}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_featured: checked })
                    }
                  />
                  <Label>مميزة</Label>
                </div>
              </div>

              <Button type="submit" className="w-full">
                {editingPackage ? "تحديث" : "إضافة"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {packages.map((pkg) => (
          <Card key={pkg.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                {pkg.image_url && (
                  <img
                    src={pkg.image_url}
                    alt={pkg.name || `باقة ${pkg.package_number}`}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div>
                  <h3 className="font-bold">
                    {pkg.name || `باقة ${pkg.package_number}`}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    الاستثمار: {pkg.investment_amount.toLocaleString()} {pkg.currency === "USD" ? "دولار" : "ريال"} |
                    الربح اليومي: {pkg.daily_profit} {pkg.currency === "USD" ? "دولار" : "ريال"}
                  </p>
                  <div className="flex gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded ${pkg.currency === "USD" ? "bg-green-500/20 text-green-500" : "bg-blue-500/20 text-blue-500"}`}>
                      {pkg.currency === "USD" ? "USD 💵" : "SAR 🇸🇦"}
                    </span>
                    {pkg.is_business && (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                        أعمال
                      </span>
                    )}
                    {!pkg.is_active && (
                      <span className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded">
                        غير مفعّلة
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleEdit(pkg)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDelete(pkg.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminPackages;
