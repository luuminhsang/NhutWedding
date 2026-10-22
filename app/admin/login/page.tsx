"use client";
import { FormEvent, Suspense, useState } from "react";
import { LogIn } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

function AdminLoginForm() {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [message, setMessage] = useState(""); const router = useRouter(); const parameters = useSearchParams();
  const login = async (event: FormEvent) => { event.preventDefault(); const supabase = createBrowserSupabaseClient(); if (!supabase) return setMessage("Cần cấu hình Supabase trước khi đăng nhập."); const result = await supabase.auth.signInWithPassword({ email, password }); if (result.error) return setMessage("Không thể đăng nhập. Kiểm tra lại thông tin và quyền quản trị."); router.replace("/admin"); router.refresh(); };
  const reason = parameters.get("reason");
  return <main className="admin-shell"><form className="admin-login" onSubmit={login}><p className="kicker">NHỨT & MỸ NGÂN</p><h1>Quản trị thiệp cưới</h1><p>Chỉ tài khoản quản trị được cho phép mới có thể truy cập.</p>{reason === "configuration" && <p role="alert">Supabase chưa được cấu hình.</p>}{reason === "unauthorized" && <p role="alert">Bạn không có quyền truy cập trang này.</p>}<label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label>Mật khẩu<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>{message && <p role="alert">{message}</p>}<button className="primary-button"><LogIn size={16} /> Đăng nhập</button></form></main>;
}

export default function AdminLoginPage() {
  return <Suspense fallback={<main className="admin-shell" />}><AdminLoginForm /></Suspense>;
}
