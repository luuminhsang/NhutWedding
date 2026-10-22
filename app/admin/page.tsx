import { redirect } from "next/navigation";
import AdminDashboard from "./dashboard";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) redirect("/admin/login?reason=configuration");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email?.toLowerCase() !== process.env.ADMIN_EMAIL?.toLowerCase()) redirect("/admin/login?reason=unauthorized");
  const { data: admin } = await supabase.from("admin_users").select("id").eq("id", user.id).maybeSingle();
  if (!admin) redirect("/admin/login?reason=unauthorized");
  return <AdminDashboard email={user.email ?? ""} />;
}
