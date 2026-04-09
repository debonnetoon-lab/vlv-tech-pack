import { redirect } from "next/navigation";

// Redirect /dashboard to the root app
export default function DashboardPage() {
  redirect("/");
}
