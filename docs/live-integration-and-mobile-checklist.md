# Live Supabase and Android validation

## Status

The standard Playwright suite mocks Supabase. It is not evidence of live authentication, database permissions, or cloud synchronization. The live tests in `tests/live-supabase.spec.cjs` require two dedicated, pre-created Supabase test accounts and must never use real customer data.

## Enable live cloud tests in GitHub Actions

1. In GitHub, open **Settings → Secrets and variables → Actions** for this repository.
2. Add repository secrets:
   - `SUPABASE_TEST_EMAIL`
   - `SUPABASE_TEST_PASSWORD`
   - `SUPABASE_TEST_EMAIL_B`
   - `SUPABASE_TEST_PASSWORD_B`
3. Add repository variable `RUN_LIVE_SUPABASE_TESTS` with value `true`.
4. Run **Actions → Functional browser tests → Run workflow**. The live job will run only when the variable is enabled.

Use two test-only accounts. Confirm both can sign in, and that the database `protocols` table and row-level security policies are configured. The live suite creates uniquely named test records. After testing, remove records whose protocol numbers start with `LIVE-QA-` from both accounts using the app or Supabase dashboard. Do not put credentials in code, README, issues, or chat.

## Live cases

- **LIVE-CLOUD-01:** save using account A, open a fresh browser context, sign in again as account A, and verify the protocol arrives from cloud storage.
- **LIVE-CLOUD-02:** sign in as account B and verify account A's unique test protocol is absent.
- **CLOUD-03 manual:** temporarily block network access or use an isolated test environment with database access unavailable; save a test protocol and confirm the UI clearly reports that only the local copy was saved.

## Android Gboard manual test — required real device

Automated desktop Chromium cannot verify the native Android keyboard language switcher. On the target Android phone:

1. Open the published app in Chrome, not inside the GitHub editor.
2. Focus the **Client/company** text field; confirm Gboard opens.
3. Tap and hold the spacebar to switch BG ↔ EN (or use the globe key, depending on Gboard settings).
4. Confirm the language menu stays open long enough to select a language and does not disappear when tapped.
5. Repeat in client, address, notes, serial number, and reading fields.
6. Switch the app UI BG ↔ EN while a field is focused; confirm the field retains focus and the keyboard does not close unexpectedly.
7. Navigate away from a field and return; repeat portrait and landscape.
8. Record Android version, Chrome version, Gboard version, field name, steps, expected result, actual result, and screenshot/video if the failure repeats.

**Pass criteria:** the keyboard language can be changed and the selected layout remains active while typing in the app. If Gboard's switcher still collapses, record it as a device-level manual failure; don't mark it passed based on desktop tests.
