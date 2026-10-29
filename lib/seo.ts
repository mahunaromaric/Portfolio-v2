/**
 * Identité publique — source unique pour les métadonnées et le JSON-LD.
 *
 * On garde le nom légal comme nom principal, et on déclare les variantes
 * (pseudonyme, formes composées, ordre inversé) pour que les moteurs les
 * rattachent à la même entité.
 */

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://mahuna.is-a.dev").replace(/\/$/, "");

export const PERSON_NAME = "Romaric GBENOU";
export const PERSON_ALIAS = "Mahuna";

/** Variantes exactes recherchées, à déclarer en `alternateName`. */
export const PERSON_ALTERNATE_NAMES = [
  "Romaric Mahuna",
  "Romaric GBENOU Mahuna",
  "Mahuna Romaric",
  "GBENOU Mahuna",
] as const;

export const PERSON_KEYWORDS = [
  PERSON_NAME,
  ...PERSON_ALTERNATE_NAMES,
  PERSON_ALIAS,
  "Product Builder",
  "Développeur web Cotonou",
  "Développeur web Bénin",
  "Développeur freelance Bénin",
  "React",
  "Next.js",
  "Laravel",
  "PostgreSQL",
];

const PERSON_ID = `${SITE_URL}/#person`;

export const PERSON_REF = { "@id": PERSON_ID };

type PersonInput = {
  name?: string | null;
  description?: string | null;
  image?: string | null;
  location?: string | null;
  sameAs?: string[];
  locale?: string;
};

/** Nœud schema.org Person commun à toutes les pages. */
export function personJsonLd({ name, description, image, location, sameAs = [], locale }: PersonInput) {
  const isEn = locale === "en";
  return {
    "@type": "Person" as const,
    "@id": PERSON_ID,
    name: name || PERSON_NAME,
    alternateName: [...PERSON_ALTERNATE_NAMES],
    givenName: "Romaric",
    familyName: "GBENOU",
    jobTitle: isEn ? "Product Builder · Developer" : "Product Builder · Développeur",
    description: description || undefined,
    disambiguatingDescription: isEn
      ? `Romaric GBENOU, also known as ${PERSON_ALTERNATE_NAMES.join(", ")}.`
      : `Romaric GBENOU, aussi appelé ${PERSON_ALTERNATE_NAMES.join(", ")}.`,
    url: SITE_URL,
    image: image || `${SITE_URL}/img/portrait.webp`,
    address: { "@type": "PostalAddress", addressLocality: location || "Cotonou", addressCountry: "BJ" },
    sameAs,
    knowsAbout: ["React", "Next.js", "Laravel", "PostgreSQL", "Node.js", "Product design"],
  };
}
