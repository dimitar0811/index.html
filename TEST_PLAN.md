# Test Plan — Gas Measurement Protocols

## Purpose
This is an educational QA/portfolio test plan for the Gas Measurement Protocols web app. The checks below describe expected behavior; they are not a claim that every scenario has already passed in a real browser.

## Test environment
- Published app: https://dimitar0811.github.io/index.html/
- Browser: current Chrome on desktop and Android
- Test data only: do not enter real customer data.
- Cloud tests require a working Supabase project, configured `protocols` table, and a test account.
- Offline tests should be performed with network access disabled or by choosing **Продължи офлайн**.

## Test cases

| ID | Area | Steps | Expected result |
|---|---|---|---|
| AUTH-01 | Login validation | Submit login with empty email/password | Validation message appears; no sign-in request is made |
| AUTH-02 | Login | Enter valid test credentials and sign in | Login overlay closes and app controls are usable |
| AUTH-03 | Registration validation | Switch to registration and enter mismatched passwords | Clear error appears; account is not created |
| AUTH-04 | Registration | Register with a new test email and matching password | Success/confirmation message appears; session opens if Supabase returns one |
| AUTH-05 | Offline mode | Select “Продължи офлайн” | Login overlay closes and local app can be used |
| AUTH-06 | Logout | Sign in, then select “Изход” | Login overlay returns and user controls are hidden |
| UI-01 | Main actions | Open app in signed-in and offline modes | Save, signatures, print/PDF, share, new protocol, and archive controls are visible and clickable |
| LANG-01 | Language | Select EN, then BG | Text labels switch to the selected language |
| CALC-01 | Corrector calculation | Set start reading 100 and end reading 125.5 | Corrector usage displays 25.500 m³ |
| CALC-02 | Meter calculation | Set start reading 40 and end reading 47.25 | Meter usage displays 7.250 m³ |
| CALC-03 | Decimal readings | Enter decimal values in both readings | Calculations update immediately to three decimal places |
| CALC-04 | Negative difference | Enter an end reading lower than the start reading | Negative difference is displayed; confirm whether validation should reject it |
| DATE-01 | Main date | Choose a date from the calendar | Date appears in DD.MM.YYYY format |
| DATE-02 | Other dates | Set corrector and meter dates via their calendar controls | Each chosen date appears in DD.MM.YYYY format |
| SAVE-01 | Required client | Try saving with an empty client/company field | Validation alert appears and no protocol is added |
| SAVE-02 | Save protocol | Fill in client and sample data, then save | Protocol number is generated if empty; current form is stored locally and appears in archive |
| SAVE-03 | Update existing protocol | Change data and save using the same protocol number | Archive entry is updated rather than duplicated |
| ARCH-01 | Empty archive | Open archive before saving any protocol | Empty-state message appears |
| ARCH-02 | Open archive entry | Save a protocol, open archive, select Open | Saved fields and signatures are restored to the form |
| ARCH-03 | Delete archive entry | Delete a saved test protocol and confirm | Entry disappears from archive |
| NEW-01 | New protocol | Start from a saved protocol and choose New protocol; confirm | Form is cleared, date is set, previous record remains in archive |
| NEW-02 | Repeat customer | Save a protocol, then start a new one for the same client | Customer/site/device details are reused and previous end readings become new start readings |
| SIG-01 | Supplier signature | Open supplier signature dialog, draw, save | Signature image appears in supplier signature area |
| SIG-02 | Client signature | Open client signature dialog, draw with touch or mouse, save | Signature image appears in client signature area |
| SIG-03 | Cancel/clear signature | Open signature dialog, clear or cancel | Clear removes drawing; cancel closes without applying a new signature |
| PRINT-01 | Print/PDF | Fill sample protocol and select Print/PDF | Browser print dialog opens and non-print controls are hidden |
| FILE-01 | Share/export | Fill client and select Send as file | HTML file is shared or downloaded; output contains current protocol data |
| CLOUD-01 | Cloud save | Sign in, save a test protocol with a unique protocol number | Record is saved to the signed-in user's cloud archive |
| CLOUD-02 | Cloud isolation | Sign in as a different test account | The first account's records are not visible to the second account |
| CLOUD-03 | Cloud failure | Temporarily make cloud unavailable and save | App gives a clear cloud-save failure message and does not falsely claim cloud success |
| MOBILE-01 | Mobile layout | Test on Android in portrait orientation | Fields and action controls remain usable without overlapping |
| SECURITY-01 | Archive text escaping | Use test text containing characters like <, >, &, and quotes in client/site fields | Archive displays text as text; it does not execute markup |
| PERSIST-01 | Local persistence | Save a test protocol and reload the same browser | Local saved data and archive remain available |
| PERSIST-02 | Cloud reload | Save while signed in, reload, and wait for cloud load | Cloud records load for the current account |

## Known issues to investigate before calling the app tested

- The quick-action bar was authored with `display:none!important`; JavaScript assigning `style.display = 'flex'` cannot override that declaration. The bar may stay hidden after login/offline mode.
- `shareFile()` calls `save()`, which displays a save alert before opening the share/download flow; this can interrupt the flow or create confusing feedback.
- `printProtocol()` saves locally but does not itself await or confirm cloud save.
- The cloud save uses `upsert` with conflict target `user_id,pno`; verify that the database has a matching unique constraint and appropriate row-level security policies.
- Deleting an archive item calls cloud deletion without awaiting or reporting errors.
- A negative meter/corrector reading difference is currently displayed as a negative usage value; confirm the desired business rule.
- Calendar picker behavior varies across mobile browsers and needs real-device verification.

## Static source audit (2026-10-09)

The following source-level checks passed after the code fixes. These are static checks, not end-to-end browser tests.

- [x] All 19 unique inline button handler names match declared JavaScript functions.
- [x] All 40 JavaScript-referenced HTML element IDs exist.
- [x] Quick-action toolbar no longer has an inline `display:none!important` rule that blocks JavaScript from showing it.
- [x] Calculation inputs for both devices are wired to input events.
- [x] Save flow distinguishes local success from cloud-save failure.
- [x] File-share flow no longer triggers a second save dialog from inside the export function.
- [x] Print action checks for a client/company before opening the print dialog.
- [x] Cloud deletion errors have an explicit error path.
- [x] Date formatting helper is present.
- [x] Archive output escapes user-entered text.

Live login, registration, Supabase database permissions, real file sharing, PDF printing, signatures, and mobile-device behavior still require manual browser/device testing. They are not marked as passed here.

## Execution record

Use this section to record actual results during browser testing. Do not mark a case Pass unless it was executed.

| ID / range | Result (Pass/Fail/Blocked/Not run) | Evidence / notes |
|---|---|---|
| AUTH-01–AUTH-06 | Not run | |
| UI-01, LANG-01 | Not run | |
| CALC-01–CALC-04 | Not run | |
| DATE-01–DATE-02 | Not run | |
| SAVE-01–SAVE-03 | Not run | |
| ARCH-01–ARCH-03 | Not run | |
| NEW-01–NEW-02 | Not run | |
| SIG-01–SIG-03 | Not run | |
| PRINT-01, FILE-01 | Not run | |
| CLOUD-01–CLOUD-03 | Blocked pending live test credentials/configuration | |
| MOBILE-01, SECURITY-01, PERSIST-01–PERSIST-02 | Not run | |

## Portfolio note
This is an educational test plan intended to demonstrate test analysis and coverage. It does not certify the app as production-ready or legally/metrologically compliant.
