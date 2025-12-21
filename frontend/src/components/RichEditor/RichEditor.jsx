import React, { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import './RichEditor.css';

const RichEditor = forwardRef(({ onSelectionChange, onContentChange, readOnly = false }, ref) => {
    const editorRef = useRef(null);

    const applyCommand = (command, value = null) => {
        editorRef.current.focus();

        // Ensure standard block behavior
        document.execCommand('defaultParagraphSeparator', false, 'p');

        if (command === 'createCode') {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const code = document.createElement('code');

                if (range.collapsed) {
                    code.innerText = 'your code';
                    range.insertNode(code);
                    range.selectNodeContents(code);
                    selection.removeAllRanges();
                    selection.addRange(range);
                } else {
                    code.appendChild(range.extractContents());
                    range.insertNode(code);
                }
            }
        } else if (command === 'createLink') {
            if (value) document.execCommand('createLink', false, value);
        } else if (command === 'hiliteColor') {
            // Chrome uses hiliteColor, but backColor is sometimes needed as fallback
            const success = document.execCommand('hiliteColor', false, value);
            if (!success) document.execCommand('backColor', false, value);
        } else if (command === 'insertTable') {
            const { rows, cols } = value || { rows: 2, cols: 2 };
            let table = '<table border="1" style="width:100%; border-collapse: collapse;">';
            for (let i = 0; i < rows; i++) {
                table += '<tr>';
                for (let j = 0; j < cols; j++) {
                    table += '<td>&nbsp;</td>';
                }
                table += '</tr>';
            }
            table += '</table>';
            document.execCommand('insertHTML', false, table);
        } else {
            document.execCommand(command, false, value);
        }

        // Force an input event to trigger autosave/updates
        const event = new Event('input', { bubbles: true });
        editorRef.current.dispatchEvent(event);

        if (onSelectionChange) onSelectionChange();
    };

    // Table manipulation helpers
    const getSelectedTableCell = () => {
        const selection = window.getSelection();
        if (!selection.rangeCount) return null;
        let node = selection.anchorNode;
        while (node && node !== editorRef.current) {
            if (node.nodeName === 'TD' || node.nodeName === 'TH') return node;
            node = node.parentNode;
        }
        return null;
    };

    const getTableInfo = () => {
        const cell = getSelectedTableCell();
        if (!cell) return null;
        const table = cell.closest('table');
        if (!table) return null;

        const rect = table.getBoundingClientRect();
        return {
            table,
            cell,
            rect: {
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height
            }
        };
    };

    const handleTableAction = (action, value, targetTable = null, targetRowIndex = -1, targetColIndex = -1) => {
        let cell = getSelectedTableCell();
        let table = targetTable || (cell ? cell.closest('table') : null);
        if (!table) return;

        // Use passed indices if available, otherwise fallback to selection
        let rowIndex = targetRowIndex !== -1 ? targetRowIndex : (cell ? Array.from(table.rows).indexOf(cell.parentNode) : -1);
        let colIndex = targetColIndex !== -1 ? targetColIndex : (cell ? Array.from(cell.parentNode.cells).indexOf(cell) : -1);

        switch (action) {
            case 'addRowAbove':
            case 'addRowBelow': {
                const idx = action === 'addRowAbove' ? rowIndex : rowIndex + 1;
                if (idx < 0) return;
                const newRow = table.insertRow(idx);
                // For template, use the row we are inserting relative to, or the first row
                const refIdx = (rowIndex === -1 || rowIndex >= table.rows.length) ? 0 : rowIndex;
                const refRow = table.rows[refIdx];
                const colCount = refRow ? refRow.cells.length : 1;
                for (let i = 0; i < colCount; i++) {
                    const newCell = newRow.insertCell(i);
                    newCell.innerHTML = '&nbsp;';
                }
                break;
            }
            case 'deleteRow':
                if (rowIndex !== -1 && table.rows[rowIndex]) {
                    table.deleteRow(rowIndex);
                    if (table.rows.length === 0) table.remove();
                }
                break;
            case 'addColLeft':
            case 'addColRight': {
                const idx = action === 'addColLeft' ? colIndex : colIndex + 1;
                if (idx < 0) return;
                for (let i = 0; i < table.rows.length; i++) {
                    const newCell = table.rows[i].insertCell(idx);
                    newCell.innerHTML = '&nbsp;';
                }
                break;
            }
            case 'deleteCol':
                if (colIndex !== -1) {
                    for (let i = 0; i < table.rows.length; i++) {
                        if (table.rows[i].cells[colIndex]) {
                            table.rows[i].deleteCell(colIndex);
                        }
                    }
                    if (table.rows[0]?.cells.length === 0) table.remove();
                }
                break;
            case 'mergeCells': {
                if (cell && colIndex < row.cells.length - 1) {
                    const nextCell = row.cells[colIndex + 1];
                    // Clean content and merge
                    cell.innerHTML += nextCell.innerHTML;
                    cell.colSpan = (cell.colSpan || 1) + (nextCell.colSpan || 1);
                    nextCell.remove();
                }
                break;
            }
            case 'splitCell': {
                if (cell) {
                    if ((cell.colSpan || 1) > 1) {
                        cell.colSpan = cell.colSpan - 1;
                        const newCell = row.insertCell(colIndex + 1);
                        newCell.innerHTML = '&nbsp;';
                    } else {
                        // Split a single cell into two by adding a column locally in this row?
                        // standard table behavior: add column to entire table
                        handleTableAction('addColRight', null, table, rowIndex, colIndex);
                    }
                }
                break;
            }
            case 'deleteTable':
                table.remove();
                break;
            case 'setCellBackground':
                if (cell) cell.style.backgroundColor = value;
                break;
            case 'setCellVAlign':
                if (cell) cell.style.verticalAlign = value || "middle";
                break;
            case 'toggleHeaderRow': {
                if (cell) {
                    const isHeader = cell.nodeName === 'TH';
                    const newTag = isHeader ? 'td' : 'th';
                    const newCell = document.createElement(newTag);
                    newCell.innerHTML = cell.innerHTML;
                    Array.from(cell.attributes).forEach(attr => newCell.setAttribute(attr.name, attr.value));
                    cell.parentNode.replaceChild(newCell, cell);
                }
                break;
            }
            case 'setTableBorders':
                table.style.borderCollapse = 'collapse';
                table.style.border = value;
                Array.from(table.getElementsByTagName('td')).forEach(td => td.style.border = value);
                Array.from(table.getElementsByTagName('th')).forEach(th => th.style.border = value);
                break;
            default: break;
        }
        handleInput();
    };

    const insertLink = (text, url) => {
        editorRef.current.focus();
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const selectedText = selection.toString();

            // If text is different from selection, or selection is collapsed, replace/insert
            if (selectedText !== text || range.collapsed) {
                range.deleteContents();
                const link = document.createElement('a');
                link.href = url;
                link.innerText = text || url;
                range.insertNode(link);
                // Collapse to end of link
                selection.setBaseAndExtent(link, 0, link, 1);
            } else {
                // Just wrap the selection
                document.execCommand('createLink', false, url);
            }
        }
        handleInput();
    };

    const insertImage = (url, alt) => {
        editorRef.current.focus();
        const img = `<img src="${url}" alt="${alt || ''}" style="width: 50%; height: auto; display: block; margin: 10px auto;"/>`;
        document.execCommand('insertHTML', false, img);
        handleInput();
    };

    const insertVideo = (url) => {
        editorRef.current.focus();
        let embedUrl = url;
        if (url.includes('youtube.com/watch?v=')) {
            embedUrl = url.replace('watch?v=', 'embed/');
        } else if (url.includes('youtu.be/')) {
            embedUrl = url.replace('youtu.be/', 'youtube.com/embed/');
        }
        const video = `<iframe src="${embedUrl}" width="100%" height="400" frameborder="0" allowfullscreen style="display: block; margin: 10px auto;"></iframe>`;
        document.execCommand('insertHTML', false, video);
        handleInput();
    };

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
        executeCommand: applyCommand,
        executeTableAction: handleTableAction,
        getTableInfo,
        insertLink,
        insertImage,
        insertVideo,
        getHTML: () => editorRef.current.innerHTML,
        setHTML: (html) => { editorRef.current.innerHTML = html; },
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
        if (readOnly) return;
        if (onContentChange) onContentChange(editorRef.current.innerHTML);
    };

    const handleKeyUp = (e) => {
        if (onSelectionChange) onSelectionChange();
    };

    const handleMouseUp = () => {
        if (onSelectionChange) onSelectionChange();
    };

    const handleKeyDown = (e) => {
        if (readOnly) {
            e.preventDefault();
            return;
        }
        // Tab support
        if (e.key === 'Tab') {
            e.preventDefault();
            document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
        }

        // Hotkeys
        if (e.ctrlKey) {
            if (e.key === 'b') {
                // Browser handles Bold usually, but we can call it here for consistency
                // e.preventDefault(); 
                // document.execCommand('bold');
            } else if (e.key === '`') {
                e.preventDefault();
                applyCommand('createCode');
            } else if (e.shiftKey && e.key === 'C') {
                e.preventDefault();
                applyCommand('insertHTML', '<pre><code>\n\n</code></pre>');
            }
        }
    };

    return (
        <div className="rich-editor-container">
            <div className="document-canvas">
                <div
                    ref={editorRef}
                    className={`editable-area ${readOnly ? 'read-only' : ''}`}
                    contentEditable={!readOnly}
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
                <div className="editor-footer">
                    <div className="footer-left">
                        <span className="tag-pill">&lt;p&gt;</span>
                    </div>
                    <div className="footer-right">
                        <span className="char-count">characters: {editorRef.current ? editorRef.current.innerText.length : 0}</span>
                        <div className="resize-handle" />
                    </div>
                </div>
            </div>
        </div>
    );
});

export default RichEditor;
