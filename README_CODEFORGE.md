# CodeForge Studio — Final Production Workspace Build

CodeForge is a mobile-first coding workspace built around Monaco Editor, Emmet, project templates, live web preview, an offline Copilot assistant, integrated terminal tools, and user-controlled project storage.

## Main workflow
1. Welcome screen
2. Choose language
3. Choose the project/workspace folder in the system picker
4. CodeForge generates the starter files
5. The first save writes the project files to that folder
6. Later saves reuse the same folder grant

### HTML template
Selecting HTML creates:
- `index.html`
- `style.css`
- `script.js`

The files are linked and immediately usable in Live Preview.

## Editor
- Monaco editor
- compact 11px editor text / 16px line height
- word wrap off by default so more code fits vertically and horizontally
- reduced editor chrome and denser tabs
- syntax highlighting
- Emmet integration
- tabs and dirty state
- create / rename / duplicate / delete
- content-aware workspace search
- command palette
- local autosave
- explicit disk Save

## Live Preview
- right-side Live Preview panel
- HTML + CSS + JS composition
- desktop/mobile preview widths
- refresh button
- sandboxed iframe preview
- **Open in Chrome** button on Android

The Android native bridge creates a temporary HTML file and launches Chrome directly when Chrome is installed. If Chrome is unavailable, Android falls back to the normal browser intent.

## Copilot
The built-in Copilot is intentionally offline and does not ship an API key. It is functional for common coding workflows:
- explain the active file
- inspect common HTML/JS structural problems
- generate navbar, button and form snippets
- apply generated snippets into the active editor
- copy generated code
- safe local `var` → `const` refactor

A cloud LLM can be added later through a secure backend without exposing a provider secret inside the APK.

## Project storage / permissions
Android uses the Storage Access Framework through the built-in CodeForge native Capacitor plugin. The user explicitly selects a folder and Android grants access to that directory tree. CodeForge persists the URI permission natively and writes UTF-8 source files through `DocumentFile`.

This intentionally avoids broad `MANAGE_EXTERNAL_STORAGE` access. A user-selected directory grant is the safer Play Store-compatible model for an editor that works with user-selected project folders.

## Capacitor / Play Store baseline
This project uses **Capacitor 8** and Android API **36** as the production baseline. Google Play's current requirement says that starting **August 31, 2026**, new apps and app updates must target Android 16 / API 36 or higher. citeturn11search0

Capacitor's current Android migration guidance for v8 also uses compile/target SDK 36 and Java 21. citeturn3search4

## Fresh Android setup
If you have an old Capacitor 6 `android/` directory, do not mix it with this build:

```bash
rm -rf android
npm install
npm run build
npx cap add android
npx cap sync android
```

Then check the environment:

```bash
npx cap doctor
java -version
node -v
```

Node 22+ and Java 21 are the intended baseline for this build.

## Debug APK

```bash
npm run android:debug
```

APK:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

## Release / Play Store
For Play Store release you still need to configure your own signing key / Play App Signing, version code, app icon/splash assets, store listing, Data safety declaration, content rating, privacy policy where applicable, and test the release AAB on real Android devices. Google requires signed Android releases. citeturn11search1

## Validation performed on this source package
- package JSON parsed successfully
- JavaScript utility/store files passed Node syntax checks
- all JSX/JS source files passed TypeScript parser syntax validation
- Capacitor config has a type-only `CapacitorConfig` import
- no old `bundledWebRuntime` config remains
- custom Android plugin source has no Java parser-level syntax errors; full Android compilation requires the Android/Gradle dependency tree, which was not available in the editing environment

The final archive intentionally does not contain `node_modules` or a generated Android platform directory. Run `npm install` and `npx cap add android` once in the target environment so Capacitor generates the correct native project for the installed Capacitor 8 packages.
