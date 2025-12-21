import React, { useState, useRef, useEffect } from 'react';
import './TableContextToolbar.css';

const TableColorPicker = ({ onSelect, activeColor }) => {
    const [isOpen, setIsOpen] = useState(false);
    const colors = ['#ffffff', '#f3f4f6', '#e5e7eb', '#d1d5db', '#fee2e2', '#ffedd5', '#fef9c3', '#ecfccb', '#dcfce7', '#d1fae5', '#e0f2fe', '#f0f9ff'];
    const ref = useRef(null);

    useEffect(() => {
        const clickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', clickOutside);
        return () => document.removeEventListener('mousedown', clickOutside);
    }, []);

    return (
        <div className="table-option-wrapper" ref={ref}>
            <button className="table-tool-btn" onClick={() => setIsOpen(!isOpen)} title="Shading">
                <span className="icon">🎨</span>
            </button>
            {isOpen && (
                <div className="table-option-dropdown color-grid">
                    {colors.map(c => (
                        <div key={c} className="color-sq" style={{ background: c }} onClick={() => { onSelect(c); setIsOpen(false); }} />
                    ))}
                </div>
            )}
        </div>
    );
};

const BorderPicker = ({ onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const borders = [
        { label: 'None', val: 'none' },
        { label: 'Thin', val: '1px solid #ccc' },
        { label: 'Medium', val: '2px solid #666' },
        { label: 'Thick', val: '3px solid #333' }
    ];
    const ref = useRef(null);

    useEffect(() => {
        const clickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', clickOutside);
        return () => document.removeEventListener('mousedown', clickOutside);
    }, []);

    return (
        <div className="table-option-wrapper" ref={ref}>
            <button className="table-tool-btn" onClick={() => setIsOpen(!isOpen)} title="Borders">
                <span className="icon">田</span>
            </button>
            {isOpen && (
                <div className="table-option-dropdown border-list">
                    {borders.map(b => (
                        <div key={b.val} className="border-opt" onClick={() => { onSelect(b.val); setIsOpen(false); }}>
                            {b.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const TableContextToolbar = ({ info, onAction }) => {
    if (!info) return null;

    const { rect } = info;

    const style = {
        position: 'fixed',
        top: `${rect.top - 48}px`,
        left: `${rect.left}px`,
        zIndex: 1000,
    };

    return (
        <div className="table-context-toolbar" style={style}>
            <div className="toolbar-section">
                <button onClick={() => onAction('addRowAbove')} title="Insert Row Above">R↑</button>
                <button onClick={() => onAction('addRowBelow')} title="Insert Row Below">R↓</button>
                <button onClick={() => onAction('addColLeft')} title="Insert Column Left">C←</button>
                <button onClick={() => onAction('addColRight')} title="Insert Column Right">C→</button>
            </div>
            <div className="toolbar-divider" />
            <div className="toolbar-section">
                <button onClick={() => onAction('deleteRow')} title="Delete Row">Del R</button>
                <button onClick={() => onAction('deleteCol')} title="Delete Column">Del C</button>
                <button onClick={() => onAction('deleteTable')} title="Delete Table" className="danger">Del T</button>
            </div>
            <div className="toolbar-divider" />
            <div className="toolbar-section">
                <button onClick={() => onAction('mergeCells')} title="Merge Cells">Merge</button>
                <button onClick={() => onAction('splitCell')} title="Split Cell">Split</button>
            </div>
            <div className="toolbar-divider" />
            <div className="toolbar-section">
                <button onClick={() => onAction('toggleHeaderRow')} title="Toggle Header">Header</button>
                <div className="align-group">
                    <button onClick={() => onAction('setCellVAlign', 'top')} title="Align Top">⤒</button>
                    <button onClick={() => onAction('setCellVAlign', 'middle')} title="Align Middle">⇕</button>
                    <button onClick={() => onAction('setCellVAlign', 'bottom')} title="Align Bottom">⤓</button>
                </div>
            </div>
            <div className="toolbar-divider" />
            <div className="toolbar-section">
                <TableColorPicker onSelect={(c) => onAction('setCellBackground', c)} />
                <BorderPicker onSelect={(b) => onAction('setTableBorders', b)} />
            </div>
        </div>
    );
};

export default TableContextToolbar;
