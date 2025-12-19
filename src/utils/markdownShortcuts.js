// Markdown shortcut actions
export const markdownActions = {
    bold: { prefix: '**', suffix: '**', placeholder: 'bold text' },
    italic: { prefix: '*', suffix: '*', placeholder: 'italic text' },
    strikethrough: { prefix: '~~', suffix: '~~', placeholder: 'strikethrough' },
    code: { prefix: '`', suffix: '`', placeholder: 'code' },
    codeBlock: { prefix: '```\n', suffix: '\n```', placeholder: 'code block' },
    link: { prefix: '[', suffix: '](url)', placeholder: 'link text' },
    image: { prefix: '![', suffix: '](url)', placeholder: 'alt text' },
    quote: { prefix: '> ', suffix: '', placeholder: 'quote', newLine: true },
    h1: { prefix: '# ', suffix: '', placeholder: 'Heading 1', newLine: true },
    h2: { prefix: '## ', suffix: '', placeholder: 'Heading 2', newLine: true },
    h3: { prefix: '### ', suffix: '', placeholder: 'Heading 3', newLine: true },
    h4: { prefix: '#### ', suffix: '', placeholder: 'Heading 4', newLine: true },
    h5: { prefix: '##### ', suffix: '', placeholder: 'Heading 5', newLine: true },
    h6: { prefix: '###### ', suffix: '', placeholder: 'Heading 6', newLine: true },
};

// Handle keyboard shortcuts
export function handleKeyboardShortcut(e, content, textareaRef, onChange, callbacks) {
    const { onNewFile, onOpenFile, onSaveFile, onTogglePreview, onShowShortcuts } = callbacks;

    // Show shortcuts with ?
    if (e.key === '?' && !e.ctrlKey && !e.shiftKey) {
        e.preventDefault();
        onShowShortcuts?.();
        return true;
    }

    // Ctrl + key combinations
    if (e.ctrlKey) {
        let action = null;

        switch (e.key.toLowerCase()) {
            case 'b':
                e.preventDefault();
                action = markdownActions.bold;
                break;
            case 'i':
                e.preventDefault();
                action = markdownActions.italic;
                break;
            case 'k':
                e.preventDefault();
                if (e.shiftKey) {
                    action = markdownActions.image;
                } else {
                    action = markdownActions.link;
                }
                break;
            case 'q':
                e.preventDefault();
                action = markdownActions.quote;
                break;
            case '`':
                e.preventDefault();
                action = markdownActions.codeBlock;
                break;
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
                e.preventDefault();
                action = markdownActions[`h${e.key}`];
                break;
            case 's':
                e.preventDefault();
                onSaveFile?.();
                return true;
            case 'o':
                e.preventDefault();
                onOpenFile?.();
                return true;
            case 'n':
                e.preventDefault();
                onNewFile?.();
                return true;
            case 'p':
                e.preventDefault();
                onTogglePreview?.();
                return true;
            default:
                break;
        }

        // Ctrl + Shift combinations
        if (e.shiftKey) {
            switch (e.key.toLowerCase()) {
                case 's':
                    e.preventDefault();
                    action = markdownActions.strikethrough;
                    break;
                case 'c':
                    e.preventDefault();
                    action = markdownActions.code;
                    break;
                default:
                    break;
            }
        }

        if (action) {
            insertMarkdown(content, textareaRef, onChange, action);
            return true;
        }
    }

    return false;
}

// Insert markdown syntax at cursor position
export function insertMarkdown(content, textareaRef, onChange, action) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const textBefore = content.substring(0, start);
    const textAfter = content.substring(end);

    // Check if we need a new line before the insertion
    const needsNewLine = action.newLine && start > 0 && textBefore[textBefore.length - 1] !== '\n';
    const newLinePrefix = needsNewLine ? '\n' : '';

    let insertText;
    let newCursorPos;

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
}
