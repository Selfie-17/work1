// Table Model Helpers with Span Support

export const DOMToGrid = (table) => {
    const grid = []; // 2D array of { cell: HTMLElement, origin: boolean (is top-left of span) }
    const rows = Array.from(table.rows);

    // 1. Initialize grid expansion
    // We don't know width/height yet, so we expand dynamically
    let maxCols = 0;

    rows.forEach((row, rIndex) => {
        if (!grid[rIndex]) grid[rIndex] = [];

        let cIndex = 0;
        Array.from(row.cells).forEach((cell) => {
            // Find first empty slot in this row
            while (grid[rIndex][cIndex]) cIndex++;

            const rowspan = parseInt(cell.getAttribute('rowspan') || 1);
            const colspan = parseInt(cell.getAttribute('colspan') || 1);

            // Mark this cell and its spans
            for (let r = 0; r < rowspan; r++) {
                for (let c = 0; c < colspan; c++) {
                    const targetR = rIndex + r;
                    const targetC = cIndex + c;

                    if (!grid[targetR]) grid[targetR] = [];
                    grid[targetR][targetC] = {
                        html: cell.innerHTML,
                        isHeader: cell.tagName === 'TH',
                        rowspan,
                        colspan,
                        origin: (r === 0 && c === 0),
                        realCell: (r === 0 && c === 0) ? cell : null // Reference to DOM if needed
                    };
                }
            }
            cIndex += colspan;
        });
        if (cIndex > maxCols) maxCols = cIndex;
    });

    // Fill gaps with empty if any (normalize)
    for (let r = 0; r < grid.length; r++) {
        if (!grid[r]) grid[r] = [];
        for (let c = 0; c < maxCols; c++) {
            if (!grid[r][c]) {
                grid[r][c] = { html: '&nbsp;', isHeader: false, rowspan: 1, colspan: 1, origin: true };
            }
        }
    }

    return grid;
};

export const GridToDOM = (table, grid) => {
    // Clear
    while (table.rows.length > 0) table.deleteRow(0);

    grid.forEach((row, rIndex) => {
        const tr = table.insertRow();
        row.forEach((cellData, cIndex) => {
            if (cellData.origin) {
                const cell = document.createElement(cellData.isHeader ? 'TH' : 'TD');
                cell.innerHTML = cellData.html || '&nbsp;';
                if (cellData.rowspan > 1) cell.setAttribute('rowspan', cellData.rowspan);
                if (cellData.colspan > 1) cell.setAttribute('colspan', cellData.colspan);

                // Styling preservation? For now basic.
                tr.appendChild(cell);
            }
        });
    });
};
