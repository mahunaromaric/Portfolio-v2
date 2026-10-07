import { SiteFooter, SiteHeader } from "@/components/site/SiteShell";
import { MobileDock } from "@/components/site/MobileDock";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 pt-[72px] pb-24 lg:pb-0">{children}</main>
      <SiteFooter />
      <MobileDock />
    </>
  );
}
