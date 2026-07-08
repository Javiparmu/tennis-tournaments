"use client";

import type { LucideIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

export type SectionTabItem = {
  id: string;
  label: string;
  icon?: LucideIcon;
  content: ReactNode;
};

// Compact horizontal segmented tab bar with the active tab mirrored to the URL
// (`?tab=`) so it is shareable and survives reload. Only the active panel renders.
// Deliberately custom (not HeroUI Tabs) to stay a single tight row instead of a
// tall stacked list.
export function SectionTabs({
  tabs,
  ariaLabel,
  paramKey = "tab",
}: {
  tabs: SectionTabItem[];
  ariaLabel: string;
  paramKey?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const fromUrl = searchParams.get(paramKey);
  const active = tabs.some((tab) => tab.id === fromUrl) ? (fromUrl as string) : tabs[0]?.id;
  const activeTab = tabs.find((tab) => tab.id === active) ?? tabs[0];

  function select(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (id === tabs[0]?.id) params.delete(paramKey);
    else params.set(paramKey, id);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label={ariaLabel}
        className="inline-flex max-w-full gap-1 overflow-x-auto rounded-xl border border-court/10 bg-white p-1 shadow-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => select(tab.id)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-court ${
                isActive ? "bg-court text-ball-bright" : "text-stone-600 hover:bg-court/5 hover:text-court-ink"
              }`}
            >
              {tab.icon ? <tab.icon className="h-4 w-4" aria-hidden /> : null}
              {tab.label}
            </button>
          );
        })}
      </div>
      <div className="mt-6">{activeTab?.content}</div>
    </div>
  );
}
