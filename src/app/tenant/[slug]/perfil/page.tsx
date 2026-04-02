import { requireUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { PerfilClientView } from "./PerfilClientView";

export default async function PerfilPage() {
  const authUser = await requireUser().catch(() => null);
  
  if (!authUser) {
    redirect("/login");
  }

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500 max-w-7xl mx-auto">
      <PerfilClientView user={authUser as any} />
    </div>
  );
}
