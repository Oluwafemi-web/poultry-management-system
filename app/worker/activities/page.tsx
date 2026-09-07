import { Suspense } from "react";
import WorkerActivitiesPage from "./activities-client";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8">Loading…</div>}>
      <WorkerActivitiesPage />
    </Suspense>
  );
}
