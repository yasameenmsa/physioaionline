# Fix: Image Upload/Drag-Drop in Column Blocks

## Problem
Images inside column blocks cannot be uploaded or drag-and-dropped. The `InnerBlockEditor.tsx` component's `image` case is a stripped-down version that only supports URL input — it's missing the file upload and drag-drop handlers that the full `ImageBlock.tsx` has.

## Root Cause
`components/features/workshops/blocks/InnerBlockEditor.tsx:132-163` — the `image` case in `renderInnerBlock()` has no `<input type="file">`, no upload handler, and no drag-drop support.

## Fix

### File: `components/features/workshops/blocks/InnerBlockEditor.tsx`

1. Add `useRef` for a hidden file input (add to existing imports from React)
2. Add a `handleFileUpload` async function that:
   - Accepts a File object
   - Uses `uploadFile` from `@/lib/upload-utils` (same as ImageBlock.tsx)
   - Calls `onUpdate(block.id, url, { alt: '', caption: '' })` on success
3. Add a hidden `<input type="file" accept="image/*">` inside the `image` case
4. Add drag-drop handlers (`onDragOver`, `onDrop`) to the image container
5. Make the empty-state container clickable to trigger the file input
6. Add a small "Upload" button alongside the existing URL input

### No other files need changes.
