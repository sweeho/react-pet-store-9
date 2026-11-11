import { ChevronRight, Globe, LayoutGrid, PawPrint } from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { PRIMARY_AREAS } from "@/constants/primary-areas";
import { useScreen } from "@/i18n";

const AREA_ICONS = { catalog: LayoutGrid, localization: Globe } as const;

const Home = () => {
  const { t } = useScreen();
  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-8">
      <section className="grid items-center gap-10 py-12 sm:py-[72px] lg:grid-cols-[1.1fr_.9fr] lg:gap-14">
        <div>
          <span className="text-muted-foreground border-border inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[13px] font-medium">
            <b className="bg-chart-1 size-1.5 rounded-full" />
            {t("home.badge")}
          </span>
          <h1 className="mt-5 text-4xl leading-[1.05] font-semibold tracking-[-0.035em] sm:text-[56px]">
            {t("home.title")}
          </h1>
          <p className="text-muted-foreground mt-5 max-w-[540px] text-lg leading-relaxed">
            {t("home.lead")}
          </p>
          <Button asChild size="lg" className="mt-7">
            <Link to="/catalog">{t("home.browse")}</Link>
          </Button>
        </div>
        <div
          aria-hidden="true"
          className="bg-muted border-border hidden aspect-[1/0.82] place-items-center rounded-2xl border lg:grid"
        >
          <PawPrint className="size-[120px] opacity-90" strokeWidth={1.25} />
        </div>
      </section>

      <section className="pb-[72px]">
        <h2 className="text-[22px] font-semibold tracking-tight">{t("home.where")}</h2>
        <p className="text-muted-foreground mt-1.5 text-[15px]">{t("home.whereLead")}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PRIMARY_AREAS.map((area) => {
            const Icon = AREA_ICONS[area.slug as keyof typeof AREA_ICONS] ?? PawPrint;
            return (
              <Link
                key={area.slug}
                to={area.href}
                className="bg-card border-border hover:border-ring hover:bg-muted/50 flex items-start gap-4 rounded-[var(--radius)] border p-5 transition-colors"
              >
                <span className="bg-secondary grid size-10 flex-none place-items-center rounded-md">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <div>
                  <h3 className="text-[15px] font-semibold">
                    {t(`area.${area.slug}.label`) || area.label}
                  </h3>
                  <p className="text-muted-foreground mt-1 text-sm leading-normal">
                    {t(`area.${area.slug}.description`) || area.description}
                  </p>
                </div>
                <ChevronRight
                  aria-hidden="true"
                  className="text-muted-foreground ml-auto size-[18px] flex-none self-center"
                />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Home;
