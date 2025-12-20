import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import DocumentHeader from '../components/DocumentHeader/DocumentHeader';
import EditorToolbar from '../components/EditorToolbar/EditorToolbar';
import RichEditor from '../components/RichEditor/RichEditor';
import API_BASE_URL from '../config';

const Editor = () => {
    const { id } = useParams();
    const richEditorRef = useRef(null);
    const [activeStates, setActiveStates] = useState({});
    const [docTitle, setDocTitle] = useState('Loading...');
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const saveTimeoutRef = useRef(null);

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

    const handleCommand = useCallback((command, value) => {
        if (richEditorRef.current) {
            richEditorRef.current.executeCommand(command, value);
        }
    }, []);

    const updateActiveStates = useCallback(() => {
        const states = {
            bold: document.queryCommandState('bold'),
            italic: document.queryCommandState('italic'),
            underline: document.queryCommandState('underline'),
            insertUnorderedList: document.queryCommandState('insertUnorderedList'),
            insertOrderedList: document.queryCommandState('insertOrderedList'),
            code: !!document.queryCommandValue('formatBlock')?.match(/code/i) || !!window.getSelection().anchorNode?.parentElement?.closest('code'),
            link: !!window.getSelection().anchorNode?.parentElement?.closest('a'),
        };
        setActiveStates(states);
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

    return (
        <div className="editor-page">
            <Navbar />
            <DocumentHeader
                title={docTitle}
                onTitleChange={(newTitle) => {
                    setDocTitle(newTitle);
                    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
                    saveTimeoutRef.current = setTimeout(() => handleSave(newTitle), 1000);
                }}
                onSave={() => handleSave()}
                isSaving={isSaving}
            />
            <EditorToolbar onCommand={handleCommand} activeStates={activeStates} />
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
