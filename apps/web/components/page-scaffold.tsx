import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

type PageScaffoldProps = {
  children: ReactNode;
  /** Override the <main> classes for the rare page whose frame differs. */
  mainClassName?: string;
};

const DEFAULT_MAIN_CLASS = "mx-auto w-full max-w-6xl flex-1 px-6 py-10";

// The shared page frame every top-level route uses: sticky header, centered
// max-w-6xl main column (see the layout rule in AGENTS.md), and footer. Keeps
// the outer chrome in one place so pages only render their own content.
export function PageScaffold({ children, mainClassName = DEFAULT_MAIN_CLASS }: PageScaffoldProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-court-ink">
      <SiteHeader />
      <main className={mainClassName}>{children}</main>
      <SiteFooter />
    </div>
  );
}
