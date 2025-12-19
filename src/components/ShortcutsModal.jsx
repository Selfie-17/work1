import { useEffect } from 'react';
import { Keyboard, X } from 'lucide-react';
import './ShortcutsModal.css';

const SHORTCUTS = [
    {
        section: 'Text Formatting',
        items: [
            { label: 'Bold', keys: ['Ctrl', 'B'] },
            { label: 'Italic', keys: ['Ctrl', 'I'] },
            { label: 'Strikethrough', keys: ['Ctrl', 'Shift', 'S'] },
        ]
    },
    {
        section: 'Headings',
        items: [
            { label: 'Heading 1', keys: ['Ctrl', '1'] },
            { label: 'Heading 2', keys: ['Ctrl', '2'] },
            { label: 'Heading 3', keys: ['Ctrl', '3'] },
            { label: 'Heading 4', keys: ['Ctrl', '4'] },
            { label: 'Heading 5', keys: ['Ctrl', '5'] },
            { label: 'Heading 6', keys: ['Ctrl', '6'] },
        ]
    },
    {
        section: 'Insert Elements',
        items: [
            { label: 'Link', keys: ['Ctrl', 'K'] },
            { label: 'Image', keys: ['Ctrl', 'Shift', 'K'] },
            { label: 'Code Block', keys: ['Ctrl', '`'] },
            { label: 'Inline Code', keys: ['Ctrl', 'Shift', 'C'] },
            { label: 'Quote', keys: ['Ctrl', 'Q'] },
        ]
    },
    {
        section: 'File Operations',
        items: [
            { label: 'New File', keys: ['Ctrl', 'N'] },
            { label: 'Open File', keys: ['Ctrl', 'O'] },
            { label: 'Save File', keys: ['Ctrl', 'S'] },
        ]
    },
    {
        section: 'View',
        items: [
            { label: 'Toggle Preview', keys: ['Ctrl', 'P'] },
            { label: 'Show Shortcuts', keys: ['?'] },
        ]
    }
];

export default function ShortcutsModal({ isOpen, onClose }) {
    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="shortcuts-modal-overlay" onClick={onClose}>
            <div className="shortcuts-modal" onClick={(e) => e.stopPropagation()}>
                <div className="shortcuts-header">
                    <div className="shortcuts-title">
                        <Keyboard size={20} />
                        Keyboard Shortcuts
                    </div>
                    <button className="shortcuts-close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>
                <div className="shortcuts-content">
                    {SHORTCUTS.map((section) => (
                        <div key={section.section} className="shortcuts-section">
                            <div className="shortcuts-section-title">{section.section}</div>
                            <div className="shortcuts-list">
                                {section.items.map((item) => (
                                    <div key={item.label} className="shortcut-item">
                                        <span className="shortcut-label">{item.label}</span>
                                        <div className="shortcut-keys">
                                            {item.keys.map((key, index) => (
                                                <span key={index} className="shortcut-key">
                                                    {key}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
