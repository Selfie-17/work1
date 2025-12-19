import { FileText, FilePlus, FolderOpen, Download, Keyboard } from 'lucide-react';
import './Navbar.css';

const VIEW_MODES = {
  EDITOR: 'editor',
  PREVIEW: 'preview',
  SPLIT: 'split'
};

export default function Navbar({ 
  viewMode, 
  onViewModeChange, 
  onNewFile, 
  onOpenFile, 
  onSaveFile,
  onShowShortcuts 
}) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="navbar-logo">
          <FileText size={22} />
        </div>
        <span className="navbar-title">MD Editor</span>
      </div>

      <div className="navbar-actions">
        <div className="file-actions">
          <button 
            className="btn btn-glass" 
            onClick={onNewFile}
            data-tooltip="New File (Ctrl+N)"
          >
            <FilePlus size={18} />
            New
          </button>
          <button 
            className="btn btn-glass" 
            onClick={onOpenFile}
            data-tooltip="Open File (Ctrl+O)"
          >
            <FolderOpen size={18} />
            Open
          </button>
          <button 
            className="btn btn-glass" 
            onClick={onSaveFile}
            data-tooltip="Save File (Ctrl+S)"
          >
            <Download size={18} />
            Save
          </button>
        </div>

        <div className="divider"></div>

        <div className="view-toggle">
          <button 
            className={`btn ${viewMode === VIEW_MODES.EDITOR ? 'active' : ''}`}
            onClick={() => onViewModeChange(VIEW_MODES.EDITOR)}
          >
            Editor
          </button>
          <button 
            className={`btn ${viewMode === VIEW_MODES.SPLIT ? 'active' : ''}`}
            onClick={() => onViewModeChange(VIEW_MODES.SPLIT)}
          >
            Split
          </button>
          <button 
            className={`btn ${viewMode === VIEW_MODES.PREVIEW ? 'active' : ''}`}
            onClick={() => onViewModeChange(VIEW_MODES.PREVIEW)}
          >
            Preview
          </button>
        </div>

        <div className="divider"></div>

        <div className="shortcuts-hint" onClick={onShowShortcuts}>
          <Keyboard size={14} />
          <span>Shortcuts</span>
          <span className="kbd">?</span>
        </div>
      </div>
    </nav>
  );
}

export { VIEW_MODES };
