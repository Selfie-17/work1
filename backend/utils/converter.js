const TurndownService = require('turndown');
const { marked } = require('marked');

const turndownPluginGfm = require('turndown-plugin-gfm');

const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced'
});

// Use GFM plugin for tables, task lists, etc.
turndownService.use(turndownPluginGfm.gfm);

// Preserve tags that don't have direct Markdown equivalents but are used for formatting
turndownService.keep(['span', 'font', 'u', 'table', 'tr', 'td', 'th', 'thead', 'tbody']);

// Add a rule to preserve styles/attributes on tables and cells
turndownService.addRule('preserveTableStyles', {
    filter: ['td', 'th', 'table'],
    replacement: function (content, node) {
        const tag = node.nodeName.toLowerCase();
        const style = node.getAttribute('style');
        const colspan = node.getAttribute('colspan');
        const rowspan = node.getAttribute('rowspan');

        let attrs = '';
        if (style) attrs += ` style="${style}"`;
        if (colspan) attrs += ` colspan="${colspan}"`;
        if (rowspan) attrs += ` rowspan="${rowspan}"`;

        if (tag === 'table') {
            return `<table${attrs}>${content}</table>`;
        }
        return `<${tag}${attrs}>${content}</${tag}>`;
    }
});

const htmlToMarkdown = (html) => {
    return turndownService.turndown(html);
};

const markdownToHtml = (markdown) => {
    return marked.parse(markdown);
};

module.exports = { htmlToMarkdown, markdownToHtml };
