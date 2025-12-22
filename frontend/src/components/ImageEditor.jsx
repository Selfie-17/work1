import React, { useRef, useEffect, useState, useCallback } from 'react';

// Icons/Cursors could be custom, but we'll use standard CSS cursors.

const ImageEditor = ({ src }) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    // -- State --
    const [image, setImage] = useState(null);

    // Object Properties (Center based)
    const [imgState, setImgState] = useState({
        x: 0, // Center X
        y: 0, // Center Y
        width: 0,
        height: 0,
        rotation: 0 // Degrees
    });

    // Interaction State
    const [dragAction, setDragAction] = useState(null); // 'move', 'n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw', 'rotate'
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
    const [initialImgState, setInitialImgState] = useState(null); // Snapshot at start of drag

    const HANDLE_SIZE = 10;
    const ROTATE_HANDLE_OFFSET = 30;

    // -- Helpers --

    // Load Image
    useEffect(() => {
        const img = new Image();
        img.src = src;
        img.crossOrigin = "anonymous";
        img.onload = () => {
            setImage(img);
            // Initial setup: Center in container, scaled to fit 80%
            if (containerRef.current) {
                const { offsetWidth, offsetHeight } = containerRef.current;
                const aspect = img.width / img.height;
                let startW = offsetWidth * 0.5;
                let startH = startW / aspect;

                if (startH > offsetHeight * 0.8) {
                    startH = offsetHeight * 0.5;
                    startW = startH * aspect;
                }

                setImgState({
                    x: offsetWidth / 2,
                    y: offsetHeight / 2,
                    width: startW,
                    height: startH,
                    rotation: 0
                });
            }
        };
    }, [src]);


    // -- Math Helpers --

    const rotatePoint = (x, y, cx, cy, angleDeg) => {
        const rad = (angleDeg * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        return {
            x: cx + (x - cx) * cos - (y - cy) * sin,
            y: cy + (x - cx) * sin + (y - cy) * cos
        };
    };

    /**
     * Get the coordinates of all handles in Canvas Space
     */
    const getHandles = useCallback((state) => {
        const { x: cx, y: cy, width: w, height: h, rotation } = state;
        const halfW = w / 2;
        const halfH = h / 2;

        // Unrotated coords relative to center
        const coords = {
            nw: { x: cx - halfW, y: cy - halfH },
            n: { x: cx, y: cy - halfH },
            ne: { x: cx + halfW, y: cy - halfH },
            e: { x: cx + halfW, y: cy },
            se: { x: cx + halfW, y: cy + halfH },
            s: { x: cx, y: cy + halfH },
            sw: { x: cx - halfW, y: cy + halfH },
            w: { x: cx - halfW, y: cy },
            rotate: { x: cx, y: cy - halfH - ROTATE_HANDLE_OFFSET }
        };

        // Rotate all points around (cx, cy)
        const rotated = {};
        Object.keys(coords).forEach(k => {
            rotated[k] = rotatePoint(coords[k].x, coords[k].y, cx, cy, rotation);
        });

        return rotated;
    }, []);

    // -- Drawing --

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !image) return;
        const ctx = canvas.getContext('2d');

        // Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Save
        ctx.save();

        // 1. Draw Image
        ctx.translate(imgState.x, imgState.y);
        ctx.rotate((imgState.rotation * Math.PI) / 180);
        ctx.drawImage(image, -imgState.width / 2, -imgState.height / 2, imgState.width, imgState.height);

        // 2. Draw UI (Selection Box)
        ctx.strokeStyle = '#3b82f6'; // Blue-500
        ctx.lineWidth = 2;
        ctx.strokeRect(-imgState.width / 2, -imgState.height / 2, imgState.width, imgState.height);

        ctx.restore();

        // 3. Draw Handles (No rotation on context, draw at calculated points)
        const handles = getHandles(imgState);

        ctx.fillStyle = 'white';
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 1;

        // Draw square handles
        ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].forEach(key => {
            const { x, y } = handles[key];
            ctx.beginPath();
            ctx.rect(x - HANDLE_SIZE / 2, y - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
            ctx.fill();
            ctx.stroke();
        });

        // Draw Rotate Handle
        const rot = handles.rotate;
        const top = handles.n;
        ctx.beginPath();
        ctx.moveTo(top.x, top.y);
        ctx.lineTo(rot.x, rot.y);
        ctx.strokeStyle = '#3b82f6';
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(rot.x, rot.y, HANDLE_SIZE / 2, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.stroke();

    }, [image, imgState, getHandles]);

    // Animation Loop
    useEffect(() => {
        let raf;
        const render = () => {
            draw();
            raf = requestAnimationFrame(render);
        }
        render();
        return () => cancelAnimationFrame(raf);
    }, [draw]);

    // -- Event Logic --

    const getMousePos = (e) => {
        if (!canvasRef.current) return { x: 0, y: 0 };
        const rect = canvasRef.current.getBoundingClientRect();
        const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const hitTest = (x, y) => {
        const handles = getHandles(imgState);

        // Check handles first
        for (const [key, pos] of Object.entries(handles)) {
            if (x >= pos.x - HANDLE_SIZE && x <= pos.x + HANDLE_SIZE &&
                y >= pos.y - HANDLE_SIZE && y <= pos.y + HANDLE_SIZE) {
                return key;
            }
        }

        // Check body (using rotated point check is complex, simplify by rotating point back)
        // Rotate mouse point around image center by -rotation
        const local = rotatePoint(x, y, imgState.x, imgState.y, -imgState.rotation);
        if (local.x >= imgState.x - imgState.width / 2 && local.x <= imgState.x + imgState.width / 2 &&
            local.y >= imgState.y - imgState.height / 2 && local.y <= imgState.y + imgState.height / 2) {
            return 'move';
        }

        return null;
    };

    const updateCursor = (action, rotation) => {
        if (!canvasRef.current) return;
        // Simplified cursors for valid interaction
        // Ideally we rotate cursors based on handle rotation, but standard is okay for now
        let cursor = 'default';
        if (action === 'move') cursor = 'move';
        else if (action === 'rotate') cursor = 'grab'; // or url to rotate icon
        else if (['n', 's'].includes(action)) cursor = 'ns-resize';
        else if (['e', 'w'].includes(action)) cursor = 'ew-resize';
        else if (['nw', 'se'].includes(action)) cursor = 'nwse-resize';
        else if (['ne', 'sw'].includes(action)) cursor = 'nesw-resize';

        canvasRef.current.style.cursor = cursor;
    };

    const handlePointerDown = (e) => {
        e.preventDefault(); // Prevent scroll on touch
        const pos = getMousePos(e);
        const action = hitTest(pos.x, pos.y);
        if (action) {
            setDragAction(action);
            setLastMousePos(pos);
            setInitialImgState({ ...imgState });
        }
    };

    const handlePointerMove = (e) => {
        e.preventDefault();
        const pos = getMousePos(e);

        // Update Cursor check if not dragging
        if (!dragAction) {
            const action = hitTest(pos.x, pos.y);
            updateCursor(action || 'default', imgState.rotation);
            return;
        }

        // Drag Logic
        const dx = pos.x - lastMousePos.x;
        const dy = pos.y - lastMousePos.y;

        if (dragAction === 'move') {
            setImgState(prev => ({
                ...prev,
                x: prev.x + dx,
                y: prev.y + dy
            }));
            setLastMousePos(pos);
            return;
        }

        if (dragAction === 'rotate') {
            const cx = imgState.x;
            const cy = imgState.y;
            // Angle from center to current mouse
            const angle = Math.atan2(pos.y - cy, pos.x - cx) * (180 / Math.PI);
            // We want the handle (which is at -90 deg relative to graphic) to follow mouse
            // So offset by 90
            setImgState(prev => ({
                ...prev,
                rotation: angle + 90
            }));
            return;
        }

        // Resizing logic
        // This is the complex part. 
        // Simplified: Rotate delta back to local space, apply to width/height, then adjust center.
        // However, keeping specific corners fixed is better.

        // 1. Calculate the fixed point (opposite corner)
        // Map of opposite handles
        const opposites = {
            nw: 'se', n: 's', ne: 'sw', e: 'w',
            se: 'nw', s: 'n', sw: 'ne', w: 'e'
        };

        // We need the coordinates of the opposite handle from the INITIAL state
        // But we need to use the current mouse position.

        // Let's us a simpler approach that is "good enough" for UI prototypes
        // Project the mouse movement onto the local axes of the image.

        const rad = (imgState.rotation * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        // Delta in local space
        const localDx = dx * cos + dy * sin;
        const localDy = -dx * sin + dy * cos;

        setImgState(prev => {
            let { x, y, width, height } = prev;

            // This simple additive approach creates "drifting" if not careful with centers.
            // A more robust way is to recalculate everything from the anchor point.
            // But for this step, let's implement the delta application dependent on handle.

            let newW = width;
            let newH = height;
            let dX_rot = 0; // Center shift X (rotated back to world)
            let dY_rot = 0; // Center shift Y

            if (dragAction.includes('e')) {
                newW += localDx;
                // Center moves by half the width change, in direction of rotation 0 (local X)
                dX_rot += (localDx / 2) * cos;
                dY_rot += (localDx / 2) * sin;
            }
            if (dragAction.includes('w')) {
                newW -= localDx;
                dX_rot += (-localDx / 2) * cos;
                dY_rot += (-localDx / 2) * sin;
            }
            if (dragAction.includes('s')) {
                newH += localDy;
                dX_rot += -(localDy / 2) * sin; // Local Y is sin(ROT+90)? No, local Y vector is (-sin, cos)
                dY_rot += (localDy / 2) * cos;
            }
            if (dragAction.includes('n')) {
                newH -= localDy;
                dX_rot -= -(localDy / 2) * sin;
                dY_rot -= (localDy / 2) * cos;
            }

            // Constraints
            if (newW < 20) newW = 20;
            if (newH < 20) newH = 20;

            return {
                ...prev,
                width: newW,
                height: newH,
                x: x + dX_rot,
                y: y + dY_rot
            };
        });

        setLastMousePos(pos);
    };

    const handlePointerUp = () => {
        setDragAction(null);
    };


    // Resize Observer for canvas size
    useEffect(() => {
        const resizeCanvas = () => {
            if (containerRef.current && canvasRef.current) {
                canvasRef.current.width = containerRef.current.offsetWidth;
                canvasRef.current.height = containerRef.current.offsetHeight;
                draw();
            }
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        return () => window.removeEventListener('resize', resizeCanvas);
    }, [draw]);

    // Export
    const handleExport = (format = 'png') => {
        if (!image) return;
        // Export just the internal image with current rotation ??? 
        // User likely wants the "result" of the edit. 
        // If we are just transforming an object on a blank canvas, maybe we export the cropped/transformed version?
        // Logic: Create canvas of size `width x height`. Draw image.

        const temp = document.createElement('canvas');
        temp.width = imgState.width;
        temp.height = imgState.height;
        const tCtx = temp.getContext('2d');

        tCtx.translate(imgState.width / 2, imgState.height / 2);
        // If we want to burn in the rotation? 
        // Usually users expect the "straight" image if they just resized it? 
        // Or if they rotated it on screen, should the export be rotated?
        // Let's assume WYSIWYG but transparant background.

        // Actually, if I rotate 45deg, the bounding box of the export is larger.
        // Let's stick to "Export Original Image with Transforms applied".

        // Complicated: if I rotate, do I export a rotated image (larger bounds)? Yes.
        // Calculate bounds of rotated box.

        const rad = (imgState.rotation * Math.PI) / 180;
        const absCos = Math.abs(Math.cos(rad));
        const absSin = Math.abs(Math.sin(rad));

        const outW = imgState.width * absCos + imgState.height * absSin;
        const outH = imgState.width * absSin + imgState.height * absCos;

        temp.width = outW;
        temp.height = outH;
        const tCtx2 = temp.getContext('2d');

        tCtx2.translate(outW / 2, outH / 2);
        tCtx2.rotate(rad);
        tCtx2.drawImage(image, -imgState.width / 2, -imgState.height / 2, imgState.width, imgState.height);

        const link = document.createElement('a');
        link.download = `exported-image.${format}`;
        link.href = temp.toDataURL(`image/${format}`);
        link.click();
    };

    return (
        <div className="flex flex-col h-full w-full bg-gray-900 text-white rounded-xl overflow-hidden shadow-2xl select-none">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
                <h2 className="text-lg font-semibold tracking-wide text-gray-200">Transform Tool V2</h2>
                <div className="flex space-x-2">
                    <button onClick={() => setImgState({ ...imgState, rotation: 0 })} className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 rounded transition">Reset Angle</button>
                    <button onClick={() => handleExport('png')} className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 rounded transition shadow-lg">Export Result</button>
                </div>
            </div>

            <div
                ref={containerRef}
                className="flex-1 relative bg-gray-950 overflow-hidden"
            >
                <canvas
                    ref={canvasRef}
                    className="block w-full h-full touch-none"
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                />
                {!image && <div className="absolute inset-0 flex items-center justify-center text-gray-500">Loading Image...</div>}
            </div>

            <div className="p-2 bg-gray-800 text-xs text-gray-400 text-center">
                Drag image to move • Drag corners to resize • Drag top handle to rotate
            </div>
        </div>
    );
};

export default ImageEditor;
