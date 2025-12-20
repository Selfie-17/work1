import React from 'react';
import './EditorToolbar.css';

const EditorToolbar = ({ onCommand, activeStates = {} }) => {
    const tools = [
        { icon: '↺', label: 'Undo', command: 'undo' },
        { icon: '↻', label: 'Redo', command: 'redo' },
        { type: 'divider' },
        { icon: '¶', label: 'Paragraph', type: 'dropdown', command: 'formatBlock', value: 'p' },
        { type: 'divider' },
        { icon: 'B', label: 'Bold', command: 'bold', activeKey: 'bold' },
        { icon: 'I', label: 'Italic', command: 'italic', activeKey: 'italic' },
        { icon: 'U', label: 'Underline', command: 'underline', activeKey: 'underline' },
        { icon: '</>', label: 'Code', command: 'createCode', activeKey: 'code' },
        { icon: '🔗', label: 'Link', command: 'createLink', activeKey: 'link' },
        { type: 'divider' },
        { icon: '•', label: 'Bullet List', command: 'insertUnorderedList', activeKey: 'insertUnorderedList' },
        { icon: '1.', label: 'Numbered List', command: 'insertOrderedList', activeKey: 'insertOrderedList' },
        { type: 'divider' },
        { icon: '≡', label: 'Align', command: 'justifyLeft' },
        { icon: '⊞', label: 'Table', command: 'insertHTML', value: '<table border="1" style="width:100%"><tr><td>&nbsp;</td><td>&nbsp;</td></tr></table>' },
    ];

    return (
        <div className="editor-toolbar">
            {tools.map((tool, index) => {
                if (tool.type === 'divider') {
                    return <div key={index} className="toolbar-divider" />;
                }

                const isActive = tool.activeKey && activeStates[tool.activeKey];

                return (
                    <button
                        key={index}
                        className={`toolbar-btn ${tool.type === 'dropdown' ? 'dropdown' : ''} ${isActive ? 'active' : ''}`}
                        title={tool.label}
                        onClick={() => onCommand && onCommand(tool.command, tool.value)}
                    >
                        <span className="tool-icon">{tool.icon}</span>
                        {tool.type === 'dropdown' && <span className="dropdown-arrow">▾</span>}
                    </button>
                );
            })}
        </div>
    );
};

export default EditorToolbar;
