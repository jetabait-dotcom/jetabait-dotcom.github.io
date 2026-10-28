# JetaCode online rooms

The game page is `dist/codenames.html`. It intentionally uses nickname sessions independently of the library's Google accounts. The browser generates a UUID v4 player capability and stores it locally. Only its SHA-256 digest is stored in the private room membership map. Share links contain the room code, never the player capability. Losing browser storage loses that player's seat.

`codenames.sql` is the consolidated installation schema. Applied changes are recorded in the connected Supabase project's migration history. Room tables have RLS, an explicit deny policy, and no direct privileges for API roles. The public RPC is a security-invoker wrapper. A private, fixed-search-path definer function validates the player capability and game role, serializes changes with a row lock, and constructs a role-filtered response. An active spymaster cannot switch roles or teams. Both spymasters see the key, as in the board game; operatives and spectators receive no unrevealed colors.

Database broadcasts contain only an empty refresh hint. Clients fetch authorized state through the RPC. A five-second fallback and reconnect/visibility handlers recover missed notifications. Commands carry the last room version; stale guesses cannot apply to a later turn. Deadline transitions use the database clock and preserve the new turn when an expired command arrives.

Run `codenames.test.sql` through the SQL connector. All test rooms, moves, and broadcasts are rolled back. It tests card distribution, role authorization, hidden-key filtering, clue penalties, guessing, assassin loss, completion victory, extra-guess limits, unlimited clues, replay, reconnection, custom decks, timer expiry, stale actions, and empty-room host recovery.

Voice chat is external. Word sets include Thai, English and custom lists. Semantic clue disputes are handled by the opposing spymaster's challenge action before the first guess; players should agree before using it.

The Thai pool contains 1,350 unique words across 23 categories, maintained in `words-th.json`. Run `node scripts/build-thai-words.cjs` from the project directory to validate the pool and regenerate the installation schema, expansion migration and language-option count. Existing Thai rooms receive the new pool for future rounds; their active boards stay unchanged.
