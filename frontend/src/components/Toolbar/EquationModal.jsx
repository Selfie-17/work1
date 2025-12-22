import React, { useState } from 'react';
import MathEditor from '../MathEditor';
import './EquationModal.css';

export default function EquationModal({ isOpen, initialLatex = '', onInsert, onCancel }) {
    const [latex, setLatex] = useState(initialLatex);

    if (!isOpen) return null;

    const handleInsert = () => {
        onInsert(latex);
    };

    return (
        <div className="equation-modal-overlay">
            <div className="equation-modal-content">
                <div className="equation-modal-header">
                    <h3>Insert Equation</h3>
                    <button className="close-btn" onClick={onCancel}>&times;</button>
                </div>
                <div className="equation-modal-body">
                    <p className="instruction-text">Type your equation visually. Use keyboard shortcuts like ^ for power, _ for subscript, / for fractions.</p>

                    <MathEditor
                        value={latex}
                        onChange={setLatex}
                    />

                    <div className="latex-preview">
                        <label>LaTeX Output (Internal)</label>
                        <code>{latex || '...'}</code>
                    </div>
                </div>
                <div className="equation-modal-footer">
                    <button className="secondary-btn" onClick={onCancel}>Cancel</button>
                    <button className="primary-btn" onClick={handleInsert}>
                        {initialLatex ? 'Update Equation' : 'Insert Equation'}
                    </button>
                </div>
            </div>
        </div>
    );
}
