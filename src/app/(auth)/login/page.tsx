"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, signInWithGoogle } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-xl font-semibold text-slate-900">
          49 Sünnet Uygulaması
        </h1>
        <p className="mb-6 text-sm text-slate-600">
          Yönetim ve kayıt ekranlarına erişmek için Google hesabınızla giriş
          yapın.
        </p>
        <button
          type="button"
          className="flex w-full items-center justify-center rounded-full bg-sky-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-sky-700"
          onClick={() => void signInWithGoogle()}
          disabled={loading}
        >
          {loading ? "Bekleyin..." : "Google ile Giriş Yap"}
        </button>
      </div>
    </div>
  );
}

