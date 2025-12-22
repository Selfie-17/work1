import { useState, useCallback, useEffect } from 'react';

export const useTableSelection = (editorRef) => {
    const [selection, setSelection] = useState({
        startCell: null, // { rowIndex, colIndex, table }
        endCell: null,
        isSelecting: false,
        selectedCells: [] // Array of cell DOM elements
    });

    const getCellCoords = (cell) => {
        const row = cell.parentNode;
        const table = row.parentNode.closest('table');
        const rowIndex = Array.from(table.rows).indexOf(row);
        const colIndex = Array.from(row.cells).indexOf(cell);
        return { rowIndex, colIndex, table };
    };

    const getSelectedCells = useCallback((start, end) => {
        if (!start || !end || start.table !== end.table) return [];

        const table = start.table;
        const minRow = Math.min(start.rowIndex, end.rowIndex);
        const maxRow = Math.max(start.rowIndex, end.rowIndex);
        const minCol = Math.min(start.colIndex, end.colIndex);
        const maxCol = Math.max(start.colIndex, end.colIndex);

        const cells = [];
        for (let i = minRow; i <= maxRow; i++) {
            const row = table.rows[i];
            if (!row) continue;
            for (let j = minCol; j <= maxCol; j++) {
                const cell = row.cells[j];
                if (cell) cells.push(cell);
            }
        }
        return cells;
    }, []);

    const handleMouseDown = useCallback((e) => {
        const cell = e.target.closest('td, th');
        if (!cell || !editorRef.current.contains(cell)) return;

        // If clicking on a border (resize), ignore selection logic? 
        // For now, assume selection.

        const coords = getCellCoords(cell);
        setSelection({
            startCell: coords,
            endCell: coords,
            isSelecting: true,
            selectedCells: [cell]
        });
    }, [editorRef]);

    const handleMouseMove = useCallback((e) => {
        if (!selection.isSelecting || !selection.startCell) return;

        const cell = e.target.closest('td, th');
        if (!cell || !editorRef.current.contains(cell)) return;

        const coords = getCellCoords(cell);
        if (coords.table !== selection.startCell.table) return;

        const newSelectedCells = getSelectedCells(selection.startCell, coords);

        setSelection(prev => ({
            ...prev,
            endCell: coords,
            selectedCells: newSelectedCells
        }));
    }, [selection.isSelecting, selection.startCell, editorRef, getSelectedCells]);

    const handleMouseUp = useCallback(() => {
        if (selection.isSelecting) {
            setSelection(prev => ({ ...prev, isSelecting: false }));
        }
    }, [selection.isSelecting]);

    // Global mouseup to catch releases outside the editor
    useEffect(() => {
        const onGlobalMouseUp = () => {
            if (selection.isSelecting) {
                setSelection(prev => ({ ...prev, isSelecting: false }));
            }
        };
        window.addEventListener('mouseup', onGlobalMouseUp);
        return () => window.removeEventListener('mouseup', onGlobalMouseUp);
    }, [selection.isSelecting]);

    return {
        selection,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        setSelection
    };
};
