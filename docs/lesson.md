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
