// Table helpers moved to TableOperations.js

import 'katex/dist/katex.min.css';
import katex from 'katex';

import React, { useRef, useImperativeHandle, forwardRef, useEffect, useState } from 'react';
import './RichEditor.css';
import { useTableSelection } from './Table/useTableSelection';
import { useTableResize } from './Table/useTableResize';
import { useTableOperations } from './Table/useTableOperations';
import TableOverlay from './Table/TableOverlay';
import InlineImageEditor from './InlineImageEditor';
import EquationOverlay from './EquationOverlay';

const transformTextNodes = (node) => {
    if (node.nodeType === 3) { // Text node
        const text = node.textContent;
        // Regex for $$...$$ (Display) or $...$ (Inline)
        // We use a combined regex. 
        // Note: Inline math usually shouldn't span multiple lines, but we allow it for flexibility.
        const regex = /\$\$([\s\S]+?)\$\$|\$([^$]+)\$/g;

        if (regex.test(text)) {
            const fragment = document.createDocumentFragment();
            let lastIndex = 0;

            text.replace(regex, (match, displayFormula, inlineFormula, offset) => {
                const formula = displayFormula || inlineFormula;
                const isDisplay = !!displayFormula;

                // Add text before math
                if (offset > lastIndex) {
                    fragment.appendChild(document.createTextNode(text.slice(lastIndex, offset)));
                }

                // Render Math
                const span = document.createElement('span');
                span.contentEditable = "false";
                span.className = "math-formula-rendered math-align-left";
                span.dataset.latex = formula;
                span.dataset.display = isDisplay;
                span.title = "Click to edit";
                span.style.cursor = "pointer";
                span.style.padding = "0 2px";
                if (isDisplay) {
                    span.style.display = "inline-block";
                }

                try {
                    katex.render(formula, span, {
                        throwOnError: false,
                        displayMode: isDisplay
                    });
                } catch (e) {
                    console.error("Katex Error:", e);
                    span.textContent = match;
                }

                fragment.appendChild(span);

                lastIndex = offset + match.length;
            });

            // Add remaining text
            if (lastIndex < text.length) {
                fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
            }

            node.parentNode.replaceChild(fragment, node);
            return true; // Found match
        }
    } else if (node.nodeType === 1 && node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE' && !node.classList.contains('math-formula-rendered')) {
        let found = false;
        Array.from(node.childNodes).forEach(child => {
            if (transformTextNodes(child)) found = true;
        });
        return found;
    }
    return false;
};

const RichEditor = forwardRef(({ onSelectionChange, onContentChange, readOnly = false }, ref) => {
    const editorRef = useRef(null);
    const canvasRef = useRef(null);
    const savedRangeRef = useRef(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedEquation, setSelectedEquation] = useState(null);
    const { selection: tableSelection, handleMouseDown: onTableMouseDown, handleMouseMove: onTableMouseMove, handleMouseUp: onTableMouseUp } = useTableSelection(editorRef);
    const { resizeState, handleMouseDown: onTableResizeDown, handleMouseMove: onTableResizeMove } = useTableResize(editorRef);
    const { executeAction } = useTableOperations(editorRef);

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
        } else if (command === 'formatMath') {
            if (editorRef.current) {
                editorRef.current.normalize();
                transformTextNodes(editorRef.current);
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
        // Use multi-selection if available
        if (tableSelection && tableSelection.selectedCells.length > 0) {
            const cells = tableSelection.selectedCells;
            const firstCell = cells[0];
            const table = firstCell.closest('table');

            // Calculate bounding box of all selected cells
            const rects = cells.map(c => c.getBoundingClientRect());
            const minTop = Math.min(...rects.map(r => r.top));
            const minLeft = Math.min(...rects.map(r => r.left));
            const maxRight = Math.max(...rects.map(r => r.right));
            const maxBottom = Math.max(...rects.map(r => r.bottom));

            return {
                table,
                cell: firstCell,
                rowIndex: -1, // Context is selection, not single cell
                colIndex: -1,
                rect: {
                    top: minTop,
                    left: minLeft,
                    width: maxRight - minLeft,
                    height: maxBottom - minTop
                }
            };
        }

        // Fallback to single cell selection (cursor)
        const cell = getSelectedTableCell();
        if (!cell) return null;
        const table = cell.closest('table');
        if (!table) return null;

        const row = cell.parentNode;
        const rowIndex = Array.from(table.rows).indexOf(row);
        const colIndex = Array.from(row.cells).indexOf(cell);

        const rect = table.getBoundingClientRect(); // Default to table rect if single cell? Or cell rect?
        // Original code used table rect, but for context menu it causes jump.
        // Let's us cell rect for single selection too?
        // Actually, existing behavior was table rect. Let's keep it if user liked it, 
        // OR better: use cell rect for consistency. 
        // The screenshot shows toolbar above the *selection*.

        const cellRect = cell.getBoundingClientRect();

        return {
            table,
            cell,
            rowIndex,
            colIndex,
            rect: {
                top: cellRect.top,
                left: cellRect.left,
                width: cellRect.width,
                height: cellRect.height
            }
        };
    };

    const handleTableAction = (action, value, targetTable = null) => {
        const cell = getSelectedTableCell();
        const table = targetTable || (cell ? cell.closest('table') : null) || tableSelection.startCell?.table;
        if (!table) return;

        // Grid operations handled by hook
        if (['addRowAbove', 'addRowBelow', 'addColLeft', 'addColRight', 'deleteRow', 'deleteCol', 'deleteTable', 'mergeCells', 'splitCell'].includes(action)) {
            executeAction(action, table, tableSelection);
            saveSelection(); // Selection might be lost after rebuild
            return;
        }

        // Style operations handled locally
        switch (action) {
            case 'setCellBackground':
                if (cell) cell.style.backgroundColor = value;
                break;
            case 'setCellVAlign':
                if (cell) cell.style.verticalAlign = value || "middle";
                break;
            case 'setTableBorders':
                table.style.borderCollapse = 'collapse';
                table.style.border = value;
                Array.from(table.getElementsByTagName('td')).forEach(td => td.style.border = value);
                Array.from(table.getElementsByTagName('th')).forEach(th => th.style.border = value);
                break;
            // toggleHeaderRow excluded for now as it affects grid structure, should move to operations if needed
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
        img.style.width = '300px';
        img.style.maxWidth = '100%';
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
        insertEquation: (latex, isDisplay = true) => {
            editorRef.current.focus();
            restoreSelection();
            const delimiter = isDisplay ? '$$' : '$';
            const value = `\n${delimiter}\n${latex}\n${delimiter}\n`;
            applyCommand('insertHTML', value);
            // Run transformation immediately
            editorRef.current.normalize();
            transformTextNodes(editorRef.current);
            handleInput();
        },
        updateEquation: (latex, isDisplay, element) => {
            const delimiter = isDisplay ? '$$' : '$';
            const textNode = document.createTextNode(`${delimiter}${latex}${delimiter}`);
            element.parentNode.replaceChild(textNode, element);
            // Re-transform (or we could just re-render the span, but this is safer for consistency)
            editorRef.current.normalize();
            transformTextNodes(editorRef.current);
            setSelectedEquation(null); // Clear selection after edit
            handleInput();
        },
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

        // Use event delegation for math formula clicks
        const container = editorRef.current;
        const handleMathClick = (e) => {
            const mathElement = e.target.closest('.math-formula-rendered');
            if (mathElement) {
                e.stopPropagation();
                const latex = mathElement.dataset.latex;
                const isDisplay = mathElement.dataset.display === 'true';
                setSelectedEquation({
                    latex,
                    isDisplay,
                    element: mathElement
                });
                setSelectedImage(null);
            }
        };
        container.addEventListener('click', handleMathClick);

        return () => {
            document.removeEventListener('selectionchange', handleSelectionChange);
            container.removeEventListener('click', handleMathClick);
        };
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

    // Handle link clicks - Ctrl+Click opens in new tab
    const handleClick = (e) => {
        // Prevent parent navigation/links when interacting with table
        if (e.target.closest('td, th, table, .table-selection-overlay')) {
            e.stopPropagation();
            return;
        }

        const link = e.target.closest('a');
        if (link && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            window.open(link.href, '_blank', 'noopener,noreferrer');
        }
    };

    const handleKeyDown = (e) => {
        if (readOnly) {
            e.preventDefault();
            return;
        }
        // Tab support
        if (e.key === 'Tab') {
            e.preventDefault();
            const cell = getSelectedTableCell();
            if (cell) {
                const table = cell.closest('table');
                const cells = Array.from(table.getElementsByTagName('td')); // And th?
                const allCells = Array.from(table.querySelectorAll('td, th'));
                const currentIndex = allCells.indexOf(cell);

                if (e.shiftKey) {
                    // Previous
                    if (currentIndex > 0) {
                        const prev = allCells[currentIndex - 1];
                        const range = document.createRange();
                        range.selectNodeContents(prev);
                        range.collapse(true); // Start?
                        const sel = window.getSelection();
                        sel.removeAllRanges();
                        sel.addRange(range);
                    }
                } else {
                    // Next
                    if (currentIndex < allCells.length - 1) {
                        const next = allCells[currentIndex + 1];
                        const range = document.createRange();
                        range.selectNodeContents(next);
                        range.collapse(true);
                        const sel = window.getSelection();
                        sel.removeAllRanges();
                        sel.addRange(range);
                    } else {
                        // Insert new row if at end?
                        handleTableAction('addRowBelow', null, table);
                    }
                }
                return;
            }
            document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
        }

        // Hotkeys
        if (e.ctrlKey) {
            if (e.key === 'b') {
                // Browser handles Bold usually
            } else if (e.key === '`') {
                e.preventDefault();
                applyCommand('createCode');
            } else if (e.shiftKey && e.key === 'C') {
                e.preventDefault();
                applyCommand('insertHTML', '<pre><code>\n\n</code></pre>');
            }
        }
    };

    // Native event listeners to override default browser behaviors (drag/drop/click links)
    useEffect(() => {
        const container = editorRef.current;
        if (!container) return;

        const handleNativeClick = (e) => {
            if (e.target.tagName === 'IMG') {
                // Stop everything and select the image
                e.preventDefault();
                e.stopPropagation();
                setSelectedImage(e.target);
            } else {
                // If clicking background/text, deselect image if not clicking the editor ui
                if (selectedImage && !container.contains(e.target)) {
                    // This logic might conflict if clicking the overlay handles (which are separate divs)
                    // The overlay handles interactions separately.
                    // If we click text, we want to deselect.
                    setSelectedImage(null);
                }
            }
        };

        const handleDragStart = (e) => {
            if (e.target.tagName === 'IMG') {
                e.preventDefault();
                e.stopPropagation();
                setSelectedImage(e.target);
                setSelectedEquation(null);
            }
        };

        const handleContainerMouseDown = (e) => {
            // If not clicking an equation, image, or overlay toolbar, clear selections
            if (!e.target.closest('.math-formula-rendered') && !e.target.closest('img') && !e.target.closest('.equation-overlay-toolbar')) {
                setSelectedEquation(null);
                setSelectedImage(null);
            }
        };

        // Aggressively capture clicks on images
        container.addEventListener('click', handleNativeClick, true);
        container.addEventListener('dragstart', handleDragStart, true);
        container.addEventListener('mousedown', handleContainerMouseDown);

        return () => {
            container.removeEventListener('click', handleNativeClick, true);
            container.removeEventListener('dragstart', handleDragStart, true);
            container.removeEventListener('mousedown', handleContainerMouseDown);
        };
    }, [selectedImage]);

    return (
        <div className="rich-editor-container">
            <div className="document-canvas" ref={canvasRef}>
                <div
                    ref={editorRef}
                    className={`editable-area ${readOnly ? 'read-only' : ''}`}
                    contentEditable={!readOnly}
                    suppressContentEditableWarning={true}
                    onKeyUp={handleKeyUp}

                    onMouseUp={(e) => { handleMouseUp(e); onTableMouseUp(e); }}
                    onMouseDown={(e) => {
                        onTableResizeDown(e);
                        // Prevent parent navigation/links when interacting with table
                        if (e.target.closest('td, th')) {
                            e.stopPropagation();
                        }
                        if (!e.defaultPrevented) onTableMouseDown(e);
                    }}
                    onMouseMove={(e) => {
                        onTableResizeMove(e);
                        onTableMouseMove(e);
                    }}
                    onClick={handleClick}
                    onKeyDown={handleKeyDown}
                    onInput={handleInput}
                    placeholder="Start writing your lesson here..."
                >
                </div>
                {/* Inline Image Editor - Rendered if an image is selected */}
                {selectedImage && !readOnly && (
                    <InlineImageEditor
                        target={selectedImage}
                        containerRef={canvasRef}
                        onSave={() => {
                            setSelectedImage(null);
                            handleInput(); // Trigger save
                        }}
                        onCancel={() => setSelectedImage(null)}
                    />
                )}

                {/* Equation Contextual Toolbar */}
                {selectedEquation && !readOnly && (
                    <EquationOverlay
                        target={selectedEquation.element}
                        containerRef={canvasRef}
                        onAlign={(alignment) => {
                            const el = selectedEquation.element;
                            el.classList.remove('math-align-left', 'math-align-center', 'math-align-right');
                            el.classList.add(`math-align-${alignment}`);
                            handleInput();
                        }}
                        onEdit={() => {
                            if (onSelectionChange) onSelectionChange('edit-math', selectedEquation);
                        }}
                        onCancel={() => setSelectedEquation(null)}
                    />
                )}



                {/* Table Selection Overlay */}
                <TableOverlay selection={tableSelection} editorRef={editorRef} />

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
