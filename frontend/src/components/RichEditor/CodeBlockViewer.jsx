import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './CodeBlockViewer.css';

// Map common language aliases to supported names
const normalizeLanguage = (lang = '') => {
    const lower = lang.toLowerCase().trim();
    if (lower === 'js' || lower === 'jsx') return 'javascript';
    if (lower === 'ts' || lower === 'tsx') return 'typescript';
    if (lower === 'c++') return 'cpp';
    if (lower === 'c#') return 'csharp';
    if (lower === 'py') return 'python';
    if (lower === 'sh') return 'bash';
    if (lower === 'yml') return 'yaml';
    return lower || 'text';
};

const getDisplayLabel = (lang = '') => {
    const lower = lang.toLowerCase().trim();
    const map = {
        'javascript': 'JavaScript',
        'typescript': 'TypeScript',
        'java': 'Java',
        'python': 'Python',
        'cpp': 'C++',
        'c': 'C',
        'csharp': 'C#',
        'markup': 'HTML',
        'css': 'CSS',
        'bash': 'Bash',
        'json': 'JSON',
        'sql': 'SQL',
        'go': 'Go',
        'rust': 'Rust'
    };
    return map[lower] || lang.toUpperCase() || 'CODE';
};

const CodeBlockViewer = ({ code = '', language = '' }) => {
    const [copied, setCopied] = useState(false);
    const normalizedLang = normalizeLanguage(language);
    const displayLabel = getDisplayLabel(normalizedLang === 'text' ? language : normalizedLang);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code || '');
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Copy failed:', err);
        }
    };

    return (
        <div className="code-block">
            {/* Header */}
            <div className="code-block-header">
                <span className="code-block-lang">{displayLabel}</span>
                <button
                    type="button"
                    className={`code-block-copy ${copied ? 'copied' : ''}`}
                    onClick={handleCopy}
                    aria-label={copied ? 'Copied!' : 'Copy code'}
                    title={copied ? 'Copied!' : 'Copy to clipboard'}
                >
                    {copied ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Content using React Syntax Highlighter (Prism) */}
            <div className="code-block-content">
                <SyntaxHighlighter
                    language={normalizedLang}
                    style={oneLight}
                    customStyle={{
                        margin: 0,
                        padding: 0,
                        background: 'transparent',
                        border: 'none',
                        boxShadow: 'none',
                        fontSize: '14px',
                        lineHeight: '1.7',
                        fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace"
                    }}
                    codeTagProps={{
                        style: {
                            fontFamily: 'inherit',
                            fontSize: 'inherit'
                        }
                    }}
                    PreTag="div"
                >
                    {code.trim()}
                </SyntaxHighlighter>
            </div>
        </div>
    );
};

export default CodeBlockViewer;
