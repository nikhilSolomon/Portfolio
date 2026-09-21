# nikhilsolomon.com

Personal portfolio with a built-in admin panel. Express + SQLite, no external services required.

## Run locally

```bash
npm install
cp .env.example .env        # optional; defaults work for local dev
npm run dev                 # http://localhost:3000, admin at /admin
```

The first visit to `/admin` asks you to set a password. The database and uploads live in `./data` (gitignored) and are created automatically with your content and seven starter projects.

## What's inside

| Path | What it does |
| --- | --- |
| `server.js` | Express app: sessions, static files, routes |
| `src/db.js` | SQLite schema and data access (uses Node's built-in `node:sqlite`) |
| `src/content.js` | Default site content and starter projects, editable later in the admin |
| `src/routes/site.js` | Public pages, contact API, analytics beacon, OG images, sitemap, 404 |
| `src/routes/admin.js` | Login, projects CRUD, uploads, site content editor, inbox, analytics |
| `views/` | EJS templates (`site.ejs` is the home page, `admin/` the panel) |
| `public/site.css`, `public/site.js` | The v1 design, now driven by data |
| `data/` | `portfolio.db`, `uploads/`, generated `og/` images |

## Admin features

- Projects: create, edit, delete, drag to reorder, draft or publish, featured flag
- Cover and gallery images: uploaded files are resized and converted to WebP
- Case studies in Markdown, with live/source/paper links and a headline result
- Site content: name, headline, roles, bio, stats, "what I do", skills, timeline, approach, socials, SEO, résumé PDF
- Messages: contact-form inbox, optional email notification over SMTP
- Analytics: views, unique visitors, project opens, referrers, top pages and 404 hits (cookie-free)

## Public URLs

- `/` home, `/work/<slug>` project page (server-rendered, shareable, SEO meta + OG image)
- `/og/<slug>.png` social preview image, `/sitemap.xml`, `/robots.txt`, `/healthz`
- Unknown URLs render the branded 404 page and are logged

## Scripts

```bash
npm run seed                 # re-apply default site content (keeps your projects)
npm run seed -- --force      # also replace all projects with the starter set
npm run reset-password       # set a new admin password
```

## Static mode (no server, no admin)

```bash
npm run build      # renders everything to dist/ (HTML, project pages, 404, sitemap, OG images, uploads)
npm run preview    # serves dist/ at http://localhost:4173 to check it
```

In static mode the contact form opens the visitor's email app with the message pre-filled, and analytics is off. Everything else, including the project modal and per-project URLs, works the same. `.github/workflows/pages.yml` builds and publishes `dist/` to GitHub Pages on every push to `main`. To ship content you edited in the local admin, run `npm run export` first and commit the `content/` folder; the build uses it when there is no database.

## Deploy

See [DEPLOY.md](DEPLOY.md) for Render (simplest), Docker on a VPS, and pointing `nikhilsolomon.com` at it.
