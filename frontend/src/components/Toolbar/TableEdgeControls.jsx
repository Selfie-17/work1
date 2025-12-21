import React, { useState, useEffect } from 'react';
import './TableEdgeControls.css';

const TableEdgeControls = ({ editorRef }) => {
    const [activeControl, setActiveControl] = useState(null); // { type, index, table, top, left, width, height }

    useEffect(() => {
        const editor = editorRef.current?.getElement();
        if (!editor) return;

        const handleMouseMove = (e) => {
            const target = e.target;
            const cell = target.closest('td, th');
            if (!cell) {
                setActiveControl(null);
                return;
            }

            const table = cell.closest('table');
            const rect = cell.getBoundingClientRect();
            const tableRect = table.getBoundingClientRect();

            const threshold = 10;
            const mouseX = e.clientX;
            const mouseY = e.clientY;

            // Row insertion (check top/bottom of cell)
            if (Math.abs(mouseY - rect.top) < threshold) {
                const tr = cell.closest('tr');
                const rowIndex = Array.from(table.rows).indexOf(tr);
                setActiveControl({
                    type: 'row',
                    index: rowIndex,
                    table,
                    top: rect.top,
                    left: tableRect.left,
                    width: tableRect.width
                });
                return;
            }

            if (Math.abs(mouseY - rect.bottom) < threshold) {
                const tr = cell.closest('tr');
                const rowIndex = Array.from(table.rows).indexOf(tr);
                setActiveControl({
                    type: 'row',
                    index: rowIndex + 1,
                    table,
                    top: rect.bottom,
                    left: tableRect.left,
                    width: tableRect.width
                });
                return;
            }

            // Column insertion (check left/right of cell)
            if (Math.abs(mouseX - rect.left) < threshold) {
                const colIndex = Array.from(cell.parentNode.cells).indexOf(cell);
                setActiveControl({
                    type: 'col',
                    index: colIndex,
                    table,
                    top: tableRect.top,
                    left: rect.left,
                    height: tableRect.height
                });
                return;
            }

            if (Math.abs(mouseX - rect.right) < threshold) {
                const colIndex = Array.from(cell.parentNode.cells).indexOf(cell);
                setActiveControl({
                    type: 'col',
                    index: colIndex + 1,
                    table,
                    top: tableRect.top,
                    left: rect.right,
                    height: tableRect.height
                });
                return;
            }

            // Delete control (hovering top-left of cell)
            if (Math.abs(mouseY - rect.top) < threshold + 5 && Math.abs(mouseX - rect.left) < threshold + 5) {
                const tr = cell.closest('tr');
                const rowIndex = Array.from(table.rows).indexOf(tr);
                const colIndex = Array.from(cell.parentNode.cells).indexOf(cell);
                setActiveControl({
                    type: 'delete',
                    rowIndex,
                    colIndex,
                    table,
                    top: rect.top,
                    left: rect.left
                });
                return;
            }

            setActiveControl(null);
        };

        editor.addEventListener('mousemove', handleMouseMove);
        return () => editor.removeEventListener('mousemove', handleMouseMove);
    }, [editorRef]);

    if (!activeControl) return null;

    const handleAction = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const { type, index, table, rowIndex, colIndex } = activeControl;
        const editor = editorRef.current;
        if (!editor) return;

        if (type === 'row') {
            editor.executeTableAction('addRowAbove', null, table, index, -1);
        } else if (type === 'col') {
            editor.executeTableAction('addColLeft', null, table, -1, index);
        }
        setActiveControl(null);
    };

    const handleDelete = (e, delType) => {
        e.preventDefault();
        e.stopPropagation();
        const { table, rowIndex, colIndex } = activeControl;
        const editor = editorRef.current;
        if (!editor) return;

        if (delType === 'row') {
            editor.executeTableAction('deleteRow', null, table, rowIndex, -1);
        } else if (delType === 'col') {
            editor.executeTableAction('deleteCol', null, table, -1, colIndex);
        }
        setActiveControl(null);
    };

    const style = activeControl.type === 'row'
        ? { top: activeControl.top, left: activeControl.left, width: activeControl.width }
        : activeControl.type === 'col'
            ? { top: activeControl.top, left: activeControl.left, height: activeControl.height }
            : { top: activeControl.top, left: activeControl.left };

    return (
        <div className={`table-edge-control ${activeControl.type}`} style={style}>
            {activeControl.type === 'row' && (
                <div className="edge-spacer-h">
                    <button className="edge-plus-btn" onClick={handleAction}>+</button>
                </div>
            )}
            {activeControl.type === 'col' && (
                <div className="edge-spacer-v">
                    <button className="edge-plus-btn" onClick={handleAction}>+</button>
                </div>
            )}
            {activeControl.type === 'delete' && (
                <div className="edge-delete-btns">
                    <button className="edge-del-btn row-del" onClick={(e) => handleDelete(e, 'row')} title="Delete Row">R×</button>
                    <button className="edge-del-btn col-del" onClick={(e) => handleDelete(e, 'col')} title="Delete Column">C×</button>
                </div>
            )}
        </div>
    );
};

export default TableEdgeControls;
