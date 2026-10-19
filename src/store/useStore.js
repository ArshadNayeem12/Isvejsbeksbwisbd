import { create } from 'zustand';
import { chooseWorkspaceFolder, saveWorkspaceToFolder } from '../utils/native';

const STORAGE_KEY = 'codeforge-workspace-v2';

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const LANGUAGE_TEMPLATES = {
  html: {
    label: 'HTML',
    icon: '🌐',
    description: 'Web pages and semantic markup',
    files: [
      { name: 'index.html', language: 'html', content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CodeForge Project</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main class="container">
    <h1>Hello, CodeForge!</h1>
    <p>Start building something amazing.</p>
    <button id="actionButton">Click me</button>
  </main>
  <script src="script.js"></script>
</body>
</html>` },
      { name: 'style.css', language: 'css', content: `* { box-sizing: border-box; }
body {
  margin: 0;
  min-height: 100vh;
  font-family: system-ui, sans-serif;
  background: #0b1020;
  color: #eef2ff;
}
.container {
  min-height: 100vh;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 12px;
  padding: 24px;
}
button {
  border: 0;
  border-radius: 10px;
  padding: 10px 16px;
  cursor: pointer;
}` },
      { name: 'script.js', language: 'javascript', content: `const button = document.querySelector('#actionButton');

button?.addEventListener('click', () => {
  button.textContent = 'It works! ⚡';
  console.log('CodeForge preview is running.');
});` }
    ]
  },
  css: {
    label: 'CSS', icon: '🎨', description: 'Stylesheets and responsive design',
    files: [{ name: 'style.css', language: 'css', content: `:root { font-family: system-ui, sans-serif; }
body { margin: 0; min-height: 100vh; display: grid; place-items: center; }
.card { padding: 2rem; border-radius: 1rem; }` }]
  },
  javascript: {
    label: 'JavaScript', icon: 'JS', description: 'Interactive web and scripting',
    files: [{ name: 'index.js', language: 'javascript', content: `const greet = (name = 'CodeForge') => {
  console.log(\`Hello, \${name}!\`);
};

greet();` }]
  },
  typescript: {
    label: 'TypeScript', icon: 'TS', description: 'Typed JavaScript applications',
    files: [
      { name: 'index.ts', language: 'typescript', content: `type User = { name: string; age: number };

const user: User = { name: 'CodeForge', age: 1 };
console.log(user);` },
      { name: 'tsconfig.json', language: 'json', content: `{
  "compilerOptions": {
    "target": "ES2020",
    "strict": true,
    "module": "ESNext"
  }
}` }
    ]
  },
  python: {
    label: 'Python', icon: '🐍', description: 'Scripts, automation and applications',
    files: [{ name: 'main.py', language: 'python', content: `def main():
    message = "Hello from CodeForge!"
    print(message)

if __name__ == "__main__":
    main()
` }]
  },
  json: {
    label: 'JSON', icon: '{}', description: 'Structured configuration and data',
    files: [{ name: 'data.json', language: 'json', content: `{
  "name": "CodeForge Project",
  "version": "1.0.0",
  "enabled": true
}` }]
  },
  markdown: {
    label: 'Markdown', icon: 'M↓', description: 'Documentation and formatted text',
    files: [{ name: 'README.md', language: 'markdown', content: `# CodeForge Project

Welcome to your new project.

## Getting started

Edit this file and use the preview when working with web files.
` }]
  },
  java: {
    label: 'Java', icon: '☕', description: 'Object-oriented applications',
    files: [{ name: 'Main.java', language: 'java', content: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from CodeForge!");
    }
}` }]
  },
  c: {
    label: 'C', icon: 'C', description: 'Native systems programming',
    files: [{ name: 'main.c', language: 'c', content: `#include <stdio.h>

int main(void) {
    printf("Hello from CodeForge!\\n");
    return 0;
}` }]
  },
  cpp: {
    label: 'C++', icon: 'C+', description: 'Native applications and games',
    files: [{ name: 'main.cpp', language: 'cpp', content: `#include <iostream>

int main() {
    std::cout << "Hello from CodeForge!\\n";
    return 0;
}` }]
  },
  csharp: {
    label: 'C#', icon: 'C#', description: '.NET applications',
    files: [{ name: 'Program.cs', language: 'csharp', content: `using System;

class Program {
    static void Main() {
        Console.WriteLine("Hello from CodeForge!");
    }
}` }]
  },
  php: {
    label: 'PHP', icon: 'PHP', description: 'Server-side web development',
    files: [{ name: 'index.php', language: 'php', content: `<?php
echo "Hello from CodeForge!";
` }]
  },
  go: {
    label: 'Go', icon: 'Go', description: 'Fast backend and systems software',
    files: [{ name: 'main.go', language: 'go', content: `package main

import "fmt"

func main() {
    fmt.Println("Hello from CodeForge!")
}` }]
  },
  rust: {
    label: 'Rust', icon: '🦀', description: 'Safe and performant systems programming',
    files: [{ name: 'main.rs', language: 'rust', content: `fn main() {
    println!("Hello from CodeForge!");
}` }]
  },
  sql: {
    label: 'SQL', icon: 'SQL', description: 'Queries and database scripts',
    files: [{ name: 'query.sql', language: 'sql', content: `CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);

SELECT * FROM users;` }]
  },
  bash: {
    label: 'Bash', icon: '>_', description: 'Shell scripts and automation',
    files: [{ name: 'script.sh', language: 'shell', content: `#!/usr/bin/env bash
set -e

echo "Hello from CodeForge!"` }]
  },
  yaml: {
    label: 'YAML', icon: 'YML', description: 'Configuration files',
    files: [{ name: 'config.yaml', language: 'yaml', content: `name: CodeForge
version: 1.0
enabled: true` }]
  },
  xml: {
    label: 'XML', icon: 'XML', description: 'Structured markup',
    files: [{ name: 'document.xml', language: 'xml', content: `<?xml version="1.0" encoding="UTF-8"?>
<document>
  <title>CodeForge</title>
</document>` }]
  }
};

const languageFromName = (name) => {
  const ext = name.toLowerCase().split('.').pop();
  const map = {
    html: 'html', htm: 'html', css: 'css', js: 'javascript', mjs: 'javascript', cjs: 'javascript', jsx: 'javascript',
    ts: 'typescript', tsx: 'typescript', json: 'json', md: 'markdown', py: 'python', java: 'java',
    c: 'c', h: 'c', cpp: 'cpp', cc: 'cpp', cxx: 'cpp', cs: 'csharp', php: 'php', go: 'go', rs: 'rust',
    sql: 'sql', sh: 'shell', bash: 'shell', yml: 'yaml', yaml: 'yaml', xml: 'xml', txt: 'plaintext'
  };
  return map[ext] || 'plaintext';
};

const makeFiles = (items) => items.map(f => ({ ...f, id: uid() }));
const defaultFiles = makeFiles(LANGUAGE_TEMPLATES.html.files);
const saved = (() => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch { return null; }
})();

export const useStore = create((set, get) => ({
  theme: saved?.theme || 'github-dark',
  setTheme: (theme) => set({ theme }),
  view: saved?.files?.length ? 'editor' : 'welcome',
  setView: (view) => set({ view }),
  activeSidebar: 'explorer',
  setActiveSidebar: (view) => set({ activeSidebar: view, sidebarVisible: true }),
  sidebarVisible: true,
  toggleSidebar: () => set(s => ({ sidebarVisible: !s.sidebarVisible })),
  showAIPanel: false,
  toggleAIPanel: () => set(s => ({ showAIPanel: !s.showAIPanel })),
  aiMode: 'preview',
  setAiMode: (mode) => set({ aiMode: mode, showAIPanel: true }),
  showTerminalPanel: false,
  toggleTerminalPanel: () => set(s => ({ showTerminalPanel: !s.showTerminalPanel })),
  cmdPaletteOpen: false,
  toggleCmdPalette: () => set(s => ({ cmdPaletteOpen: !s.cmdPaletteOpen })),
  files: saved?.files || defaultFiles,
  activeFileId: saved?.activeFileId || defaultFiles[0].id,
  openTabs: saved?.openTabs || defaultFiles.map(f => f.id),
  workspaceName: saved?.workspaceName || 'Untitled Project',
  workspaceFolder: saved?.workspaceFolder || null,
  saving: false,
  saveMessage: '',
  dirty: false,
  cursor: { line: 1, column: 1 },
  setCursor: (cursor) => set({ cursor }),
  setWorkspaceFolder: (folder) => {
    set({ workspaceFolder: folder });
    const s = get();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      theme:s.theme, files:s.files, activeFileId:s.activeFileId, openTabs:s.openTabs,
      workspaceName:s.workspaceName, workspaceFolder: folder
    }));
  },
  selectWorkspaceFolder: async () => {
    try {
      const folder = await chooseWorkspaceFolder();
      get().setWorkspaceFolder(folder);
      set({ saveMessage: 'Folder access granted' });
      return folder;
    } catch (error) {
      set({ saveMessage: error?.message || 'Folder selection cancelled' });
      return null;
    }
  },
  saveProject: async () => {
    let folder = get().workspaceFolder;
    if (!folder) folder = await get().selectWorkspaceFolder();
    if (!folder) return false;
    set({ saving: true, saveMessage: 'Saving files…' });
    try {
      await saveWorkspaceToFolder(folder, get().files);
      get().saveWorkspace();
      set({ saving: false, saveMessage: `Saved ${get().files.length} file${get().files.length === 1 ? '' : 's'}` });
      return true;
    } catch (error) {
      set({ saving: false, saveMessage: error?.message || 'Save failed' });
      return false;
    }
  },
  setActiveFile: (id) => set(s => ({ activeFileId: id, openTabs: s.openTabs.includes(id) ? s.openTabs : [...s.openTabs, id] })),
  closeTab: (id) => set(s => {
    const tabs = s.openTabs.filter(x => x !== id);
    return { openTabs: tabs, activeFileId: s.activeFileId === id ? (tabs[tabs.length - 1] || null) : s.activeFileId };
  }),
  updateFileContent: (id, content) => set(s => ({ dirty: true, files: s.files.map(f => f.id === id ? { ...f, content } : f) })),
  createFile: (name, content = '') => set(s => {
    const clean = name.trim();
    if (!clean || s.files.some(f => f.name === clean)) return s;
    const file = { id: uid(), name: clean, language: languageFromName(clean), content };
    return { files: [...s.files, file], openTabs: [...s.openTabs, file.id], activeFileId: file.id, dirty: true };
  }),
  renameFile: (id, name) => set(s => {
    const clean = name.trim();
    if (!clean || s.files.some(f => f.id !== id && f.name === clean)) return s;
    return { files: s.files.map(f => f.id === id ? { ...f, name: clean, language: languageFromName(clean) } : f), dirty: true };
  }),
  deleteFile: (id) => set(s => {
    const tabs = s.openTabs.filter(x => x !== id);
    const active = s.activeFileId === id ? (tabs[tabs.length - 1] || null) : s.activeFileId;
    return { files: s.files.filter(f => f.id !== id), openTabs: tabs, activeFileId: active, dirty: true };
  }),
  saveWorkspace: () => {
    const s = get();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      theme:s.theme, files:s.files, activeFileId:s.activeFileId, openTabs:s.openTabs,
      workspaceName:s.workspaceName, workspaceFolder:s.workspaceFolder
    }));
    set({ dirty: false });
  },
  newProject: (key) => {
    const template = LANGUAGE_TEMPLATES[key] || LANGUAGE_TEMPLATES.html;
    const files = makeFiles(template.files);
    set({ view:'editor', files, activeFileId:files[0]?.id || null, openTabs:files.map(f=>f.id), workspaceName:`${template.label} Project`, dirty:true });
    setTimeout(() => get().saveWorkspace(), 0);
  },
  closeWelcome: () => set({ view:'languages' }),
  backToWelcome: () => set({ view:'welcome' }),
  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  chatMessages: [{ role:'ai', content:'CodeForge Copilot is ready. Ask me to explain, find bugs, refactor, generate code, or edit the active file.' }],
  addChatMessage: (msg) => set(s => ({ chatMessages:[...s.chatMessages,msg] }))
}));

export { languageFromName };
