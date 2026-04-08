import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import UIKitDemoClient from "./UIKitDemoClient";

export default function UIKitPage() {
  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        <UIKitDemoClient />
      </div>
    </div>
  );
}
