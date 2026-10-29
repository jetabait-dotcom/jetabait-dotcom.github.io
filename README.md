# Jetabait

Game hub with Codenames, 7 Wonders Duel and Spyfall.

## Hosting

The committed `dist/` directory is the complete static website. GitHub Actions tests and deploys it to GitHub Pages on pushes to `main`.

Use the repository name `jetabait-dotcom.github.io` so existing root-relative routes work at `https://jetabait-dotcom.github.io/`. In Settings → Pages, select **GitHub Actions** as the build source.

Supabase continues to provide authentication, database and game functions. Add `https://jetabait-dotcom.github.io/account.html` to Supabase Authentication → URL Configuration → Redirect URLs, retaining the existing website URL. Without this setting Google login may return visitors to the original website.

## Online visitors

The homepage sidebar uses the public Supabase Realtime Presence channel `jetabait-online-v1`. The login page and all three games also publish presence. Names/status are client-reported display information, never proof of identity or authorization. Payloads contain display names and pseudonymous deduplication keys; no emails, Auth UUIDs, avatars or access tokens are shared. Guests receive a random browser identifier; accounts are deduplicated with a namespaced hash. No visitor history is stored in a database. Disconnected clients disappear when the realtime service detects the disconnect, which may take a short time after a network loss. Clients on the previous deployed version do not appear until they reload.

Run `node presence.test.mjs` for lifecycle and deduplication checks. `node scripts/test-presence-live.mjs` checks two independent connections against an isolated temporary topic on the configured Supabase project.

## Update the website

Open this repository in GitHub Desktop, commit changes and choose **Push origin**. The Pages workflow publishes `dist/` automatically. Files outside `dist/` are source and documentation, not web assets.

## Check

```sh
node --test auth.test.cjs board.test.cjs duel.test.mjs duel-server.test.mjs spyfall.test.mjs spyfall-server.test.mjs
```
