import React, { useState, useEffect } from 'react';
import './Sidebar.css';
import API_BASE_URL from '../../config';

// Removed Mock Data

// Helper to find parent of a node to remove it from tree
const findParent = (nodes, childId) => {
    for (const node of nodes) {
        if (node.children && node.children.some(c => c._id === childId)) {
            return node;
        }
        if (node.children) {
            const found = findParent(node.children, childId);
            if (found) return found;
        }
    }
    return null;
};

const SidebarItem = ({
    item, level, activeFileId, onSelect, onOpen,
    expandedFolders, toggleFolder,
    activeMenuId, onToggleMenu, onDeleteFolder
}) => {
    const isFolder = item.type === 'folder';
    const isExpanded = expandedFolders.has(item._id);
    const isActive = item._id === activeFileId;
    const isMenuOpen = activeMenuId === item._id;

    const handleClick = (e) => {
        e.stopPropagation();
        if (isFolder) {
            toggleFolder(item._id);
        } else {
            onSelect(item._id);
            onOpen({ id: item._id, name: item.title });
        }
    };

    const handleDoubleClick = (e) => {
        e.stopPropagation();
        if (!isFolder) {
            onOpen({ id: item._id, name: item.title });
        }
    };

    const handleMenuClick = (e) => {
        e.stopPropagation();
        onToggleMenu(item._id);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        onDeleteFolder(item._id);
        onToggleMenu(null); // Close menu
    };

    return (
        <>
            <div
                className={`sidebar-item ${isActive ? 'active' : ''} ${isFolder ? 'folder' : 'file'}`}
                style={{ paddingLeft: `${level * 12 + 12}px` }}
                onClick={handleClick}
                onDoubleClick={handleDoubleClick}
                title={item.name || item.title}
            >
                {isFolder && (
                    <span className={`arrow ${isExpanded ? 'expanded' : ''}`}>▶</span>
                )}
                <span className="icon">{isFolder ? '📁' : '📄'}</span>
                <span className="label" style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.name || item.title}
                </span>

                {isFolder && (
                    <div className="sidebar-menu-container">
                        <div
                            className={`sidebar-menu-trigger ${isMenuOpen ? 'active' : ''}`}
                            onClick={handleMenuClick}
                        >
                            ⋮
                        </div>
                        {isMenuOpen && (
                            <div className="sidebar-dropdown">
                                <div className="sidebar-dropdown-item delete" onClick={handleDelete}>
                                    🗑 Delete
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {isFolder && isExpanded && item.children && (
                <div className="sidebar-children">
                    {item.children.map(child => (
                        <SidebarItem
                            key={child._id}
                            item={child}
                            level={level + 1}
                            activeFileId={activeFileId}
                            onSelect={onSelect}
                            onOpen={onOpen}
                            expandedFolders={expandedFolders}
                            toggleFolder={toggleFolder}
                            activeMenuId={activeMenuId}
                            onToggleMenu={onToggleMenu}
                            onDeleteFolder={onDeleteFolder}
                        />
                    ))}
                </div>
            )}
        </>
    );
};

const Sidebar = ({ activeFileId, onFileOpen, rootFolderId, onClose }) => {
    const [expandedFolders, setExpandedFolders] = useState(new Set());
    const [selectedFileId, setSelectedFileId] = useState(activeFileId);

    const [folderContext, setFolderContext] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeMenuId, setActiveMenuId] = useState(null); // Menu state

    const user = JSON.parse(localStorage.getItem('user'));

    if (!rootFolderId) return null;

    // Close menu when clicking elsewhere
    useEffect(() => {
        const closeMenu = () => setActiveMenuId(null);
        document.addEventListener('click', closeMenu);
        return () => document.removeEventListener('click', closeMenu);
    }, []);

    useEffect(() => {
        if (rootFolderId) {
            fetchFolderContents(rootFolderId);
        }
    }, [rootFolderId]);

    const fetchFolderContents = async (folderId) => {
        setLoading(true);
        try {
            const foldersRes = await fetch(`${API_BASE_URL}/folders?authorId=${user?.id}&parentId=${folderId}`);
            const docsRes = await fetch(`${API_BASE_URL}/docs?authorId=${user?.id}&folderId=${folderId}`);
            if (foldersRes.ok && docsRes.ok) {
                const folders = await foldersRes.json();
                const docs = await docsRes.json();
                const formattedFolders = folders
                    .map(f => ({ ...f, type: 'folder', children: [] }))
                    .sort((a, b) => a.name.localeCompare(b.name));
                const formattedDocs = docs
                    .map(d => ({ ...d, type: 'file' }))
                    .sort((a, b) => a.title.localeCompare(b.title));
                setFolderContext([...formattedFolders, ...formattedDocs]);
            }
        } catch (err) {
            console.error("Failed to fetch sidebar content", err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleFolder = async (folderId) => {
        const isExpanding = !expandedFolders.has(folderId);
        setExpandedFolders(prev => {
            const next = new Set(prev);
            if (next.has(folderId)) next.delete(folderId);
            else next.add(folderId);
            return next;
        });
        if (isExpanding) {
            const target = findNodeInTree(folderContext, folderId);
            if (target && (!target.children || target.children.length === 0)) {
                try {
                    const foldersRes = await fetch(`${API_BASE_URL}/folders?authorId=${user?.id}&parentId=${folderId}`);
                    const docsRes = await fetch(`${API_BASE_URL}/docs?authorId=${user?.id}&folderId=${folderId}`);
                    const folders = await foldersRes.json();
                    const docs = await docsRes.json();
                    const newChildren = [
                        ...folders.map(f => ({ ...f, type: 'folder', children: [] })).sort((a, b) => a.name.localeCompare(b.name)),
                        ...docs.map(d => ({ ...d, type: 'file' })).sort((a, b) => a.title.localeCompare(b.title))
                    ];
                    setFolderContext(prev => insertChildren(prev, folderId, newChildren));
                } catch (err) { console.error(err); }
            }
        }
    };

    const findNodeInTree = (nodes, id) => {
        for (const node of nodes) {
            if (node._id === id) return node;
            if (node.children) {
                const found = findNodeInTree(node.children, id);
                if (found) return found;
            }
        }
        return null;
    };

    const insertChildren = (nodes, parentId, children) => {
        return nodes.map(node => {
            if (node._id === parentId) {
                return { ...node, children };
            }
            if (node.children) {
                return { ...node, children: insertChildren(node.children, parentId, children) };
            }
            return node;
        });
    };

    const handleDeleteFolder = async (folderId) => {
        if (!window.confirm("Are you sure you want to delete this folder and all its contents?")) return;

        try {
            const res = await fetch(`${API_BASE_URL}/folders/${folderId}`, { method: 'DELETE' });
            if (res.ok) {
                // Remove from tree locally to avoid full refetch
                setFolderContext(prev => {
                    const removeFromNodes = (nodes) => {
                        return nodes.filter(node => {
                            if (node._id === folderId) return false;
                            if (node.children) {
                                node.children = removeFromNodes(node.children);
                            }
                            return true;
                        });
                    };
                    return removeFromNodes(prev);
                });
            }
        } catch (err) {
            console.error("Failed to delete folder", err);
            alert("Failed to delete folder");
        }
    };

    const handleSelect = (fileId) => {
        setSelectedFileId(fileId);
    };

    const handleOpen = (file) => {
        if (onFileOpen) {
            onFileOpen(file);
        }
    };

    return (
        <div className="sidebar-container">
            <div className="sidebar-header">
                <span>Folder View</span>
                <div className="sidebar-close-btn" onClick={onClose} title="Collapse Sidebar">
                    «
                </div>
            </div>
            <div className="sidebar-tree">
                {loading && <div style={{ padding: '10px', color: '#888' }}>Loading...</div>}
                {!loading && folderContext.map(item => (
                    <SidebarItem
                        key={item._id}
                        item={item}
                        level={0}
                        activeFileId={selectedFileId}
                        onSelect={handleSelect}
                        onOpen={handleOpen}
                        expandedFolders={expandedFolders}
                        toggleFolder={handleToggleFolder}

                        activeMenuId={activeMenuId}
                        onToggleMenu={setActiveMenuId}
                        onDeleteFolder={handleDeleteFolder}
                    />
                ))}
                {!loading && folderContext.length === 0 && (
                    <div style={{ padding: '12px', color: '#999', fontStyle: 'italic' }}>Empty folder</div>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
