import React, { useEffect, useRef, useState } from 'react';
import './TableOverlay.css';

const TableOverlay = ({ selection, editorRef }) => {
    const overlayRef = useRef(null);
    const [rects, setRects] = useState([]);

    useEffect(() => {
        if (!selection.selectedCells.length) {
            setRects([]);
            return;
        }

        if (!overlayRef.current) return;
        const containerRect = overlayRef.current.getBoundingClientRect();
        const newRects = selection.selectedCells.map(cell => {
            const cellRect = cell.getBoundingClientRect();
            return {
                top: cellRect.top - containerRect.top,
                left: cellRect.left - containerRect.left,
                width: cellRect.width,
                height: cellRect.height
            };
        });
        setRects(newRects);
    }, [selection, editorRef]);

    // Always render container so ref is attached
    return (
        <div className="table-selection-overlay" ref={overlayRef}>
            {rects.length > 0 && (
                <>
                    {/* Individual cell highlights (background) */}
                    {rects.map((rect, i) => (
                        <div
                            key={i}
                            className="table-cell-highlight"
                            style={{
                                top: rect.top,
                                left: rect.left,
                                width: rect.width,
                                height: rect.height
                            }}
                        />
                    ))}

                    {/* Bounding box border */}
                    <div
                        className="table-selection-border"
                        style={{
                            top: Math.min(...rects.map(r => r.top)),
                            left: Math.min(...rects.map(r => r.left)),
                            width: Math.max(...rects.map(r => r.left + r.width)) - Math.min(...rects.map(r => r.left)),
                            height: Math.max(...rects.map(r => r.top + r.height)) - Math.min(...rects.map(r => r.top))
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                    />
                </>
            )}
        </div>
    );
};

export default TableOverlay;
