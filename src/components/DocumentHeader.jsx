import { useState, useRef } from 'react';
import {
    ChevronLeft, Pencil, CheckCircle, ChevronDown, MoreVertical, Sparkles,
    Share2, Printer, Download, FileText, FileImage, Copy, Trash2, Info
} from 'lucide-react';
import './DocumentHeader.css';

export default function DocumentHeader({ title, onTitleChange }) {
    const [docTitle, setDocTitle] = useState(title || 'Untitled Document');
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareLink, setShareLink] = useState('');
    const titleInputRef = useRef(null);

    const handleTitleBlur = () => {
        if (onTitleChange) {
            onTitleChange(docTitle);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.target.blur();
        }
    };

    // Share functionality
    const handleShare = () => {
        const link = `${window.location.origin}/doc/${encodeURIComponent(docTitle)}`;
        setShareLink(link);
        setShowShareModal(true);
    };

    const copyShareLink = () => {
        navigator.clipboard.writeText(shareLink);
        alert('Link copied to clipboard!');
    };

    // Print functionality
    const handlePrint = () => {
        window.print();
    };

    // Export functionality
    const handleExport = (format) => {
        const content = document.querySelector('.editor-content')?.innerHTML || '';

        if (format === 'html') {
            const blob = new Blob([`<!DOCTYPE html><html><head><title>${docTitle}</title></head><body>${content}</body></html>`], { type: 'text/html' });
            downloadBlob(blob, `${docTitle}.html`);
        } else if (format === 'txt') {
            const textContent = document.querySelector('.editor-content')?.innerText || '';
            const blob = new Blob([textContent], { type: 'text/plain' });
            downloadBlob(blob, `${docTitle}.txt`);
        } else if (format === 'md') {
            const textContent = document.querySelector('.editor-content')?.innerText || '';
            const blob = new Blob([textContent], { type: 'text/markdown' });
            downloadBlob(blob, `${docTitle}.md`);
        }
        setShowExportMenu(false);
    };

    const downloadBlob = (blob, filename) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // More menu actions
    const handleDuplicate = () => {
        alert('Document duplicated!');
        setShowMoreMenu(false);
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this document?')) {
            alert('Document deleted!');
        }
        setShowMoreMenu(false);
    };

    const handleAbout = () => {
        alert(`Document: ${docTitle}\nCreated: ${new Date().toLocaleDateString()}`);
        setShowMoreMenu(false);
    };

    return (
        <>
            <header className="document-header">
                <div className="header-left">
                    <button className="back-btn" title="Go back">
                        <ChevronLeft />
                    </button>

                    <div className="ai-icon">
                        <Sparkles />
                    </div>

                    <div className="document-info">
                        <div className="document-title-wrapper">
                            <input
                                ref={titleInputRef}
                                type="text"
                                className="document-title"
                                value={docTitle}
                                onChange={(e) => setDocTitle(e.target.value)}
                                onBlur={handleTitleBlur}
                                onKeyDown={handleKeyDown}
                            />
                            <button
                                className="edit-title-btn"
                                onClick={() => titleInputRef.current?.focus()}
                                title="Edit title"
                            >
                                <Pencil />
                            </button>
                        </div>

                        <div className="save-status">
                            <CheckCircle />
                            <span>Saved to</span>
                            <a href="#">My Documents</a>
                        </div>
                    </div>
                </div>

                <div className="header-right">
                    <button className="action-btn" onClick={handleShare}>
                        <Share2 size={16} />
                        Share
                    </button>
                    <button className="action-btn" onClick={handlePrint}>
                        <Printer size={16} />
                        Print
                    </button>

                    <div className="dropdown-container">
                        <button
                            className="action-btn export-btn"
                            onClick={() => setShowExportMenu(!showExportMenu)}
                        >
                            <Download size={16} />
                            Export
                            <ChevronDown size={14} />
                        </button>

                        {showExportMenu && (
                            <div className="dropdown-menu">
                                <button onClick={() => handleExport('html')}>
                                    <FileText size={16} />
                                    HTML Document
                                </button>
                                <button onClick={() => handleExport('txt')}>
                                    <FileText size={16} />
                                    Plain Text (.txt)
                                </button>
                                <button onClick={() => handleExport('md')}>
                                    <FileText size={16} />
                                    Markdown (.md)
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="dropdown-container">
                        <button
                            className="more-btn"
                            title="More options"
                            onClick={() => setShowMoreMenu(!showMoreMenu)}
                        >
                            <MoreVertical />
                        </button>

                        {showMoreMenu && (
                            <div className="dropdown-menu">
                                <button onClick={handleDuplicate}>
                                    <Copy size={16} />
                                    Duplicate
                                </button>
                                <button onClick={handleAbout}>
                                    <Info size={16} />
                                    Document Info
                                </button>
                                <div className="dropdown-divider"></div>
                                <button onClick={handleDelete} className="danger">
                                    <Trash2 size={16} />
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Share Modal */}
            {showShareModal && (
                <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Share Document</h3>
                        <p>Share this link with others:</p>
                        <div className="share-link-container">
                            <input
                                type="text"
                                value={shareLink}
                                readOnly
                                className="share-link-input"
                            />
                            <button className="copy-btn" onClick={copyShareLink}>
                                <Copy size={16} />
                                Copy
                            </button>
                        </div>
                        <button className="modal-close-btn" onClick={() => setShowShareModal(false)}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
