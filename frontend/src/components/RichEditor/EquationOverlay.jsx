import React, { useState, useEffect, useRef, useCallback } from 'react';

const AlignLeftIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="17" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="17" y1="18" x2="3" y2="18" /></svg>;
const AlignCenterIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="10" x2="6" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="18" y1="18" x2="6" y2="18" /></svg>;
const AlignRightIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="21" y1="10" x2="7" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="21" y1="18" x2="7" y2="18" /></svg>;
const EditIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;

const EquationOverlay = ({ target, containerRef, onAlign, onEdit, onCancel }) => {
    const [rect, setRect] = useState(null);

    const updateRect = useCallback(() => {
        if (!target || !containerRef.current) return;

        const elRect = target.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();

        setRect({
            top: elRect.top - containerRect.top + containerRef.current.scrollTop,
            left: elRect.left - containerRect.left + containerRef.current.scrollLeft,
            width: elRect.width,
            height: elRect.height
        });
    }, [target, containerRef]);

    useEffect(() => {
        updateRect();
        const interval = setInterval(updateRect, 30);
        window.addEventListener('resize', updateRect);
        window.addEventListener('scroll', updateRect, true);
        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', updateRect);
            window.removeEventListener('scroll', updateRect, true);
        };
    }, [updateRect]);

    if (!rect) return null;

    return (
        <div style={{
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            pointerEvents: 'none',
            zIndex: 9998
        }}>
            {/* Selection Highlight */}
            <div style={{
                position: 'absolute',
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
                border: '2px solid #3b82f6',
                borderRadius: '4px',
                pointerEvents: 'none',
                boxSizing: 'border-box'
            }} />

            {/* Toolbar */}
            <div className="equation-overlay-toolbar" style={{
                position: 'absolute',
                top: rect.top - 45,
                left: Math.max(0, rect.left + (rect.width / 2) - 90),
                display: 'flex',
                gap: 8,
                backgroundColor: '#fff',
                padding: '6px 10px',
                borderRadius: '6px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                border: '1px solid #e2e8f0',
                zIndex: 10000,
                pointerEvents: 'auto',
                whiteSpace: 'nowrap'
            }}>
                <button onClick={() => onAlign('left')} title="Align Left" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, color: '#5f6368', borderRadius: 4 }}><AlignLeftIcon /></button>
                <button onClick={() => onAlign('center')} title="Align Center" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, color: '#5f6368', borderRadius: 4 }}><AlignCenterIcon /></button>
                <button onClick={() => onAlign('right')} title="Align Right" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, color: '#5f6368', borderRadius: 4 }}><AlignRightIcon /></button>

                <div style={{ width: 1, background: '#e2e8f0', margin: '0 4px' }} />

                <button onClick={onEdit} title="Edit Equation" style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, color: '#2563eb', fontSize: '13px', fontWeight: '500' }}>
                    <EditIcon /> Edit
                </button>

                <div style={{ width: 1, background: '#e2e8f0', margin: '0 4px' }} />

                <button onClick={onCancel} style={{ fontSize: '13px', fontWeight: '500', border: 'none', background: 'transparent', color: '#64748b', cursor: 'pointer', padding: '0 4px' }}>
                    Close
                </button>
            </div>
        </div>
    );
};

export default EquationOverlay;
