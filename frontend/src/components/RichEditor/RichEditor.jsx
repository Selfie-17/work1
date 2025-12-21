// --- 2D Array Model-Based Table Helpers ---

// Convert a table DOM element to a 2D array model
// Each cell stores: { html: string, isHeader: boolean }
const tableToModel = (table) => {
    const model = [];
    Array.from(table.rows).forEach(row => {
        const rowData = [];
        Array.from(row.cells).forEach(cell => {
            rowData.push({
                html: cell.innerHTML,
                isHeader: cell.tagName === 'TH'
            });
        });
        model.push(rowData);
    });
    return model;
};

// Convert a 2D array model back to table HTML and replace the table's content
const modelToTable = (table, model) => {
    if (!model || model.length === 0) return;

    // Get table attributes to preserve
    const border = table.getAttribute('border') || '1';
    const style = table.getAttribute('style') || 'width:100%; border-collapse: collapse;';

    // Clear existing rows
    while (table.rows.length > 0) {
        table.deleteRow(0);
    }

    // Rebuild from model
    model.forEach(rowData => {
        const tr = table.insertRow();
        rowData.forEach(cellData => {
            const cell = document.createElement(cellData.isHeader ? 'TH' : 'TD');
            cell.innerHTML = cellData.html || '&nbsp;';
            tr.appendChild(cell);
        });
    });

    // Restore attributes
    table.setAttribute('border', border);
    table.setAttribute('style', style);
};

// Create an empty cell object
const createEmptyCell = (isHeader = false) => ({
    html: '&nbsp;',
    isHeader
});

// Get number of columns from model
const getModelColumnCount = (model) => {
    if (!model || model.length === 0) return 0;
    return Math.max(...model.map(row => row.length));
};

// Ensure all rows in model have the same number of columns
const normalizeModel = (model, targetCols = null) => {
    const colCount = targetCols !== null ? targetCols : getModelColumnCount(model);
    return model.map(row => {
        const newRow = [...row];
        while (newRow.length < colCount) {
            newRow.push(createEmptyCell(row[0]?.isHeader || false));
        }
        while (newRow.length > colCount) {
            newRow.pop();
        }
        return newRow;
    });
};

import React, { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import './RichEditor.css';

const RichEditor = forwardRef(({ onSelectionChange, onContentChange, readOnly = false }, ref) => {
    const editorRef = useRef(null);
    const savedRangeRef = useRef(null);

    // Selection save/restore logic
    const saveSelection = () => {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
            savedRangeRef.current = sel.getRangeAt(0).cloneRange();
        }
    };

    const restoreSelection = () => {
        const sel = window.getSelection();
        if (savedRangeRef.current) {
            sel.removeAllRanges();
            sel.addRange(savedRangeRef.current);
        }
    };

    // Accepts an optional restoreSelection function (set via ref by parent)
    const applyCommand = (command, value = null, restoreSelectionFn) => {
        editorRef.current.focus();
        if (typeof restoreSelectionFn === 'function') {
            restoreSelectionFn();
        } else {
            restoreSelection();
        }
        document.execCommand('defaultParagraphSeparator', false, 'p');
        const selection = window.getSelection();
        if (command === 'createCode') {
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
            const success = document.execCommand('hiliteColor', false, value);
            if (!success) document.execCommand('backColor', false, value);
        } else if (command === 'insertTable') {
            const { rows, cols } = value || { rows: 2, cols: 2 };
            let tableHtml = '<table border="1" style="width:100%; border-collapse: collapse;">';
            for (let i = 0; i < rows; i++) {
                tableHtml += '<tr>';
                for (let j = 0; j < cols; j++) {
                    tableHtml += '<td>&nbsp;</td>';
                }
                tableHtml += '</tr>';
            }
            tableHtml += '</table>';
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const temp = document.createElement('div');
                temp.innerHTML = tableHtml;
                const tableNode = temp.firstChild;
                range.deleteContents();
                range.insertNode(tableNode);
                // Move cursor to first cell
                if (tableNode && tableNode.rows && tableNode.rows[0] && tableNode.rows[0].cells[0]) {
                    const cell = tableNode.rows[0].cells[0];
                    const newRange = document.createRange();
                    newRange.selectNodeContents(cell);
                    newRange.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                }
            } else {
                document.execCommand('insertHTML', false, tableHtml);
            }
        } else if (command === 'insertHTML') {
            // Insert HTML at the current selection using DOM APIs
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const temp = document.createElement('div');
                temp.innerHTML = value;
                const nodes = Array.from(temp.childNodes);
                range.deleteContents();
                let lastNode = null;
                nodes.forEach(node => {
                    lastNode = range.insertNode(node);
                });
                if (lastNode) {
                    // Move cursor after inserted node
                    range.setStartAfter(lastNode);
                    range.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            } else {
                document.execCommand('insertHTML', false, value);
            }
        } else {
            document.execCommand(command, false, value);
        }

        // Force an input event to trigger autosave/updates
        const event = new Event('input', { bubbles: true });
        editorRef.current.dispatchEvent(event);

        saveSelection();
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

        const row = cell.parentNode;
        const rowIndex = Array.from(table.rows).indexOf(row);
        const colIndex = Array.from(row.cells).indexOf(cell);

        const rect = table.getBoundingClientRect();
        return {
            table,
            cell,
            rowIndex,
            colIndex,
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
        let rowIndex = targetRowIndex !== -1 ? targetRowIndex : (cell ? Array.from(table.rows).indexOf(cell.parentNode) : 0);
        let colIndex = targetColIndex !== -1 ? targetColIndex : (cell ? Array.from(cell.parentNode.cells).indexOf(cell) : 0);

        // Convert table to 2D model for manipulation
        let model = tableToModel(table);
        const colCount = getModelColumnCount(model);

        switch (action) {
            case 'addRowAbove':
            case 'addRowBelow': {
                // Create a new row with empty cells matching the column count
                const isHeader = model[rowIndex]?.[0]?.isHeader || false;
                const newRow = Array(colCount).fill(null).map(() => createEmptyCell(false));
                const insertIndex = action === 'addRowAbove' ? rowIndex : rowIndex + 1;
                model.splice(insertIndex, 0, newRow);
                model = normalizeModel(model);
                modelToTable(table, model);
                break;
            }
            case 'deleteRow': {
                if (model.length > 1 && rowIndex >= 0 && rowIndex < model.length) {
                    model.splice(rowIndex, 1);
                    model = normalizeModel(model);
                    modelToTable(table, model);
                } else if (model.length === 1) {
                    table.remove();
                }
                break;
            }
            case 'addColLeft':
            case 'addColRight': {
                const insertIdx = action === 'addColLeft' ? colIndex : colIndex + 1;
                model = model.map(row => {
                    const newRow = [...row];
                    const isHeader = row[0]?.isHeader || false;
                    newRow.splice(insertIdx, 0, createEmptyCell(isHeader));
                    return newRow;
                });
                model = normalizeModel(model);
                modelToTable(table, model);
                break;
            }
            case 'deleteCol': {
                if (colCount <= 1) {
                    table.remove();
                    break;
                }
                if (colIndex >= 0 && colIndex < colCount) {
                    model = model.map(row => {
                        const newRow = [...row];
                        if (colIndex < newRow.length) {
                            newRow.splice(colIndex, 1);
                        }
                        return newRow;
                    });
                    model = normalizeModel(model);
                    modelToTable(table, model);
                }
                break;
            }
            case 'mergeCells': {
                // Merge current cell with the next cell in the same row
                if (colIndex >= 0 && colIndex < colCount - 1 && rowIndex >= 0 && rowIndex < model.length) {
                    const currentCell = model[rowIndex][colIndex];
                    const nextCell = model[rowIndex][colIndex + 1];
                    if (currentCell && nextCell) {
                        currentCell.html = (currentCell.html || '') + (nextCell.html || '');
                        model[rowIndex].splice(colIndex + 1, 1);
                    }
                    model = normalizeModel(model);
                    modelToTable(table, model);
                }
                break;
            }
            case 'splitCell': {
                // Split current cell into two cells
                if (colIndex >= 0 && rowIndex >= 0 && rowIndex < model.length) {
                    const isHeader = model[rowIndex][colIndex]?.isHeader || false;
                    model[rowIndex].splice(colIndex + 1, 0, createEmptyCell(isHeader));
                    model = normalizeModel(model);
                    modelToTable(table, model);
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
                if (rowIndex >= 0 && rowIndex < model.length) {
                    const isCurrentlyHeader = model[rowIndex][0]?.isHeader || false;
                    model[rowIndex] = model[rowIndex].map(cell => ({
                        ...cell,
                        isHeader: !isCurrentlyHeader
                    }));
                    modelToTable(table, model);
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
        restoreSelection();
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const selectedText = selection.toString();
            if (selectedText !== text || range.collapsed) {
                range.deleteContents();
                const link = document.createElement('a');
                link.href = url;
                link.innerText = text || url;
                range.insertNode(link);
                selection.setBaseAndExtent(link, 0, link, 1);
            } else {
                document.execCommand('createLink', false, url);
            }
        }
        saveSelection();
        handleInput();
    };

    const insertImage = (url, alt) => {
        editorRef.current.focus();
        restoreSelection();
        const selection = window.getSelection();
        const img = document.createElement('img');
        img.src = url;
        img.alt = alt || '';
        img.style.width = '50%';
        img.style.height = 'auto';
        img.style.display = 'block';
        img.style.margin = '10px auto';
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(img);
            range.setStartAfter(img);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        } else {
            document.execCommand('insertHTML', false, img.outerHTML);
        }
        saveSelection();
        handleInput();
    };

    const insertVideo = (url) => {
        editorRef.current.focus();
        restoreSelection();
        let embedUrl = url;
        if (url.includes('youtube.com/watch?v=')) {
            embedUrl = url.replace('watch?v=', 'embed/');
        } else if (url.includes('youtu.be/')) {
            embedUrl = url.replace('youtu.be/', 'youtube.com/embed/');
        }
        const iframe = document.createElement('iframe');
        iframe.src = embedUrl;
        iframe.width = '100%';
        iframe.height = '400';
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allowfullscreen', '');
        iframe.style.display = 'block';
        iframe.style.margin = '10px auto';
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(iframe);
            range.setStartAfter(iframe);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        } else {
            document.execCommand('insertHTML', false, iframe.outerHTML);
        }
        saveSelection();
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
        getElement: () => editorRef.current,
        applyCommandWithRestore: (cmd, val, restoreSelection) => applyCommand(cmd, val, restoreSelection),
        saveSelection,
        restoreSelection
    }));

    useEffect(() => {
        const handleSelectionChange = () => {
            if (document.activeElement === editorRef.current) {
                saveSelection();
                if (onSelectionChange) onSelectionChange();
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
        saveSelection();
        if (onSelectionChange) onSelectionChange();
    };

    const handleMouseUp = () => {
        saveSelection();
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
