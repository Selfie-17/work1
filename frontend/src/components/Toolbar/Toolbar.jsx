import React, { useState, useEffect, useRef } from 'react';
import "./Toolbar.css";
import { transformImageUrl } from "../../utils/imageUtils";

const Icons = {
    Undo: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" /></svg>,
    Redo: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6" /><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" /></svg>,
    Bold: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /></svg>,
    Italic: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" /></svg>,
    Underline: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" /><line x1="4" y1="21" x2="20" y2="21" /></svg>,
    AlignLeft: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="17" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="17" y1="18" x2="3" y2="18" /></svg>,
    AlignCenter: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="10" x2="6" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="18" y1="18" x2="6" y2="18" /></svg>,
    AlignRight: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="10" x2="7" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="21" y1="18" x2="7" y2="18" /></svg>,
    AlignJustify: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="21" y1="18" x2="3" y2="18" /></svg>,
    ListBullet: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>,
    ListNumber: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" /><path d="M4 6h1v4" /><path d="M4 10h2" /><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" /></svg>,
    Quote: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 2.5 1 4.5 4 6" /><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v1c0 2.5 1 4.5 4 6" /></svg>,
    TableDelete: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" /><line x1="4" y1="4" x2="20" y2="20" /><line x1="20" y1="4" x2="4" y2="20" /></svg>,
    Shading: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z" /><path d="m5 21 5-5" /><path d="M19 13 11 5" /></svg>,
    VAlign: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16" /><path d="M4 18h16" /><path d="M12 8v8" /><path d="m9 11 3 3 3-3" /></svg>,
    Eraser: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" /><path d="m22 21H7" /><path d="m5 11 9 9" /></svg>,
    Scissors: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><line x1="20" y1="4" x2="8.12" y2="15.88" /><line x1="14.47" y1="14.48" x2="20" y2="20" /><line x1="8.12" y1="8.12" x2="12" y2="12" /></svg>,
    Copy: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>,
    Paste: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></svg>,
    Search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
    Link: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>,
    Image: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>,
    Video: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>,
    Table: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" /></svg>,
    Eye: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
    Save: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>,
    Share: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>,
    Print: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>,
    Export: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
    Code: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>,
    Strike: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4H9a3 3 0 0 0-2.83 4" /><path d="M14 12a4 4 0 0 1 0 8H6" /><line x1="4" y1="12" x2="20" y2="12" /></svg>,
    Superscript: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 22 10-10" /><path d="M2 13h10" /><path d="m18 8 2 2h-4" /><path d="M17 10c0-1.7 1.3-3 3-3s3 1.3 3 3-1.3 3-3 3" /></svg>,
    Subscript: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 22 10-10" /><path d="M2 13h10" /><path d="m18 19 2 2h-4" /><path d="M17 21c0-1.7 1.3-3 3-3s3 1.3 3 3-1.3 3-3 3" /></svg>,
    Uppercase: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14V4h16v10" /><path d="M12 4v16" /></svg>,
    Lowercase: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 12V8h10v4" /><path d="M12 8v8" /></svg>,
    Calendar: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
    Pdf: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><path d="M9 15h3a2 2 0 0 1 0 4h-3" /><path d="M9 12v6" /></svg>,
};

const ColorPicker = ({ icon, command, colors, onSelect, label }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [lastColor, setLastColor] = useState(colors[0]);
    const ref = useRef(null);

    useEffect(() => {
        const clickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', clickOutside);
        return () => document.removeEventListener('mousedown', clickOutside);
    }, []);

    const handleApplyLast = (e) => {
        e.preventDefault();
        onSelect(lastColor);
    };

    const toggleDropdown = (e) => {
        e.preventDefault();
        setIsOpen(!isOpen);
    };

    return (
        <div className="color-picker-wrapper" ref={ref}>
            <div className="split-color-btn">
                <button
                    className="toolbar-btn color-main-btn"
                    onMouseDown={handleApplyLast}
                    title={`${label}: ${lastColor}`}
                >
                    <span className="color-icon-inner" style={{ borderBottom: `3px solid ${lastColor}` }}>
                        {icon}
                    </span>
                </button>
                <button
                    className="toolbar-btn color-arrow-btn"
                    onMouseDown={toggleDropdown}
                    title="Select Color"
                >
                    <span className="color-arrow">▾</span>
                </button>
            </div>
            {isOpen && (
                <div className="color-dropdown">
                    {colors.map(c => (
                        <div
                            key={c}
                            className="color-swatch"
                            style={{ backgroundColor: c }}
                            onClick={() => {
                                setLastColor(c);
                                onSelect(c);
                                setIsOpen(false);
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const SymbolPicker = ({ onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [category, setCategory] = useState('Basic Math');
    const ref = useRef(null);

    const categories = {
        'Basic Math': [
            { s: '+', n: 'Plus', d: 'Addition' },
            { s: '−', n: 'Minus', d: 'Subtraction' },
            { s: '×', n: 'Multiply', d: 'Multiplication' },
            { s: '÷', n: 'Divide', d: 'Division' },
            { s: '=', n: 'Equals', d: 'Equal sign' },
            { s: '≠', n: 'Not Equal', d: 'Not equal to' },
            { s: '<', n: 'Less Than', d: 'Less than' },
            { s: '>', n: 'Greater Than', d: 'Greater than' },
            { s: '≤', n: 'Less/Equal', d: 'Less than or equal' },
            { s: '≥', n: 'Greater/Equal', d: 'Greater than or equal' },
            { s: '±', n: 'Plus-Minus', d: 'Plus or minus' },
            { s: '∓', n: 'Minus-Plus', d: 'Minus or plus' },
            { s: '∞', n: 'Infinity', d: 'Infinity' },
            { s: '≈', n: 'Approx', d: 'Approximately equal' },
            { s: '≡', n: 'Identical', d: 'Identical to' },
            { s: '∝', n: 'Proportional', d: 'Proportional to' },
            { s: '√', n: 'Sqrt', d: 'Square root' },
            { s: '∛', n: 'Cbrt', d: 'Cube root' },
            { s: '∑', n: 'Sum', d: 'Summation' },
            { s: '∏', n: 'Product', d: 'N-ary product' },
            { s: '|x|', n: 'Abs', d: 'Absolute value' },
            { s: '‖x‖', n: 'Norm', d: 'Norm' }
        ],
        'Greek': [
            { s: 'α', n: 'alpha', d: 'Learning rate, parameter' },
            { s: 'β', n: 'beta', d: 'Beta parameter' },
            { s: 'γ', n: 'gamma', d: 'Gamma parameter' },
            { s: 'δ', n: 'delta', d: 'Small change' },
            { s: 'ε', n: 'epsilon', d: 'Small value, error' },
            { s: 'ζ', n: 'zeta', d: 'Zeta' },
            { s: 'η', n: 'eta', d: 'Learning rate' },
            { s: 'θ', n: 'theta', d: 'Model parameters' },
            { s: 'ι', n: 'iota', d: 'Iota' },
            { s: 'κ', n: 'kappa', d: 'Kappa' },
            { s: 'λ', n: 'lambda', d: 'Regularization, eigenvalue' },
            { s: 'μ', n: 'mu', d: 'Mean' },
            { s: 'ν', n: 'nu', d: 'Nu' },
            { s: 'ξ', n: 'xi', d: 'Xi' },
            { s: 'π', n: 'pi', d: 'Pi constant' },
            { s: 'ρ', n: 'rho', d: 'Correlation' },
            { s: 'σ', n: 'sigma', d: 'Standard deviation' },
            { s: 'τ', n: 'tau', d: 'Tau, time constant' },
            { s: 'υ', n: 'upsilon', d: 'Upsilon' },
            { s: 'φ', n: 'phi', d: 'Phi function' },
            { s: 'χ', n: 'chi', d: 'Chi distribution' },
            { s: 'ψ', n: 'psi', d: 'Psi' },
            { s: 'ω', n: 'omega', d: 'Angular frequency' },
            { s: 'Α', n: 'Alpha', d: 'Capital Alpha' },
            { s: 'Β', n: 'Beta', d: 'Capital Beta' },
            { s: 'Γ', n: 'Gamma', d: 'Gamma function' },
            { s: 'Δ', n: 'Delta', d: 'Change, difference' },
            { s: 'Θ', n: 'Theta', d: 'Capital Theta' },
            { s: 'Λ', n: 'Lambda', d: 'Capital Lambda' },
            { s: 'Π', n: 'Pi', d: 'Product notation' },
            { s: 'Σ', n: 'Sigma', d: 'Summation' },
            { s: 'Φ', n: 'Phi', d: 'Capital Phi' },
            { s: 'Ψ', n: 'Psi', d: 'Capital Psi' },
            { s: 'Ω', n: 'Omega', d: 'Ohm, sample space' }
        ],
        'Linear Alg': [
            { s: '→', n: 'Vector', d: 'Vector arrow' },
            { s: '←', n: 'Left Arrow', d: 'Left vector' },
            { s: '⋅', n: 'Dot', d: 'Dot product' },
            { s: '×', n: 'Cross', d: 'Cross product' },
            { s: '⊗', n: 'Tensor', d: 'Tensor/Kronecker product' },
            { s: '⊕', n: 'Direct Sum', d: 'Direct sum' },
            { s: 'ᵀ', n: 'Transpose', d: 'Matrix transpose' },
            { s: '⁻¹', n: 'Inverse', d: 'Matrix inverse' },
            { s: '|A|', n: 'Det', d: 'Determinant' },
            { s: '‖x‖', n: 'Norm', d: 'Vector/Matrix norm' },
            { s: 'x²', n: 'Squared', d: 'Superscript 2' },
            { s: 'x³', n: 'Cubed', d: 'Superscript 3' },
            { s: 'xⁿ', n: 'Power n', d: 'Superscript n' },
            { s: 'x₁', n: 'Sub 1', d: 'Subscript 1' },
            { s: 'x₂', n: 'Sub 2', d: 'Subscript 2' },
            { s: 'xᵢ', n: 'Sub i', d: 'Subscript i' },
            { s: 'xⱼ', n: 'Sub j', d: 'Subscript j' }
        ],
        'Calculus': [
            { s: '∂', n: 'Partial', d: 'Partial derivative' },
            { s: '∇', n: 'Nabla', d: 'Gradient/Del operator' },
            { s: '∇²', n: 'Laplacian', d: 'Laplacian operator' },
            { s: '∫', n: 'Integral', d: 'Integral' },
            { s: '∬', n: 'Double Int', d: 'Double integral' },
            { s: '∮', n: 'Contour', d: 'Contour integral' },
            { s: 'Δ', n: 'Delta', d: 'Change/Difference' },
            { s: 'd/dx', n: 'Derivative', d: 'Derivative notation' },
            { s: '∂/∂x', n: 'Partial Deriv', d: 'Partial derivative' },
            { s: 'lim', n: 'Limit', d: 'Limit notation' },
            { s: '∞', n: 'Infinity', d: 'Infinity' },
            { s: '→', n: 'Approaches', d: 'Approaches/tends to' }
        ],
        'Probability': [
            { s: 'P()', n: 'Probability', d: 'Probability function' },
            { s: 'E[]', n: 'Expected', d: 'Expected value' },
            { s: 'Var()', n: 'Variance', d: 'Variance' },
            { s: 'Cov()', n: 'Covariance', d: 'Covariance' },
            { s: '∼', n: 'Distributed', d: 'Distributed as' },
            { s: 'N(μ,σ²)', n: 'Normal', d: 'Normal distribution' },
            { s: 'σ²', n: 'Variance', d: 'Variance symbol' },
            { s: 'μ', n: 'Mean', d: 'Population mean' },
            { s: 'x̄', n: 'Sample Mean', d: 'Sample mean' },
            { s: 'σ', n: 'Std Dev', d: 'Standard deviation' },
            { s: 'ρ', n: 'Correlation', d: 'Correlation coefficient' },
            { s: '!', n: 'Factorial', d: 'Factorial' }
        ],
        'Logic/Sets': [
            { s: '∈', n: 'Element of', d: 'Is element of' },
            { s: '∉', n: 'Not Element', d: 'Not element of' },
            { s: '⊂', n: 'Subset', d: 'Proper subset' },
            { s: '⊆', n: 'Subset/Equal', d: 'Subset or equal' },
            { s: '⊃', n: 'Superset', d: 'Proper superset' },
            { s: '⊇', n: 'Super/Equal', d: 'Superset or equal' },
            { s: '∪', n: 'Union', d: 'Set union' },
            { s: '∩', n: 'Intersect', d: 'Set intersection' },
            { s: '∅', n: 'Empty Set', d: 'Empty/null set' },
            { s: '∀', n: 'For All', d: 'Universal quantifier' },
            { s: '∃', n: 'Exists', d: 'Existential quantifier' },
            { s: '∧', n: 'And', d: 'Logical AND' },
            { s: '∨', n: 'Or', d: 'Logical OR' },
            { s: '¬', n: 'Not', d: 'Logical NOT' },
            { s: '⇒', n: 'Implies', d: 'Logical implication' },
            { s: '⇔', n: 'Iff', d: 'If and only if' },
            { s: '⊨', n: 'Models', d: 'Semantic entailment' },
            { s: '⊢', n: 'Proves', d: 'Syntactic entailment' },
            { s: '∴', n: 'Therefore', d: 'Therefore' },
            { s: '∵', n: 'Because', d: 'Because' },
            { s: '⊥', n: 'Perpendicular', d: 'Perpendicular/false' }
        ],
        'ML': [
            { s: 'ŷ', n: 'y-hat', d: 'Predicted value' },
            { s: 'θ̂', n: 'theta-hat', d: 'Estimated parameter' },
            { s: 'argmax', n: 'Argmax', d: 'Argument of maximum' },
            { s: 'argmin', n: 'Argmin', d: 'Argument of minimum' },
            { s: 'L()', n: 'Loss', d: 'Loss function' },
            { s: 'J(θ)', n: 'Cost', d: 'Cost function' },
            { s: 'f(x)', n: 'Function', d: 'Function notation' },
            { s: 'hθ(x)', n: 'Hypothesis', d: 'Hypothesis function' },
            { s: '∇L', n: 'Gradient L', d: 'Gradient of loss' },
            { s: '∂L/∂w', n: 'Backprop', d: 'Backpropagation' },
            { s: '⊕', n: 'XOR/Add', d: 'XOR or addition' },
            { s: '⊗', n: 'Tensor', d: 'Tensor product' },
            { s: '||y−ŷ||', n: 'Error Norm', d: 'Prediction error' },
            { s: 'α', n: 'Learning Rate', d: 'Learning rate' },
            { s: 'λ', n: 'Regularization', d: 'Regularization param' },
            { s: 'softmax', n: 'Softmax', d: 'Softmax function' },
            { s: 'sigmoid', n: 'Sigmoid', d: 'Sigmoid activation' },
            { s: 'ReLU', n: 'ReLU', d: 'ReLU activation' }
        ],
        'Arrows': [
            { s: '→', n: 'Right', d: 'Right arrow' },
            { s: '←', n: 'Left', d: 'Left arrow' },
            { s: '↔', n: 'LeftRight', d: 'Bidirectional' },
            { s: '⇒', n: 'Implies', d: 'Double right' },
            { s: '⇐', n: 'Implied by', d: 'Double left' },
            { s: '⇔', n: 'Iff', d: 'Double bidirectional' },
            { s: '↑', n: 'Up', d: 'Upward arrow' },
            { s: '↓', n: 'Down', d: 'Downward arrow' },
            { s: '⟶', n: 'Long Right', d: 'Long right arrow' },
            { s: '↦', n: 'Maps to', d: 'Maps to' },
            { s: '⊃', n: 'Superset', d: 'Superset arrow' }
        ],
        'Brackets': [
            { s: '(', n: 'Left Paren', d: 'Left parenthesis' },
            { s: ')', n: 'Right Paren', d: 'Right parenthesis' },
            { s: '[', n: 'Left Bracket', d: 'Left square bracket' },
            { s: ']', n: 'Right Bracket', d: 'Right square bracket' },
            { s: '{', n: 'Left Brace', d: 'Left curly brace' },
            { s: '}', n: 'Right Brace', d: 'Right curly brace' },
            { s: '⟨', n: 'Left Angle', d: 'Left angle bracket' },
            { s: '⟩', n: 'Right Angle', d: 'Right angle bracket' },
            { s: '⌈', n: 'Left Ceil', d: 'Left ceiling' },
            { s: '⌉', n: 'Right Ceil', d: 'Right ceiling' },
            { s: '⌊', n: 'Left Floor', d: 'Left floor' },
            { s: '⌋', n: 'Right Floor', d: 'Right floor' },
            { s: '|', n: 'Pipe', d: 'Vertical bar' },
            { s: '‖', n: 'Double Pipe', d: 'Double vertical bar' }
        ]
    };

    useEffect(() => {
        const clickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', clickOutside);
        return () => document.removeEventListener('mousedown', clickOutside);
    }, []);

    return (
        <div className="color-picker-wrapper" ref={ref}>
            <button className="toolbar-btn" onMouseDown={e => e.preventDefault()} onClick={() => setIsOpen(!isOpen)} title="Special Symbols">
                <span style={{ fontSize: '16px' }}>Ω</span>
            </button>
            {isOpen && (
                <div className="symbol-picker-dropdown">
                    <div className="symbol-tabs">
                        {Object.keys(categories).map(cat => (
                            <button
                                key={cat}
                                className={`symbol-tab ${category === cat ? 'active' : ''}`}
                                onClick={() => setCategory(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    <div className="symbol-grid-advanced">
                        {categories[category].map(item => (
                            <div
                                key={item.s}
                                className="symbol-item-advanced"
                                onMouseDown={() => window.__saveSelection && window.__saveSelection()}
                                onClick={() => { onSelect(item.s); setIsOpen(false); }}
                                title={`${item.n}: ${item.d}`}
                            >
                                <span className="symbol-char">{item.s}</span>
                                <span className="symbol-name-hint">{item.n}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const TableGrid = ({ onSelect }) => {
    const [hovered, setHovered] = useState({ r: 0, c: 0 });

    const handleMouseOver = (r, c) => setHovered({ r, c });
    const handleClick = (r, c) => onSelect({ rows: r, cols: c });

    return (
        <div className="table-grid-container" onMouseLeave={() => setHovered({ r: 0, c: 0 })}>
            <div className="table-grid-header">
                {hovered.r > 0 ? `Insert Table ${hovered.r} x ${hovered.c}` : "Select Dimensions"}
            </div>
            <div className="table-grid-board">
                {Array.from({ length: 10 }).map((_, r) => (
                    <div key={r} className="grid-row">
                        {Array.from({ length: 10 }).map((_, c) => {
                            const active = r < hovered.r && c < hovered.c;
                            return (
                                <div
                                    key={c}
                                    className={`grid-cell ${active ? 'active' : ''}`}
                                    onMouseOver={() => handleMouseOver(r + 1, c + 1)}
                                    onClick={() => handleClick(r + 1, c + 1)}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

const TablePicker = ({ onInsert }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const clickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', clickOutside);
        return () => document.removeEventListener('mousedown', clickOutside);
    }, []);

    return (
        <div className="color-picker-wrapper" ref={ref}>
            <button className="toolbar-btn" onMouseDown={e => e.preventDefault()} onClick={() => setIsOpen(!isOpen)} title="Insert Table">
                <Icons.Table />
            </button>
            {isOpen && (
                <div className="table-grid-dropdown">
                    <TableGrid onSelect={(val) => { onInsert(val); setIsOpen(false); }} />
                    <div className="dropdown-divider" />
                    <div className="dropdown-item" onClick={() => {
                        const r = prompt("Rows:", "3");
                        const c = prompt("Columns:", "3");
                        if (r && c) onInsert({ rows: parseInt(r), cols: parseInt(c) });
                        setIsOpen(false);
                    }}>
                        Custom Table...
                    </div>
                </div>
            )}
        </div>
    );
};

const EmojiPicker = ({ onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);
    const emojis = [
        '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '👻', '💀', '☠️', '👽', '👾', '🤖', '💩', '😺', '😸', '😻', '😼', '😽', '🙀', '😿', '😾', '🙈', '🙉', '🙊'
    ];

    useEffect(() => {
        const clickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', clickOutside);
        return () => document.removeEventListener('mousedown', clickOutside);
    }, []);

    return (
        <div className="color-picker-wrapper" ref={ref}>
            <button className="toolbar-btn" onMouseDown={e => e.preventDefault()} onClick={() => setIsOpen(!isOpen)} title="Emojis">
                <span style={{ fontSize: '16px' }}>😊</span>
            </button>
            {isOpen && (
                <div className="color-dropdown emojis-dropdown">
                    {emojis.map(emoji => (
                        <div key={emoji} className="symbol-item" onClick={() => { onSelect(emoji); setIsOpen(false); }}>
                            {emoji}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default function Toolbar({
    activeStates = {},
    onCommand,
    onTableAction,
    onSave,
    onShare,
    onPrint,
    onExport,
    onSearch,
    onMediaTrigger,
    onTransformCase,
    onInsertDate,
    stats = { words: 0, chars: 0 }
}) {
    const [showMore, setShowMore] = useState(false);
    const moreRef = useRef(null);
    const colors = ['#000000', '#ef4444', '#f97316', '#facc15', '#22c55e', '#3b82f6', '#4f46e5', '#7c3aed', '#db2777', '#ffffff'];
    const highlights = ['#fef08a', '#bbf7d0', '#bfdbfe', '#fbcfe8', '#ddd6fe', '#fed7aa', '#f3f4f6', 'transparent'];

    useEffect(() => {
        const clickOutside = (e) => {
            if (moreRef.current && !moreRef.current.contains(e.target)) setShowMore(false);
        };
        document.addEventListener('mousedown', clickOutside);
        return () => document.removeEventListener('mousedown', clickOutside);
    }, []);

    return (
        <div className="pro-toolbar-container">
            {/* Row 1: Formatting focus */}
            <div className="toolbar-row row-1">
                <Group>
                    <Btn icon={<Icons.Bold />} onMouseDown={() => window.__saveSelection && window.__saveSelection()} onClick={() => onCommand("bold")} active={activeStates.bold} title="Bold" />
                    <Btn icon={<Icons.Italic />} onMouseDown={() => window.__saveSelection && window.__saveSelection()} onClick={() => onCommand("italic")} active={activeStates.italic} title="Italic" />
                    <Btn icon={<Icons.Underline />} onMouseDown={() => window.__saveSelection && window.__saveSelection()} onClick={() => onCommand("underline")} active={activeStates.underline} title="Underline" />
                    <Btn icon={<Icons.Superscript />} onMouseDown={() => window.__saveSelection && window.__saveSelection()} onClick={() => onCommand("superscript")} active={activeStates.super} title="Superscript" />
                    <Btn icon={<Icons.Subscript />} onMouseDown={() => window.__saveSelection && window.__saveSelection()} onClick={() => onCommand("subscript")} active={activeStates.sub} title="Subscript" />
                    <ColorPicker icon="A" label="Text Color" command="foreColor" colors={colors} onSelect={c => { window.__saveSelection && window.__saveSelection(); onCommand("foreColor", c); }} />
                    <ColorPicker icon="🖌️" label="Highlight" command="hiliteColor" colors={highlights} onSelect={c => { window.__saveSelection && window.__saveSelection(); onCommand("hiliteColor", c); }} />
                </Group>

                <Group>
                    <Btn icon={<Icons.AlignLeft />} onMouseDown={() => window.__saveSelection && window.__saveSelection()} onClick={() => onCommand("justifyLeft")} active={activeStates.justifyLeft} title="Align Left" />
                    <Btn icon={<Icons.AlignCenter />} onMouseDown={() => window.__saveSelection && window.__saveSelection()} onClick={() => onCommand("justifyCenter")} active={activeStates.justifyCenter} title="Align Center" />
                    <Btn icon={<Icons.AlignRight />} onMouseDown={() => window.__saveSelection && window.__saveSelection()} onClick={() => onCommand("justifyRight")} active={activeStates.justifyRight} title="Align Right" />
                    <Btn icon={<Icons.AlignJustify />} onMouseDown={() => window.__saveSelection && window.__saveSelection()} onClick={() => onCommand("justifyFull")} active={activeStates.justifyFull} title="Justify" />
                </Group>

                <Group>
                    <Btn icon={<Icons.ListNumber />} onMouseDown={() => window.__saveSelection && window.__saveSelection()} onClick={() => onCommand("insertOrderedList")} active={activeStates.orderedList} title="Numbered List" />
                    <Btn icon={<Icons.ListBullet />} onMouseDown={() => window.__saveSelection && window.__saveSelection()} onClick={() => onCommand("insertUnorderedList")} active={activeStates.unorderedList} title="Bullet List" />
                </Group>

                <Group>
                    <Btn icon={<Icons.Quote />} onMouseDown={() => window.__saveSelection && window.__saveSelection()} onClick={() => onCommand("formatBlock", "blockquote")} title="Blockquote" />
                    <EmojiPicker onSelect={emoji => { window.__saveSelection && window.__saveSelection(); onCommand("insertHTML", emoji); }} />
                </Group>

                <div className="toolbar-spacer" />

                <Group className="actions-group">
                    <Btn icon={<Icons.Save />} onClick={onSave} title="Save Document" />
                    <Btn icon={<Icons.Share />} onClick={onShare} title="Share Link" />
                    <Btn icon={<Icons.Print />} onClick={onPrint} title="Print Document" />
                    <Btn icon={<Icons.Pdf />} onClick={onPrint} title="Export to PDF" />
                </Group>
            </div>

            {/* Row 2: Insertion and Navigation focus */}
            <div className="toolbar-row row-2">
                <Group>
                    <Btn icon={<Icons.Eraser />} onMouseDown={() => window.__saveSelection && window.__saveSelection()} onClick={() => onCommand("removeFormat")} title="Clear Formatting" />
                    <Btn icon={<Icons.Scissors />} onMouseDown={() => window.__saveSelection && window.__saveSelection()} onClick={() => onCommand("cut")} title="Cut" />
                    <Btn icon={<Icons.Copy />} onMouseDown={() => window.__saveSelection && window.__saveSelection()} onClick={() => onCommand("copy")} title="Copy" />
                    <Btn icon={<Icons.Paste />} onMouseDown={() => window.__saveSelection && window.__saveSelection()} onClick={() => navigator.clipboard.readText().then(t => onCommand("insertHTML", t))} title="Paste" />
                    <Btn icon={<Icons.Search />} onMouseDown={() => window.__saveSelection && window.__saveSelection()} onClick={onSearch} title="Search" />
                </Group>

                <Group>
                    <Btn icon={<Icons.Link />} onMouseDown={() => window.__saveSelection && window.__saveSelection()} onClick={() => onMediaTrigger('link')} title="Link" />
                    <SymbolPicker onSelect={s => { window.__saveSelection && window.__saveSelection(); onCommand("insertHTML", s); }} />
                    <TablePicker onInsert={val => { window.__saveSelection && window.__saveSelection(); onCommand("insertTable", val); }} />
                    <Btn icon={<Icons.Image />} onMouseDown={() => window.__saveSelection && window.__saveSelection()} onClick={() => onMediaTrigger('image')} title="Image" />
                    <Btn icon={<Icons.Video />} onMouseDown={() => window.__saveSelection && window.__saveSelection()} onClick={() => onMediaTrigger('video')} title="Video" />
                </Group>

                <Group>
                    <select className="style-select" onMouseDown={() => window.__saveSelection && window.__saveSelection()} onChange={(e) => onCommand("formatBlock", e.target.value)} defaultValue="p">
                        <option value="p">Paragraph</option>
                        <option value="h1">Heading 1</option>
                        <option value="h2">Heading 2</option>
                        <option value="h3">Heading 3</option>
                    </select>
                    <Btn icon={<Icons.Code />} onClick={() => onCommand("insertHTML", "<pre><code>\n\n</code></pre>")} title="Code Block" />
                </Group>

                <div className="toolbar-spacer" />

                <Group ref={moreRef} className="more-options-container">
                    <Btn icon={<Icons.Undo />} onClick={() => onCommand("undo")} title="Undo" />
                    <Btn icon={<Icons.Redo />} onClick={() => onCommand("redo")} title="Redo" />
                    <button className="toolbar-btn" onMouseDown={e => e.preventDefault()} onClick={() => setShowMore(!showMore)} title="More Options">
                        ⋮
                    </button>
                    {showMore && (
                        <div className="more-dropdown">
                            <div className="more-tools-row">
                                <Btn icon={<Icons.Strike />} onClick={() => onCommand("strikethrough")} active={activeStates.strike} title="Strikethrough" />
                                <Btn icon={<Icons.Uppercase />} onClick={() => onTransformCase('upper')} title="Uppercase (TT)" />
                                <Btn icon={<Icons.Lowercase />} onClick={() => onTransformCase('lower')} title="Lowercase (tT)" />
                                <Btn icon={<Icons.Calendar />} onClick={onInsertDate} title="Insert Date" />
                            </div>
                            <hr />
                            <div className="stats-item">Words: <strong>{stats.words}</strong></div>
                            <div className="stats-item">Chars: <strong>{stats.chars}</strong></div>
                            <div className="stats-item">Time: <strong>{~~(stats.words / 200)} min read</strong></div>
                            <hr />
                            <div className="dropdown-action" onClick={() => window.location.reload()}>Reload Document</div>
                        </div>
                    )}
                </Group>
            </div>
        </div>
    );
}

function Group({ children, className = "" }, ref) {
    return <div ref={ref} className={`toolbar-group ${className}`}>{children}</div>;
}

// Forward ref for Group to handle clickOutside
Group = React.forwardRef(Group);

function Btn({ icon, label, onClick, title, active }) {
    return (
        <button
            className={`toolbar-btn ${active ? 'active' : ''}`}
            onMouseDown={e => e.preventDefault()}
            onClick={onClick}
            title={title}
        >
            {icon || label}
        </button>
    );
}
