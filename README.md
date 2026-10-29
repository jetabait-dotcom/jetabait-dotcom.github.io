# Jetabait

Game hub with Codenames, 7 Wonders Duel and Spyfall.

## Hosting

The committed `dist/` directory is the complete static website. GitHub Actions tests and deploys it to GitHub Pages on pushes to `main`.

Use the repository name `jetabait-dotcom.github.io` so existing root-relative routes work at `https://jetabait-dotcom.github.io/`. In Settings → Pages, select **GitHub Actions** as the build source.

Supabase continues to provide authentication, database and game functions. Add `https://jetabait-dotcom.github.io/account.html` to Supabase Authentication → URL Configuration → Redirect URLs, retaining the existing website URL. Without this setting Google login may return visitors to the original website.

## Update

Open this repository in GitHub Desktop, commit changes and choose **Push origin**. The Pages workflow publishes `dist/` automatically. Files outside `dist/` are source and documentation, not web assets.

## Check

```sh
node --test auth.test.cjs board.test.cjs duel.test.mjs duel-server.test.mjs spyfall.test.mjs spyfall-server.test.mjs
```
