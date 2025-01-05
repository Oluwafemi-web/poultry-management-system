import Navbar from "../components/navbar";
import WorkerSidebar from "../components/workersidebar";

export default function WorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <WorkerSidebar />
      <div className="flex-1 ml-[15%]">
        <Navbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
