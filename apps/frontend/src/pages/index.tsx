import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  UserCheck,
  Users,
  FileSignature,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  FileText,
  ClipboardList,
  ChevronLeft,
  ListChecks,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "../hooks/useAuth";
import { useActiveForms } from "../hooks/useActiveForms";
import formsApi from "../api/forms";
import adminFormsApi from "../api/admin-forms";
import { toPersianDigits } from "@/lib/utils";
import Image from "@/assets/IMG_20260405_115046_685.jpg";

interface Submission {
  id: number;
  form_id: number;
  created_at: string;
  form?: {
    id: number;
    title: string;
    slug: string;
  };
}

interface SelfDeclaration {
  id: number;
  status: "pending" | "approved" | "returned";
  admin_notes?: string | null;
  correction_fields?: string[] | null;
}

interface FormWithNotification {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  show_notification?: boolean;
  notification_title?: string | null;
  notification_text?: string | null;
}

interface AdminDashboardStats {
  users: {
    total: number;
    byStatus: {
      not_started: number;
      form_completed: number;
      awaiting_interview: number;
      accepted: number;
      not_meeting_requirements: number;
    };
  };
  selfDeclarations: {
    total: number;
    byStatus: {
      pending: number;
      approved: number;
      returned: number;
    };
  };
}

interface Notification {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  action?: { label: string; to: string };
}

const statusConfig = {
  pending: {
    icon: Clock,
    label: "در انتظار تأیید",
    color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950",
  },
  approved: {
    icon: CheckCircle2,
    label: "تأیید شده",
    color: "text-green-600 bg-green-50 dark:bg-green-950",
  },
  returned: {
    icon: AlertTriangle,
    label: "نیازمند اصلاح",
    color: "text-red-600 bg-red-50 dark:bg-red-950",
  },
} as const;

export function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { forms, loading: formsLoading } = useActiveForms();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selfDeclaration, setSelfDeclaration] =
    useState<SelfDeclaration | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const [adminStats, setAdminStats] = useState<AdminDashboardStats | null>(
    null,
  );
  const [adminStatsLoading, setAdminStatsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const promises = [
          formsApi.getMyAllSubmissions().catch(() => []),
          formsApi.getMySelfDeclaration().catch(() => null),
        ];

        if (isAdmin) {
          promises.push(adminFormsApi.getDashboardStats().catch(() => null));
        }

        const [submissionsData, selfDeclData, adminStatsData] =
          await Promise.all(promises);
        if (cancelled) return;
        setSubmissions(submissionsData || []);
        setSelfDeclaration(selfDeclData);
        if (adminStatsData) {
          setAdminStats(adminStatsData);
        }
      } catch {
        // Silently handle
      } finally {
        if (!cancelled) {
          setLoading(false);
          setAdminStatsLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const notifications: Notification[] = [];

  if (selfDeclaration) {
    const status = statusConfig[selfDeclaration.status];
    const StatusIcon = status.icon;
    notifications.push({
      id: "self-declaration",
      title: `اظهارنامه ${status.label}`,
      description:
        selfDeclaration.status === "returned"
          ? "اظهارنامه شما نیازمند اصلاح است. لطفاً اقدام کنید."
          : selfDeclaration.status === "approved"
            ? "اظهارنامه شما توسط مدیریت تأیید شد."
            : "اظهارنامه شما در انتظار بررسی مدیریت است.",
      icon: StatusIcon,
      color: status.color,
      action:
        selfDeclaration.status === "returned"
          ? { label: "اصلاح اظهارنامه", to: "/forms/self-declaration" }
          : undefined,
    });
  }

  const formsWithNotification = forms as FormWithNotification[];
  for (const form of formsWithNotification) {
    if (form.show_notification) {
      notifications.push({
        id: `form-${form.slug}`,
        title: form.notification_title || form.title,
        description:
          form.notification_text || `فرم "${form.title}" در دسترس است`,
        icon: FileText,
        color: "text-blue-600 bg-blue-50 dark:bg-blue-950",
        action: {
          label: "پر کردن فرم",
          to: `/forms/${form.slug}`,
        },
      });
    }
  }

  const selfDeclSubmitted = !!selfDeclaration;
  const submittedFormIds = new Set(submissions.map((s) => s.form_id));
  const remainingForms = forms.filter((f) => !submittedFormIds.has(f.id));
  const completedForms = forms.filter((f) => submittedFormIds.has(f.id));

  const totalForms = forms.length + 1;
  const totalSubmissions = submissions.length + (selfDeclSubmitted ? 1 : 0);
  const totalRemaining = remainingForms.length + (selfDeclSubmitted ? 0 : 1);
  const selfDeclForm = {
    id: -1,
    slug: "self-declaration",
    title: "اظهارنامه",
    description: "فرم اظهارنامه شخصی",
  };

  if (loading || formsLoading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <img src={Image} className="rounded-2xl" />
      </div>

      <div>
        <h1 className="text-2xl font-bold">
          خوش آمدید، {user?.first_name} {user?.last_name}
        </h1>
        <p className="text-muted-foreground mt-1">
          به داشبورد {isAdmin ? "مدیریت" : "کاربری"} خود خوش آمدید
        </p>
      </div>

      {isAdmin && (
        <>
          {adminStatsLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : adminStats ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <UsersStatsCard stats={adminStats.users} />
                <SelfDeclarationStatsCard stats={adminStats.selfDeclarations} />
              </div>
            </>
          ) : null}
        </>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RegistrationStatusCard
          selfDeclaration={selfDeclaration}
          interviewStatus={user?.interview_status}
          navigate={navigate}
        />
        <StatsCard
          totalForms={totalForms}
          submissionsCount={totalSubmissions}
          remainingCount={totalRemaining}
          selfDeclaration={selfDeclaration}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QuickAccessCard
          remainingForms={remainingForms}
          completedForms={completedForms}
          selfDeclaration={selfDeclaration}
          selfDeclForm={selfDeclForm}
          navigate={navigate}
        />
        <NotificationsCard notifications={notifications} navigate={navigate} />
      </div>
    </div>
  );
}

function RegistrationStatusCard({
  selfDeclaration,
  interviewStatus,
  navigate,
}: {
  selfDeclaration: SelfDeclaration | null;
  interviewStatus: string | null | undefined;
  navigate: ReturnType<typeof useNavigate>;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">وضعیت ثبت‌نام</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {!selfDeclaration ? (
          <div className="text-center py-4 space-y-4">
            <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">
              اظهارنامه هنوز تکمیل نشده است
            </p>
            <Button onClick={() => navigate("/forms/self-declaration")}>
              تکمیل اظهارنامه
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {(() => {
              const status = statusConfig[selfDeclaration.status];
              const StatusIcon = status.icon;
              return (
                <div
                  className={`flex items-center gap-2 p-3 rounded-lg ${status.color}`}>
                  <StatusIcon className="h-5 w-5 shrink-0" />
                  <span className="font-medium">{status.label}</span>
                </div>
              );
            })()}
            {selfDeclaration.status === "approved" && interviewStatus && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600">
                {interviewStatus === "awaiting_interview" && (
                  <>
                    <Clock className="h-5 w-5 shrink-0" />
                    <span className="font-medium">در انتظار مصاحبه</span>
                  </>
                )}
                {interviewStatus === "accepted" && (
                  <>
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                    <span className="font-medium">پذیرفته شده</span>
                  </>
                )}
                {interviewStatus === "not_meeting_requirements" && (
                  <>
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <span className="font-medium">عدم احراز شرایط</span>
                  </>
                )}
              </div>
            )}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/forms/self-declaration")}>
              مشاهده اظهارنامه
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatsCard({
  totalForms,
  submissionsCount,
  remainingCount,
  selfDeclaration,
}: {
  totalForms: number;
  submissionsCount: number;
  remainingCount: number;
  selfDeclaration: SelfDeclaration | null;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">آمار فرم‌ها</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold text-primary">
              {toPersianDigits(totalForms)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">فرم فعال</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {toPersianDigits(submissionsCount)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">ارسال شده</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold text-amber-600">
              {toPersianDigits(remainingCount)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">باقی‌مانده</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-lg font-bold">
              {selfDeclaration
                ? statusConfig[selfDeclaration.status].label
                : "تکمیل نشده"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              وضعیت اظهارنامه
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickAccessCard({
  remainingForms,
  completedForms,
  selfDeclaration,
  selfDeclForm,
  navigate,
}: {
  remainingForms: {
    id: number;
    slug: string;
    title: string;
    description: string | null;
  }[];
  completedForms: { id: number; slug: string; title: string }[];
  selfDeclaration: SelfDeclaration | null;
  selfDeclForm: {
    id: number;
    slug: string;
    title: string;
    description: string;
  };
  navigate: ReturnType<typeof useNavigate>;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileSignature className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">فرم‌های قابل پر کردن</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {(remainingForms.length > 0 || !selfDeclaration) && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-medium">
                نیاز به تکمیل
              </p>
              {remainingForms.map((form) => (
                <div
                  key={form.slug}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors mb-2">
                  <div className="min-w-0 flex-1 ml-2">
                    <p className="font-medium text-sm truncate">{form.title}</p>
                    {form.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {form.description}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => navigate(`/forms/${form.slug}`)}>
                    <ChevronLeft className="h-4 w-4 ml-1" />
                    پر کردن
                  </Button>
                </div>
              ))}
              {!selfDeclaration && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors mb-2">
                  <div className="min-w-0 flex-1 ml-2">
                    <p className="font-medium text-sm truncate">
                      {selfDeclForm.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {selfDeclForm.description}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => navigate(`/forms/${selfDeclForm.slug}`)}>
                    <ChevronLeft className="h-4 w-4 ml-1" />
                    پر کردن
                  </Button>
                </div>
              )}
            </div>
          )}
          {(completedForms.length > 0 || selfDeclaration) && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-medium">
                تکمیل شده
              </p>
              {completedForms.map((form) => (
                <div
                  key={form.slug}
                  className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/50 mb-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1 ml-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                    <p className="font-medium text-sm truncate">{form.title}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/forms/${form.slug}`)}>
                    <ListChecks className="h-4 w-4 ml-1" />
                    مشاهده
                  </Button>
                </div>
              ))}
              {selfDeclaration && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/50 mb-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1 ml-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                    <p className="font-medium text-sm truncate">
                      {selfDeclForm.title}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/forms/${selfDeclForm.slug}`)}>
                    <ListChecks className="h-4 w-4 ml-1" />
                    مشاهده
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function UsersStatsCard({ stats }: { stats: AdminDashboardStats["users"] }) {
  const statusItems = [
    {
      key: "not_started",
      label: "ثبت‌نام نکرده",
      value: stats.byStatus.not_started,
      color: "text-gray-600 bg-gray-50 dark:bg-gray-950",
    },
    {
      key: "form_completed",
      label: "تکمیل فرم",
      value: stats.byStatus.form_completed,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950",
    },
    {
      key: "awaiting_interview",
      label: "در انتظار مصاحبه",
      value: stats.byStatus.awaiting_interview,
      color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950",
    },
    {
      key: "accepted",
      label: "پذیرفته شده",
      value: stats.byStatus.accepted,
      color: "text-green-600 bg-green-50 dark:bg-green-950",
    },
    {
      key: "not_meeting_requirements",
      label: "عدم احراز شرایط",
      value: stats.byStatus.not_meeting_requirements,
      color: "text-red-600 bg-red-50 dark:bg-red-950",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">کاربران</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center p-4 bg-muted/50 rounded-lg mb-4">
          <p className="text-3xl font-bold text-primary">
            {toPersianDigits(stats.total)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">کل کاربران</p>
        </div>
        <div className="space-y-2">
          {statusItems.map((item) => (
            <div
              key={item.key}
              className={`flex items-center justify-between p-3 rounded-lg ${item.color}`}>
              <span className="font-medium text-sm">{item.label}</span>
              <span className="font-bold">{toPersianDigits(item.value)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SelfDeclarationStatsCard({
  stats,
}: {
  stats: AdminDashboardStats["selfDeclarations"];
}) {
  const statusItems = [
    {
      key: "pending",
      label: "در انتظار تأیید",
      value: stats.byStatus.pending,
      icon: Clock,
      color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950",
    },
    {
      key: "approved",
      label: "تأیید شده",
      value: stats.byStatus.approved,
      icon: CheckCircle2,
      color: "text-green-600 bg-green-50 dark:bg-green-950",
    },
    {
      key: "returned",
      label: "نیازمند اصلاح",
      value: stats.byStatus.returned,
      icon: AlertTriangle,
      color: "text-red-600 bg-red-50 dark:bg-red-950",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">اظهارنامه‌ها</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center p-4 bg-muted/50 rounded-lg mb-4">
          <p className="text-3xl font-bold text-primary">
            {toPersianDigits(stats.total)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">کل اظهارنامه‌ها</p>
        </div>
        <div className="space-y-2">
          {statusItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.key}
                className={`flex items-center justify-between p-3 rounded-lg ${item.color}`}>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
                <span className="font-bold">{toPersianDigits(item.value)}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function NotificationsCard({
  notifications,
  navigate,
}: {
  notifications: Notification[];
  navigate: ReturnType<typeof useNavigate>;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">اعلان‌ها</CardTitle>
        </div>
        <CardDescription>
          آخرین وضعیت درخواست‌ها و اعلان‌های شما
        </CardDescription>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-6">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground mt-2">هیچ اعلانی وجود ندارد</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => {
              const Icon = n.icon;
              return (
                <div
                  key={n.id}
                  className="flex items-start gap-3 p-4 rounded-lg border">
                  <div className={`p-2 rounded-full shrink-0 ${n.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{n.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {n.description}
                    </p>
                  </div>
                  {n.action && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0"
                      onClick={() => navigate(n.action!.to)}>
                      {n.action.label}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
