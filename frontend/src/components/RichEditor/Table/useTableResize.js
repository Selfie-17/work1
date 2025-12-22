import { useState, useCallback, useEffect } from 'react';

export const useTableResize = (editorRef) => {
    const [resizeState, setResizeState] = useState({
        isResizing: false,
        type: null, // 'col' or 'row'
        target: null, // the cell element being resized
        initialSize: 0,
        initialPos: 0,
        table: null
    });

    const [hoverState, setHoverState] = useState({
        type: null,
        target: null
    });

    // Threshold for detecting border hover (pixels)
    const THRESHOLD = 5;

    const handleMouseMove = useCallback((e) => {
        if (resizeState.isResizing) return; // Managed by window listener

        const cell = e.target.closest('td, th');
        if (!cell || !editorRef.current.contains(cell)) {
            if (hoverState.type) setHoverState({ type: null, target: null });
            editorRef.current.style.cursor = 'auto'; // Reset cursor
            return;
        }

        const rect = cell.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;

        // Check right border for Col Resize
        if (Math.abs(rect.right - x) < THRESHOLD) {
            setHoverState({ type: 'col', target: cell });
            editorRef.current.style.cursor = 'col-resize';
            return;
        }

        // Check bottom border for Row Resize
        if (Math.abs(rect.bottom - y) < THRESHOLD) {
            setHoverState({ type: 'row', target: cell });
            editorRef.current.style.cursor = 'row-resize';
            return;
        }

        // Reset if no match
        if (hoverState.type) {
            setHoverState({ type: null, target: null });
            editorRef.current.style.cursor = 'text';
        }
    }, [editorRef, resizeState.isResizing, hoverState.type]);

    const handleMouseDown = useCallback((e) => {
        if (!hoverState.type || !hoverState.target) return;

        e.preventDefault(); // Prevent text selection
        e.stopPropagation();

        const rect = hoverState.target.getBoundingClientRect();

        setResizeState({
            isResizing: true,
            type: hoverState.type,
            target: hoverState.target,
            initialSize: hoverState.type === 'col' ? rect.width : rect.height,
            initialPos: hoverState.type === 'col' ? e.clientX : e.clientY,
            table: hoverState.target.closest('table')
        });
    }, [hoverState]);

    useEffect(() => {
        if (!resizeState.isResizing) return;

        const onMove = (e) => {
            const { type, initialSize, initialPos, target, table } = resizeState;
            const currentPos = type === 'col' ? e.clientX : e.clientY;
            const delta = currentPos - initialPos;
            const newSize = Math.max(10, initialSize + delta); // Min 10px

            if (type === 'col') {
                target.style.width = `${newSize}px`;
                // Also update colgroup if it exists (not implemented yet, relying on cell width)

                // Google Docs behavior: Table width might need to change if strict
                // For now, let table reflow
            } else {
                target.style.height = `${newSize}px`;
                target.parentNode.style.height = `${newSize}px`;
            }
        };

        const onUp = () => {
            setResizeState(prev => ({ ...prev, isResizing: false }));
            editorRef.current.style.cursor = 'auto';
        };

        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
    }, [resizeState, editorRef]);

    return {
        resizeState,
        handleMouseMove,
        handleMouseDown
    };
};
