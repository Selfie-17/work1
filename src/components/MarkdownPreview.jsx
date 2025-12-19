import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { Eye } from 'lucide-react';
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

// Custom components for rendering
const components = {
    // Simple, robust image component
    img: ({ node, src, alt, ...props }) => {
        const transformedSrc = transformImageUrl(src);

        return (
            <img
                src={transformedSrc}
                alt={alt || 'Image'}
                loading="lazy"
                referrerPolicy="no-referrer"
                style={{
                    maxWidth: '100%',
                    height: 'auto',
                    borderRadius: '8px',
                    margin: '16px 0',
                    display: 'block',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                }}
                onError={(e) => {
                    // Show error state
                    e.target.style.display = 'none';
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'image-error-fallback';
                    errorDiv.innerHTML = `
                        <span>⚠️ Failed to load image</span>
                        <a href="${src}" target="_blank" rel="noopener noreferrer">Open original link</a>
                    `;
                    e.target.parentNode.insertBefore(errorDiv, e.target.nextSibling);
                }}
                {...props}
            />
        );
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
    }
};

export default function MarkdownPreview({ content, className }) {
    return (
        <div className={`preview-pane ${className}`}>
            <div className="preview-header">
                <div className="preview-title">
                    <Eye size={16} />
                    Preview
                </div>
            </div>
            <div className="preview-content">
                <div className="markdown-body">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex, rehypeHighlight, rehypeRaw]}
                        components={components}
                    >
                        {content}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
}
