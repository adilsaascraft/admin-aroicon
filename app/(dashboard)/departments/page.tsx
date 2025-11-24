// app/department/page.tsx
"use client";

import DepartmentClient from "@/components/clients/DepartmentClient";

export default function DepartmentsPage() {
  return (
    <div className="p-4">
      <DepartmentClient />
    </div>
  );
}
