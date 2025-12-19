import { useRef, useEffect, useState, useCallback } from 'react';
import Toolbar from './Toolbar';
import './Editor.css';

export default function MarkdownEditor({
    content,
    onChange,
    className,
    editorRef: externalRef,
    previewRef,
    scrollSync,
    history,
    historyIndex,
    onUndo,
    onRedo
}) {
    const internalRef = useRef(null);
    const textareaRef = externalRef || internalRef;
    const lineNumbersRef = useRef(null);
    const [lineCount, setLineCount] = useState(1);
    const isScrollingRef = useRef(false);

    // Update line numbers when content changes
    useEffect(() => {
        const lines = content.split('\n').length;
        setLineCount(lines);
    }, [content]);

    // Sync scroll between textarea, line numbers, and preview
    const handleScroll = useCallback(() => {
        if (lineNumbersRef.current && textareaRef.current) {
            lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
        }

        // Sync with preview pane if scrollSync is enabled
        if (scrollSync && previewRef?.current && textareaRef.current && !isScrollingRef.current) {
            isScrollingRef.current = true;
            const textarea = textareaRef.current;
            const preview = previewRef.current;

            const scrollPercentage = textarea.scrollTop / (textarea.scrollHeight - textarea.clientHeight);
            const previewScrollTop = scrollPercentage * (preview.scrollHeight - preview.clientHeight);

            preview.scrollTop = previewScrollTop || 0;

            setTimeout(() => {
                isScrollingRef.current = false;
            }, 50);
        }
    }, [textareaRef, previewRef, scrollSync]);

    // Handle toolbar insertions
    const handleInsert = useCallback((action) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.substring(start, end);
        const textBefore = content.substring(0, start);
        const textAfter = content.substring(end);

        let insertText;
        let newCursorPos;

        // Check if we need a new line before the insertion
        const needsNewLine = action.newLine && start > 0 && textBefore[textBefore.length - 1] !== '\n';
        const newLinePrefix = needsNewLine ? '\n' : '';

        if (selectedText) {
            insertText = `${newLinePrefix}${action.prefix}${selectedText}${action.suffix}`;
            newCursorPos = start + newLinePrefix.length + action.prefix.length + selectedText.length;
        } else {
            insertText = `${newLinePrefix}${action.prefix}${action.placeholder}${action.suffix}`;
            newCursorPos = start + newLinePrefix.length + action.prefix.length;
        }

        const newContent = textBefore + insertText + textAfter;
        onChange(newContent);

        // Set cursor position after React re-render
        setTimeout(() => {
            textarea.focus();
            if (selectedText) {
                textarea.setSelectionRange(newCursorPos, newCursorPos);
            } else {
                textarea.setSelectionRange(
                    newCursorPos,
                    newCursorPos + action.placeholder.length
                );
            }
        }, 0);
    }, [content, onChange, textareaRef]);

    // Handle raw markdown insertion (for modals)
    const handleInsertRaw = useCallback((markdown) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const textBefore = content.substring(0, start);
        const textAfter = content.substring(end);

        const newContent = textBefore + markdown + textAfter;
        onChange(newContent);

        // Set cursor after inserted text
        setTimeout(() => {
            textarea.focus();
            const newPos = start + markdown.length;
            textarea.setSelectionRange(newPos, newPos);
        }, 0);
    }, [content, onChange, textareaRef]);

    // Handle copy
    const handleCopy = useCallback(async () => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.substring(start, end);

        if (selectedText) {
            await navigator.clipboard.writeText(selectedText);
        } else {
            // Copy entire content if nothing selected
            await navigator.clipboard.writeText(content);
        }
    }, [content, textareaRef]);

    // Handle paste
    const handlePaste = useCallback(async () => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        try {
            const clipboardText = await navigator.clipboard.readText();
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const textBefore = content.substring(0, start);
            const textAfter = content.substring(end);

            const newContent = textBefore + clipboardText + textAfter;
            onChange(newContent);

            // Set cursor after pasted text
            setTimeout(() => {
                textarea.focus();
                const newPos = start + clipboardText.length;
                textarea.setSelectionRange(newPos, newPos);
            }, 0);
        } catch (err) {
            console.error('Failed to paste:', err);
        }
    }, [content, onChange, textareaRef]);

    return (
        <div className={`editor-pane ${className}`}>
            <div className="editor-wrapper">
                <Toolbar
                    onInsert={handleInsert}
                    onInsertRaw={handleInsertRaw}
                    onUndo={onUndo}
                    onRedo={onRedo}
                    onCopy={handleCopy}
                    onPaste={handlePaste}
                />
                <div className="editor-textarea-wrapper">
                    <div className="line-numbers" ref={lineNumbersRef}>
                        {Array.from({ length: lineCount }, (_, i) => (
                            <div key={i + 1} className="line-number">
                                {i + 1}
                            </div>
                        ))}
                    </div>
                    <textarea
                        ref={textareaRef}
                        className="editor-textarea"
                        value={content}
                        onChange={(e) => onChange(e.target.value)}
                        onScroll={handleScroll}
                        placeholder="Start writing your markdown here..."
                        spellCheck={false}
                    />
                </div>
            </div>
        </div>
    );
}
