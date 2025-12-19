import { useState, useRef, useEffect } from 'react';
import { Link, X } from 'lucide-react';
import './InsertModal.css';

export default function InsertLinkModal({ isOpen, onClose, onInsert }) {
    const [text, setText] = useState('');
    const [url, setUrl] = useState('');
    const textInputRef = useRef(null);

    useEffect(() => {
        if (isOpen && textInputRef.current) {
            textInputRef.current.focus();
            setText('');
            setUrl('');
        }
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (url.trim()) {
            const linkText = text.trim() || 'Link';
            onInsert(`[${linkText}](${url.trim()})`);
            onClose();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="insert-modal-overlay" onClick={onClose}>
            <div
                className="insert-modal"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={handleKeyDown}
            >
                <div className="insert-modal-header">
                    <div className="insert-modal-title">
                        <Link size={18} />
                        Insert Link
                    </div>
                    <button className="insert-modal-close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="insert-modal-form">
                    <div className="insert-modal-field">
                        <label htmlFor="link-text">Link Text</label>
                        <input
                            ref={textInputRef}
                            id="link-text"
                            type="text"
                            placeholder="Enter display text (optional)"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                    </div>

                    <div className="insert-modal-field">
                        <label htmlFor="link-url">URL</label>
                        <input
                            id="link-url"
                            type="text"
                            placeholder="https://example.com"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            required
                        />
                    </div>

                    <div className="insert-modal-preview">
                        <span className="preview-label">Preview:</span>
                        <span className="preview-content">
                            [<span className="preview-text">{text || 'Link'}</span>]
                            (<span className="preview-url">{url || 'url'}</span>)
                        </span>
                    </div>

                    <div className="insert-modal-actions">
                        <button type="button" className="btn btn-glass" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={!url.trim()}>
                            Insert Link
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
