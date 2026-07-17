import type { ReactNode } from "react";
import { SiteLayout } from "./SiteLayout";

export function PagePlaceholder({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  description: string;
  children?: ReactNode;
}) {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-4 py-20">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {eyebrow}
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold md:text-5xl">{title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">{description}</p>
        </div>
        {children && <div className="mt-12">{children}</div>}
      </section>
    </SiteLayout>
  );
}