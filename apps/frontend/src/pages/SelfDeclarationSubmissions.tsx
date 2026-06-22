import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ClipboardList,
  Eye,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  File,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import adminFormsApi from "../api/admin-forms";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { toast } from "sonner";
import { translateServerError } from "../lib/error-translations";
import { cn, toPersianDigits } from "@/lib/utils";

interface FieldDefinition {
  name: string;
  label: string;
  type: string;
  options?: { label: string; value: string }[];
}

interface SelfDeclarationUser {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
}

interface SelfDeclaration {
  id: number;
  user_id: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
  status: "pending" | "approved" | "returned";
  admin_notes: string | null;
  correction_fields: string[] | null;
  created_at: string;
  updated_at: string;
  user: SelfDeclarationUser;
}

const statusConfig = {
  pending: { icon: Clock, label: "در انتظار بررسی", class: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950" },
  approved: { icon: CheckCircle2, label: "تأیید شده", class: "text-green-600 bg-green-50 dark:bg-green-950" },
  returned: { icon: AlertTriangle, label: "بازگشت داده شده", class: "text-red-600 bg-red-50 dark:bg-red-950" },
};

export function SelfDeclarationSubmissions() {
  const [submissions, setSubmissions] = useState<SelfDeclaration[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [schemaFields, setSchemaFields] = useState<FieldDefinition[]>([]);
  const [reviewingId, setReviewingId] = useState<number | null>(null);
  const [reviewAction, setReviewAction] = useState<"approved" | "returned">("approved");
  const [reviewNotes, setReviewNotes] = useState("");
  const [correctionFields, setCorrectionFields] = useState<string[]>([]);

  useEffect(() => {
    fetchSubmissions();
    fetchSchema();
  }, []);

  const fetchSchema = async () => {
    try {
      const forms = await adminFormsApi.getAll();
      const selfDeclForm = forms.find((f: { slug: string }) => f.slug === "self-declaration");
      if (selfDeclForm?.fields) {
        setSchemaFields(selfDeclForm.fields);
      }
    } catch {
      // schema fetch is non-critical
    }
  };

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const data = await adminFormsApi.getSelfDeclarations();
      setSubmissions(data || []);
    } catch (err: unknown) {
      toast.error(translateServerError(err) || "خطا در دریافت اظهارنامه‌ها");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
    setReviewingId(null);
  };

  const startReview = (id: number) => {
    setReviewingId(id);
    setReviewAction("approved");
    setReviewNotes("");
    setCorrectionFields([]);
  };

  const handleReview = async (id: number) => {
    try {
      await adminFormsApi.reviewSelfDeclaration(id, {
        status: reviewAction,
        admin_notes: reviewAction === "returned" ? reviewNotes : undefined,
        correction_fields: reviewAction === "returned" ? correctionFields : undefined,
      });
      toast.success(
        reviewAction === "approved"
          ? "اظهارنامه تأیید شد"
          : "اظهارنامه برای اصلاح بازگشت داده شد",
      );
      setReviewingId(null);
      setExpandedId(null);
      await fetchSubmissions();
    } catch (err: unknown) {
      toast.error(translateServerError(err) || "خطا در بررسی اظهارنامه");
    }
  };

  const getFieldDef = (name: string) =>
    schemaFields.find((f) => f.name === name);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderValue = (fieldKey: string, value: any) => {
    const field = getFieldDef(fieldKey);
    const isFileUrl =
      typeof value === "string" &&
      (value.startsWith("/uploads/") || value.startsWith("http"));
    if (isFileUrl) {
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-primary hover:underline"
        >
          <File className="h-3 w-3" />
          مشاهده فایل
          <ExternalLink className="h-3 w-3" />
        </a>
      );
    }
    if (Array.isArray(value)) {
      if (field?.options) {
        return value
          .map(
            (v) =>
              field.options?.find((o) => o.value === v)?.label || v,
          )
          .join(", ");
      }
      return value.join(", ");
    }
    if (typeof value === "object" && value !== null) {
      return Object.entries(value)
        .map(([k, v]) => `${k}: ${v}`)
        .join(" | ");
    }
    if (field?.options) {
      const option = field.options.find((o) => o.value === value);
      if (option) return option.label;
    }
    return String(value ?? "");
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <ClipboardList className="h-6 w-6" />
            <CardTitle>اظهارنامه‌های کاربران</CardTitle>
          </div>
          <CardDescription>
            مشاهده و بررسی اظهارنامه‌های ارسال شده توسط کاربران
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size={32} />
            </div>
          ) : submissions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              هیچ اظهارنامه‌ای ارسال نشده است
            </p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {toPersianDigits(submissions.length)} اظهارنامه ارسال شده
              </p>
              {submissions.map((sub) => {
                const StatusIcon = statusConfig[sub.status].icon;
                return (
                  <Card key={sub.id} className="overflow-hidden">
                    <button
                      onClick={() => toggleExpand(sub.id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors text-right"
                    >
                      <div className="flex items-center gap-3">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {sub.user?.first_name} {sub.user?.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground" dir="ltr">
                            {sub.user?.phone}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                          statusConfig[sub.status].class,
                        )}>
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig[sub.status].label}
                        </span>
                        {expandedId === sub.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </button>
                    {expandedId === sub.id && (
                      <div className="border-t px-4 py-3 space-y-4 bg-muted/20">
                        <div className="space-y-2">
                          {schemaFields.map((field) => {
                            const value = sub.data[field.name];
                            if (value === undefined || value === null || value === "") return null;
                            return (
                              <div key={field.name} className="grid grid-cols-3 gap-2 text-sm">
                                <span className="font-medium text-muted-foreground col-span-1">
                                  {field.label}
                                </span>
                                <span className="col-span-2">
                                  {renderValue(field.name, value)}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {sub.admin_notes && (
                          <div className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm">
                            <span className="font-medium text-yellow-700 dark:text-yellow-400">
                              یادداشت مدیریت:
                            </span>
                            <p className="text-yellow-600 dark:text-yellow-500 mt-1">
                              {sub.admin_notes}
                            </p>
                          </div>
                        )}

                        {sub.correction_fields && sub.correction_fields.length > 0 && (
                          <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg text-sm">
                            <span className="font-medium text-red-700 dark:text-red-400">
                              فیلدهای نیازمند اصلاح:
                            </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {sub.correction_fields.map((fieldName) => {
                                const fieldDef = getFieldDef(fieldName);
                                return (
                                  <span
                                    key={fieldName}
                                    className="inline-flex items-center px-2 py-0.5 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded text-xs"
                                  >
                                    {fieldDef?.label || fieldName}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {sub.status !== "approved" && (
                          <div className="border-t pt-3">
                            {reviewingId === sub.id ? (
                              <div className="space-y-3">
                                <div className="flex gap-2">
                                  <Button
                                    variant={reviewAction === "approved" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setReviewAction("approved")}
                                  >
                                    <CheckCircle2 className="ml-1 h-4 w-4" />
                                    تأیید
                                  </Button>
                                  <Button
                                    variant={reviewAction === "returned" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setReviewAction("returned")}
                                  >
                                    <AlertTriangle className="ml-1 h-4 w-4" />
                                    بازگشت برای اصلاح
                                  </Button>
                                </div>
                                {reviewAction === "returned" && (
                                  <>
                                    <div className="space-y-2">
                                      <Label htmlFor={`notes-${sub.id}`}>
                                        علت بازگشت (الزامی)
                                      </Label>
                                      <Textarea
                                        id={`notes-${sub.id}`}
                                        value={reviewNotes}
                                        onChange={(e) => setReviewNotes(e.target.value)}
                                        placeholder="توضیحات اصلاحات مورد نیاز را وارد کنید"
                                        rows={3}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>فیلدهای نیازمند اصلاح (الزامی)</Label>
                                      <div className="space-y-1 pr-2 max-h-48 overflow-y-auto border rounded-md p-2">
                                        {schemaFields.length === 0 ? (
                                          <p className="text-sm text-muted-foreground">
                                            در حال بارگذاری فیلدها...
                                          </p>
                                        ) : (
                                          schemaFields.map((field) => (
                                            <div key={field.name} className="flex items-center gap-2">
                                              <Checkbox
                                                id={`field-${sub.id}-${field.name}`}
                                                checked={correctionFields.includes(field.name)}
                                                onCheckedChange={(checked) => {
                                                  if (checked) {
                                                    setCorrectionFields([...correctionFields, field.name]);
                                                  } else {
                                                    setCorrectionFields(
                                                      correctionFields.filter((f) => f !== field.name),
                                                    );
                                                  }
                                                }}
                                              />
                                              <Label
                                                htmlFor={`field-${sub.id}-${field.name}`}
                                                className="cursor-pointer text-sm"
                                              >
                                                {field.label}
                                              </Label>
                                            </div>
                                          ))
                                        )}
                                      </div>
                                    </div>
                                  </>
                                )}
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleReview(sub.id)}
                                    disabled={reviewAction === "returned" && (!reviewNotes.trim() || correctionFields.length === 0)}
                                  >
                                    ثبت بررسی
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    onClick={() => setReviewingId(null)}
                                  >
                                    انصراف
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => startReview(sub.id)}
                              >
                                بررسی اظهارنامه
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
