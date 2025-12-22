import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import Navbar from '../components/Navbar/Navbar';
import Button from '../components/Button/Button';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import API_BASE_URL from '../config';

const Dashboard = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const folderIdParam = searchParams.get('folderId') || 'root';

    const [documents, setDocuments] = useState([]);
    const [folders, setFolders] = useState([]);
    const [currentFolder, setCurrentFolder] = useState(null); // Full folder object for breadcrumbs
    const [folderPath, setFolderPath] = useState([]); // Array of folder objects

    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user'));

    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

    // Search State
    const [searchQuery, setSearchQuery] = useState('');

    const [githubUrl, setGithubUrl] = useState('');
    const [importLoading, setImportLoading] = useState(false);

    useEffect(() => {
        if (user?.id) {
            fetchFolders(folderIdParam);
            fetchDocuments(folderIdParam);
            fetchCurrentPath(folderIdParam);
        }
    }, [folderIdParam, user?.id]);

    const fetchCurrentPath = async (id) => {
        if (id === 'root') {
            setCurrentFolder(null);
            setFolderPath([]);
            return;
        }
        try {
            // Need a route to get full path or just the folder itself
            const response = await fetch(`${API_BASE_URL}/folders/${id}`);
            if (response.ok) {
                const folder = await response.json();
                setCurrentFolder(folder);
                // For now, let's keep it simple: just show the current folder in breadcrumbs
                // If we want full breadcrumbs, we'd need the backend to return the parents array
                setFolderPath([folder]);
            }
        } catch (err) {
            console.error('Failed to fetch path');
        }
    };

    const fetchFolders = async (parentId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/folders?authorId=${user.id}&parentId=${parentId}`);
            if (response.ok) {
                const data = await response.json();
                setFolders(data);
            }
        } catch (err) {
            console.error('Failed to fetch folders');
        }
    };

    const fetchDocuments = async (folderId) => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/docs?authorId=${user.id}&folderId=${folderId}`);
            if (response.ok) {
                const data = await response.json();
                setDocuments(data);
            }
        } catch (err) {
            console.error('Failed to fetch documents');
        } finally {
            setLoading(false);
        }
    };

    const handleNavigate = (folder) => {
        if (!folder) {
            setSearchParams({});
        } else {
            setSearchParams({ folderId: folder._id });
        }
    };

    const handleCreateNew = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/docs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: 'Untitled Document',
                    markdown: '# Untitled Document\nStart writing...',
                    authorId: user?.id,
                    folderId: currentFolder?._id
                })
            });

            if (response.ok) {
                const newDoc = await response.json();
                navigate(`/editor/${newDoc._id}`);
            }
        } catch (err) {
            console.error('Failed to create document');
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this document?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/docs/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                setDocuments(prevDocs => prevDocs.filter(doc => doc._id !== id));
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message || 'Failed to delete'}`);
            }
        } catch (err) {
            console.error('Failed to delete document', err);
            alert('Connection error. Is the server running?');
        }
    };

    const handleDeleteFolder = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm('Delete this folder? Documents will be moved to root.')) return;
        try {
            const response = await fetch(`${API_BASE_URL}/folders/${id}`, { method: 'DELETE' });
            if (response.ok) {
                setFolders(prev => prev.filter(f => f._id !== id));
                if (currentFolder?._id === id) handleNavigate(null);
            }
        } catch (err) {
            console.error('Failed to delete folder');
        }
    };

    const handleCreateFolder = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/folders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newFolderName,
                    authorId: user.id,
                    parentId: currentFolder?._id || null
                })
            });
            if (response.ok) {
                setNewFolderName('');
                setIsFolderModalOpen(false);
                fetchFolders(folderIdParam);
            }
        } catch (err) {
            console.error('Failed to create folder');
        }
    };
    const handleImport = async (e) => {
        e.preventDefault();
        setImportLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/docs/import`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    githubUrl,
                    authorId: user?.id
                })
            });

            if (response.ok) {
                const data = await response.json();
                setIsImportModalOpen(false);
                setGithubUrl('');
                alert(data.message || 'Import completed!');
                fetchFolders(folderIdParam);
                fetchDocuments(folderIdParam);
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to import');
            }
        } catch (err) {
            console.error('Failed to import from GitHub');
            alert('Failed to connect to server');
        } finally {
            setImportLoading(false);
        }
    };

    const handlePublish = async (id, e) => {
        e.stopPropagation();
        try {
            const response = await fetch(`${API_BASE_URL}/docs/${id}/publish`, {
                method: 'PATCH'
            });
            if (response.ok) {
                const data = await response.json();
                setDocuments(prevDocs =>
                    prevDocs.map(doc =>
                        doc._id === id ? { ...doc, isPublished: data.isPublished } : doc
                    )
                );
            }
        } catch (err) {
            console.error('Failed to toggle publish:', err);
        }
    };

    const handlePublishFolder = async (id, e) => {
        e.stopPropagation();
        try {
            const response = await fetch(`${API_BASE_URL}/folders/${id}/publish`, {
                method: 'PATCH'
            });
            if (response.ok) {
                const data = await response.json();
                setFolders(prevFolders =>
                    prevFolders.map(folder =>
                        folder._id === id ? { ...folder, isPublished: data.isPublished } : folder
                    )
                );
                // Refresh documents to reflect changes
                fetchDocuments(folderIdParam);
                alert(data.message + ` (${data.documentsUpdated} documents updated)`);
            }
        } catch (err) {
            console.error('Failed to toggle folder publish:', err);
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const filteredFolders = folders.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const filteredDocs = documents.filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="dashboard-page">
            <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

            <main className="dashboard-content">
                <header className="dashboard-header">
                    <div className="header-text">
                        <h1>My Documents</h1>
                        <p>Welcome back, {user?.name || 'User'}! Manage and edit your lessons.</p>
                    </div>
                    <div className="header-actions">
                        <Button variant="outline" onClick={() => setIsFolderModalOpen(true)}>
                            <span className="btn-icon">📁</span> New Folder
                        </Button>
                        <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
                            <span className="btn-icon">🔗</span> Import
                        </Button>
                        <Button variant="primary" onClick={handleCreateNew}>
                            <span className="btn-icon">+</span> New Document
                        </Button>
                    </div>
                </header>

                <div className="dashboard-navigation">
                    <button
                        className={`nav-crumb ${!currentFolder ? 'active' : ''}`}
                        onClick={() => handleNavigate(null)}
                    >
                        My Documents
                    </button>
                    {folderPath.map((folder, idx) => (
                        <React.Fragment key={folder._id}>
                            <span className="nav-separator">/</span>
                            <button
                                className={`nav-crumb ${idx === folderPath.length - 1 ? 'active' : ''}`}
                                onClick={() => handleNavigate(folder)}
                            >
                                {folder.name}
                            </button>
                        </React.Fragment>
                    ))}
                </div>

                {loading ? (
                    <div className="loading-state">Loading...</div>
                ) : (filteredDocs.length === 0 && filteredFolders.length === 0) ? (
                    <div className="empty-state">
                        <div className="empty-icon">{searchQuery ? '🔍' : '📂'}</div>
                        <h3>{searchQuery ? 'No results found' : 'No items here'}</h3>
                        <p>{searchQuery ? `No matches for "${searchQuery}"` : 'Create a file or folder to get started.'}</p>
                    </div>
                ) : (
                    <div className="document-grid">
                        {/* Folders */}
                        {filteredFolders.map((folder) => (
                            <div
                                key={folder._id}
                                className={`doc-card folder-card ${folder.isPublished ? 'published' : ''}`}
                                onClick={() => navigate(`/editor?folder=${folder._id}`)}
                            >
                                <div className="doc-card-header">
                                    <div className="doc-icon">📁</div>
                                    {folder.isPublished && <span className="published-badge" title="Published to students">📢</span>}
                                    <button
                                        className="doc-close"
                                        onClick={(e) => handleDeleteFolder(folder._id, e)}
                                    >
                                        ×
                                    </button>
                                </div>
                                <h3 className="doc-title">{folder.name}</h3>
                                <p className="doc-meta">Folder</p>
                                <div className="doc-footer">
                                    <button
                                        className={`publish-btn ${folder.isPublished ? 'unpublish' : ''}`}
                                        onClick={(e) => handlePublishFolder(folder._id, e)}
                                        title={folder.isPublished ? 'Unpublish folder' : 'Publish folder & all docs'}
                                    >
                                        {folder.isPublished ? '🔒 Unpublish' : '📢 Publish All'}
                                    </button>
                                    <span className="doc-action">Open →</span>
                                </div>
                            </div>
                        ))}

                        {/* Documents */}
                        {filteredDocs.map((doc) => (
                            <div
                                key={doc._id}
                                className={`doc-card ${doc.isPublished ? 'published' : ''}`}
                                onClick={() => navigate(`/editor/${doc._id}`)}
                            >
                                <div className="doc-card-header">
                                    <div className="doc-icon">📄</div>
                                    {doc.isPublished && <span className="published-badge" title="Published to students">📢</span>}
                                    <button
                                        className="doc-close"
                                        title="Delete"
                                        onClick={(e) => handleDelete(doc._id, e)}
                                    >
                                        ×
                                    </button>
                                </div>
                                <h3 className="doc-title">{doc.title}</h3>
                                <p className="doc-meta">Edited {formatDate(doc.updatedAt)}</p>

                                <div className="doc-footer">
                                    <button
                                        className={`publish-btn ${doc.isPublished ? 'unpublish' : ''}`}
                                        onClick={(e) => handlePublish(doc._id, e)}
                                        title={doc.isPublished ? 'Unpublish from students' : 'Publish to students'}
                                    >
                                        {doc.isPublished ? '🔒 Unpublish' : '📢 Publish'}
                                    </button>
                                    <span className="doc-action">Open →</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {isImportModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Import Markdown from GitHub</h2>
                        <p>Paste the public GitHub file URL (e.g., https://github.com/user/repo/blob/main/README.md)</p>
                        <form onSubmit={handleImport}>
                            <input
                                type="url"
                                placeholder="https://github.com/..."
                                value={githubUrl}
                                onChange={(e) => setGithubUrl(e.target.value)}
                                required
                                className="modal-input"
                                autoFocus
                            />
                            <div className="modal-actions">
                                <Button type="button" variant="outline" onClick={() => setIsImportModalOpen(false)}>Cancel</Button>
                                <Button type="submit" variant="primary" disabled={importLoading}>
                                    {importLoading ? 'Importing...' : 'Import Now'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isFolderModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Create New Folder</h2>
                        <form onSubmit={handleCreateFolder}>
                            <input
                                type="text"
                                placeholder="Folder Name"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                required
                                className="modal-input"
                                autoFocus
                            />
                            <div className="modal-actions">
                                <Button type="button" variant="outline" onClick={() => setIsFolderModalOpen(false)}>Cancel</Button>
                                <Button type="submit" variant="primary">Create Folder</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <button className="fab-new" onClick={handleCreateNew} title="New Document">+</button>
        </div>
    );
};

export default Dashboard;
