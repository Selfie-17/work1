import React, { useState, useEffect, useRef } from 'react';
import "./Toolbar.css";
import { exec, insertHTML, setBlock } from "./editorCommands";
import { transformImageUrl } from "../../utils/imageUtils";

const Icons = {
    Undo: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" /></svg>,
    Redo: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6" /><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" /></svg>,
    Bold: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /></svg>,
    Italic: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" /></svg>,
    Underline: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" /><line x1="4" y1="21" x2="20" y2="21" /></svg>,
    AlignLeft: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="17" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="17" y1="18" x2="3" y2="18" /></svg>,
    AlignCenter: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="10" x2="6" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="18" y1="18" x2="6" y2="18" /></svg>,
    AlignRight: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="10" x2="7" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="21" y1="18" x2="7" y2="18" /></svg>,
    AlignJustify: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="21" y1="18" x2="3" y2="18" /></svg>,
    ListBullet: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>,
    ListNumber: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" /><path d="M4 6h1v4" /><path d="M4 10h2" /><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" /></svg>,
    Indent: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 6 15 12 9 18" /><line x1="21" y1="12" x2="9" y2="12" /><line x1="21" y1="6" x2="21" y2="6" /><line x1="21" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3" y2="6" /><line x1="3" y1="18" x2="3" y2="18" /></svg>,
    Outdent: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /><line x1="3" y1="12" x2="15" y2="12" /><line x1="3" y1="6" x2="3" y2="6" /><line x1="3" y1="18" x2="3" y2="18" /><line x1="21" y1="6" x2="21" y2="6" /><line x1="21" y1="18" x2="21" y2="18" /></svg>,
    Quote: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 2.5 1 4.5 4 6" /><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v1c0 2.5 1 4.5 4 6" /></svg>,
    Eraser: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" /><path d="m22 21H7" /><path d="m5 11 9 9" /></svg>,
    Scissors: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><line x1="20" y1="4" x2="8.12" y2="15.88" /><line x1="14.47" y1="14.48" x2="20" y2="20" /><line x1="8.12" y1="8.12" x2="12" y2="12" /></svg>,
    Copy: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>,
    Paste: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></svg>,
    Search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
    Link: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>,
    Image: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>,
    Video: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>,
    Table: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" /></svg>,
    Eye: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
    Save: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>,
    Share: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>,
    Print: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>,
    Export: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
    Code: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>,
    Strike: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4H9a3 3 0 0 0-2.83 4" /><path d="M14 12a4 4 0 0 1 0 8H6" /><line x1="4" y1="12" x2="20" y2="12" /></svg>,
    Superscript: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 22 10-10" /><path d="M2 13h10" /><path d="m18 8 2 2h-4" /><path d="M17 10c0-1.7 1.3-3 3-3s3 1.3 3 3-1.3 3-3 3" /></svg>,
    Subscript: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 22 10-10" /><path d="M2 13h10" /><path d="m18 19 2 2h-4" /><path d="M17 21c0-1.7 1.3-3 3-3s3 1.3 3 3-1.3 3-3 3" /></svg>,
    Uppercase: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14V4h16v10" /><path d="M12 4v16" /></svg>,
    Lowercase: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 12V8h10v4" /><path d="M12 8v8" /></svg>,
    Calendar: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
    Pdf: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><path d="M9 15h3a2 2 0 0 1 0 4h-3" /><path d="M9 12v6" /></svg>,
};

const ColorPicker = ({ icon, command, colors, onSelect, label }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const clickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', clickOutside);
        return () => document.removeEventListener('mousedown', clickOutside);
    }, []);

    return (
        <div className="color-picker-wrapper" ref={ref}>
            <button
                className="toolbar-btn color-btn"
                onMouseDown={e => e.preventDefault()}
                onClick={() => setIsOpen(!isOpen)}
                title={label}
            >
                <span className="color-icon" style={{ borderBottom: command === 'foreColor' ? `3px solid ${colors[0]}` : 'none' }}>{icon}</span>
                <span className="color-arrow">▾</span>
            </button>
            {isOpen && (
                <div className="color-dropdown">
                    {colors.map(c => (
                        <div
                            key={c}
                            className="color-swatch"
                            style={{ backgroundColor: c }}
                            onClick={() => {
                                onSelect(c);
                                setIsOpen(false);
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const SymbolPicker = ({ onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);
    const symbols = ['©', '®', '™', 'π', '∑', '∞', '∆', '√', '≈', '≠', '≤', '≥', '±', '×', '÷', '€', '£', '¥', '§', '¶', '†', '‡', '•', '…'];

    useEffect(() => {
        const clickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', clickOutside);
        return () => document.removeEventListener('mousedown', clickOutside);
    }, []);

    return (
        <div className="color-picker-wrapper" ref={ref}>
            <button className="toolbar-btn" onMouseDown={e => e.preventDefault()} onClick={() => setIsOpen(!isOpen)} title="Special Symbols">
                <span style={{ fontSize: '16px' }}>Ω</span>
            </button>
            {isOpen && (
                <div className="color-dropdown symbols-dropdown">
                    {symbols.map(s => (
                        <div key={s} className="symbol-item" onClick={() => { onSelect(s); setIsOpen(false); }}>
                            {s}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default function Toolbar({
    activeStates = {},
    onSave,
    onShare,
    onPrint,
    onExport,
    onSearch,
    onTogglePreview,
    isPreviewMode,
    onTransformCase,
    onInsertDate,
    stats = { words: 0, chars: 0 }
}) {
    const [showMore, setShowMore] = useState(false);
    const moreRef = useRef(null);
    const colors = ['#000000', '#ef4444', '#f97316', '#facc15', '#22c55e', '#3b82f6', '#4f46e5', '#7c3aed', '#db2777', '#ffffff'];
    const highlights = ['#fef08a', '#bbf7d0', '#bfdbfe', '#fbcfe8', '#ddd6fe', '#fed7aa', '#f3f4f6', 'transparent'];

    useEffect(() => {
        const clickOutside = (e) => {
            if (moreRef.current && !moreRef.current.contains(e.target)) setShowMore(false);
        };
        document.addEventListener('mousedown', clickOutside);
        return () => document.removeEventListener('mousedown', clickOutside);
    }, []);

    return (
        <div className={`pro-toolbar-container ${isPreviewMode ? 'preview-active' : ''}`}>
            {/* Row 1: Formatting focus */}
            <div className="toolbar-row row-1">
                <Group>
                    <Btn icon={<Icons.Bold />} onClick={() => exec("bold")} active={activeStates.bold} title="Bold" />
                    <Btn icon={<Icons.Italic />} onClick={() => exec("italic")} active={activeStates.italic} title="Italic" />
                    <Btn icon={<Icons.Underline />} onClick={() => exec("underline")} active={activeStates.underline} title="Underline" />
                    <ColorPicker icon="A" label="Text Color" command="foreColor" colors={colors} onSelect={c => exec("foreColor", c)} />
                    <ColorPicker icon="🖌️" label="Highlight" command="hiliteColor" colors={highlights} onSelect={c => exec("hiliteColor", c)} />
                </Group>

                <Group>
                    <Btn icon={<Icons.AlignLeft />} onClick={() => exec("justifyLeft")} active={activeStates.justifyLeft} title="Align Left" />
                    <Btn icon={<Icons.AlignCenter />} onClick={() => exec("justifyCenter")} active={activeStates.justifyCenter} title="Align Center" />
                    <Btn icon={<Icons.AlignRight />} onClick={() => exec("justifyRight")} active={activeStates.justifyRight} title="Align Right" />
                    <Btn icon={<Icons.AlignJustify />} onClick={() => exec("justifyFull")} active={activeStates.justifyFull} title="Justify" />
                </Group>

                <Group>
                    <Btn icon={<Icons.ListNumber />} onClick={() => exec("insertOrderedList")} active={activeStates.orderedList} title="Numbered List" />
                    <Btn icon={<Icons.ListBullet />} onClick={() => exec("insertUnorderedList")} active={activeStates.unorderedList} title="Bullet List" />
                    <Btn icon={<Icons.Outdent />} onClick={() => exec("outdent")} title="Outdent" />
                    <Btn icon={<Icons.Indent />} onClick={() => exec("indent")} title="Indent" />
                </Group>

                <Group>
                    <Btn icon={<Icons.Quote />} onClick={() => setBlock("blockquote")} title="Blockquote" />
                    <Btn icon="😊" onClick={() => insertHTML("😊")} title="Emoji" />
                </Group>

                <div className="toolbar-spacer" />

                <Group className="actions-group">
                    <Btn icon={<Icons.Save />} onClick={onSave} title="Save Document" />
                    <Btn icon={<Icons.Share />} onClick={onShare} title="Share Link" />
                    <Btn icon={<Icons.Print />} onClick={onPrint} title="Print Document" />
                    <Btn icon={<Icons.Pdf />} onClick={onPrint} title="Export to PDF" />
                </Group>
            </div>

            {/* Row 2: Insertion and Navigation focus */}
            <div className="toolbar-row row-2">
                <Group>
                    <Btn icon={<Icons.Eraser />} onClick={() => exec("removeFormat")} title="Clear Formatting" />
                    <Btn icon={<Icons.Scissors />} onClick={() => exec("cut")} title="Cut" />
                    <Btn icon={<Icons.Copy />} onClick={() => exec("copy")} title="Copy" />
                    <Btn icon={<Icons.Paste />} onClick={() => navigator.clipboard.readText().then(t => insertHTML(t))} title="Paste" />
                    <Btn icon={<Icons.Search />} onClick={onSearch} title="Search" />
                </Group>

                <Group>
                    <Btn icon={<Icons.Link />} onClick={() => { const u = prompt("URL"); if (u) exec("createLink", u); }} title="Link" />
                    <SymbolPicker onSelect={s => insertHTML(s)} />
                    <Btn icon={<Icons.Table />} onClick={() => insertHTML('<table border="1" style="width:100%; border-collapse: collapse;"><tr><td>&nbsp;</td><td>&nbsp;</td></tr></table>')} title="Table" />
                    <Btn icon={<Icons.Image />} onClick={() => {
                        const u = prompt("Image URL");
                        if (u) {
                            const transformedUrl = transformImageUrl(u);
                            insertHTML(`<img src="${transformedUrl}" style="width: 50%; height: auto;"/>`);
                        }
                    }} title="Image" />
                    <Btn icon={<Icons.Video />} onClick={() => {
                        const u = prompt("Video URL (YouTube Embed Link):");
                        if (u) {
                            const embedUrl = u.replace("watch?v=", "embed/");
                            insertHTML(`<iframe src="${embedUrl}" width="100%" height="400" frameborder="0" allowfullscreen></iframe>`);
                        }
                    }} title="Video" />
                </Group>

                <Group>
                    <select className="style-select" onChange={(e) => setBlock(e.target.value)} defaultValue="p" disabled={isPreviewMode}>
                        <option value="p">Paragraph</option>
                        <option value="h1">Heading 1</option>
                        <option value="h2">Heading 2</option>
                        <option value="h3">Heading 3</option>
                    </select>
                    <Btn icon={<Icons.Code />} onClick={() => insertHTML("<pre><code>\n\n</code></pre>")} title="Code Block" />
                    <Btn icon={<Icons.Eye />} onClick={onTogglePreview} active={isPreviewMode} title="Preview Mode" />
                </Group>

                <div className="toolbar-spacer" />

                <Group ref={moreRef} className="more-options-container">
                    <Btn icon={<Icons.Undo />} onClick={() => exec("undo")} title="Undo" />
                    <Btn icon={<Icons.Redo />} onClick={() => exec("redo")} title="Redo" />
                    <button className="toolbar-btn" onMouseDown={e => e.preventDefault()} onClick={() => setShowMore(!showMore)} title="More Options">
                        ⋮
                    </button>
                    {showMore && (
                        <div className="more-dropdown">
                            <div className="more-tools-row">
                                <Btn icon={<Icons.Strike />} onClick={() => exec("strikethrough")} active={activeStates.strike} title="Strikethrough" />
                                <Btn icon={<Icons.Superscript />} onClick={() => exec("superscript")} active={activeStates.super} title="Superscript" />
                                <Btn icon={<Icons.Subscript />} onClick={() => exec("subscript")} active={activeStates.sub} title="Subscript" />
                                <Btn icon={<Icons.Uppercase />} onClick={() => onTransformCase('upper')} title="Uppercase (TT)" />
                                <Btn icon={<Icons.Lowercase />} onClick={() => onTransformCase('lower')} title="Lowercase (tT)" />
                                <Btn icon={<Icons.Calendar />} onClick={onInsertDate} title="Insert Date" />
                            </div>
                            <hr />
                            <div className="stats-item">Words: <strong>{stats.words}</strong></div>
                            <div className="stats-item">Chars: <strong>{stats.chars}</strong></div>
                            <div className="stats-item">Time: <strong>{~~(stats.words / 200)} min read</strong></div>
                            <hr />
                            <div className="dropdown-action" onClick={() => window.location.reload()}>Reload Document</div>
                        </div>
                    )}
                </Group>
            </div>
        </div>
    );
}

function Group({ children, className = "" }, ref) {
    return <div ref={ref} className={`toolbar-group ${className}`}>{children}</div>;
}

// Forward ref for Group to handle clickOutside
Group = React.forwardRef(Group);

function Btn({ icon, label, onClick, title, active }) {
    return (
        <button
            className={`toolbar-btn ${active ? 'active' : ''}`}
            onMouseDown={e => e.preventDefault()}
            onClick={onClick}
            title={title}
        >
            {icon || label}
        </button>
    );
}
