import { useState, useRef, useCallback } from 'react';
import {
    Undo2, Redo2, Bold, Italic, Underline, Highlighter,
    Sparkles, Link, List, ListOrdered, AlignLeft, AlignCenter,
    AlignRight, Table, ChevronDown, X
} from 'lucide-react';
import './RichTextEditor.css';

export default function RichTextEditor() {
    const editorRef = useRef(null);
    const [activeFormats, setActiveFormats] = useState({});
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [linkText, setLinkText] = useState('');
    const [savedSelection, setSavedSelection] = useState(null);

    const execCommand = useCallback((command, value = null) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
        updateActiveFormats();
    }, []);

    const updateActiveFormats = () => {
        setActiveFormats({
            bold: document.queryCommandState('bold'),
            italic: document.queryCommandState('italic'),
            underline: document.queryCommandState('underline'),
        });
    };

    const handleInput = () => {
        updateActiveFormats();
    };

    const handleKeyUp = () => {
        updateActiveFormats();
    };

    // Save selection before opening modal
    const saveSelection = () => {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            setSavedSelection(selection.getRangeAt(0).cloneRange());
            setLinkText(selection.toString());
        }
    };

    // Restore selection
    const restoreSelection = () => {
        if (savedSelection) {
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(savedSelection);
        }
    };

    // Open link modal
    const openLinkModal = () => {
        saveSelection();
        setLinkUrl('');
        setShowLinkModal(true);
    };

    // Insert link
    const insertLink = () => {
        if (linkUrl) {
            restoreSelection();
            if (linkText) {
                const html = `<a href="${linkUrl}" target="_blank">${linkText}</a>`;
                execCommand('insertHTML', html);
            } else {
                execCommand('createLink', linkUrl);
            }
        }
        setShowLinkModal(false);
        setLinkUrl('');
        setLinkText('');
        setSavedSelection(null);
    };

    const insertTable = () => {
        const html = `
      <table>
        <tr><td>Cell 1</td><td>Cell 2</td><td>Cell 3</td></tr>
        <tr><td>Cell 4</td><td>Cell 5</td><td>Cell 6</td></tr>
      </table>
    `;
        execCommand('insertHTML', html);
    };

    const ToolbarButton = ({ icon: Icon, command, active, onClick, title }) => (
        <button
            className={`toolbar-btn ${active ? 'active' : ''}`}
            onClick={onClick || (() => execCommand(command))}
            title={title}
            type="button"
        >
            <Icon />
        </button>
    );

    return (
        <div className="editor-wrapper">
            <div className="editor-container">
                {/* Toolbar */}
                <div className="editor-toolbar">
                    <div className="toolbar-group">
                        <ToolbarButton icon={Undo2} command="undo" title="Undo" />
                        <ToolbarButton icon={Redo2} command="redo" title="Redo" />
                    </div>

                    <span className="toolbar-divider" />

                    <button className="paragraph-select">
                        Paragraph
                        <ChevronDown />
                    </button>

                    <span className="toolbar-divider" />

                    <div className="toolbar-group">
                        <ToolbarButton
                            icon={Bold}
                            command="bold"
                            active={activeFormats.bold}
                            title="Bold"
                        />
                        <ToolbarButton
                            icon={Italic}
                            command="italic"
                            active={activeFormats.italic}
                            title="Italic"
                        />
                        <ToolbarButton
                            icon={Underline}
                            command="underline"
                            active={activeFormats.underline}
                            title="Underline"
                        />
                    </div>

                    <span className="toolbar-divider" />

                    <div className="toolbar-group">
                        <ToolbarButton
                            icon={Highlighter}
                            onClick={() => execCommand('hiliteColor', 'yellow')}
                            title="Highlight"
                        />
                        <ToolbarButton
                            icon={Sparkles}
                            onClick={() => { }}
                            title="AI Assist"
                        />
                        <ToolbarButton
                            icon={Link}
                            onClick={openLinkModal}
                            title="Insert Link"
                        />
                    </div>

                    <span className="toolbar-divider" />

                    <div className="toolbar-group">
                        <ToolbarButton
                            icon={List}
                            command="insertUnorderedList"
                            title="Bullet List"
                        />
                        <ToolbarButton
                            icon={ListOrdered}
                            command="insertOrderedList"
                            title="Numbered List"
                        />
                    </div>

                    <span className="toolbar-divider" />

                    <div className="toolbar-group">
                        <ToolbarButton
                            icon={AlignLeft}
                            command="justifyLeft"
                            title="Align Left"
                        />
                        <ToolbarButton
                            icon={AlignCenter}
                            command="justifyCenter"
                            title="Align Center"
                        />
                        <ToolbarButton
                            icon={AlignRight}
                            command="justifyRight"
                            title="Align Right"
                        />
                    </div>

                    <span className="toolbar-divider" />

                    <ToolbarButton
                        icon={Table}
                        onClick={insertTable}
                        title="Insert Table"
                    />
                </div>

                {/* Editable Content */}
                <div
                    ref={editorRef}
                    className="editor-content"
                    contentEditable
                    suppressContentEditableWarning
                    onInput={handleInput}
                    onKeyUp={handleKeyUp}
                    onMouseUp={updateActiveFormats}
                >
                </div>
            </div>

            {/* Link Modal */}
            {showLinkModal && (
                <div className="link-modal-overlay" onClick={() => setShowLinkModal(false)}>
                    <div className="link-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="link-modal-header">
                            <h3>Insert Link</h3>
                            <button
                                className="link-modal-close"
                                onClick={() => setShowLinkModal(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="link-modal-body">
                            <div className="link-input-group">
                                <label>Text to display</label>
                                <input
                                    type="text"
                                    value={linkText}
                                    onChange={(e) => setLinkText(e.target.value)}
                                    placeholder="Enter display text"
                                />
                            </div>
                            <div className="link-input-group">
                                <label>URL</label>
                                <input
                                    type="url"
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                    placeholder="https://example.com"
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="link-modal-footer">
                            <button
                                className="link-cancel-btn"
                                onClick={() => setShowLinkModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="link-insert-btn"
                                onClick={insertLink}
                                disabled={!linkUrl}
                            >
                                Insert Link
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
