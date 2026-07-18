# Workshop Plan — CEO Review Complete

## Overview
New "Workshops" feature — Notion-like block editor for creating rich educational content alongside existing YouTube-only "Courses".

## Architecture
- **Model:** Workshop (new Mongoose collection, embedded blocks)
- **Hierarchy:** Workshop → Sections → Lessons → Blocks
- **Block Types:** 16 (paragraph, heading, image, youtube, quote, code, list, divider, columns, callout, toggle, table, file, quiz)
- **Data:** Embedded blocks in MongoDB (Workshop document)
- **Save:** Auto-save (30s debounce) + manual save + LocalStorage backup
- **Drag-and-Drop:** @dnd-kit for block reorder
- **Slash Commands:** `/` menu to add blocks (Notion-style)

## Scope
- Student dashboard (progress, completion)
- Instructor dashboard (analytics, student list)
- Image + file upload for blocks
- All 16 block types
- Responsive design, accessibility

## Deferred
- AI content generation
- Real-time collaboration
- Stripe integration
- Certificates for workshops
- Mobile app
- Lesson templates

## Implementation Phases
1. Foundation (Week 1-2): Model, API, listing, basic editor
2. Core Editor (Week 2-3): All block types, DnD, slash commands, auto-save
3. Student Experience (Week 3-4): View, syllabus, progress, dashboard
4. Instructor + Polish (Week 4-5): Dashboard, quiz, responsive, tests
