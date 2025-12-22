import React, { useState, useEffect, useRef, useCallback } from 'react';

// --- Icons ---
const CropIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6.13 1L6 16a2 2 0 0 0 2 2h15" /><path d="M1 6.13L16 6a2 2 0 0 1 2 2v15" /></svg>;
const ResetIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12" /><path d="M3 3v9h9" /></svg>;

const AlignLeftIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="17" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="17" y1="18" x2="3" y2="18" /></svg>; // Placeholder for "Wrap Left"
const AlignCenterIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="10" x2="6" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="18" y1="18" x2="6" y2="18" /></svg>;
const AlignRightIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="21" y1="10" x2="7" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="21" y1="18" x2="7" y2="18" /></svg>;
const AlignInlineIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><path d="M17 21v-8" /><path d="M7 21v-8" /></svg>; // Placeholder


const InlineImageEditor = ({ target, containerRef, onSave, onCancel }) => {
    // --- State ---
    const [rect, setRect] = useState(null);
    const [isCropMode, setIsCropMode] = useState(false);

    // Track alignment state for UI feedback? 
    // We can just read styles, but styles update live.
    // Let's just apply styles.

    const interactionRef = useRef(null);

    // --- Helpers ---
    const getWrapper = () => {
        if (target.parentNode && target.parentNode.classList.contains('image-crop-wrapper')) {
            return target.parentNode;
        }
        return null;
    };

    const getActiveElement = () => getWrapper() || target;

    const updateRect = useCallback(() => {
        const el = getActiveElement();
        if (!el || !containerRef.current) return;

        const elRect = el.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();

        const transform = el.style.transform || '';
        const match = transform.match(/rotate\(([-\d.]+)deg\)/);
        const angle = match ? parseFloat(match[1]) : 0;

        setRect({
            top: elRect.top - containerRect.top + containerRef.current.scrollTop,
            left: elRect.left - containerRect.left + containerRef.current.scrollLeft,
            width: elRect.width,
            height: elRect.height,
            angle: angle,
            el: el
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
    }, [updateRect, containerRef]);

    useEffect(() => {
        if (target) {
            target.style.maxWidth = 'none';
        }
        if (getWrapper()) {
            setIsCropMode(true);
        }
    }, [target]);


    // --- Actions ---

    const handleAlign = (mode) => {
        const el = getActiveElement(); // Wrapper or Img

        // Reset base styles
        el.style.display = '';
        el.style.float = '';
        el.style.margin = '';
        el.style.marginLeft = '';
        el.style.marginTop = '';
        // Note: Resetting margin might break Crop positioning if we are in crop mode?
        // If we are in Crop Mode, the wrapper has margins?
        // Standard Crop logic in Docs: You can Wrap/Align the cropped image.
        // It applies to the Wrapper.
        // But resetting margins resets drag position?
        // NO, Drag Panning is inner image. 
        // Wrapper margins are for page flow.

        // However, if we align center, we use margin: 0 auto.
        // If we align inline, margin is 0.

        // Let's handle generic flow styles (float, display, margin-left/right auto)
        // Keep margin-top/bottom/left/right if they were specific? 
        // Simpler: Just overwrite alignment styles.

        if (mode === 'left') {
            el.style.float = 'left';
            el.style.marginRight = '10px';
            el.style.marginBottom = '10px';
            el.style.display = 'block'; // or inline-block
        } else if (mode === 'right') {
            el.style.float = 'right';
            el.style.marginLeft = '10px';
            el.style.marginBottom = '10px';
            el.style.display = 'block';
        } else if (mode === 'center') {
            el.style.float = 'none';
            el.style.display = 'block';
            el.style.margin = '10px auto';
        } else if (mode === 'inline') {
            el.style.float = 'none';
            el.style.display = 'inline-block'; // or inline
            el.style.margin = '0 5px';
            el.style.verticalAlign = 'bottom';
        }

        // Force update 
        updateRect();
    };

    const toggleCropMode = (e) => {
        e.stopPropagation();
        const wrapper = getWrapper();

        if (isCropMode) {
            // EXIT Crop Mode
            if (wrapper) {
                const wRect = wrapper.getBoundingClientRect();
                const iRect = target.getBoundingClientRect();

                const wWidth = wRect.width || 100;
                const wHeight = wRect.height || 100;

                const widthPct = (iRect.width / wWidth) * 100;
                const heightPct = (iRect.height / wHeight) * 100;

                const marginLeft = parseFloat(target.style.marginLeft) || 0;
                const marginTop = parseFloat(target.style.marginTop) || 0;

                const leftPct = (marginLeft / wWidth) * 100;
                const topPct = (marginTop / wHeight) * 100;

                target.style.width = scroll ? `${widthPct}%` : `${widthPct}%`; // typo fix from prev
                target.style.width = `${widthPct}%`;
                target.style.height = `${heightPct}%`;
                target.style.marginLeft = `${leftPct}%`;
                target.style.marginTop = `${topPct}%`;
            }
            setIsCropMode(false);
            updateRect();
        } else {
            // ENTER Crop Mode
            if (!wrapper) {
                const w = document.createElement('span');
                w.className = 'image-crop-wrapper';
                w.style.display = 'inline-block';
                w.style.overflow = 'hidden';
                w.style.verticalAlign = 'bottom';
                w.style.position = 'relative';
                w.style.maxWidth = 'none';

                const currentW = target.offsetWidth;
                const currentH = target.offsetHeight;

                w.style.width = `${currentW}px`;
                w.style.height = `${currentH}px`;

                // Inherit alignment from target if any? 
                // We should transfer float/margin
                w.style.float = target.style.float;
                w.style.margin = target.style.margin;
                w.style.display = target.style.display;

                target.style.float = 'none';
                target.style.margin = '0';
                target.style.display = 'block'; // Inner image block

                w.style.transform = target.style.transform;
                target.style.transform = '';

                target.parentNode.insertBefore(w, target);
                w.appendChild(target);
            }

            const computedW = target.offsetWidth;
            const computedH = target.offsetHeight;
            target.style.width = `${computedW}px`;
            target.style.height = `${computedH}px`;

            // If we just wrapped, margins are 0.
            // If we wrap an existing wrap, margins exist.

            setIsCropMode(true);
            updateRect();
        }
    };

    const handleReset = (e) => {
        e.stopPropagation();
        const wrapper = getWrapper();
        const el = getActiveElement();
        el.style.transform = '';

        // Reset alignment
        el.style.float = '';
        el.style.margin = '';
        el.style.display = '';

        if (wrapper) {
            wrapper.parentNode.insertBefore(target, wrapper);
            wrapper.remove();
        }

        target.style.width = '';
        target.style.height = '';
        target.style.marginLeft = '';
        target.style.marginTop = '';
        target.style.maxWidth = '100%';
        target.style.float = '';

        setIsCropMode(false);
        updateRect();
    };


    // --- Interactions ---

    const startInteraction = (type, e, extra = {}) => {
        e.preventDefault();
        e.stopPropagation();

        const el = getActiveElement();
        const startRect = el.getBoundingClientRect();

        const startLeft = parseFloat(target.style.marginLeft) || 0;
        const startTop = parseFloat(target.style.marginTop) || 0;

        interactionRef.current = {
            type,
            handle: extra.handle,
            startX: e.clientX,
            startY: e.clientY,
            startW: startRect.width,
            startH: startRect.height,
            startLeft,
            startTop,
            startRatio: (startRect.width / startRect.height) || 1
        };
    };

    useEffect(() => {
        const handleMove = (e) => {
            const current = interactionRef.current;
            if (!current) return;

            e.preventDefault();
            e.stopPropagation();

            const dx = e.clientX - current.startX;
            const dy = e.clientY - current.startY;

            const el = getActiveElement();

            if (current.type === 'resize') {
                let newW = current.startW;
                let newH = current.startH;
                const handle = current.handle;

                const isCorner = handle.length === 2;
                const lockRatio = isCorner;

                if (handle.includes('e')) newW += dx;
                if (handle.includes('w')) newW -= dx;
                if (handle.includes('s')) newH += dy;
                if (handle.includes('n')) newH -= dy;

                if (lockRatio) {
                    if (handle.includes('e') || handle.includes('w')) {
                        newH = newW / current.startRatio;
                    } else {
                        newW = newH * current.startRatio;
                    }
                }

                if (newW < 20) newW = 20;
                if (newH < 20) newH = 20;

                el.style.width = `${newW}px`;
                el.style.height = `${newH}px`;
            }

            if (current.type === 'crop-move') {
                if (isCropMode) {
                    const newLeft = current.startLeft + dx;
                    const newTop = current.startTop + dy;
                    target.style.marginLeft = `${newLeft}px`;
                    target.style.marginTop = `${newTop}px`;
                }
            }

            if (current.type === 'rotate') {
                const rect = el.getBoundingClientRect();
                const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
                const angle = Math.atan2(e.clientY - center.y, e.clientX - center.x) * (180 / Math.PI);
                const finalAngle = angle + 90;
                el.style.transform = `rotate(${finalAngle}deg)`;
            }
        };

        const handleUp = () => {
            interactionRef.current = null;
        };

        window.addEventListener('pointermove', handleMove);
        window.addEventListener('pointerup', handleUp);
        return () => {
            window.removeEventListener('pointermove', handleMove);
            window.removeEventListener('pointerup', handleUp);
        };
    }, [updateRect, target, isCropMode]);


    if (!rect) return null;

    // --- Render Styles ---
    const handleColor = isCropMode ? '#000' : '#3b82f6';
    const borderColor = isCropMode ? 'rgba(0,0,0,0.5)' : '#3b82f6';
    const borderStyle = isCropMode ? 'dashed' : 'solid';

    const handleStyle = (pos) => ({
        position: 'absolute',
        width: 10,
        height: 10,
        backgroundColor: '#fff',
        border: `1px solid ${handleColor}`,
        zIndex: 60,
        pointerEvents: 'auto',
        ...pos
    });

    return (
        <div style={{
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            pointerEvents: 'none',
            zIndex: 9999
        }}>
            {/* The Frame Overlay */}
            <div style={{
                position: 'absolute',
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
                border: `2px ${borderStyle} ${borderColor}`,
                transform: `rotate(${rect.angle}deg)`,
                transformOrigin: '50% 50%',
                pointerEvents: 'none',
                boxSizing: 'border-box'
            }}>

                {/* Drag Area */}
                {isCropMode && (
                    <div
                        style={{ position: 'absolute', inset: 0, cursor: 'move', pointerEvents: 'auto' }}
                        onPointerDown={e => startInteraction('crop-move', e)}
                        title="Drag to pan image"
                    />
                )}

                {/* Handles */}
                <div style={handleStyle({ top: -6, left: -6, cursor: 'nw-resize' })} onPointerDown={e => startInteraction('resize', e, { handle: 'nw' })}></div>
                <div style={handleStyle({ top: -6, right: -6, cursor: 'ne-resize' })} onPointerDown={e => startInteraction('resize', e, { handle: 'ne' })}></div>
                <div style={handleStyle({ bottom: -6, left: -6, cursor: 'sw-resize' })} onPointerDown={e => startInteraction('resize', e, { handle: 'sw' })}></div>
                <div style={handleStyle({ bottom: -6, right: -6, cursor: 'se-resize' })} onPointerDown={e => startInteraction('resize', e, { handle: 'se' })}></div>
                <div style={handleStyle({ top: -6, left: '50%', marginLeft: -5, cursor: 'n-resize' })} onPointerDown={e => startInteraction('resize', e, { handle: 'n' })}></div>
                <div style={handleStyle({ bottom: -6, left: '50%', marginLeft: -5, cursor: 's-resize' })} onPointerDown={e => startInteraction('resize', e, { handle: 's' })}></div>
                <div style={handleStyle({ left: -6, top: '50%', marginTop: -5, cursor: 'w-resize' })} onPointerDown={e => startInteraction('resize', e, { handle: 'w' })}></div>
                <div style={handleStyle({ right: -6, top: '50%', marginTop: -5, cursor: 'e-resize' })} onPointerDown={e => startInteraction('resize', e, { handle: 'e' })}></div>

                {/* Rotate Handle */}
                <div style={{
                    position: 'absolute',
                    top: -30,
                    left: '50%',
                    marginLeft: -5,
                    width: 10,
                    height: 10,
                    backgroundColor: handleColor,
                    borderRadius: '50%',
                    cursor: 'grab',
                    pointerEvents: 'auto',
                    zIndex: 60,
                    border: '1px solid white'
                }} onPointerDown={e => startInteraction('rotate', e)} />
                <div style={{
                    position: 'absolute',
                    top: -30,
                    left: '50%',
                    height: 30,
                    borderLeft: `1px solid ${handleColor}`,
                    marginLeft: 0
                }} />

            </div>

            {/* Toolbar */}
            <div style={{
                position: 'absolute',
                top: rect.top + rect.height + 15,
                left: rect.left,
                display: 'flex',
                gap: 8,
                backgroundColor: '#fff',
                padding: '6px 10px',
                borderRadius: 4,
                boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
                border: '1px solid #e0e0e0',
                zIndex: 10000,
                pointerEvents: 'auto',
                whiteSpace: 'nowrap'
            }}>
                {/* Alignment */}
                <button onClick={() => handleAlign('inline')} title="Inline" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, color: '#5f6368' }}><AlignInlineIcon /></button>
                <button onClick={() => handleAlign('left')} title="Wrap Text (Left)" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, color: '#5f6368' }}><AlignLeftIcon /></button>
                <button onClick={() => handleAlign('center')} title="Break Text (Center)" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, color: '#5f6368' }}><AlignCenterIcon /></button>
                <button onClick={() => handleAlign('right')} title="Wrap Text (Right)" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, color: '#5f6368' }}><AlignRightIcon /></button>

                <div style={{ width: 1, background: '#e0e0e0', margin: '0 4px' }} />

                <button
                    onClick={toggleCropMode}
                    title={isCropMode ? "Done Cropping" : "Crop Image"}
                    style={{ background: isCropMode ? '#e8f0fe' : 'transparent', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 4, color: isCropMode ? '#1967d2' : '#5f6368' }}
                >
                    <CropIcon />
                </button>
                <button
                    onClick={handleReset}
                    title="Reset Image"
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 4, color: '#5f6368' }}
                >
                    <ResetIcon />
                </button>
                <button onClick={onCancel} style={{ fontSize: 12, fontWeight: 500, border: 'none', background: 'transparent', color: '#5f6368', cursor: 'pointer', borderLeft: '1px solid #ddd', paddingLeft: 8, marginLeft: 4 }}>
                    Close
                </button>
            </div>
        </div>
    );
};

export default InlineImageEditor;
