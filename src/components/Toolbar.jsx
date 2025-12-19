import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Code,
    Link,
    Image,
    List,
    ListOrdered,
    CheckSquare,
    Quote,
    Table,
    Minus,
    ChevronDown,
    Sigma,
    FileCode,
    Undo2,
    Redo2,
    Copy,
    Clipboard
} from 'lucide-react';
import './Toolbar.css';

export default function Toolbar({ onInsert, onUndo, onRedo, onCopy, onPaste }) {
    const toolbarActions = {
        bold: { prefix: '**', suffix: '**', placeholder: 'bold text' },
        italic: { prefix: '*', suffix: '*', placeholder: 'italic text' },
        underline: { prefix: '<u>', suffix: '</u>', placeholder: 'underlined text' },
        strikethrough: { prefix: '~~', suffix: '~~', placeholder: 'strikethrough' },
        code: { prefix: '`', suffix: '`', placeholder: 'code' },
        codeBlock: { prefix: '```\n', suffix: '\n```', placeholder: 'code block' },
        link: { prefix: '[', suffix: '](url)', placeholder: 'link text' },
        image: { prefix: '![', suffix: '](url)', placeholder: 'alt text' },
        unorderedList: { prefix: '- ', suffix: '', placeholder: 'list item', newLine: true },
        orderedList: { prefix: '1. ', suffix: '', placeholder: 'list item', newLine: true },
        taskList: { prefix: '- [ ] ', suffix: '', placeholder: 'task', newLine: true },
        quote: { prefix: '> ', suffix: '', placeholder: 'quote', newLine: true },
        hr: { prefix: '\n---\n', suffix: '', placeholder: '' },
        table: {
            prefix: '\n| Header 1 | Header 2 | Header 3 |\n| -------- | -------- | -------- |\n| ',
            suffix: ' | Cell 2 | Cell 3 |\n',
            placeholder: 'Cell 1'
        },
        inlineMath: { prefix: '$', suffix: '$', placeholder: 'E = mc^2' },
        blockMath: { prefix: '\n$$\n', suffix: '\n$$\n', placeholder: '\\sum_{i=1}^n x_i' },
        h1: { prefix: '# ', suffix: '', placeholder: 'Heading 1', newLine: true },
        h2: { prefix: '## ', suffix: '', placeholder: 'Heading 2', newLine: true },
        h3: { prefix: '### ', suffix: '', placeholder: 'Heading 3', newLine: true },
        h4: { prefix: '#### ', suffix: '', placeholder: 'Heading 4', newLine: true },
        h5: { prefix: '##### ', suffix: '', placeholder: 'Heading 5', newLine: true },
        h6: { prefix: '###### ', suffix: '', placeholder: 'Heading 6', newLine: true },
    };

    const handleAction = (action) => {
        onInsert(toolbarActions[action]);
    };

    return (
        <div className="toolbar">
            {/* Undo/Redo */}
            <div className="toolbar-group">
                <button
                    className="toolbar-btn"
                    onClick={onUndo}
                    data-tooltip="Undo (Ctrl+Z)"
                >
                    <Undo2 size={16} />
                </button>
                <button
                    className="toolbar-btn"
                    onClick={onRedo}
                    data-tooltip="Redo (Ctrl+Y)"
                >
                    <Redo2 size={16} />
                </button>
            </div>

            {/* Copy/Paste */}
            <div className="toolbar-group">
                <button
                    className="toolbar-btn"
                    onClick={onCopy}
                    data-tooltip="Copy (Ctrl+C)"
                >
                    <Copy size={16} />
                </button>
                <button
                    className="toolbar-btn"
                    onClick={onPaste}
                    data-tooltip="Paste (Ctrl+V)"
                >
                    <Clipboard size={16} />
                </button>
            </div>

            {/* Headings Dropdown */}
            <div className="toolbar-group">
                <div className="heading-dropdown">
                    <button className="heading-dropdown-btn">
                        H <ChevronDown size={14} />
                    </button>
                    <div className="heading-menu">
                        {[1, 2, 3, 4, 5, 6].map((level) => (
                            <button
                                key={level}
                                className="heading-option"
                                onClick={() => handleAction(`h${level}`)}
                            >
                                Heading {level}
                                <span>{'#'.repeat(level)}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Text Formatting */}
            <div className="toolbar-group">
                <button
                    className="toolbar-btn"
                    onClick={() => handleAction('bold')}
                    data-tooltip="Bold (Ctrl+B)"
                >
                    <Bold size={16} />
                </button>
                <button
                    className="toolbar-btn"
                    onClick={() => handleAction('italic')}
                    data-tooltip="Italic (Ctrl+I)"
                >
                    <Italic size={16} />
                </button>
                <button
                    className="toolbar-btn"
                    onClick={() => handleAction('underline')}
                    data-tooltip="Underline (Ctrl+U)"
                >
                    <Underline size={16} />
                </button>
                <button
                    className="toolbar-btn"
                    onClick={() => handleAction('strikethrough')}
                    data-tooltip="Strikethrough"
                >
                    <Strikethrough size={16} />
                </button>
            </div>

            {/* Code */}
            <div className="toolbar-group">
                <button
                    className="toolbar-btn"
                    onClick={() => handleAction('code')}
                    data-tooltip="Inline Code"
                >
                    <Code size={16} />
                </button>
                <button
                    className="toolbar-btn"
                    onClick={() => handleAction('codeBlock')}
                    data-tooltip="Code Block (Ctrl+`)"
                >
                    <FileCode size={16} />
                </button>
            </div>

            {/* Links & Media */}
            <div className="toolbar-group">
                <button
                    className="toolbar-btn"
                    onClick={() => handleAction('link')}
                    data-tooltip="Link (Ctrl+K)"
                >
                    <Link size={16} />
                </button>
                <button
                    className="toolbar-btn"
                    onClick={() => handleAction('image')}
                    data-tooltip="Image (Ctrl+Shift+K)"
                >
                    <Image size={16} />
                </button>
            </div>

            {/* Lists */}
            <div className="toolbar-group">
                <button
                    className="toolbar-btn"
                    onClick={() => handleAction('unorderedList')}
                    data-tooltip="Bullet List"
                >
                    <List size={16} />
                </button>
                <button
                    className="toolbar-btn"
                    onClick={() => handleAction('orderedList')}
                    data-tooltip="Numbered List"
                >
                    <ListOrdered size={16} />
                </button>
                <button
                    className="toolbar-btn"
                    onClick={() => handleAction('taskList')}
                    data-tooltip="Task List"
                >
                    <CheckSquare size={16} />
                </button>
            </div>

            {/* Blocks */}
            <div className="toolbar-group">
                <button
                    className="toolbar-btn"
                    onClick={() => handleAction('quote')}
                    data-tooltip="Quote"
                >
                    <Quote size={16} />
                </button>
                <button
                    className="toolbar-btn"
                    onClick={() => handleAction('table')}
                    data-tooltip="Table"
                >
                    <Table size={16} />
                </button>
                <button
                    className="toolbar-btn"
                    onClick={() => handleAction('hr')}
                    data-tooltip="Horizontal Rule"
                >
                    <Minus size={16} />
                </button>
            </div>

            {/* Math */}
            <div className="toolbar-group">
                <button
                    className="toolbar-btn"
                    onClick={() => handleAction('inlineMath')}
                    data-tooltip="Inline Math"
                >
                    <Sigma size={16} />
                </button>
                <button
                    className="toolbar-btn"
                    onClick={() => handleAction('blockMath')}
                    data-tooltip="Block Math"
                >
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px' }}>∑</span>
                </button>
            </div>
        </div>
    );
}
