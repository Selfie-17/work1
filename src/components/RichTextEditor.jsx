import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import './RichTextEditor.css';

const RichTextEditor = forwardRef(({ initialContent = '', onChange }, ref) => {
    const containerRef = useRef(null);
    const editorInstanceRef = useRef(null);
    const initAttempted = useRef(false);

    useImperativeHandle(ref, () => ({
        getHTMLCode: () => {
            return editorInstanceRef.current?.getHTMLCode() || '';
        },
        setHTMLCode: (html) => {
            editorInstanceRef.current?.setHTMLCode(html);
        },
        getText: () => {
            return editorInstanceRef.current?.getText() || '';
        },
        focus: () => {
            editorInstanceRef.current?.focus();
        }
    }));

    useEffect(() => {
        if (initAttempted.current) return;

        let checkInterval;
        let isMounted = true;

        const initEditor = () => {
            if (!isMounted || !containerRef.current || editorInstanceRef.current) return;

            if (window.RichTextEditor) {
                try {
                    initAttempted.current = true;

                    // Initialize the editor
                    editorInstanceRef.current = new window.RichTextEditor(containerRef.current);

                    // Set initial content
                    if (initialContent) {
                        editorInstanceRef.current.setHTMLCode(initialContent);
                    } else {
                        editorInstanceRef.current.setHTMLCode('<p>Start writing here...</p>');
                    }

                    // Set up change handler
                    if (onChange) {
                        editorInstanceRef.current.attachEvent('change', () => {
                            if (isMounted) {
                                onChange(editorInstanceRef.current.getHTMLCode());
                            }
                        });
                    }
                } catch (error) {
                    console.error('Failed to initialize RichTextEditor:', error);
                }
            }
        };

        // Wait for scripts to load
        const timeout = setTimeout(() => {
            if (window.RichTextEditor) {
                initEditor();
            } else {
                checkInterval = setInterval(() => {
                    if (window.RichTextEditor) {
                        clearInterval(checkInterval);
                        initEditor();
                    }
                }, 200);
            }
        }, 100);

        return () => {
            isMounted = false;
            clearTimeout(timeout);
            if (checkInterval) clearInterval(checkInterval);
        };
    }, []);

    return (
        <div className="editor-wrapper">
            <div className="editor-container">
                <div ref={containerRef} className="rte-container" />
            </div>
        </div>
    );
});

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;
