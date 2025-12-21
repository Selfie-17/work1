import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import Toolbar from '../components/Toolbar/Toolbar';
import RichEditor from '../components/RichEditor/RichEditor';
import FindReplace from '../components/FindReplace/FindReplace';
import TableContextToolbar from '../components/Toolbar/TableContextToolbar';
import TableEdgeControls from '../components/Toolbar/TableEdgeControls';
import API_BASE_URL from '../config';

import MediaModal from '../components/Toolbar/MediaModal';

const Editor = () => {
    const { id } = useParams();
    const richEditorRef = useRef(null);
    const [activeStates, setActiveStates] = useState({});
    const [docTitle, setDocTitle] = useState('Loading...');
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [stats, setStats] = useState({ chars: 0, words: 0 });
    const [mediaModal, setMediaModal] = useState({ isOpen: false, tab: 'link' });
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

    const updateActiveStates = useCallback(() => {
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

    // Remove global selection save for toolbar; use RichEditor ref methods instead

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
            <Toolbar
                activeStates={activeStates}
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
                stats={stats}
            />
            <MediaModal
                isOpen={mediaModal.isOpen}
                onClose={() => setMediaModal({ ...mediaModal, isOpen: false })}
                onSubmit={handleMediaSubmit}
                initialTab={mediaModal.tab}
                selectionText={selectionText}
            />
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
            <RichEditor
                ref={richEditorRef}
                onSelectionChange={updateActiveStates}
                onContentChange={handleContentChange}
                onBlur={handleBlur}
            />
        </div>
    );
};

export default Editor;
