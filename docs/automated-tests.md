# Automated functional tests

These browser tests target the published `index.html` entry point and follow the cases in `TEST_PLAN.md`.

## Automated browser coverage

- Login form validation and registration password mismatch
- Offline mode and action-toolbar visibility
- BG/EN interface switching
- Corrector/meter calculations, decimal precision and negative differences
- Date-picker formatting
- Required-client validation, local save, generated protocol number and reload persistence
- Updating an existing archive record without duplication
- Empty archive, opening and deleting an entry
- New protocol and repeat-customer reading carry-over
- Escaping of customer-entered archive text
- Signature canvas interaction
- Print guard and print invocation
- HTML file export/download
- Mocked cloud-save failure path

## Important limitations

Supabase is mocked in automated browser tests to avoid modifying real accounts or production records. Passing mocked cloud tests does not prove real authentication, row-level security, cloud isolation, database constraints, or synchronization across devices. Those require a dedicated test account and configured Supabase database. Android Gboard language switching, native file sharing, and real print/PDF behavior require manual tests on the target device/browser.

## Run locally

`npm install`  
`npx playwright install chromium`  
`npm test`
