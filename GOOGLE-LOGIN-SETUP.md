# Jetabait accounts and online library

## Deployed foundation

- Supabase project: `ovqaqjtdpnkercvcuazx` (Jetabait organization, Singapore).
- `dist/account.html`: Google sign-in, profile, sign-out, and account status.
- `dist/account.js`: managed Supabase Auth with PKCE and verified user lookup. No custom password/session service.
- `dist/cloud-library.js`: owner-scoped cache, durable outbox, row-level writes, tombstone deletes, pagination and manual retry.
- `dist/library-account.js`: per-account library selection, sync on focus/reconnection, explicit import of legacy browser records.
- `db/migrations/20261028_accounts_and_library.sql`: profiles and library entries, ownership policies enforced by Postgres RLS.
- `dist/config.js`: public project URL and publishable API key only. No Google secret or Supabase secret/service-role key belongs in browser code.

The existing Sites owner-only access policy stays in place. Google identifies the app account; it does not grant a visitor access through the Sites hosting gate. Opening this to other people requires a separate, explicit audience change.

## Activation still required

1. In Google Cloud, create an OAuth web client and configure the consent screen. For a testing consent screen, add the Google accounts that should be able to test login.
2. Register this authorized Google redirect URI:
   `https://ovqaqjtdpnkercvcuazx.supabase.co/auth/v1/callback`
3. In Supabase Authentication > Sign In / Providers > Google, enable Google and enter the Google client ID and secret. Keep the secret in Supabase settings, never in this repository or in chat.
4. In Supabase Authentication > URL Configuration set Site URL to:
   `https://my-watch-vault-jeta.secrettitan13.chatgpt.site`
   and allow this application redirect URL:
   `https://my-watch-vault-jeta.secrettitan13.chatgpt.site/account.html`
5. Inspect `/auth/v1/settings` with the publishable API key and confirm `external.google` is true. Set `googleEnabled: true` in `dist/config.js`, package and deploy the Site using its existing ID.
6. Verify Google sign-in/sign-out, then explicitly import the existing device library from the sidebar after a successful initial cloud pull. Keep the original backup until the imported records are visible after signing in from another device.

Until activation, the account screen shows that Google Login is not enabled, and the existing browser library remains usable. This is deliberate: no demo account or fake successful login is shown.

## Data and sync behavior

- Google credentials and token renewal are handled by Supabase Auth.
- Auth UUID is the owner key; email/name are display fields, never authorization checks.
- Tables deny anonymous access and require `auth.uid()` to match the row owner for every operation.
- Each user has an independent browser cache and outbox. Logging into a different user never selects another user's cache.
- Pending offline writes are kept until the server confirms them. A deletion is retained online as a tombstone.
- Simultaneous edits to the same record use last server write wins. Other devices refresh on window focus or reconnect; this first implementation does not subscribe to live realtime changes.
- Local-to-account import is explicit and only adds missing IDs; existing online records win duplicates. The legacy device library is not deleted.
- Future Jetabait tools should use new owner-scoped tables and policies, keeping Supabase Auth as the shared identity service.

## References

- https://supabase.com/docs/guides/auth/social-sign-in/auth-google
- https://supabase.com/docs/guides/auth/sessions/pkce-flow
- https://supabase.com/docs/guides/auth/redirect-urls
- https://supabase.com/docs/guides/database/postgres/row-level-security
