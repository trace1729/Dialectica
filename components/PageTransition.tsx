"use client";

import { usePathname } from "next/navigation";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex-1 flex flex-col animate-fade-in" key={pathname}>
      {children}
    </div>
  );
}
