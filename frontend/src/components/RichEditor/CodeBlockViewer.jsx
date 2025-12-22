import React, { useEffect, useState } from 'react';
import Editor, { loader } from '@monaco-editor/react';

// Configure monaco loader path if needed, or rely on CDN
// loader.config({ paths: { vs: '...' } });

const CodeBlockViewer = ({ code, language }) => {
    const [editorHeight, setEditorHeight] = useState(100);

    // Normalize language
    const getLanguage = (lang) => {
        if (!lang) return 'plaintext';
        const lower = lang.toLowerCase();
        if (lower === 'js' || lower === 'jsx') return 'javascript';
        if (lower === 'ts' || lower === 'tsx') return 'typescript';
        if (lower === 'py') return 'python';
        if (lower === 'c++' || lower === 'cpp') return 'cpp';
        if (lower === 'c#') return 'csharp';
        return lower;
    };

    const handleEditorDidMount = (editor, monaco) => {
        // Define custom theme to match app styles
        monaco.editor.defineTheme('student-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [],
            colors: {
                'editor.background': '#0f172a', // Slate-900 from CSS
            }
        });
        monaco.editor.setTheme('student-dark');

        // Adjust height to content
        const updateHeight = () => {
            const contentHeight = Math.min(10000, editor.getContentHeight());
            setEditorHeight(contentHeight < 20 ? 20 : contentHeight);
        };

        updateHeight();
        editor.onDidContentSizeChange(updateHeight);
    };

    return (
        <div className="monaco-code-block" style={{ margin: '1em 0', border: '1px solid #1e293b', borderRadius: '8px', overflow: 'hidden' }}>
            <Editor
                height={`${editorHeight}px`}
                width="100%"
                language={getLanguage(language)}
                theme="student-dark"
                value={code}
                options={{
                    readOnly: true,
                    domReadOnly: true,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    lineNumbers: 'on',
                    glyphMargin: false,
                    folding: false,
                    lineDecorationsWidth: 16,
                    lineNumbersMinChars: 4,
                    renderLineHighlight: 'none',
                    scrollbar: {
                        vertical: 'hidden',
                        horizontal: 'auto',
                        handleMouseWheel: false,
                    },
                    overviewRulerLanes: 0,
                    hideCursorInOverviewRuler: true,
                    contextmenu: false,
                    fontFamily: 'Consolas, "Courier New", monospace',
                    fontSize: 14,
                    padding: { top: 16, bottom: 16 }, // Match CSS padding
                    automaticLayout: true,
                }}
                onMount={handleEditorDidMount}
                loading={<div style={{ padding: '20px', color: '#e5e7eb', background: '#0f172a' }}>Loading code...</div>}
            />
        </div>
    );
};

export default CodeBlockViewer;
