# CodeForge + Termux code-server (landscape, keyboard/mouse)

CodeForge opens the code-server website in a native Android WebView Activity, not Chrome. The embedded screen is locked to landscape and is intended for a physical keyboard and mouse.

## 1. Install code-server in Termux

```sh
pkg update && pkg upgrade -y
pkg install tur-repo -y
pkg install code-server -y
mkdir -p ~/.config/code-server
nano ~/.config/code-server/config.yaml
```

Set a password in `config.yaml` (example):

```yaml
bind-addr: 127.0.0.1:8080
auth: password
password: CHANGE_THIS_TO_A_LONG_PASSWORD
cert: false

```

Start the server and keep Termux alive:

```sh
code-server --bind-addr 127.0.0.1:8080
```

## 2. Build CodeForge

Use Node.js 22+ and Java 21 in a Linux build environment (or Android build environment that supports Gradle). From the project root:

```sh
npm install
npm run build
npx cap add android
npx cap sync android
cd android
./gradlew assembleDebug
```

The APK is `android/app/build/outputs/apk/debug/app-debug.apk`. Install it, start code-server in Termux, then open **Connect code-server** from the CodeForge welcome screen.

## Security and limits

- Keep code-server bound to `127.0.0.1`; do not expose it to your LAN or the internet without a security review.
- Use a strong password. Anyone who can reach the server and authenticate can access the files and terminal available to that code-server process.
- The embedded view uses a native WebView, locked to landscape. Touchscreen taps are ignored; it is designed for a physical keyboard and mouse/trackpad. Some VS Code extensions requiring desktop binaries, native APIs, or unsupported browser capabilities may not work on Android.
- The WebView does not install or start code-server automatically; Termux must keep the process running.
