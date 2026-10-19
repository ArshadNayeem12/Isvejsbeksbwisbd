# @codeforge/native

Capacitor Android plugin for CodeForge. Provides user-selected folder saving, external browser preview, and an embedded landscape WebView for Termux `code-server`.

`openCodeServer({ url: "http://127.0.0.1:8080" })` opens the code-server UI in a native Android WebView Activity. Start code-server in Termux first. Use a password in `~/.config/code-server/config.yaml`; keep the server bound to loopback. This view is optimized for landscape + physical keyboard/mouse.
