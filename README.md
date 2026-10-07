# Portfolio V2 — Next.js 16 + Prisma 8 + PostgreSQL

## Backend (V1 en place)

### Stack
- **Next.js 16** (App Router, Server Actions), React 19, Tailwind 4
- **Prisma 8** (`@prisma/orm-postgres`, contrat-first) + **PostgreSQL >= 15**
- Validation **Zod**, sessions admin en DB, hash `scrypt`

### Modèle de données (`prisma/schema.prisma`)
`Profile` (singleton) + `SocialLink` · `Project` + `ProjectCategory` + `Technology` (+`TechnologyCategory` dont `exploring`) via `ProjectTechnology` · `Media` + `ProjectMedia` (1 seul cover/projet) · `CaseStudy` + `CaseStudyBlock` (contenu polymorphe en `Json`, `title` = nom de section) · `Experience` · `Education` · `Testimonial` · `Message` (contact, anti-spam) · `AdminUser` + `AdminSession` · `LoginAttempt` (rate-limit).

### Commandes
```bash
npm run dev                  # dev
npm run build / npm start    # prod
npm run contract:emit        # après chaque edit de prisma/schema.prisma
npm run db:migrate           # appliquer les migrations (formel, versionné)
npm run db:verify            # vérifier DB == contrat
npm run seed                 # données initiales (profil, catégories, technos dont exploring, projet démo 8 blocs)
npm run admin:create <email> <password>  # créer un admin back-office
```

### Workflow contrat Prisma 8
1. Éditer `prisma/schema.prisma`
2. `npm run contract:emit` (régénère `schema.json` + `schema.d.ts`, ne jamais les éditer)
3. `npx prisma migration plan --name <slug>` puis `npm run db:migrate`
4. En dev solo rapide : `npx prisma db update` (sans historique)

> `prisma/db.ts` importe `./schema.json` + `./schema.d` (noms dérivés du contrat `schema.prisma`, pas `contract.*`).

### Back-office — `/admin`
- `/admin/login` : connexion (cookie `admin_session` httpOnly, 7 jours, token SHA-256 en DB, **rate-limit 4 tentatives / 15 min** par IP ou email via `LoginAttempt`)
- `/admin` : dashboard (compteurs, derniers messages)
- `/admin/projets` + `/admin/projets/[id]` : CRUD projets, technos, médias liés, blocs d'étude de cas titrés
- `/admin/medias` : upload (images/vidéo/pdf, max 5 Mo) via `lib/storage.ts` — **S3 en prod** si `S3_*` configurés, sinon local `public/uploads/` (gitignoré)
- `/admin/contenu` : profil, liens sociaux, catégories, technos, expériences, formations, témoignages
- `/admin/messages` : boîte de réception (NEW/READ/REPLIED/ARCHIVED)

### Site public — multi-page (Manrope, palette maquette)
- `/` : Hero (MA + headline), Selected Work (4 featured `ProjectCard` avec cover), Approach (4 principes), About preview, Contact CTA sombre. Données : `getProfile()`, `getFeaturedProjects()`.
- `/work` : grille complète `ProjectCard` (tri `displayOrder`), `generateMetadata` statique.
- `/work/[slug]` : header (catégorie, année, rôle, technos, liens), cover + galerie, `CaseStudyRenderer` (TEXT markdown, FEATURES, TECHNICAL, QUOTE, IMAGE/IMAGE_GALLERY via médias liés), `generateStaticParams` + `notFound()`. Convention : `CaseStudyBlock.title` = nom de section (Context, Problem, Objectives…).
- `/about` : intro (Profile), Journey (timeline Experience/Education), Skills par catégorie + bloc « Currently exploring » (catégorie `exploring`), Testimonials.
- `/contact` : page dans le shell (`app/(site)/contact`) avec `ContactForm` (honeypot + Turnstile + 1 msg/min/IP). Layout `app/(site)/layout.tsx` : Navbar sticky + Footer communs.
- `sitemap.ts` / `robots.ts` dynamiques depuis les projets publiés.

### Couches code
- `lib/dal/public.ts` : lectures publiques (statut `PUBLISHED` uniquement)
- `lib/dal/admin.ts` : listes admin
- `lib/actions/` : `auth.ts`, `projects.ts`, `media.ts`, `content.ts` (Server Actions, `requireAdmin()` systématique côté écriture)
- `lib/validation.ts` : schémas Zod (dont blocs case-study discriminés)
- `lib/auth.ts`, `lib/crypto.ts`, `lib/slug.ts` : session, scrypt, slugs, rate-limit login
- `lib/storage.ts` : abstraction médias (S3 / local), `lib/turnstile.ts` : vérification serveur
- `components/ContactForm.tsx`, `components/Turnstile.tsx`, `components/site/*` : formulaire, widget, shell et cards publiques
- `app/(site)/*`, `app/sitemap.ts`, `app/robots.ts` : site multi-page + SEO
- `scripts/seed.ts`, `scripts/create-admin.ts`

### Sécurité / anti-spam
- Login : **4 tentatives max / 15 min** par IP ou email, réponse générique anti-énumération, purge auto des vieilles tentatives. Succès → historique effacé.
- Contact : honeypot silencieux + Turnstile (requis si `TURNSTILE_SECRET_KEY` définie, ignoré en dev seulement) + 1 msg/min/IP hashée.
- Suppression média : fichier S3/disque supprimé en best-effort avec la ligne DB.

### Design
- Palette maquette : `#f7f7f5` / `#fff` / `#111` / `#666` / `#ddddd8` / `#2457ff`  ·  typo **Manrope 400/700/800** (next/font), letter-spacing négatifs, 2 breakpoints 800/520px. Dark mode retiré (design clair uniquement).
