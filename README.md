# walka-walka

This project is a minimal starter template for creating an app with the Inglorious Web framework using TypeScript, bundled with Vite.

## Getting Started

This project was scaffolded with `@inglorious/create-app`.

To get started, follow these steps:

1.  **Install dependencies**:
    Navigate to your project directory and install the required packages.
    ```sh
    pnpm install
    ```
2.  **Start the development server**:
    Run the following command to start the Vite development server.
    ```sh
    pnpm dev
    ```

This will start a Vite development server. Open your browser to the local URL provided to see it in action.

## Project Setup

- `index.html`: The main entry point for your app.
- `src/`: Contains your app's TypeScript source code.
- `types/`: Type declarations for your app's entities, state and types.
- `vite.config.ts`: Vite configuration file.
- `tsconfig.json`: TypeScript configuration for the project.
- `package.json`: Project metadata and dependencies.

## Tests

`pnpm test` runs the unit tests once, `pnpm test:watch` again on every save. `vitest.config` builds on `vite.config`, so tests see the app as Vite builds it. Tests named `*.integration.test.*` run apart, with `pnpm test:integration`: they are the ones that talk to a real backend, such as the local Supabase stack.

A handler is a function from an entity to a changed entity, so most tests need no browser: `trigger` from `@inglorious/web/test` runs a handler on a copy of an entity and returns the result with the events it sent. `src/**/message/index.test.*` is the example to copy.

## Mobile Setup

This project includes Capacitor for Android and iOS support.

Please note that mobile development depends on external platform tooling that is not installed or managed by the CLI. If the app does not just work after scaffolding, it is usually because one or more native prerequisites are missing on the machine.

### Android

Before you run the native apps, make sure you have:

- Android Studio installed with the Android SDK: https://developer.android.com/studio
- A Java Development Kit compatible with Capacitor. Capacitor is currently known to work reliably with JDK 21, so prefer JDK 21 over newer versions if you run into Java compatibility errors.
- The SDK path available via ANDROID_HOME (for example, on macOS this is often $HOME/Library/Android/sdk)

On macOS, the following shell variables are commonly needed:

```bash
export JAVA_HOME="/path/to/jdk-21"
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"
```

### iOS

For iOS you also need the Apple toolchain and device setup on a Mac:

- Xcode from the App Store
- iOS development tools and simulator components (this can be very large, often multiple GB)
- A valid Apple Developer team / signing identity in Xcode
- Device trust setup for your iPhone in Settings > General > VPN & Device Management

The most common first-time setup commands are:

```bash
sudo xcode-select -switch /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -license accept
```

If you are using a physical device, you may also need to approve the developer certificate on the device and ensure the app is signed with a valid team.

### Official resources

- Android: https://capacitorjs.com/docs/android
- iOS: https://capacitorjs.com/docs/ios
- Android Studio: https://developer.android.com/studio
- Xcode: https://developer.apple.com/xcode/

Then create the native projects you need, once. Each starts with your logo as its icon and splash screen:

```bash
pnpm mobile:init:android
pnpm mobile:init:ios
```

Then sync and open the native project:

```bash
pnpm mobile:sync
pnpm mobile:android
# or
pnpm mobile:ios
```

### Live reload on a device

`pnpm mobile:dev:ios` or `pnpm mobile:dev:android` runs the app on a phone or emulator against the dev server on this computer: every file you save reloads on the device, as `pnpm dev` does in the browser. The phone must be on the same Wi-Fi network. Pick a device with `--target <id>` (`pnpm cap run ios --list` lists them). Ctrl+C stops both, and the next `pnpm mobile:sync` or `pnpm mobile:ios` runs the built app again.

### Native settings

Leave `android/` and `ios/` to the tools: what the app needs from them is in `native` in `package.json`, and `inglorious-capacitor configure` writes it into both projects after every `cap sync`. Set `native.ios.teamId` to your Apple Developer Team ID, so Xcode signs the app without asking. `native.ios.infoPlist` adds Info.plist entries, such as the text iOS shows when the app asks for the microphone (`NSMicrophoneUsageDescription`), and `native.android.permissions` adds Android permissions, such as `android.permission.RECORD_AUDIO`. With routing, `native.ios.swipeBack` lets a swipe from the left edge go back, as in other iOS apps. `ITSAppUsesNonExemptEncryption: false` tells App Store Connect that the app uses no encryption beyond HTTPS: remove it if that stops being true.

### Icons and splash screens

`pnpm mobile:assets` makes every icon and splash screen from `public/logo.svg` or `public/logo.png`, centred on `native.assets.background` (white by default) and, for the dark splash screen, `native.assets.backgroundDark`. `iconScale` and `splashScale` set the logo's width as a share of the icon (0.6) and of the splash screen (0.3). Run it again after changing the logo, and commit the result.

### Store listing images

With the app running (`pnpm dev`), `pnpm mobile:listing-assets` captures the screens listed in `listing.config.js` at the sizes App Store Connect and Play Console ask for, and makes the promotional images (Google Play's feature graphic, a header and a search results card, from the logo, the app's name, `promo.tagline` and framed screenshots) and Google Play's 512px icon, all in `listing-assets/`. It drives your installed Chrome. Add `locales` (and `localeParam`, if the app reads the language from links) for one set per language, `signIn` to sign a demo account in first, `storage` to answer prompts such as analytics consent before the app starts, and `prepare` on a screen to bring it to the state worth showing. Seed the local backend with realistic demo data first: real users must never appear in store screenshots.

### Opening links in the app

With Universal Links (iOS) and App Links (Android), a link to the app's domain opens the installed app instead of the browser, and the router goes to the link's path. Fill in `native.appLinks.domain`, then:

1. For iOS, set `native.ios.teamId`. `pnpm mobile:sync` adds the domain to the app's Associated Domains and writes `public/.well-known/apple-app-site-association`. Links in `native.appLinks.exclude` stay in the browser: by default, the ones carrying a sign-in token.
2. For Android, add the SHA-256 fingerprints of the keys that sign the app to `native.android.sha256`: Google's app signing key and your upload key, both under **Test and release → App integrity → App signing** in Play Console. `pnpm mobile:sync` writes `public/.well-known/assetlinks.json` and the intent filter. Android can't exclude a link: it opens the paths in `native.appLinks.paths`, `["/*"]` by default, so list the ones that should open the app instead, such as `["/", "/jobs*"]`.
3. Deploy the site, so the domain serves both files. `vercel.json` already serves them as JSON.

Test on a device by tapping a link in Notes or Messages; typing it in Safari does not count. Both files are cached, so a change can take a few hours to arrive, and Android checks the domain when the app is installed or updated: `adb shell pm get-app-links <app id>` should say `verified`.

### Releasing

The version users see comes from `package.json`, the same on the web, Android and iOS. The build number is shared by both native apps and must go up with every store upload.

1. Describe each change as you make it with `pnpm changeset`. When a release is due, `pnpm release:version` raises the version and writes `CHANGELOG.md`. Skip this to upload another build of the same version, for example to TestFlight.
2. Run `pnpm mobile:release`. It copies the version into both native projects, raises the build number, builds with the production values in `.env` (ignoring `.env.local`), and syncs. Commit what it changed.
3. Upload. In Xcode, use **Product → Archive**, then **Distribute App → Custom → App Store Connect → Upload**, and untick **Manage Version and Build Number** so the store gets the project's build number. In Android Studio, use **Build → Generate Signed App Bundle**.

## Firebase Setup

1. Create a project in the [Firebase console](https://console.firebase.google.com) and add a web app to it.
2. Copy `.env.example` to `.env.local` and fill it in from Project settings → General → your web app. These values end up in the built app, so they are not secret.
3. `VITE_FIREBASE_MEASUREMENT_ID` is the web app's `measurementId`. Do not paste Google's `gtag.js` snippet into `index.html`: it would start before anyone agreed.
4. `VITE_FIREBASE_VAPID_KEY` is the public half of a Web Push key pair, from Project settings → Cloud Messaging → Web configuration.
5. Add an Android and an iOS app too, and put their `google-services.json` and `GoogleService-Info.plist` in the project's root folder: `pnpm mobile:sync` copies them into the native projects, and sets up the rest.

## Analytics

Usage is measured with Google Analytics for Firebase, and only for people who said yes: until then, no analytics code loads. Check that your privacy policy covers it, naming Google as the processor.

Page views follow the router by themselves. The app's own events go through the entity, and are dropped without consent:

```js
api.notify("#analytics:analyticsTrack", { name: "sign_up" })
```

To let people change their answer, for example from a settings page, notify `#analytics:analyticsAsk` to bring the prompt back.

The native apps must start with collection off, or they measure from launch. `inglorious-capacitor configure` writes that setting into the native projects after every `cap sync`, and removes the advertising ID permission that Firebase adds to the Android app: in Play Console, answer "No" to the advertising ID question.

## Push Notifications

Pushes reach the PWA and the native apps through Firebase Cloud Messaging. Supabase keeps each device's token and sends: inserting a row in `notifications` is what sends a push.

```sql
insert into public.notifications (user_id, title, body, url)
values ('<user id>', 'Hello', 'You have a new message', '/');
```

The permission prompt appears once someone signs in with Supabase Auth, so the app needs a sign-in screen. To sign out, call `signOut` from `src/api/push`, which deletes the device's token first.

To set it up, with the [Supabase CLI](https://supabase.com/docs/guides/cli) installed:

1. In the Firebase console, go to Project settings → Service accounts → Generate new private key. The file is a real secret: never commit it.
2. In the Google Cloud console, give that service account the **Firebase Cloud Messaging API Admin** role. The similarly named Firebase Cloud Messaging Admin cannot send.
3. Run `supabase init` here, then `supabase start` to try it locally, with the file's JSON on one line as `FCM_SERVICE_ACCOUNT` in `supabase/functions/.env`. `supabase status` gives the values of `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

To deploy:

```bash
supabase link --project-ref <your project ref>
supabase db push
pnpm secrets:push
supabase functions deploy push-notify
pnpm vault:push
```

`pnpm secrets:push` sets the function secrets in `supabase/functions/.env`, such as `FCM_SERVICE_ACCOUNT`, on the linked project, and checks that each arrived as it is locally; `pnpm secrets:push FCM_SERVICE_ACCOUNT` sets just that one. `pnpm vault:push` tells the database how to reach the function. It stores the project's legacy `service_role` key in Vault, which is the key `push-notify` can read a role from. It asks the Supabase CLI for the key, so it is never written down.

A browser's service worker only exists in a build, so try web pushes with `pnpm build && pnpm preview`.

## Sign-in

People sign in with Supabase Auth: `src/app/auth` asks for the email, then a password, a new account or a code sent by email. Until someone is signed in, `src/main` shows that screen instead of the app. Codes, rather than links, work in the native app too, since nobody has to open anything.

With the [Supabase CLI](https://supabase.com/docs/guides/cli) installed, run `supabase init` here if you haven't, then add the email templates with the codes to `supabase/config.toml`:

```toml
[auth.email]
enable_confirmations = true

[auth.email.template.confirmation]
subject = "Your confirmation code"
content_path = "./supabase/templates/confirmation.html"

[auth.email.template.magic_link]
subject = "Your sign-in code"
content_path = "./supabase/templates/magic_link.html"

[auth.email.template.recovery]
subject = "Your password reset code"
content_path = "./supabase/templates/recovery.html"
```

`supabase start` runs it locally: the emails arrive in Mailpit, which `supabase status` lists. Copy `.env.example` to `.env.local` and fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from `supabase status`.

For the hosted project, paste the three templates under Authentication → Emails, then:

```sh
supabase link --project-ref <your project ref>
supabase functions deploy erase-account
```

To stop bots from creating accounts, turn on CAPTCHA protection with Cloudflare Turnstile under Authentication → Attack Protection, and set `VITE_TURNSTILE_SITE_KEY`.

### Deleting an account

Apple and Google require apps that create accounts to delete them from inside the app. **Delete account**, on the profile page (or in the app bar without routing), calls the `erase-account` Edge Function, which deletes the user with `eraseUser` from `@inglorious/supabase/edge`. Tables whose rows belong to a user should reference `auth.users` with `on delete cascade`, and files under a folder named after the user's id go too, in the buckets listed in `USER_BUCKETS`.

### Before the stores

- **App Store**: under App Privacy, declare the email address (for the account) and anything else the app collects, linked to the user.
- **Google Play**: fill in the Data safety form the same way, and give the web address where people can ask for their account to be deleted, as Google requires one outside the app too.

## Edge Functions

`supabase start` already serves every function in `supabase/functions/`. While editing one, `pnpm edge` serves them with their logs in this terminal, reloading on every save; `pnpm edge:check` type-checks and lints them with Deno, which must be installed. Functions read the secrets in `supabase/functions/.env` when they start: after changing one, restart the stack (`supabase stop && supabase start`) or `pnpm edge`.

The first `pnpm edge:check` writes `supabase/functions/deno.lock`: commit it, so every machine and every deploy runs the functions with the same versions of their dependencies.

## Mandatory Native Updates

The native apps carry their web code inside the binary, so only the stores update them. Each platform's row in the `app_versions` table holds the oldest build allowed to run: an older one shows nothing but an update page, at launch and whenever it comes back to the foreground.

Once a new build is live in a store, raise that platform's minimum to its build number:

```sql
update public.app_versions set min_build = 7 where platform = 'android';
```

Never before: users would be blocked with nothing to download. Set `store_url` to the store page, or the update page shows no button. A failed check keeps the last answer, so nobody is blocked for being offline.

Older builds keep talking to the backend until they are blocked, so a change that breaks them ships in two releases: a build that works with both backends, made mandatory, then the breaking change.

## Live Updates

A store release is only needed for native changes. The web code inside the apps updates itself from a signed bundle in the public `live-updates` bucket: at launch, every hour and on each return to the foreground, the app downloads a newer bundle made for its build and switches to it the next time it goes to the background. A bundle that doesn't start within 10 seconds is rolled back and never downloaded again.

Once, before the first store build, make the signing keys:

```bash
pnpm live:keys
```

The private key goes to `~/.config/<app name>/live-update.pem`, or wherever `LIVE_UPDATE_PRIVATE_KEY` points: back it up, and never commit it. Whoever holds it can change the installed apps; without it, the next live update needs a new store build first. The public key goes to `live-update.pub.pem`: commit it, since `capacitor.config.ts` builds it into the apps, which then refuse anything it didn't sign.

To publish, commit and run:

```bash
pnpm live:release
```

It builds the committed code from a clean checkout, with the production values in `.env`, signs it and uploads it with the service role key it asks the Supabase CLI for (after `supabase link`). `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` take its place, for example in CI.

To publish on every push to `main` that changes the app, call it from a pre-push hook, which hands it the refs being pushed:

```sh
printf '%s\n' "$(cat)" | pnpm exec inglorious-live-update release --on-push
```

Every release build is stamped with the time it was built, and an app only takes a newer bundle, so a store build never goes back. `liveUpdate.minBuild` in `package.json` is the oldest build a bundle runs on: raise it to the new build number whenever a release changes something native, such as a Capacitor plugin, a permission or `capacitor.config.ts`. Development builds aren't stamped, so they never update themselves.
