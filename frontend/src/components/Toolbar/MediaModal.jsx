import React, { useState, useRef, useEffect } from 'react';
import './MediaModal.css';

const MediaModal = ({ isOpen, onClose, onSubmit, initialTab = 'link', selectionText = '' }) => {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [linkData, setLinkData] = useState({ text: '', url: '' });
    const [imageData, setImageData] = useState({ url: '', alt: '' });
    const [videoData, setVideoData] = useState({ url: '' });
    const fileInputRef = useRef(null);

    const titleMap = {
        link: 'Insert Hyperlink',
        image: 'Insert Image',
        video: 'Insert Video'
    };

    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
            // Reset data and pre-fill text from selection for links
            setLinkData({ text: selectionText || '', url: '' });
            setImageData({ url: '', alt: '' });
            setVideoData({ url: '' });
        }
    }, [isOpen, initialTab, selectionText]);

    if (!isOpen) return null;

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImageData({ ...imageData, url: event.target.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (activeTab === 'link') {
            onSubmit('link', linkData);
        } else if (activeTab === 'image') {
            onSubmit('image', imageData);
        } else if (activeTab === 'video') {
            onSubmit('video', videoData);
        }
        onClose();
    };

    return (
        <div className="media-modal-overlay" onClick={onClose}>
            <div className="media-modal-content" onClick={e => e.stopPropagation()}>
                <div className="media-modal-header">
                    <h2 className="modal-title">{titleMap[activeTab]}</h2>
                    <button className="close-modal" onClick={onClose}>&times;</button>
                </div>

                <form className="media-modal-form" onSubmit={handleSubmit}>
                    {activeTab === 'link' && (
                        <div className="tab-content">
                            <div className="input-group">
                                <label>Display Text</label>
                                <input
                                    type="text"
                                    value={linkData.text}
                                    onChange={e => setLinkData({ ...linkData, text: e.target.value })}
                                    placeholder="Text to display"
                                    autoFocus
                                />
                            </div>
                            <div className="input-group">
                                <label>Link URL</label>
                                <input
                                    type="url"
                                    value={linkData.url}
                                    onChange={e => setLinkData({ ...linkData, url: e.target.value })}
                                    placeholder="https://example.com"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'image' && (
                        <div className="tab-content">
                            <div className="input-group">
                                <label>Image URL</label>
                                <input
                                    type="text"
                                    value={imageData.url}
                                    onChange={e => setImageData({ ...imageData, url: e.target.value })}
                                    placeholder="https://image-url.com/pic.png"
                                    autoFocus
                                />
                            </div>
                            <div className="divider"><span>OR</span></div>
                            <div className="input-group">
                                <button
                                    type="button"
                                    className="upload-btn"
                                    onClick={() => fileInputRef.current.click()}
                                >
                                    📁 Upload Image
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    accept="image/*"
                                    hidden
                                />
                                {imageData.url.startsWith('data:') && <p className="file-ready">✅ Image ready to insert</p>}
                            </div>
                            <div className="input-group">
                                <label>Alt Text (Optional)</label>
                                <input
                                    type="text"
                                    value={imageData.alt}
                                    onChange={e => setImageData({ ...imageData, alt: e.target.value })}
                                    placeholder="Description of the image"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'video' && (
                        <div className="tab-content">
                            <div className="input-group">
                                <label>Video URL (YouTube/Vimeo)</label>
                                <input
                                    type="url"
                                    value={videoData.url}
                                    onChange={e => setVideoData({ ...videoData, url: e.target.value })}
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    autoFocus
                                    required
                                />
                                <p className="hint">We'll automatically transform this into an embed.</p>
                            </div>
                        </div>
                    )}

                    <div className="media-modal-footer">
                        <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
                        <button type="submit" className="submit-btn highlight">Insert Media</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MediaModal;
