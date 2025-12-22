import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import RichEditor from '../components/RichEditor/RichEditor';
import API_BASE_URL from '../config';
import './StudentView.css';

const StudentView = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [folders, setFolders] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [currentFolder, setCurrentFolder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [seenDocs, setSeenDocs] = useState(() => {
        const saved = localStorage.getItem('seenDocs');
        return saved ? JSON.parse(saved) : [];
    });
    const editorRef = useRef(null);

    // Fetch published content
    useEffect(() => {
        const fetchPublishedContent = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/published`);
                if (response.ok) {
                    const data = await response.json();
                    setFolders(data.folders || []);
                    setDocuments(data.documents || []);
                }
            } catch (err) {
                console.error('Failed to fetch published content:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPublishedContent();
    }, []);

    // Mark document as seen
    const markAsSeen = (docId) => {
        if (!seenDocs.includes(docId)) {
            const updated = [...seenDocs, docId];
            setSeenDocs(updated);
            localStorage.setItem('seenDocs', JSON.stringify(updated));
        }
    };

    // Handle folder selection
    const handleSelectFolder = async (folder) => {
        setLoading(true);
        setCurrentFolder(folder);
        setSelectedDoc(null);
        try {
            const response = await fetch(`${API_BASE_URL}/published/folder/${folder._id}`);
            if (response.ok) {
                const data = await response.json();
                setDocuments(data.documents || []);
                setFolders(data.folders || []);
            }
        } catch (err) {
            console.error('Failed to load folder:', err);
        } finally {
            setLoading(false);
        }
    };

    // Handle back to main
    const handleBackToMain = async () => {
        setCurrentFolder(null);
        setSelectedDoc(null);
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/published`);
            if (response.ok) {
                const data = await response.json();
                setFolders(data.folders || []);
                setDocuments(data.documents || []);
            }
        } catch (err) {
            console.error('Failed to fetch published content:', err);
        } finally {
            setLoading(false);
        }
    };

    // Handle document selection
    const handleSelectDoc = async (doc) => {
        setSelectedDoc(doc);
        markAsSeen(doc._id || doc.id);

        // Fetch document content
        try {
            const response = await fetch(`${API_BASE_URL}/documents/${doc._id || doc.id}`);
            if (response.ok) {
                const docData = await response.json();
                if (editorRef.current) {
                    editorRef.current.setHTML(docData.htmlContent || '');
                }
            }
        } catch (err) {
            console.error('Failed to load document:', err);
        }
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="student-view">
            {/* Header */}
            <header className="student-header">
                <button className="hamburger-btn" onClick={toggleSidebar} aria-label="Toggle sidebar">
                    <span className={`hamburger-icon ${sidebarOpen ? 'open' : ''}`}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </span>
                </button>
                <h1 className="student-title">📚 Student View</h1>
                <button className="back-btn" onClick={() => navigate('/login')}>
                    Exit
                </button>
            </header>

            <div className="student-content">
                {/* Sidebar */}
                <aside className={`student-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                    <div className="sidebar-header">
                        <h2>{currentFolder ? currentFolder.name : 'Materials'}</h2>
                        {currentFolder && (
                            <button className="back-to-main" onClick={handleBackToMain}>
                                ← Back
                            </button>
                        )}
                    </div>
                    <div className="file-list">
                        {loading ? (
                            <div className="loading-state">Loading...</div>
                        ) : (documents.length === 0 && folders.length === 0) ? (
                            <div className="empty-state">
                                <p>No content published yet.</p>
                                <p className="hint">Ask your teacher to publish content.</p>
                            </div>
                        ) : (
                            <>
                                {/* Folders */}
                                {folders.map((folder) => (
                                    <button
                                        key={folder._id}
                                        className="file-item folder"
                                        onClick={() => handleSelectFolder(folder)}
                                    >
                                        <span className="file-icon">📁</span>
                                        <span className="file-name">{folder.name}</span>
                                        <span className="folder-arrow">→</span>
                                    </button>
                                ))}

                                {/* Documents */}
                                {documents.map((doc) => (
                                    <button
                                        key={doc._id || doc.id}
                                        className={`file-item ${selectedDoc?._id === doc._id ? 'active' : ''} ${seenDocs.includes(doc._id || doc.id) ? 'seen' : ''}`}
                                        onClick={() => handleSelectDoc(doc)}
                                    >
                                        <span className="file-icon">📄</span>
                                        <span className="file-name">{doc.title || 'Untitled'}</span>
                                        {seenDocs.includes(doc._id || doc.id) && (
                                            <span className="seen-badge" title="Already viewed">✓</span>
                                        )}
                                    </button>
                                ))}
                            </>
                        )}
                    </div>
                </aside>

                {/* Main Content */}
                <main className={`student-main ${sidebarOpen ? '' : 'full-width'}`}>
                    {selectedDoc ? (
                        <div className="document-preview">
                            <div className="doc-header">
                                <h2>{selectedDoc.title || 'Untitled Document'}</h2>
                            </div>
                            <div className="doc-content">
                                <RichEditor
                                    ref={editorRef}
                                    readOnly={true}
                                    onContentChange={() => { }}
                                    onSelectionChange={() => { }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="no-selection">
                            <div className="placeholder-icon">📖</div>
                            <h2>Select a document to view</h2>
                            <p>Choose a document from the sidebar to start reading.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default StudentView;

