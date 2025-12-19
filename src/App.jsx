import { useState, useRef, useEffect, useCallback } from 'react';
import Navbar, { VIEW_MODES } from './components/Navbar';
import MarkdownEditor from './components/MarkdownEditor';
import MarkdownPreview from './components/MarkdownPreview';
import ShortcutsModal from './components/ShortcutsModal';
import { handleKeyboardShortcut } from './utils/markdownShortcuts';
import { createNewFile, openFile, saveFile } from './utils/fileOperations';
import { downloadMarkdown, downloadPDF, printPreview } from './utils/downloadUtils';
import { Check, AlertCircle } from 'lucide-react';
import './App.css';

// Sample markdown content for demo
const SAMPLE_CONTENT = `# Welcome to MD Editor! 🚀

A beautiful markdown editor with **live preview**, *syntax highlighting*, and full math support.

## Features

- ✨ **Rich Formatting Toolbar** - Quick access to all markdown syntax
- 🎨 **Glassmorphism UI** - Modern, sleek design
- 📐 **Math Equations** - Full LaTeX support with KaTeX
- 🔤 **Syntax Highlighting** - Beautiful code blocks
- ⌨️ **Keyboard Shortcuts** - Press \`?\` to see all shortcuts

## Math Examples

Inline math: $E = mc^2$

Block equation:

$$
\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$

The quadratic formula above solves $ax^2 + bx + c = 0$.

## Code Example

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
  return { message: "Welcome to MD Editor" };
}

greet("World");
\`\`\`

## Task List

- [x] Create markdown editor
- [x] Add live preview
- [x] Implement math rendering
- [ ] Add more awesome features

## Image Example

![Sample Image](https://raw.githubusercontent.com/github/explore/main/topics/markdown/markdown.png)

## Table Example

| Feature | Status | Notes |
| ------- | ------ | ----- |
| Editor | ✅ Done | Full-featured |
| Preview | ✅ Done | Real-time |
| Math | ✅ Done | KaTeX |
| Shortcuts | ✅ Done | Comprehensive |

## Quote

> "The best way to predict the future is to create it."
> — *Peter Drucker*

---

### Try It Out!

Start editing on the left, and watch the preview update in real-time on the right! 🎉
`;

const MAX_HISTORY = 100;

function App() {
  const [content, setContent] = useState(SAMPLE_CONTENT);
  const [history, setHistory] = useState([SAMPLE_CONTENT]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [viewMode, setViewMode] = useState(VIEW_MODES.SPLIT);
  const [fileName, setFileName] = useState('Welcome.md');
  const [fileHandle, setFileHandle] = useState(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [scrollSync, setScrollSync] = useState(true);
  const [toast, setToast] = useState(null);
  const editorRef = useRef(null);
  const previewRef = useRef(null);
  const previewContentRef = useRef(null);
  const isUndoRedo = useRef(false);

  // Show toast notification
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Handle content change with history
  const handleContentChange = useCallback((newContent) => {
    setContent(newContent);

    // Don't add to history if this is an undo/redo action
    if (isUndoRedo.current) {
      isUndoRedo.current = false;
      return;
    }

    // Add to history
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newContent);
      // Limit history size
      if (newHistory.length > MAX_HISTORY) {
        newHistory.shift();
        return newHistory;
      }
      return newHistory;
    });
    setHistoryIndex((prev) => Math.min(prev + 1, MAX_HISTORY - 1));
  }, [historyIndex]);

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      isUndoRedo.current = true;
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setContent(history[newIndex]);
    }
  }, [history, historyIndex]);

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUndoRedo.current = true;
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setContent(history[newIndex]);
    }
  }, [history, historyIndex]);

  // File operations callbacks
  const handleNewFile = useCallback(() => {
    const newFile = createNewFile();
    setContent(newFile.content);
    setFileName(newFile.name);
    setFileHandle(null);
    setHistory([newFile.content]);
    setHistoryIndex(0);
    showToast('New file created');
  }, [showToast]);

  const handleOpenFile = useCallback(async () => {
    try {
      const result = await openFile();
      if (result) {
        setContent(result.content);
        setFileName(result.name);
        setFileHandle(result.handle);
        setHistory([result.content]);
        setHistoryIndex(0);
        showToast(`Opened: ${result.name}`);
      }
    } catch (err) {
      console.error('Error opening file:', err);
      showToast('Failed to open file', 'error');
    }
  }, [showToast]);

  const handleSaveFile = useCallback(async () => {
    try {
      const result = await saveFile(content, fileName, fileHandle);
      if (result.success) {
        if (result.handle) {
          setFileHandle(result.handle);
          setFileName(result.name);
        }
        showToast('File saved successfully');
      }
    } catch (err) {
      console.error('Error saving file:', err);
      showToast('Failed to save file', 'error');
    }
  }, [content, fileName, fileHandle, showToast]);

  // Toggle preview mode
  const handleTogglePreview = useCallback(() => {
    setViewMode((prev) => {
      if (prev === VIEW_MODES.EDITOR) return VIEW_MODES.SPLIT;
      if (prev === VIEW_MODES.SPLIT) return VIEW_MODES.PREVIEW;
      return VIEW_MODES.EDITOR;
    });
  }, []);

  // Download handlers
  const handleDownloadMD = useCallback(() => {
    downloadMarkdown(content, fileName);
    showToast('Markdown file downloaded');
  }, [content, fileName, showToast]);

  const handleDownloadPDF = useCallback(() => {
    const previewElement = previewContentRef.current;
    if (previewElement) {
      downloadPDF(previewElement, fileName);
    } else {
      showToast('Please switch to Split or Preview mode first', 'error');
    }
  }, [fileName, showToast]);

  const handlePrint = useCallback(() => {
    const previewElement = previewContentRef.current;
    if (previewElement) {
      printPreview(previewElement);
    } else {
      showToast('Please switch to Split or Preview mode first', 'error');
    }
  }, [showToast]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't handle shortcuts when in modal
      if (showShortcuts && e.key !== 'Escape') return;

      // Handle Undo/Redo
      if (e.ctrlKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
        return;
      }
      if (e.ctrlKey && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
        return;
      }

      handleKeyboardShortcut(e, content, editorRef, handleContentChange, {
        onNewFile: handleNewFile,
        onOpenFile: handleOpenFile,
        onSaveFile: handleSaveFile,
        onTogglePreview: handleTogglePreview,
        onShowShortcuts: () => setShowShortcuts(true)
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [content, showShortcuts, handleNewFile, handleOpenFile, handleSaveFile, handleTogglePreview, handleUndo, handleRedo, handleContentChange]);

  // Get view classes
  const getEditorClass = () => {
    if (viewMode === VIEW_MODES.EDITOR) return 'full';
    if (viewMode === VIEW_MODES.PREVIEW) return 'hidden';
    return 'split';
  };

  const getPreviewClass = () => {
    if (viewMode === VIEW_MODES.PREVIEW) return 'full';
    if (viewMode === VIEW_MODES.EDITOR) return 'hidden';
    return 'split';
  };

  return (
    <div className="app">
      <Navbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        scrollSync={scrollSync}
        onScrollSyncChange={setScrollSync}
        onNewFile={handleNewFile}
        onOpenFile={handleOpenFile}
        onSaveFile={handleSaveFile}
        onDownloadMD={handleDownloadMD}
        onDownloadPDF={handleDownloadPDF}
        onPrint={handlePrint}
        onShowShortcuts={() => setShowShortcuts(true)}
      />

      <main className="main-content">
        <div className="editor-container">
          <MarkdownEditor
            content={content}
            onChange={handleContentChange}
            className={getEditorClass()}
            editorRef={editorRef}
            previewRef={previewRef}
            scrollSync={scrollSync && viewMode === VIEW_MODES.SPLIT}
            history={history}
            historyIndex={historyIndex}
            onUndo={handleUndo}
            onRedo={handleRedo}
          />
          <MarkdownPreview
            content={content}
            className={getPreviewClass()}
            previewRef={previewRef}
            previewContentRef={previewContentRef}
            editorRef={editorRef}
            scrollSync={scrollSync && viewMode === VIEW_MODES.SPLIT}
          />
        </div>
      </main>

      <ShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />

      {/* Toast Notification */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === 'success' ? (
            <Check size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          <span className="toast-message">{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default App;
