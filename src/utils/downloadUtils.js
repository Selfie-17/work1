/**
 * Download content as a Markdown file
 * @param {string} content - The markdown content
 * @param {string} fileName - The file name (with or without .md extension)
 */
export function downloadMarkdown(content, fileName) {
    const name = fileName.endsWith('.md') ? fileName : `${fileName}.md`;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Print the preview content
 * @param {HTMLElement} previewElement - The preview content element
 */
export function printPreview(previewElement) {
    if (!previewElement) {
        console.error('Preview element not found');
        return;
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Please allow popups to print the preview');
        return;
    }

    // Get all stylesheets
    const styles = Array.from(document.styleSheets)
        .map(sheet => {
            try {
                return Array.from(sheet.cssRules)
                    .map(rule => rule.cssText)
                    .join('\n');
            } catch (e) {
                // External stylesheets may throw security errors
                if (sheet.href) {
                    return `@import url("${sheet.href}");`;
                }
                return '';
            }
        })
        .join('\n');

    // Build the print document
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>MD Editor - Print Preview</title>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/github-dark.min.css">
            <style>
                ${styles}
                body {
                    background: white !important;
                    color: black !important;
                    padding: 40px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }
                .markdown-body {
                    color: black !important;
                    max-width: 800px;
                    margin: 0 auto;
                }
                .markdown-body h1, .markdown-body h2, .markdown-body h3,
                .markdown-body h4, .markdown-body h5, .markdown-body h6 {
                    color: black !important;
                    border-color: #ddd !important;
                }
                .markdown-body a {
                    color: #0366d6 !important;
                }
                .markdown-body code {
                    background: #f6f8fa !important;
                    color: #24292e !important;
                }
                .markdown-body pre {
                    background: #f6f8fa !important;
                    border: 1px solid #ddd !important;
                }
                .markdown-body blockquote {
                    border-left-color: #ddd !important;
                    background: #f9f9f9 !important;
                    color: #555 !important;
                }
                .markdown-body table th {
                    background: #f6f8fa !important;
                }
                .markdown-body table td, .markdown-body table th {
                    border-color: #ddd !important;
                }
                .markdown-body img {
                    box-shadow: none !important;
                }
                @media print {
                    body { padding: 0; }
                    .markdown-body { max-width: none; }
                }
            </style>
        </head>
        <body>
            <div class="markdown-body">
                ${previewElement.innerHTML}
            </div>
            <script>
                window.onload = function() {
                    window.print();
                    window.onafterprint = function() {
                        window.close();
                    };
                };
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

/**
 * Download the preview as a PDF using print to PDF
 * @param {HTMLElement} previewElement - The preview content element
 * @param {string} fileName - The file name for the PDF
 */
export function downloadPDF(previewElement, fileName) {
    if (!previewElement) {
        console.error('Preview element not found');
        return;
    }

    // Create a new window for PDF generation
    const pdfWindow = window.open('', '_blank');
    if (!pdfWindow) {
        alert('Please allow popups to download as PDF');
        return;
    }

    const name = fileName.replace('.md', '');

    // Get all stylesheets
    const styles = Array.from(document.styleSheets)
        .map(sheet => {
            try {
                return Array.from(sheet.cssRules)
                    .map(rule => rule.cssText)
                    .join('\n');
            } catch (e) {
                if (sheet.href) {
                    return `@import url("${sheet.href}");`;
                }
                return '';
            }
        })
        .join('\n');

    // Build the PDF document
    pdfWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${name}</title>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/github.min.css">
            <style>
                ${styles}
                body {
                    background: white !important;
                    color: black !important;
                    padding: 40px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }
                .markdown-body {
                    color: black !important;
                    max-width: 800px;
                    margin: 0 auto;
                }
                .markdown-body h1, .markdown-body h2, .markdown-body h3,
                .markdown-body h4, .markdown-body h5, .markdown-body h6 {
                    color: black !important;
                    border-color: #ddd !important;
                }
                .markdown-body a {
                    color: #0366d6 !important;
                }
                .markdown-body code {
                    background: #f6f8fa !important;
                    color: #24292e !important;
                }
                .markdown-body pre {
                    background: #f6f8fa !important;
                    border: 1px solid #ddd !important;
                }
                .markdown-body blockquote {
                    border-left-color: #ddd !important;
                    background: #f9f9f9 !important;
                    color: #555 !important;
                }
                .markdown-body table th {
                    background: #f6f8fa !important;
                }
                .markdown-body table td, .markdown-body table th {
                    border-color: #ddd !important;
                }
                .markdown-body img {
                    box-shadow: none !important;
                }
                .instructions {
                    background: #fff3cd;
                    border: 1px solid #ffc107;
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 24px;
                    color: #856404;
                }
                .instructions h3 {
                    margin: 0 0 8px 0;
                    color: #856404 !important;
                }
                .instructions p {
                    margin: 0;
                }
                @media print {
                    .instructions { display: none; }
                    body { padding: 0; }
                    .markdown-body { max-width: none; }
                }
            </style>
        </head>
        <body>
            <div class="instructions">
                <h3>📄 Save as PDF</h3>
                <p>Press <strong>Ctrl+P</strong> (or Cmd+P on Mac), then select "Save as PDF" as the destination.</p>
            </div>
            <div class="markdown-body">
                ${previewElement.innerHTML}
            </div>
        </body>
        </html>
    `);
    pdfWindow.document.close();
}
