import { CircleCheckIcon } from "lucide-react";

import { ReactNode } from "react";

export default function SuccessAlert({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-md border border-emerald-500/50 px-4 py-3 text-emerald-600">
      <p className="text-sm">
        <CircleCheckIcon
          className="me-3 -mt-0.5 inline-flex opacity-60"
          size={16}
          aria-hidden="true"
        />
        {children}
      </p>
    </div>
  );
}
