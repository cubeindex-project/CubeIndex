# Local database seeds

The Supabase CLI loads these files in lexicographic order through the
`./seeds/*.sql` pattern in `supabase/config.toml`.

## Files

1. `00_auth_users.sql` creates login-capable Auth users and profiles.
2. `10_catalog.sql` adds reusable features, cube taxonomy, brands, series,
   vendors, review categories, and achievements.
3. `20_cubes.sql` adds representative cube models and feature assignments.
4. `30_commerce.sql` adds current vendor offers and historical price snapshots.
5. `40_community.sql` adds collections, ratings, reviews, follows,
   achievements, and notifications.
6. `50_submissions.sql` adds a pending cube submission for staff workflow
   testing.

Each SQL file owns a dependency layer. Add new files with a numeric prefix and
place them after every file that provides data they reference.

## Local accounts

All seeded users use the password `password123`.

| Role | Email |
| --- | --- |
| Admin | `admin@cubeindex.local` |
| User | `alex@cubeindex.local` |
| User | `maya@cubeindex.local` |

These credentials are development-only and must never be used in a deployed
environment.

## Applying seeds

From the project root, run:

```sh
npm run db:reset
```

The seed transactions temporarily set `session_replication_role` to `replica`.
This prevents seed inserts from sending Discord notifications, creating audit
noise, or invoking business-rule triggers while the fixture graph is assembled.
The setting is transaction-local and normal trigger behavior resumes after each
file commits.
