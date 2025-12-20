import React, { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import './RichEditor.css';

const RichEditor = forwardRef(({ onSelectionChange, onContentChange }, ref) => {
    const editorRef = useRef(null);

    // Expose methods to parent components via ref
    useImperativeHandle(ref, () => ({
        executeCommand: (command, value = null) => {
            editorRef.current.focus();

            if (command === 'createCode') {
                const selection = window.getSelection();
                if (selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    const code = document.createElement('code');

                    if (range.collapsed) {
                        code.innerText = 'your code';
                        range.insertNode(code);
                        // Move cursor inside the new code tag
                        range.selectNodeContents(code);
                        selection.removeAllRanges();
                        selection.addRange(range);
                    } else {
                        code.appendChild(range.extractContents());
                        range.insertNode(code);
                    }
                }
            } else if (command === 'createLink') {
                const url = prompt('Enter URL:');
                if (url) {
                    document.execCommand('createLink', false, url);
                }
            } else {
                document.execCommand(command, false, value);
            }

            // Trigger selection change to update toolbar state
            if (onSelectionChange) onSelectionChange();
        },
        getHTML: () => editorRef.current.innerHTML,
        setHTML: (html) => {
            editorRef.current.innerHTML = html;
        },
        getPlainText: () => editorRef.current.innerText,
        focus: () => editorRef.current.focus(),
        getElement: () => editorRef.current
    }));

    useEffect(() => {
        const handleSelectionChange = () => {
            if (document.activeElement === editorRef.current && onSelectionChange) {
                onSelectionChange();
            }
        };

        document.addEventListener('selectionchange', handleSelectionChange);
        return () => document.removeEventListener('selectionchange', handleSelectionChange);
    }, [onSelectionChange]);

    const handleInput = () => {
        if (onContentChange) onContentChange(editorRef.current.innerHTML);
    };

    const handleKeyUp = (e) => {
        if (onSelectionChange) onSelectionChange();
    };

    const handleMouseUp = () => {
        if (onSelectionChange) onSelectionChange();
    };

    const handleKeyDown = (e) => {
        // Tab support
        if (e.key === 'Tab') {
            e.preventDefault();
            document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
        }
    };

    return (
        <div className="rich-editor-container">
            <div className="document-canvas">
                <div
                    ref={editorRef}
                    className="editable-area"
                    contentEditable
                    suppressContentEditableWarning={true}
                    onKeyUp={handleKeyUp}
                    onMouseUp={handleMouseUp}
                    onKeyDown={handleKeyDown}
                    onInput={handleInput}
                    placeholder="Start writing your lesson here..."
                >
                    <h1>Start writing your lesson here...</h1>
                    <p>Select text and use the toolbar above to format your lesson. This editor supports basic rich text features and keyboard shortcuts like <b>Ctrl+B</b> and <i>Ctrl+I</i>.</p>
                </div>
            </div>
        </div>
    );
});

export default RichEditor;
