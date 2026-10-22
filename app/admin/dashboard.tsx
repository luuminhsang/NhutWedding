"use client";
import { BarChart3, FileText, Image, LogOut, MessageCircleHeart, Settings, Users } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export default function AdminDashboard({ email }: { email: string }) {
  const logout = async () => { await createBrowserSupabaseClient()?.auth.signOut(); window.location.assign("/admin/login"); };
  const modules = [[BarChart3,"Tổng quan","Dữ liệu RSVP và phản hồi"],[FileText,"Nội dung","Bản nháp, xem trước, xuất bản"],[Image,"Thư viện ảnh","Ảnh gốc, album và dung lượng"],[Users,"Danh sách khách","Tìm kiếm, lọc và xuất dữ liệu"],[MessageCircleHeart,"Lời chúc","Duyệt hoặc ẩn lời nhắn"],[Settings,"Thiết lập","URL, giao diện, QR và sao lưu"]] as const;
  return <main className="admin-shell"><aside><a href="/">← Xem trang mời</a><h2>N <i>&amp;</i> M</h2><p>QUẢN TRỊ</p><small>{email}</small><button onClick={logout}><LogOut size={15} /> Đăng xuất</button></aside><section className="admin-content"><p className="kicker">DASHBOARD</p><h1>Xin chào</h1><p className="admin-muted">Số liệu sẽ hiển thị từ Supabase khi dữ liệu bắt đầu được ghi nhận.</p><div className="metric-grid">{["RSVP tổng", "Tham dự", "Chưa chắc", "Lời chúc chờ duyệt"].map((title) => <article key={title}><span>{title}</span><b>—</b></article>)}</div><div className="admin-grid">{modules.map(([Icon, title, description]) => <button key={title} disabled><Icon /><div><b>{title}</b><span>{description}</span></div></button>)}</div></section></main>;
}
