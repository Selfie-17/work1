import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import Toolbar from '../components/Toolbar/Toolbar';
import RichEditor from '../components/RichEditor/RichEditor';
import FindReplace from '../components/FindReplace/FindReplace';
import TableContextToolbar from '../components/Toolbar/TableContextToolbar';
import TableEdgeControls from '../components/Toolbar/TableEdgeControls';
import API_BASE_URL from '../config';
import Sidebar from '../components/Sidebar/Sidebar';

import MediaModal from '../components/Toolbar/MediaModal';
import EquationModal from '../components/Toolbar/EquationModal';

const Editor = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const folderId = searchParams.get('folder');

    // Ref to track the current active ID to prevent race conditions
    const activeIdRef = useRef(id);

    useEffect(() => {
        activeIdRef.current = id;
    }, [id]);

    const richEditorRef = useRef(null);
    const [activeStates, setActiveStates] = useState({});
    const [docTitle, setDocTitle] = useState('Loading...');
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [stats, setStats] = useState({ chars: 0, words: 0 });
    const [mediaModal, setMediaModal] = useState({ isOpen: false, tab: 'link' });
    const [equationModal, setEquationModal] = useState({ isOpen: false, latex: '', element: null, isDisplay: true });
    const [selectionText, setSelectionText] = useState('');
    const savedSelection = useRef(null);
    const saveTimeoutRef = useRef(null);

    const restoreSelection = () => {
        const sel = window.getSelection();
        if (savedSelection.current) {
            sel.removeAllRanges();
            sel.addRange(savedSelection.current);
        }
    };

    const handleMediaSubmit = useCallback((type, data) => {
        if (!richEditorRef.current) return;
        if (type === 'link') {
            restoreSelection();
            richEditorRef.current.insertLink(data.text, data.url);
        } else if (type === 'image') {
            restoreSelection();
            richEditorRef.current.insertImage(data.url, data.alt);
        } else if (type === 'video') {
            restoreSelection();
            richEditorRef.current.insertVideo(data.url);
        }
    }, []);

    const handleEquationSubmit = useCallback((latex) => {
        if (!richEditorRef.current) return;
        if (equationModal.element) {
            richEditorRef.current.updateEquation(latex, equationModal.isDisplay, equationModal.element);
        } else {
            richEditorRef.current.insertEquation(latex);
        }
        setEquationModal({ isOpen: false, latex: '', element: null, isDisplay: true });
    }, [equationModal]);

    // Fetch document on load
    useEffect(() => {
        const fetchDoc = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/docs/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setDocTitle(data.title);
                    if (richEditorRef.current) {
                        richEditorRef.current.setHTML(data.htmlPreview);
                    }
                }
            } catch (err) {
                console.error('Failed to load document');
            } finally {
                setLoading(false);
            }
        };
        fetchDoc();
    }, [id]);


    const [tableInfo, setTableInfo] = useState(null);

    const updateActiveStates = useCallback((type, data) => {
        if (type === 'edit-math') {
            setEquationModal({ isOpen: true, latex: data.latex, element: data.element, isDisplay: data.isDisplay });
            return;
        }

        if (!richEditorRef.current) return;
        const editor = richEditorRef.current.getElement();
        const text = editor.innerText || "";
        setStats({
            chars: text.length,
            words: text.trim() === "" ? 0 : text.trim().split(/\s+/).length
        });

        const states = {
            bold: document.queryCommandState('bold'),
            italic: document.queryCommandState('italic'),
            underline: document.queryCommandState('underline'),
            strike: document.queryCommandState('strikethrough'),
            super: document.queryCommandState('superscript'),
            sub: document.queryCommandState('subscript'),
            unorderedList: document.queryCommandState('insertUnorderedList'),
            orderedList: document.queryCommandState('insertOrderedList'),
            justifyLeft: document.queryCommandState('justifyLeft'),
            justifyCenter: document.queryCommandState('justifyCenter'),
            justifyRight: document.queryCommandState('justifyRight'),
            justifyFull: document.queryCommandState('justifyFull'),
            code: !!document.queryCommandValue('formatBlock')?.match(/code/i) || !!window.getSelection().anchorNode?.parentElement?.closest('code'),
            link: !!window.getSelection().anchorNode?.parentElement?.closest('a'),
        };
        setActiveStates(states);
        setTableInfo(richEditorRef.current.getTableInfo());
    }, []);

    const handleShare = useCallback(() => {
        const url = window.location.href;
        if (navigator.share) {
            navigator.share({
                title: docTitle,
                url: url
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(url);
            alert('Link copied to clipboard!');
        }
    }, [docTitle]);

    const handlePrint = useCallback(() => {
        window.print();
    }, []);

    const handleExport = useCallback(() => {
        if (!richEditorRef.current) return;
        const html = richEditorRef.current.getHTML();
        // Simple client-side Markdown "conversion" or just HTML for now
        // To be real Markdown, we'd need Turndown. Applying a simple Blob for .md
        const blob = new Blob([html], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${docTitle || 'document'}.md`;
        a.click();
        URL.revokeObjectURL(url);
    }, [docTitle]);

    const handleSearch = useCallback(() => {
        const query = prompt("Find in document:");
        if (query) {
            // Use browser native find
            window.find(query);
        }
    }, []);

    const handleTransformCase = useCallback((mode) => {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        const range = selection.getRangeAt(0);
        const content = range.toString();
        if (!content) return;
        const transformed = mode === 'upper' ? content.toUpperCase() : content.toLowerCase();
        document.execCommand('insertText', false, transformed);
    }, []);

    const handleInsertDate = useCallback(() => {
        const date = new Date().toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        document.execCommand('insertText', false, date);
    }, []);

    const handleSave = useCallback(async (forcedTitle = null, forcedContent = null) => {
        if (!richEditorRef.current) return;

        const titleToSave = forcedTitle !== null ? forcedTitle : docTitle;
        const htmlToSave = forcedContent !== null ? forcedContent : richEditorRef.current.getHTML();

        setIsSaving(true);
        try {
            const response = await fetch(`${API_BASE_URL}/docs/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: titleToSave,
                    htmlContent: htmlToSave
                })
            });

            if (response.ok) {
                const data = await response.json();

                // Prevent race condition: If we navigated away, don't update state
                if (activeIdRef.current !== id) return;

                // Update title (in case it was auto-suffixed)
                setDocTitle(data.title);

                // Rule 1: Frontend owns the cursor. 
                // Only update HTML if not focused or if it's a forced external update.
                const isFocused = document.activeElement === richEditorRef.current.getElement();
                if (!isFocused && richEditorRef.current) {
                    richEditorRef.current.setHTML(data.htmlPreview);
                }
                console.log('Document synced');
            }
        } catch (err) {
            console.error('Failed to sync document');
        } finally {
            setIsSaving(false);
        }
    }, [id, docTitle]);

    const handleContentChange = useCallback((newHtml) => {
        // Debounced autosave
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
            handleSave(null, newHtml);
        }, 1000);
    }, [handleSave]);

    const handleBlur = useCallback(() => {
        // Sync on blur immediately
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        handleSave();
    }, [handleSave]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        };
    }, []);

    // Sidebar File Open Handler
    const handleFileOpen = useCallback((file) => {
        // 1. Auto-save current document before switching
        if (id) {
            handleSave();
        }

        // 2. Navigate to new doc, PRESERVING folder context
        // In real app use file.id. For mock, we use mock IDs.
        // We probably need to map mock ID to real ID or just use mock ID in URL for demo.
        navigate(`/editor/${file.id}?folder=${folderId || ''}`);

    }, [handleSave, id, folderId, navigate]);

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="editor-page">
            <Navbar
                docTitle={docTitle}
                onTitleChange={(newTitle) => {
                    setDocTitle(newTitle);
                    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
                    saveTimeoutRef.current = setTimeout(() => handleSave(newTitle), 1000);
                }}
                isSaving={isSaving}
            />

            <div className="editor-main-layout" style={{ display: 'flex', height: 'calc(100vh - 60px)' }}>
                {/* Sidebar Logic */}
                {folderId ? (
                    isSidebarOpen ? (
                        <Sidebar
                            activeFileId={id}
                            rootFolderId={folderId}
                            onFileOpen={handleFileOpen}
                            onClose={() => setIsSidebarOpen(false)}
                        />
                    ) : (
                        <div
                            style={{
                                width: '24px',
                                borderRight: '1px solid #e5e7eb',
                                backgroundColor: '#f9fafb',
                                display: 'flex',
                                alignItems: 'start',
                                paddingTop: '12px',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: '#9ca3af'
                            }}
                            onClick={() => setIsSidebarOpen(true)}
                            title="Expand Sidebar"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="3" y1="12" x2="21" y2="12"></line>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <line x1="3" y1="18" x2="21" y2="18"></line>
                            </svg>
                        </div>
                    )
                ) : null}

                <div className="editor-content-area" style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    {!id ? (
                        <div className="empty-editor-state" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
                                <h3>No Document Selected</h3>
                                <p>Select a file from the sidebar to start editing.</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <Toolbar
                                activeStates={activeStates}
                                // ... props
                                onCommand={(cmd, val) => {
                                    if (cmd === 'insertTable' || cmd === 'insertHTML') {
                                        richEditorRef.current?.applyCommandWithRestore(cmd, val, richEditorRef.current?.restoreSelection);
                                    } else {
                                        richEditorRef.current?.executeCommand(cmd, val);
                                    }
                                }}
                                onTableAction={(action) => richEditorRef.current?.executeTableAction(action)}
                                onSave={() => handleSave()}
                                onShare={handleShare}
                                onPrint={handlePrint}
                                onExport={handleExport}
                                onSearch={() => setIsSearchOpen(!isSearchOpen)}
                                onMediaTrigger={(tab) => {
                                    // Save selection before opening modal using RichEditor ref
                                    richEditorRef.current?.saveSelection();
                                    const sel = window.getSelection();
                                    setSelectionText(sel.toString());
                                    setMediaModal({ isOpen: true, tab });
                                }}
                                onTransformCase={handleTransformCase}
                                onInsertDate={handleInsertDate}
                                onEquationTrigger={() => {
                                    richEditorRef.current?.saveSelection();
                                    setEquationModal({ isOpen: true, latex: '', element: null, isDisplay: true });
                                }}
                                stats={stats}
                            />
                            {/* ... Modals ... */}
                            {mediaModal.isOpen && (
                                <MediaModal
                                    isOpen={mediaModal.isOpen}
                                    onClose={() => setMediaModal({ ...mediaModal, isOpen: false })}
                                    onSubmit={handleMediaSubmit}
                                    initialTab={mediaModal.tab}
                                    selectionText={selectionText}
                                />
                            )}
                            {equationModal.isOpen && (
                                <EquationModal
                                    isOpen={equationModal.isOpen}
                                    initialLatex={equationModal.latex}
                                    onCancel={() => setEquationModal({ isOpen: false, latex: '', element: null, isDisplay: true })}
                                    onInsert={handleEquationSubmit}
                                />
                            )}
                            <FindReplace
                                isOpen={isSearchOpen}
                                onClose={() => setIsSearchOpen(false)}
                                editorRef={richEditorRef}
                            />
                            {tableInfo && !isPreviewMode && (
                                <TableContextToolbar
                                    info={tableInfo}
                                    onAction={(action, val) => richEditorRef.current?.executeTableAction(action, val, tableInfo?.table, tableInfo?.rowIndex ?? -1, tableInfo?.colIndex ?? -1)}
                                />
                            )}
                            <TableEdgeControls editorRef={richEditorRef} />

                            <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
                                <RichEditor
                                    ref={richEditorRef}
                                    onSelectionChange={updateActiveStates}
                                    onContentChange={handleContentChange}
                                    onBlur={handleBlur}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Editor;
