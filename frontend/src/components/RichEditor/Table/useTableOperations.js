import { useCallback } from 'react';
import { DOMToGrid, GridToDOM } from './TableOperations';

export const useTableOperations = (editorRef) => {

    const executeAction = useCallback((action, table, selection = null) => {
        if (!table) return;

        let grid = DOMToGrid(table);
        const rows = grid.length;
        const cols = grid[0]?.length || 0;

        // Determine target context
        // If selection exists, use it. Else fallback to first cell?
        // Actually the toolbar passes action, but context depends on selection.

        // For Insert/Delete, we usually care about the "Active" cell or range.
        // Let's assume selection.selectedCells has the range.

        /* 
           Logic:
           We need to know WHICH row/col to operate on.
           If we have a selection of multiple cells, "Add Row Above" usually means above the TOP row of selection.
           "Merge" applies to the selection box.
        */

        let minRow = 0, maxRow = 0, minCol = 0, maxCol = 0;

        if (selection && selection.selectedCells.length > 0) {
            // Calculate bounds
            const starts = selection.selectedCells.map(cell => {
                // Find cell in grid
                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < cols; c++) {
                        if (grid[r][c].realCell === cell) return { r, c };
                        // If cell is spanned, realCell might match origin? 
                        // DOMToGrid marks origin with realCell reference.
                        // Spanned slots don't have realCell reference to the same generic object unless we link it.
                        // GridToDOM creates new cells.
                        // Wait, DOMToGrid uses "realCell" for origin.
                        // Spanned cells don't have "realCell".
                        // Use .contains or === check.
                    }
                }
                return { r: 0, c: 0 };
            });
            // This is O(N*Grid). A bit slow but fine for normal tables.
            // Better: get coordinates from DOM before grid conversion?
            // "useTableSelection" already calculates coords! selection.startCell / endCell

            if (selection.startCell && selection.endCell) {
                minRow = Math.min(selection.startCell.rowIndex, selection.endCell.rowIndex);
                maxRow = Math.max(selection.startCell.rowIndex, selection.endCell.rowIndex);
                minCol = Math.min(selection.startCell.colIndex, selection.endCell.colIndex);
                maxCol = Math.max(selection.startCell.colIndex, selection.endCell.colIndex);
            }
        }

        switch (action) {
            case 'addRowAbove':
            case 'addRowBelow': {
                const targetRow = action === 'addRowAbove' ? minRow : maxRow + 1;
                const newRow = Array(cols).fill(null).map(() => ({
                    html: '&nbsp;', isHeader: false, rowspan: 1, colspan: 1, origin: true
                }));
                grid.splice(targetRow, 0, newRow);
                break;
            }
            case 'deleteRow': {
                // Remove all rows in selection
                grid.splice(minRow, (maxRow - minRow + 1));
                break;
            }
            case 'addColLeft':
            case 'addColRight': {
                const targetCol = action === 'addColLeft' ? minCol : maxCol + 1;
                grid = grid.map(row => {
                    const newRow = [...row];
                    newRow.splice(targetCol, 0, {
                        html: '&nbsp;', isHeader: row[0]?.isHeader || false, rowspan: 1, colspan: 1, origin: true
                    });
                    return newRow;
                });
                break;
            }
            case 'deleteCol': {
                grid = grid.map(row => {
                    const newRow = [...row];
                    newRow.splice(minCol, (maxCol - minCol + 1));
                    return newRow;
                });
                break;
            }
            case 'mergeCells': {
                // Merge range [minRow..maxRow, minCol..maxCol]
                if (maxRow === minRow && maxCol === minCol) break; // Nothing to merge

                // Survivor: grid[minRow][minCol]
                const survivor = grid[minRow][minCol];
                survivor.rowspan = (maxRow - minRow + 1);
                survivor.colspan = (maxCol - minCol + 1);

                // Collect content?
                let content = survivor.html;

                // Mark others as spanned (origin=false)
                for (let r = minRow; r <= maxRow; r++) {
                    for (let c = minCol; c <= maxCol; c++) {
                        if (r === minRow && c === minCol) continue;
                        if (grid[r][c].origin) {
                            if (grid[r][c].html !== '&nbsp;') content += " " + grid[r][c].html;
                        }
                        grid[r][c] = { ...grid[r][c], origin: false, realCell: null };
                    }
                }
                survivor.html = content;
                break;
            }
            case 'splitCell': {
                // Restore cells in range
                // Reset rowspan/colspan of top-left
                // Set origin=true for all
                if (grid[minRow][minCol].rowspan > 1 || grid[minRow][minCol].colspan > 1) {
                    const rSpan = grid[minRow][minCol].rowspan;
                    const cSpan = grid[minRow][minCol].colspan;

                    grid[minRow][minCol].rowspan = 1;
                    grid[minRow][minCol].colspan = 1;

                    for (let r = minRow; r < minRow + rSpan; r++) {
                        for (let c = minCol; c < minCol + cSpan; c++) {
                            grid[r][c].origin = true;
                            grid[r][c].rowspan = 1;
                            grid[r][c].colspan = 1;
                            // Content? Empty.
                            if (r !== minRow || c !== minCol) grid[r][c].html = '&nbsp;';
                        }
                    }
                }
                break;
            }
            case 'deleteTable':
                table.remove();
                return;
        }

        if (grid.length === 0 || grid[0].length === 0) {
            table.remove();
        } else {
            GridToDOM(table, grid);
        }

        // Trigger input event
        const event = new Event('input', { bubbles: true });
        editorRef.current.dispatchEvent(event);

    }, [editorRef]);

    return { executeAction };
};
