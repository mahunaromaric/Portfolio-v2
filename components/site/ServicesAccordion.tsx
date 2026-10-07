"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { AnchorLink } from "./AnchorLink";

type ServiceItem = { id: string; title: string; description?: string | null };

export function ServicesAccordion({ services, locale = "fr" }: { services: ServiceItem[]; locale?: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const reduce = useReducedMotion();

  const list: ServiceItem[] =
    services.length > 0
      ? services
      : locale === "en"
        ? [
            { id: "1", title: "Fullstack development", description: "Complete web applications, from frontend to API, ready for production." },
            { id: "2", title: "Mobile development", description: "Performant iOS/Android apps with a native experience." },
            { id: "3", title: "API & Backend", description: "Robust APIs, authentication, payments and integrations." },
            { id: "4", title: "Websites & Landing Pages", description: "Fast showcase websites focused on SEO and conversion." },
            { id: "5", title: "Architecture & Systems", description: "Scalable design, databases and infrastructure." },
            { id: "6", title: "Open Source Tools & Packages", description: "Reusable libraries and tailor-made automations." },
          ]
        : [
            { id: "1", title: "Développement Fullstack", description: "Applications web complètes, du front à l'API, prêtes pour la production." },
            { id: "2", title: "Développement Mobile", description: "Apps iOS/Android performantes avec expérience native." },
            { id: "3", title: "API & Backend", description: "APIs robustes, authentification, paiements et intégrations." },
            { id: "4", title: "Sites & Landing Pages", description: "Sites vitrine rapides, SEO et conversion au centre." },
            { id: "5", title: "Architecture & Systèmes", description: "Conception scalable, bases de données et infra." },
            { id: "6", title: "Outils & Packages Open Source", description: "Bibliothèques réutilisables et automatisations sur mesure." },
          ];

  return (
    <div className="divide-y divide-border border-y border-border">
      {list.map((s, i) => {
        const isOpen = open === i;
        return (
          <div key={s.id}>
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={`svc-panel-${s.id}`}
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full py-4 flex items-center justify-between text-left min-h-[44px] group"
            >
              <span className="text-sm font-semibold pr-4">
                {i + 1}. {s.title}
              </span>
              <span
                className={`shrink-0 w-11 h-11 rounded-full border border-border grid place-items-center text-lg font-light transition-transform duration-300 ${isOpen ? "rotate-45 bg-ink text-white border-ink" : "text-muted bg-surface group-hover:border-accent/30"}`}
                aria-hidden
              >
                +
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`svc-panel-${s.id}`}
                  initial={reduce ? { opacity: 1, height: "auto" } : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduce ? { opacity: 1, height: "auto" } : { height: 0, opacity: 0 }}
                  transition={reduce ? { duration: 0 } : { duration: 0.3, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <p className="pb-2 text-sm leading-relaxed text-secondary pr-12">
                    {s.description || (locale === "en" ? "Details coming soon — editable from /admin/contenu." : "Détail à venir — éditable depuis /admin/contenu.")}
                  </p>
                  <p className="pb-4 pr-12">
                    <AnchorLink
                      href={`/?subject=${encodeURIComponent(s.title)}#contact`}
                      className="inline-flex items-center gap-1 text-[13px] font-bold text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:text-clay hover:decoration-clay"
                    >
                      {locale === "en" ? "Request this service" : "Demander ce service"} →
                    </AnchorLink>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
