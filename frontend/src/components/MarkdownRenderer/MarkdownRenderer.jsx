import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import CodeBlockViewer from "../RichEditor/CodeBlockViewer";
import { detectLanguage } from "../languageDetect";
import "./MarkdownRenderer.css";

/**
 * Custom code component for markdown rendering
 * Handles both inline code and code blocks with auto language detection
 */
const CodeComponent = ({ inline, className, children, ...props }) => {
  const rawCode = String(children || "").replace(/\n$/, "");

  // Extract language from ```lang syntax
  const match = /language-(\w+)/.exec(className || "");
  const explicitLang = match?.[1];

  // Detect language if not explicitly provided
  const detectedLang = explicitLang || detectLanguage(rawCode);

  // INLINE CODE: e.g., `variable name`
  if (inline) {
    return (
      <code className="inline-code" {...props}>
        {children}
      </code>
    );
  }

  // CODE BLOCK: Use CodeBlockViewer component
  return <CodeBlockViewer code={rawCode} language={detectedLang} />;
};

const MarkdownRenderer = ({ content = "" }) => {
  return (
    <div className="markdown-renderer">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code: CodeComponent,
          table({ children }) {
            return <table className="markdown-table">{children}</table>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="markdown-blockquote">
                {children}
              </blockquote>
            );
          },
          h1({ children }) {
            return <h1 className="markdown-h1">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="markdown-h2">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="markdown-h3">{children}</h3>;
          },
          a({ children, href, ...props }) {
            return (
              <a
                href={href}
                className="markdown-link"
                target="_blank"
                rel="noopener noreferrer"
                {...props}
              >
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default React.memo(MarkdownRenderer);
