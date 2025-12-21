import React, { useState, useEffect, useRef } from 'react';
import './FindReplace.css';

const FindReplace = ({ isOpen, onClose, editorRef }) => {
    const [findText, setFindText] = useState('');
    const [replaceText, setReplaceText] = useState('');
    const [matchCount, setMatchCount] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const panelRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            // Focus find input when opened
            setTimeout(() => {
                const input = panelRef.current?.querySelector('.find-input');
                input?.focus();
            }, 100);
        }
    }, [isOpen]);

    const handleFind = (forward = true) => {
        if (!findText) return;
        const editor = editorRef.current?.getElement();
        if (!editor) return;

        // Use window.find if available (simplest approach for contentEditable)
        // Note: window.find is non-standard but widely supported in browsers
        const found = window.find(findText, false, !forward, true, false, true, false);
        if (!found) {
            // Loop back or show alert
            alert("No more matches found");
        }
    };

    const handleReplace = () => {
        const selection = window.getSelection();
        if (selection.toString().toLowerCase() === findText.toLowerCase()) {
            document.execCommand('insertHTML', false, replaceText);
            handleFind(true);
        } else {
            handleFind(true);
        }
    };

    const handleReplaceAll = () => {
        const editor = editorRef.current?.getElement();
        if (!editor) return;
        const html = editor.innerHTML;
        const regex = new RegExp(findText, 'gi');
        editor.innerHTML = html.replace(regex, replaceText);
        // Trigger save/change event
        editor.dispatchEvent(new Event('input', { bubbles: true }));
    };

    const [activeTab, setActiveTab] = useState('find'); // 'find' or 'replace'

    if (!isOpen) return null;

    return (
        <div className="find-replace-panel" ref={panelRef}>
            <div className="find-replace-header">
                <div className="tab-switcher">
                    <button
                        className={`tab-btn ${activeTab === 'find' ? 'active' : ''}`}
                        onClick={() => setActiveTab('find')}
                    >
                        Find
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'replace' ? 'active' : ''}`}
                        onClick={() => setActiveTab('replace')}
                    >
                        Replace
                    </button>
                </div>
                <button className="close-btn" onClick={onClose}>×</button>
            </div>
            <div className="find-replace-body">
                <div className="input-row">
                    <input
                        type="text"
                        className="find-input"
                        placeholder="Find"
                        value={findText}
                        onChange={(e) => setFindText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleFind(true)}
                    />
                    <div className="action-btns">
                        <button className="format-btn" onClick={() => editorRef.current?.executeCommand('superscript')} title="Superscript">x²</button>
                        <button className="format-btn" onClick={() => editorRef.current?.executeCommand('subscript')} title="Subscript">x₂</button>
                        <span className="separator">|</span>
                        <button onClick={() => handleFind(false)} title="Previous">↑</button>
                        <button onClick={() => handleFind(true)} title="Next">↓</button>
                    </div>
                </div>

                {activeTab === 'replace' && (
                    <div className="input-row animate-in">
                        <input
                            type="text"
                            className="replace-input"
                            placeholder="Replace"
                            value={replaceText}
                            onChange={(e) => setReplaceText(e.target.value)}
                        />
                        <div className="action-btns">
                            <button onClick={handleReplace} title="Replace">ab</button>
                            <button onClick={handleReplaceAll} title="Replace All">All</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FindReplace;
