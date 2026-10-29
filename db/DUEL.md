# 7 Wonders Duel online

The base-game rules and original SVG graphics live separately from the existing Codenames game.

- Public page: `/duel.html`, browser assets `dist/duel*` and `dist/duel-assets/`.
- Rule data: `server/duel-data.mjs`; source references: `server/DUEL-SOURCES.md`.
- Authoritative engine: `server/duel-engine.mjs`. Browser responses omit unrevealed cards and future decks.
- Hosted Supabase Edge Function: `duel-game`, with `verify_jwt=true`. Signed-in Google users are required. The function binds a random browser capability to the JWT subject and hashes it at rest. Two seats only.
- Schema: `db/duel.sql`. RLS is enabled, and anon/authenticated cannot directly read or write room records. The Edge Function's server environment supplies its key.
- Updates use a version compare-and-swap. Polling never redraws the UI when the version is unchanged; hidden tabs back off. HTTP request timeouts and reconnection polling handle temporary disconnects.
- `duel.test.mjs` checks rule calculations and 150 complete games. `duel-server.test.mjs` runs the actual Edge handler with a simulated database, covering seat privacy, Auth-user binding, stale moves, complete-game and mutual-rematch behavior. Test runtime stays outside `dist`.

To redeploy the function with the connected Supabase tool, provide `server/duel-edge.ts` as `index.ts`, plus `duel-engine.mjs`, `duel-data.mjs`, and `deno.json` from `server/`. Set both `entrypoint_path=index.ts` and `import_map_path=deno.json` and retain `verify_jwt=true`.

The game UI is not a licensed official digital adaptation. Images are original code-native SVGs. It covers the base game, not Pantheon, Agora or promotional Wonders.
