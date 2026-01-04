import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const customComponents = {
    code({ node, inline, className, children, ...props }) {
        // Extract language from className (e.g., "language-javascript")
        const match = /language-(\w+)/.exec(className || '');
        const language = match ? match[1] : '';
        const codeContent = String(children).replace(/\n$/, '');

        // Detect if it's inline code (single backtick `code`)
        const isInline = inline === true ||
            (inline === undefined && !className && codeContent.indexOf('\n') === -1);

        // INLINE CODE: Render with simple styling
        if (isInline) {
            return (
                <code
                    className="bg-gray-100 text-red-600 px-1.5 py-0.5 rounded font-mono"
                    style={{ fontSize: '0.9em', backgroundColor: '#f3f4f6', color: '#dc2626', padding: '2px 6px', borderRadius: '4px' }}
                    {...props}
                >
                    {children}
                </code>
            );
        }

        // CODE BLOCK WITH LANGUAGE: Use syntax highlighter
        if (language) {
            return (
                <SyntaxHighlighter
                    style={oneDark}           // VS Code-like theme
                    language={language}        // e.g., "javascript", "python"
                    PreTag="div"              // Wrap in div instead of pre
                    className="rounded-lg my-4 text-sm"
                    showLineNumbers={true}    // Display line numbers
                    {...props}
                >
                    {codeContent}
                </SyntaxHighlighter>
            );
        }

        // CODE BLOCK WITHOUT LANGUAGE: Plain text highlighting
        return (
            <SyntaxHighlighter
                style={oneDark}
                language="text"
                PreTag="div"
                className="rounded-lg my-4 text-sm"
                {...props}
            >
                {codeContent}
            </SyntaxHighlighter>
        );
    }
    // You can add other components (h1, h2, etc.) here if needed
};

const MarkdownRenderer = ({ content }) => {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}  // Enable tables, strikethrough, etc.
            components={customComponents} // Use our custom code component
        >
            {content}
        </ReactMarkdown>
    );
};

export default MarkdownRenderer;
