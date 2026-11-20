# Walka Walka

**Building a real app, from idea to stores, with Inglorious Web**

A step-by-step guide for the SAIT lessons. Each chapter is one commit in this repository, so you can read the code as it was at the end of any chapter:

```bash
git log --oneline          # one commit per chapter
git checkout <commit>      # the app as it was then
git checkout main          # back to the end
```

Slides are separated by `---`: the document can be read as it is, or turned into a deck.

---

## The idea

Walking alone to campus in the Calgary winter, in the dark, on the ice. If you slip, nobody notices.

> **Walka Walka helps SAIT students find someone walking the same route at the same time, so nobody walks alone.**

- **Walk**: from, to, departure time, notes. Posted by a student.
- **Request**: another student asks to join a walk.
- **Buddy**: a request the poster accepted.

One kind of account: everyone can post _and_ join.

---

## What the app must do

| Priority   | Story                                                       |
| ---------- | ----------------------------------------------------------- |
| Must       | I sign in with my SAIT email, so others know I'm a student. |
| Must       | I post a walk: from, to, when.                              |
| Must       | I see walks starting near me, around the time I leave.      |
| Must       | I ask to join; the poster accepts or declines.              |
| Must       | I'm notified when someone asks, and when I'm accepted.      |
| Must       | I can delete my account (the stores require it).            |
| Should     | I see the route on a map.                                   |
| Won't (v1) | Live location tracking in the background.                   |

**Privacy by design**: nobody but the poster and accepted buddies ever sees the exact meeting point, and the app never stores where anyone lives.

---

## What you need installed

These chapters assume the tools are already installed:

- Node.js 26 and pnpm
- Docker Desktop, **running**
- The Supabase CLI
- For the phone: Android Studio (and Xcode on a Mac)
- Optional: Claude Code or another coding agent

---

## Chapter 0 — Scaffolding

One command creates the whole project. Every question is a decision about the requirements:

```bash
pnpm create @inglorious/app
```

| Question                          | Answer                     | Why                                                                         |
| --------------------------------- | -------------------------- | --------------------------------------------------------------------------- |
| Project name                      | `walka-walka`              | Shown as "Walka Walka"                                                      |
| Template                          | TypeScript                 | Types catch mistakes, and help the AI agent                                 |
| Rendering syntax                  | lit-html                   | Plain JavaScript templates, no compiler (JSX and Vue are also available)    |
| Inglorious UI?                    | Yes                        | Components and themes                                                       |
| Theme                             | Bootstrap                  | SAIT's own website is built on Bootstrap: chapter 1 makes it look like SAIT |
| Mobile app?                       | Yes                        | We want to be in the App Store and Google Play                              |
| App id                            | `ca.sait.walkawalka`       | How the stores know the app. It can't change after the first release        |
| Store releases on GitHub Actions? | No                         | Say yes if nobody on the team has a Mac                                     |
| Routing? Page transitions?        | Yes, yes                   | Several screens: tabs on phones, a drawer on wider screens                  |
| Icon packs                        | Font Awesome               |                                                                             |
| Translate?                        | English, French            | Canada is bilingual                                                         |
| Analytics?                        | Yes                        | Only after the user agrees                                                  |
| Sign-in?                          | Password and code by email | The code proves you own the SAIT inbox                                      |
| Push notifications?               | Yes                        | "Marcus wants to walk with you"                                             |
| Agent skills?                     | Yes                        | They teach the AI how the framework works                                   |

The same answers as flags, for scripts:

```bash
pnpm create @inglorious/app -- walka-walka --template=ts --syntax=lit-html \
  --ui --theme=bootstrap --mobile --app-id=ca.sait.walkawalka --no-ci \
  --routing --transitions --icons=fontawesome --languages=en,fr --analytics \
  --auth-methods=password,code --push --skills
```

---

## Chapter 0 — What we got

```bash
cd walka-walka
pnpm install
pnpm test     # the first test already passes
```

- `src/main.ts`: what to show — the update page for outdated phones, the sign-in screen, then the app.
- `src/app/index.ts`: the app's shell. The bars stay put and only the page scrolls; the same pages are a tab bar on phones and a drawer from 48rem wide (`src/app/style.css`).
- `src/store/index.ts`: every feature is a **type** registered in the store: `Auth`, `PushPrompt`, `LiveUpdate`, `BackButton`…
- `supabase/`: database migrations, server functions and the sign-in emails.
- `package.json`: scripts for the web, the phones, releases and live updates.
- `README.md`: the setup steps for exactly the features we picked.
- `.agents/skills/`: the conventions, written for the AI agent and for us.

**Cloning this repository instead?** The skills aren't committed. Add them back with:

```bash
pnpm dlx skills add https://inglorious.dev --skill forge forge-best-practices \
  app-recipe store web web-best-practices ui ui-best-practices i18n firebase supabase
```

---

## Chapter 1 — A SAIT look

Before building anything, the app should feel like SAIT: students will look at it for the whole lesson. Bootstrap, picked in chapter 0, is a sensible start, but it looks like a thousand other sites. So we borrow SAIT's own style, from **www.sait.ca**.

How to read a website's design: open DevTools on its home page and look at the stylesheets. SAIT's site is built on **Bootstrap**, so its brand lives in a handful of CSS variables:

|           | SAIT                               | In the app                            |
| --------- | ---------------------------------- | ------------------------------------- |
| Primary   | `#a6192e`, the SAIT red            | Buttons, the header, the selected tab |
| Secondary | `#6d2077`, purple                  |                                       |
| Text      | `#324053`, a slate blue, not black | Body text and headings                |
| Links     | `#005eb8`                          |                                       |
| Headings  | Titillium Web                      | `h1`–`h3`, the app's title            |
| Text      | DM Sans                            | Everything else                       |
| Buttons   | Pills (`border-radius: 2em`)       | Every button                          |

---

## Chapter 1 — A theme on top of a theme

Inglorious UI already has a Bootstrap theme: it gives the components their shapes, spacing and focus rings. We keep it, and add a thin layer of our own on top that only changes **tokens**:

```html
<body class="iw-theme-bootstrap iw-theme-sait"></body>
```

```css
/* src/styles/theme.css */
.iw-theme-bootstrap.iw-theme-sait {
  --iw-color-primary: #a6192e;
  --iw-color-primary-text: white;
  --iw-button-radius: var(--iw-radius-full);
  …
}
```

Every component reads tokens such as `--iw-color-primary` instead of fixed colours, so changing a token restyles every button, tab and header at once. The header turns SAIT red with one prop: `AppBar.render({ color: "primary", … })`.

---

## Chapter 1 — Accessible colours

Brand colours aren't automatically readable. The rule: **text on a colour needs a contrast of at least 4.5:1** (WCAG AA).

| Colour             | White text | Black text | So the app uses                                    |
| ------------------ | ---------- | ---------- | -------------------------------------------------- |
| SAIT red `#a6192e` | 7.5 ✓      | 2.8        | white                                              |
| Green `#40a33c`    | 3.2 ✗      | 6.5 ✓      | black, and a darker green `#2f7d2c` for green text |
| Blue `#00a3e0`     | 2.9 ✗      | 7.3 ✓      | black, and `#00739f` for blue text                 |
| Amber `#ffb016`    | 1.8 ✗      | 11.5 ✓     | black                                              |

**Design class**: pick a brand colour, check it with any contrast checker, and find the darkest shade that still feels like the brand.

---

## Chapter 1 — Fonts, offline

The fonts come from npm (`@fontsource/titillium-web`, `@fontsource/dm-sans`), not from Google's servers: they're bundled with the app, so they work offline in the native app, and no third party learns who opened it.

Only the weights we use are imported, in `src/main.ts`: every weight is a file to download.

What we **don't** borrow: SAIT's logo. It's theirs, and an app that isn't official shouldn't look official. The icon in `public/logo.png` is ours to design (then `pnpm mobile:assets` makes every size).

---

## Chapter 2 — A backend on your laptop

Supabase gives us a Postgres database, sign-in, file storage and server functions. The whole thing runs locally in Docker: free, resettable, and offline.

```bash
supabase start            # the first run downloads the images: a few minutes
```

It prints the addresses and keys of the local stack (`supabase status` prints them again). Copy two of them into `.env.local`, which git ignores:

```bash
cp .env.example .env.local
```

```ini
VITE_SUPABASE_URL=http://127.0.0.1:55321
VITE_SUPABASE_ANON_KEY=<PUBLISHABLE_KEY from supabase start>
```

Then start the app:

```bash
pnpm dev
```

Open http://localhost:5173.

---

## Chapter 2 — Signing in

`supabase/seed.sql` creates three students, all with the password `walka-local`:

| Email                      | Who                          |
| -------------------------- | ---------------------------- |
| `aiko.tanaka@edu.sait.ca`  | First year, walks at 7:40    |
| `marcus.brown@edu.sait.ca` | Walks the same way every day |
| `priya.sharma@edu.sait.ca` | Has late labs                |

Creating a new account sends a confirmation code by email. Locally no email leaves your laptop: they all land in **Mailpit**, at http://127.0.0.1:55324.

**Try it**: sign up with `you@gmail.com`. The app warns that another address needs an invitation, and the database refuses the account.

---

## Chapter 2 — Only SAIT students

The rule is enforced **twice**, for two different reasons:

1. **In the database** (`supabase/migrations/…_sait_only.sql`): Supabase Auth calls `hook_sait_only` before creating any account, and it refuses any address outside `edu.sait.ca` and `sait.ca`, unless it's an **invited guest**. This is the real protection: nobody can skip it, even by calling the API directly.
2. **In the app** (`src/app/auth/`): the sign-in screen checks the domains, only to warn right away. It can't know the guests (only the database can read them), so it warns and lets the database decide.

> **Never trust the client.** Anything the app checks, someone can bypass with a terminal. Checks in the browser are for kindness; checks on the server are for security.

The emails send a **code** instead of a link (`supabase/templates/`): a code works inside the native app too, where a link would open the browser.

---

## Chapter 2 — Invited guests

Teachers and visitors don't have a SAIT student address. The `invited_emails` table lists the addresses allowed anyway. No student can read it: only the sign-up hook does.

To invite yourself on your laptop, copy the example and put your address in it:

```bash
cp supabase/seed.local.example.sql supabase/seed.local.sql
```

```sql
insert into public.invited_emails (email) values
  ('you@example.com');
```

`supabase db reset --yes` loads it after `seed.sql`, every time. Git ignores `seed.local.sql`, so your address never reaches the repository. Then sign up with it: the confirmation code arrives in Mailpit.

---

## Chapter 2 — What changed

- `supabase/config.toml` (from `supabase init`): email confirmation on, emails with codes, passwords of 8 characters or more, and the sign-up hook.
- **Ports moved from 543xx to 553xx**, so this project runs next to other Supabase projects on the same laptop.
- `src/app/auth/helpers.ts`: `isSaitEmail`, with its tests.
- `src/app/auth/index.ts`: the screen's `emailSubmit` notes an address outside SAIT, to warn about it, then hands over to the framework's.
- `supabase/seed.local.example.sql`: how to invite your own address.

```bash
pnpm test     # 7 tests
```

**Reset the database at any time** (migrations and seed again, all data gone):

```bash
supabase db reset --yes
```

---

## Chapter 3 — The tabs

The demo screens go; the app's own arrive. One tab per thing a student does:

| Tab      | Path       | Entity     | For                               |
| -------- | ---------- | ---------- | --------------------------------- |
| Nearby   | `/`        | `nearby`   | Walks leaving near you soon       |
| Post     | `/post`    | `postWalk` | Posting your own walk             |
| My walks | `/walks`   | `myWalks`  | Walks you posted or asked to join |
| Profile  | `/profile` | `auth`     | Sign out, delete your account     |

For now each screen is only a title and a sentence: the skeleton comes first, so we can click through the whole app before any of it works.

The tabs are one list, `tabs` in `src/app/index.ts`: the tab bar on phones and the drawer on wider screens both read it, so a new screen is one more line.

---

## Chapter 3 — How a screen is wired

Four places, every time. The agent skills list them, so the AI agent knows them too:

1. **The type** — `src/views/nearby/index.ts`: an object with a `render` method (and, later, event handlers).
2. **The store** — `src/store/index.ts` registers `Nearby`; `autoCreateEntities` gives it an entity called `nearby`.
3. **The route** — `src/store/routes.ts` maps `/` to the `nearby` entity.
4. **The types** — `types/index.d.ts` declares `NearbyEntity` and `NearbyType`, so TypeScript checks every event we send.

Plus the words, in **both** languages: `src/i18n/locales/en.json` and `fr.json`. No text is written in the code: every string is a key from day one.

```bash
pnpm dev      # sign in as aiko.tanaka@edu.sait.ca / walka-local
```

**Try it**: switch the language in Profile (chosen once, so not in the app bar), and widen the window until the tab bar becomes a drawer. On Android, the back button on a tab closes the app, as other apps do (`backButton.rootPaths` in `src/store/entities.ts`).
