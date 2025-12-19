import { useState, useRef, useEffect } from 'react';
import { Image, X } from 'lucide-react';
import './InsertModal.css';

export default function InsertImageModal({ isOpen, onClose, onInsert }) {
    const [altText, setAltText] = useState('');
    const [url, setUrl] = useState('');
    const altInputRef = useRef(null);

    useEffect(() => {
        if (isOpen && altInputRef.current) {
            altInputRef.current.focus();
            setAltText('');
            setUrl('');
        }
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (url.trim()) {
            const alt = altText.trim() || 'Image';
            onInsert(`![${alt}](${url.trim()})`);
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
                        <Image size={18} />
                        Insert Image
                    </div>
                    <button className="insert-modal-close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="insert-modal-form">
                    <div className="insert-modal-field">
                        <label htmlFor="image-alt">Alt Text</label>
                        <input
                            ref={altInputRef}
                            id="image-alt"
                            type="text"
                            placeholder="Describe the image (optional)"
                            value={altText}
                            onChange={(e) => setAltText(e.target.value)}
                        />
                    </div>

                    <div className="insert-modal-field">
                        <label htmlFor="image-url">Image URL</label>
                        <input
                            id="image-url"
                            type="text"
                            placeholder="https://example.com/image.png"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            required
                        />
                    </div>

                    <div className="insert-modal-preview">
                        <span className="preview-label">Preview:</span>
                        <span className="preview-content">
                            ![<span className="preview-text">{altText || 'Image'}</span>]
                            (<span className="preview-url">{url || 'url'}</span>)
                        </span>
                    </div>

                    <div className="insert-modal-actions">
                        <button type="button" className="btn btn-glass" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={!url.trim()}>
                            Insert Image
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
