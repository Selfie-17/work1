const TurndownService = require('turndown');
const { marked } = require('marked');

const turndownPluginGfm = require('turndown-plugin-gfm');

const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced'
});

// Use GFM plugin for tables, task lists, etc.
turndownService.use(turndownPluginGfm.gfm);

const htmlToMarkdown = (html) => {
    return turndownService.turndown(html);
};

const markdownToHtml = (markdown) => {
    return marked.parse(markdown);
};

module.exports = { htmlToMarkdown, markdownToHtml };
