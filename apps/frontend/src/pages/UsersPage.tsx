import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Shield, Lock, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import usersApi from "../api/users";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useAuth } from "../hooks/useAuth";
import { toast } from "sonner";
import { translateServerError } from "../lib/error-translations";
import { toPersianDigits } from "@/lib/utils";
import { useForm } from "react-hook-form";

interface User {
  id: number;
  phone: string;
  role: string;
  first_name: string;
  last_name: string;
}

interface UserFormData {
  phone: string;
  role: string;
  first_name: string;
  last_name: string;
  password?: string;
}

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const addForm = useForm<UserFormData>();
  const editForm = useForm<UserFormData>();

  const isSuperAdmin = currentUser?.role === "super_admin";

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      const data = await usersApi.getAllUsers();
      setUsers(data || []);
    } catch (err: unknown) {
      toast.error(translateServerError(err) || "خطا در دریافت کاربران");
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on selected role
  const filteredUsers =
    roleFilter === "all"
      ? users
      : users.filter((user) => user.role === roleFilter);

  const handleAddUser = async (data: UserFormData) => {
    if (!data.password || data.password.length < 8) {
      toast.error("رمز عبور باید حداقل 8 کاراکتر باشد");
      return;
    }

    const toastId = toast.loading("در حال ایجاد کاربر...");
    setIsSubmitting(true);

    try {
      await usersApi.createUser(data);
      toast.success("کاربر با موفقیت ساخته شد!", { id: toastId });
      setIsAddDialogOpen(false);
      addForm.reset();
      fetchAllUsers();
    } catch (err: unknown) {
      toast.error(translateServerError(err) || "خطا در ایجاد کاربر", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = async (data: UserFormData) => {
    if (!selectedUser) return;

    const toastId = toast.loading("در حال بروزرسانی کاربر");
    setIsSubmitting(true);

    try {
      const updateData = { ...data };
      if (!updateData.password) {
        delete updateData.password;
      }
      await usersApi.updateUser(selectedUser.id, updateData);
      toast.success("کاربر با موفقیت بروز شد!", { id: toastId });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      editForm.reset();
      fetchAllUsers();
    } catch (err: unknown) {
      toast.error(translateServerError(err) || "خطا در بروزرسانی کاربر", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    const toastId = toast.loading("در حال حذف کاربر...");

    try {
      await usersApi.deleteUser(selectedUser.id);
      toast.success("کاربر با موفقیت حذف شد!", { id: toastId });
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      fetchAllUsers();
    } catch (err: unknown) {
      toast.error(translateServerError(err) || "خطا در حذف کاربر", { id: toastId });
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    editForm.reset({
      phone: user.phone,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "admin":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "user":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  // Check if user has admin or super_admin role
  const hasAccess =
    currentUser?.role === "admin" || currentUser?.role === "super_admin";

  if (!hasAccess) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-6 w-6 text-destructive" />
              <CardTitle>دسترسی رد شد</CardTitle>
            </div>
            <CardDescription>
              شما اجازه دسترسی به این صفحه را ندارید
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              فقط مدیران می‌توانند این صفحه را مشاهده کنند. اگر فکر می‌کنید باید
              به این صفحه دسترسی داشته باشید، لطفاً با مدیر سیستم خود تماس
              بگیرید.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-6 w-6" />
                <CardTitle>داشبورد کاربران</CardTitle>
              </div>
              <CardDescription>مدیریت تمام کاربران</CardDescription>
            </div>
            {isSuperAdmin && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 ml-2" />
                اضافه کردن کاربر
              </Button>
            )}
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="role-filter" className="whitespace-nowrap">
                فیلتر بر اساس نقش:
              </Label>
              <Select
                value={roleFilter}
                onValueChange={setRoleFilter}
              >
                <SelectTrigger id="role-filter" className="w-[200px]">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ALL ROLES</SelectItem>
                  <SelectItem value="super_admin">SUPER ADMIN</SelectItem>
                  <SelectItem value="admin">ADMIN</SelectItem>
                  <SelectItem value="user">USER</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">
                {toPersianDigits(filteredUsers.length)} {"کاربر"}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size={32} />
            </div>
          ) : filteredUsers.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              کاربری یافت نشد
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-border bg-muted/50">
                    <th className="text-right p-3 font-semibold">ID</th>
                    <th className="text-right p-3 font-semibold"> کاربرنام</th>
                    <th className="text-right p-3 font-semibold">شماره همراه</th>
                    <th className="text-right p-3 font-semibold">نقش</th>
                    {isSuperAdmin && (
                      <th className="text-right p-3 font-semibold">عملیات</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-border hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-3 font-medium">{toPersianDigits(user.id)}</td>
                      <td className="p-3">
                        {user.first_name} {user.last_name}
                      </td>
                      <td className="p-3 text-right" dir="ltr">
                        {toPersianDigits(user.phone)}
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                            user.role,
                          )}`}
                        >
                          {user.role.replace("_", " ").toUpperCase()}
                        </span>
                      </td>
                      {isSuperAdmin && (
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditDialog(user)}
                            >
                              ویرایش
                              <Pencil className="h-3 w-3 mr-1" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openDeleteDialog(user)}
                            >
                              حذف
                              <Trash2 className="h-3 w-3 mr-1" />
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader style={{ textAlign: "center" }}>
            <DialogTitle>افزودن کاربر جدید</DialogTitle>
            <DialogDescription>ایجاد کاربر جدید با نقش خاص</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={addForm.handleSubmit(handleAddUser)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-first-name">نام</Label>
                <Input
                  id="add-first-name"
                  {...addForm.register("first_name", { required: true })}
                  placeholder="جان"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-last-name">نام خانوادگی</Label>
                <Input
                  id="add-last-name"
                  {...addForm.register("last_name", { required: true })}
                  placeholder="دو"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-phone">شماره همراه</Label>
              <Input
                id="add-phone"
                dir="ltr"
                {...addForm.register("phone", { required: true })}
                placeholder="+989123456789"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-password">رمز عبور</Label>
              <Input
                id="add-password"
                type="password"
                {...addForm.register("password", { required: true })}
                placeholder="حداقل 8 کاراکتر"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-role">نقش</Label>
              <Select
                onValueChange={(value) => addForm.setValue("role", value)}
                defaultValue="user"
              >
                <SelectTrigger id="add-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">SUPER ADMIN</SelectItem>
                  <SelectItem value="admin">ADMIN</SelectItem>
                  <SelectItem value="user">USER</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                disabled={isSubmitting}
                className="ml-2"
              >
                لغو
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size={16} />
                    در حال ایجاد...
                  </>
                ) : (
                  "ایجاد"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader style={{ textAlign: "center" }}>
            <DialogTitle>ویرایش کاربر</DialogTitle>
            <DialogDescription>ویرایش اطلاعات کاربر</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={editForm.handleSubmit(handleEditUser)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-first-name">نام</Label>
                <Input
                  id="edit-first-name"
                  {...editForm.register("first_name", { required: true })}
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-last-name">نام خانوادگی</Label>
                <Input
                  id="edit-last-name"
                  {...editForm.register("last_name", { required: true })}
                  placeholder="Doe"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">شماره همراه</Label>
              <Input
                id="edit-phone"
                dir="ltr"
                {...editForm.register("phone", { required: true })}
                placeholder="+1234567890"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">
                رمز عبور (برای به‌روز بودن، خالی بگذارید)
              </Label>
              <Input
                id="edit-password"
                type="password"
                {...editForm.register("password")}
                placeholder="رمز عبور جدید"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">نقش</Label>
              <Select
                onValueChange={(value) => editForm.setValue("role", value)}
                value={editForm.watch("role")}
              >
                <SelectTrigger id="edit-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">SUPER ADMIN</SelectItem>
                  <SelectItem value="admin">ADMIN</SelectItem>
                  <SelectItem value="user">USER</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isSubmitting}
                className="ml-2"
              >
                لغو
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size={16} />
                    در حال بروزرسانی...
                  </>
                ) : (
                  "بروزرسانی"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader style={{ textAlign: "center" }}>
            <DialogTitle>حذف کاربر</DialogTitle>
            <DialogDescription>
              آیا مطمئن هستید که می‌خواهید این کاربر را حذف کنید؟ این اقدام قابل
              بازگشت نیست.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="bg-muted p-4 rounded-lg">
              <p className="font-medium">
                {selectedUser.first_name} {selectedUser.last_name}
              </p>
              <p className="text-sm text-muted-foreground" dir="ltr">
                {toPersianDigits(selectedUser.phone)}
              </p>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${getRoleBadgeColor(
                  selectedUser.role,
                )}`}
              >
                {selectedUser.role.replace("_", " ").toUpperCase()}
              </span>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="ml-2"
            >
              لغو
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteUser}
            >
              حذف کاربر
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
