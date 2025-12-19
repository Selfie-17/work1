import { FileText, FilePlus, FolderOpen, Download, Keyboard, RefreshCw, Printer, FileDown, ChevronDown } from 'lucide-react';
import './Navbar.css';

const VIEW_MODES = {
  EDITOR: 'editor',
  PREVIEW: 'preview',
  SPLIT: 'split'
};

export default function Navbar({
  viewMode,
  onViewModeChange,
  scrollSync,
  onScrollSyncChange,
  onNewFile,
  onOpenFile,
  onSaveFile,
  onDownloadMD,
  onDownloadPDF,
  onPrint,
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

          {/* Download Dropdown - CSS hover based */}
          <div className="download-dropdown">
            <button className="btn btn-glass download-btn">
              <FileDown size={18} />
              Export
              <ChevronDown size={14} />
            </button>
            <div className="download-menu">
              <button className="download-option" onClick={onDownloadMD}>
                <FileText size={16} />
                <div className="download-option-info">
                  <span className="download-option-title">Markdown (.md)</span>
                  <span className="download-option-desc">Download as markdown file</span>
                </div>
              </button>
              <button className="download-option" onClick={onDownloadPDF}>
                <FileDown size={16} />
                <div className="download-option-info">
                  <span className="download-option-title">PDF Document</span>
                  <span className="download-option-desc">Export preview as PDF</span>
                </div>
              </button>
              <button className="download-option" onClick={onPrint}>
                <Printer size={16} />
                <div className="download-option-info">
                  <span className="download-option-title">Print</span>
                  <span className="download-option-desc">Print the preview</span>
                </div>
              </button>
            </div>
          </div>
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

        {/* Scroll Sync Toggle */}
        {viewMode === VIEW_MODES.SPLIT && (
          <>
            <button
              className={`btn btn-glass scroll-sync-btn ${scrollSync ? 'active' : ''}`}
              onClick={() => onScrollSyncChange(!scrollSync)}
              data-tooltip={scrollSync ? 'Scroll Sync: ON' : 'Scroll Sync: OFF'}
            >
              <RefreshCw size={16} />
              Sync
            </button>
          </>
        )}

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
