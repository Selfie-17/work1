const TurndownService = require('turndown');
const { marked } = require('marked');

const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced'
});

const htmlToMarkdown = (html) => {
    return turndownService.turndown(html);
};

const markdownToHtml = (markdown) => {
    return marked.parse(markdown);
};

module.exports = { htmlToMarkdown, markdownToHtml };
