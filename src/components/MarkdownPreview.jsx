import { useRef, useCallback, useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import './Editor.css';

// Transform image URLs to direct embeddable URLs
function transformImageUrl(src) {
    if (!src) return src;

    // GitHub raw content - convert blob URLs to raw
    if (src.includes('github.com') && src.includes('/blob/')) {
        return src
            .replace('github.com', 'raw.githubusercontent.com')
            .replace('/blob/', '/');
    }

    // Google Drive - convert to direct view URL
    if (src.includes('drive.google.com')) {
        const match = src.match(/\/d\/([^/]+)/);
        if (match) {
            return `https://drive.google.com/uc?export=view&id=${match[1]}`;
        }
    }

    // Imgur - ensure direct link
    if (src.includes('imgur.com') && !src.includes('i.imgur.com')) {
        const match = src.match(/imgur\.com\/(\w+)/);
        if (match) {
            return `https://i.imgur.com/${match[1]}.png`;
        }
    }

    return src;
}

// Image component with proper error handling
function ImageComponent({ src, alt, ...props }) {
    const [status, setStatus] = useState('loading'); // 'loading' | 'loaded' | 'error'
    const transformedSrc = transformImageUrl(src);

    // Reset status when src changes
    useEffect(() => {
        setStatus('loading');
    }, [src]);

    if (status === 'error') {
        return (
            <div className="image-error-fallback">
                <span>⚠️ Failed to load image</span>
                <a href={src} target="_blank" rel="noopener noreferrer">Open original link</a>
            </div>
        );
    }

    return (
        <div className="image-container">
            {status === 'loading' && (
                <div className="image-loading-inline">
                    Loading image...
                </div>
            )}
            <img
                key={transformedSrc}
                src={transformedSrc}
                alt={alt || 'Image'}
                referrerPolicy="no-referrer"
                style={{
                    maxWidth: '100%',
                    height: 'auto',
                    borderRadius: '8px',
                    margin: '16px 0',
                    display: status === 'loaded' ? 'block' : 'none',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                }}
                onLoad={() => setStatus('loaded')}
                onError={() => setStatus('error')}
                {...props}
            />
        </div>
    );
}

// Custom components for rendering
const components = {
    // Use the stateful image component
    img: ({ node, src, alt, ...props }) => {
        return <ImageComponent src={src} alt={alt} {...props} />;
    },
    // Custom checkbox for task lists
    input: ({ node, type, checked, ...props }) => {
        if (type === 'checkbox') {
            return (
                <input
                    type="checkbox"
                    checked={checked}
                    disabled
                    {...props}
                />
            );
        }
        return <input type={type} {...props} />;
    },
    // Custom link to open in new tab
    a: ({ node, href, children, ...props }) => {
        return (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                {...props}
            >
                {children}
            </a>
        );
    },
    // Handle underline with custom component instead of rehypeRaw
    u: ({ node, children, ...props }) => {
        return <u {...props}>{children}</u>;
    }
};

// Pre-process content to convert <u> tags to a format that works without rehypeRaw
function preprocessContent(content) {
    // Convert <u>text</u> to custom format that ReactMarkdown can handle
    // We'll use a special marker that we convert back in components
    return content
        .replace(/<u>/gi, '++')
        .replace(/<\/u>/gi, '++');
}

export default function MarkdownPreview({ content, className, previewRef, previewContentRef, editorRef, scrollSync }) {
    const isScrollingRef = useRef(false);

    // Handle scroll sync from preview to editor
    const handleScroll = useCallback((e) => {
        if (scrollSync && editorRef?.current && !isScrollingRef.current) {
            isScrollingRef.current = true;
            const preview = e.target;
            const editor = editorRef.current;

            const scrollPercentage = preview.scrollTop / (preview.scrollHeight - preview.clientHeight);
            const editorScrollTop = scrollPercentage * (editor.scrollHeight - editor.clientHeight);

            editor.scrollTop = editorScrollTop || 0;

            setTimeout(() => {
                isScrollingRef.current = false;
            }, 50);
        }
    }, [editorRef, scrollSync]);

    return (
        <div className={`preview-pane ${className}`}>
            <div
                className="preview-content"
                ref={previewRef}
                onScroll={handleScroll}
            >
                <div className="markdown-body" ref={previewContentRef}>
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex, rehypeHighlight]}
                        components={components}
                    >
                        {content}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
}
