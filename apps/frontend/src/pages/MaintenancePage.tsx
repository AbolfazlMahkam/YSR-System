function MaintenancePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 animate-pulse items-center justify-center rounded-full bg-blue-500">
          <svg
            className="h-10 w-10 fill-white"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        </div>
        <h1 className="mb-3 text-2xl font-bold text-slate-50">
          سایت در حال به‌روزرسانی است
        </h1>
        <p className="mb-2 leading-relaxed text-slate-400">
          طبق برنامه، سایت از ساعت ۱ بامداد تا ۶ صبح هر روز برای به‌روزرسانی و
          نگهداری در دسترس نیست.
        </p>
        <p className="leading-relaxed text-slate-400">
          لطفاً از ساعت ۶ صبح به بعد مراجعه فرمایید.
        </p>
        <div className="mt-8 inline-block rounded-xl border border-slate-700 bg-slate-800 px-6 py-3 text-sm text-blue-400">
          از ساعت ۶ صبح دوباره امتحان کنید
        </div>
        <p className="mt-10 text-xs text-slate-600">YSR-System</p>
      </div>
    </div>
  );
}

export default MaintenancePage;
