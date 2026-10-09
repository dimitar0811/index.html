# Газови протоколи | Gas Measurement Protocols

**A lightweight, bilingual web application for preparing and managing gas measurement protocols.**  
**Леко уеб приложение на български и английски език за изготвяне и управление на протоколи за газови измервания.**

- **Live app / Приложение:** https://dimitar0811.github.io/index.html/
- **Repository / Хранилище:** https://github.com/dimitar0811/index.html
- **Format / Формат:** Responsive, single-page HTML application
- **Languages / Езици:** Bulgarian (BG) and English (EN)

## Overview / За проекта

Gas Protocols is a browser-based form designed to make gas measurement protocol preparation more consistent and convenient. It brings customer and site details, meter information, calculated readings, notes, signatures, and document output into one interface.

„Газови протоколи“ е уеб форма за по-лесно и последователно изготвяне на протоколи за газови измервания. В един екран са събрани данните за клиента и обекта, измервателните уреди, изчисленията, забележките, подписите и извеждането на документа.

## Features / Функционалности

- **Bilingual interface:** switch between Bulgarian and English.
- **Customer and site details:** client/company, company ID (ЕИК / Булстат), supplier representative, site address, and contact details.
- **Meter data:** separate sections for a corrector and a gas meter, including make/model, serial number, dates, and readings.
- **Automatic calculations:** calculates usage from the difference between end and start readings for both devices.
- **Date entry:** date fields use the day–month–year display format and include calendar pickers.
- **Signatures:** capture signatures for the supplier representative and the client/representative.
- **Save and archive:** save protocols, reopen archived entries, and delete entries.
- **Repeat-customer workflow:** when starting a new protocol, the app can reuse selected customer, site, and device details from the most recent matching archived protocol; previous end readings can be carried forward as new start readings.
- **Document output:** print or save as PDF through the browser's print dialog, or export/share a standalone HTML file.
- **Authentication:** account registration and sign-in are provided through Supabase Auth.
- **Cloud storage:** the app can load and save user-associated protocol records through Supabase.
- **Offline option:** an offline mode is available for local work in the current browser.

## Typical workflow / Начин на работа

1. Open the live application and sign in, register, or choose the offline option.
2. Fill in the protocol number, date, customer, site, corrector and gas meter details.
3. Enter start and end readings; usage values are calculated automatically.
4. Add notes and capture the required signatures.
5. Save the protocol so it is added to the archive.
6. Reopen saved protocols from the archive, start a new protocol, or use Print / PDF or Share as file.

## Technology / Технологии

- **HTML5 and CSS3** for the document structure, responsive layout, and print styling.
- **Vanilla JavaScript** for form behavior, calculations, date handling, signatures, archiving, and export.
- **Supabase Auth** for account registration and sign-in.
- **Supabase database API** for cloud protocol records.
- **Browser APIs** for local storage, canvas-based signatures, printing, file creation, and sharing where supported.
- **GitHub Pages** for static hosting.

The application is intentionally implemented as a compact, client-side web app without a separate custom server.

Приложението е реализирано като компактно клиентско уеб приложение без отделен собствен сървър. HTML и CSS изграждат формата и оформлението за печат, JavaScript управлява логиката, а Supabase осигурява удостоверяване и облачен достъп до записите.

## Data and privacy notes / Данни и поверителност

- Local records are stored in the browser's local storage. They may not be available in another browser or on another device.
- Cloud availability depends on the Supabase service, database configuration, network connectivity, and account permissions.
- Offline mode is intended for local use; do not assume that offline changes are synchronized to the cloud.
- Before relying on a protocol as a business record, verify that it has been saved successfully and that the expected copy is available.
- Do not place real customer or personal data in public screenshots, issues, or example files.

- Локалните записи се съхраняват в браузъра и може да не са достъпни от друго устройство.
- Облачният достъп зависи от Supabase, настройките на базата данни, интернет връзката и правата на профила.
- Офлайн режимът е за локална работа; не приемайте, че офлайн промените се синхронизират автоматично.
- Преди да разчитате на протокол като служебен документ, проверете дали е записан успешно и дали очакваното копие е налично.
- Не публикувайте реални клиентски или лични данни в снимки, проблеми (issues) или примерни файлове.

## Running locally / Стартиране локално

Because this is a static web application, the HTML file can be served by any static web server. For example, from the repository directory:

```bash
python -m http.server 8000
```

Then open http://localhost:8000/ in a browser. Authentication and cloud functions still require valid Supabase configuration and connectivity.

## Project status / Състояние на проекта

This README documents the current implementation in the repository. The application is a practical workflow tool; this documentation does not represent a certification of metrological, regulatory, security, or legal compliance. Validate the generated document and all readings before using it operationally.

Този README описва текущата реализация в хранилището. Приложението е практичен инструмент за работен процес; документацията не удостоверява метрологично, нормативно, защитно или правно съответствие. Проверявайте документа и всички показания преди реална употреба.

## Author / Автор

Developed and maintained in the public GitHub repository by the repository owner.

Разработва се и се поддържа в публичното GitHub хранилище от неговия собственик.
