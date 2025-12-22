import React, { useEffect, useState, useRef } from 'react';
import './TableToolbar.css';

const TableToolbar = ({ selection, onAction, editorRef }) => {
    const toolbarRef = useRef(null);
    const [position, setPosition] = useState(null);

    useEffect(() => {
        if (!selection.selectedCells.length || !editorRef.current) {
            setPosition(null);
            return;
        }

        // Calculate position: Centered above the selection
        const editorRect = editorRef.current.getBoundingClientRect();

        // Find bounding box of selection relative to viewport
        const rects = selection.selectedCells.map(cell => cell.getBoundingClientRect());
        const minTop = Math.min(...rects.map(r => r.top));
        const minLeft = Math.min(...rects.map(r => r.left));
        const maxWidth = Math.max(...rects.map(r => r.right)) - minLeft;

        // Position relative to editor container (assuming toolbar is absolute in container)
        // We want it slightly above the selection
        const top = minTop - editorRect.top - 45; // 45px above
        const left = (minLeft - editorRect.left) + (maxWidth / 2);

        setPosition({ top, left });

    }, [selection, editorRef]);

    if (!position) return null;

    const canMerge = selection.selectedCells.length > 1;
    // Check if we can split: simple check if cell has colspan/rowspan > 1
    const canSplit = selection.selectedCells.length === 1 && (
        (selection.selectedCells[0].colSpan > 1) || (selection.selectedCells[0].rowSpan > 1)
    );

    return (
        <div
            className="table-floating-toolbar"
            style={{
                top: position.top,
                left: position.left,
                transform: 'translateX(-50%)'
            }}
            onMouseDown={(e) => e.preventDefault()} // Prevent losing focus/selection
        >
            <div className="toolbar-group">
                <button type="button" onClick={() => onAction('addRowAbove')} title="Insert Row Above">Rw+</button>
                <button type="button" onClick={() => onAction('addRowBelow')} title="Insert Row Below">Rw-</button>
            </div>
            <div className="toolbar-separator" />
            <div className="toolbar-group">
                <button type="button" onClick={() => onAction('addColLeft')} title="Insert Column Left">Col+</button>
                <button type="button" onClick={() => onAction('addColRight')} title="Insert Column Right">Col-</button>
            </div>
            <div className="toolbar-separator" />
            <div className="toolbar-group">
                <button type="button" onClick={() => onAction('deleteRow')} title="Delete Row">Del Rw</button>
                <button type="button" onClick={() => onAction('deleteCol')} title="Delete Column">Del Col</button>
                <button type="button" onClick={() => onAction('deleteTable')} title="Delete Table">Del Tbl</button>
            </div>
            {(canMerge || canSplit) && (
                <>
                    <div className="toolbar-separator" />
                    <div className="toolbar-group">
                        {canMerge && <button type="button" onClick={() => onAction('mergeCells')}>Merge</button>}
                        {canSplit && <button type="button" onClick={() => onAction('splitCell')}>Split</button>}
                    </div>
                </>
            )}
        </div>
    );
};

export default TableToolbar;
