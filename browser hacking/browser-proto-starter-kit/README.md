# OCT 22 Royal Academy of AI — AI Prototying in the Browser

This Browser Prototyping Starter Kit contains example **Userscripts** and **Extensions**. Each example is fully working so you can test, edit, and explore on your own.

---

## 📁 Folder Structure

```
Royal-AI-Browser-Starter-Kit/
│
├── 01-userscripts/
│   ├── highlight-keywords.user.js
│   ├── image-tilt-example.user.js
│   ├── upsell-edge.user.js
│   └── (create your own here)
│
├── 02-extensions/
│   ├── focus-mode/
│   ├── tab-snooze/
│   └── (create your own here)
│
└── README.md
```

---

## 🚀 How to Test

### 🧷 Userscripts (Tampermonkey)

1. Open **Tampermonkey** → Dashboard.
2. Click **“Create a new script”** and delete any default content.
3. Copy the contents of any `.user.js` file from `01-userscripts/` and paste it in.
4. Save (`⌘/Ctrl + S`).
5. Go to any webpage — your script should activate automatically.

---

### 🧩 Extensions (MV3)

1. Open **Edge/Chrome** → `edge://extensions` or `chrome://extensions`.
2. Enable **Developer Mode**.
3. Click **Load unpacked** → select a folder inside `02-extensions/`.
4. Pin the extension icon to the toolbar.
5. To reload changes, click the **Reload** icon under your extension in the Extensions page.

---

## ⚙️ Code Generation Templates

### 🧷 Userscripts

```
Create a new Tampermonkey userscript file in:
01-userscripts/<file-name>.user.js

It should [describe what it should do / add / change to the page]
and run on all pages [or optional: replace with specific pages].
```

---

### 🧩 Extensions

```
Create a new MV3 extension at:
02-extensions/<folder-name>/

It should [explain what the feature should do].

Constraints & Details:
- Do not use bundlers; just create and save these files into that folder.
- Pick the right Chrome/Edge APIs and include short comments explaining which APIs are used and why.
- Use a minimal manifest without the 'icons' field so it loads without image assets.
- Keep everything plain JS/HTML/CSS — no frameworks or build tools.
```

---

🪄 Royal Academy of AI — AI Prototyping in Browser
Happy vibe-coding!
