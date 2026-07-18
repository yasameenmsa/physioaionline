# Plan: Add XML Prompt Template + Import Button

## Context
User wants:
1. A third prompt template (XML format) for AI to generate workshop content
2. A button in the workshop editor to paste AI output (HTML/MD/XML) and convert to blocks

## What Already Exists
- **"Paste HTML" button** in the bottom bar opens a dialog with a textarea
- `htmlToBlocks()` already auto-detects **XML prompt format** vs **standard HTML**
- `markdownToBlocks()` handles **Markdown**
- But the paste dialog only calls `htmlToBlocks()` — it doesn't handle Markdown

## Changes

### 1. Create XML Prompt Template
**File:** `prompts/text-to-xml.txt` (new)

Custom XML format that maps to all 14 block types:
- `<heading level="2">`, `<text>`, `<image src="" alt="" />`, `<youtube url="" />`
- `<quote>`, `<code language="js">`, `<list type="ordered">`, `<divider />`
- `<callout>`, `<toggle title="">`, `<columns><column width="6">`, `<table><row><cell>`, `<file>`, `<quiz>`

### 2. Upgrade the Paste Dialog to Handle All 3 Formats
**File:** `components/features/workshops/WorkshopEditor.tsx`

Changes to the existing HTML paste dialog:
- Add a **format selector** (3 buttons: HTML, Markdown, XML) at the top of the dialog
- Auto-detect format when text is pasted (XML: has `<heading>` tags, MD: has `# ` or `- ` patterns, else HTML)
- Route to the correct parser based on selection:
  - HTML/XML → `htmlToBlocks()`
  - Markdown → `markdownToBlocks()`
- Update the dialog title from "Paste HTML" to "Import Content"
- Update button label from "Convert to Blocks" to reflect the action

### 3. Add Translation Keys
**Files:** `messages/en.json`, `messages/ar.json`

New keys under `admin.editor`:
- `importContent` — "Import Content" / "استيراد المحتوى"
- `importDesc` — "Paste HTML, Markdown, or XML..." / "الصق HTML أو Markdown أو XML..."
- `formatHtml` — "HTML" / "HTML"
- `formatMarkdown` — "Markdown" / "ماركداون"
- `formatXml` — "XML" / "إكس إم إل"

## Files to Modify
1. `prompts/text-to-xml.txt` — **new file**
2. `components/features/workshops/WorkshopEditor.tsx` — upgrade paste dialog
3. `messages/en.json` — add import dialog translation keys
4. `messages/ar.json` — add import dialog translation keys

## Verification
- Open workshop editor → click "Paste HTML" button → dialog shows format selector
- Paste XML content → auto-detects XML → converts to blocks correctly
- Paste Markdown content → auto-detects Markdown → converts to blocks correctly
- Paste HTML content → auto-detects HTML → converts to blocks correctly
