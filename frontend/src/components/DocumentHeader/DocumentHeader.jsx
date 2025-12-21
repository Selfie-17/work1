import React from 'react';
import './DocumentHeader.css';
import Button from '../Button/Button';

const DocumentHeader = ({ title, onTitleChange, onSave, isSaving }) => {
    return (
        <header className="document-header">
            <div className="header-left">
                <div className="title-wrapper">
                    <input
                        type="text"
                        className="document-title-input"
                        value={title}
                        onChange={(e) => onTitleChange(e.target.value)}
                        placeholder="Untitled Document"
                    />
                    <span className="save-status">
                        {isSaving ? 'Saving...' : 'Saved'}
                    </span>
                </div>
            </div>

            <div className="header-right">
                <Button variant="outline" className="header-action-btn" onClick={onSave}>Save</Button>
                <Button variant="outline" className="header-action-btn">Share</Button>
                <Button variant="outline" className="header-action-btn">Print</Button>
                <Button variant="primary" className="header-action-btn">Export</Button>
            </div>
        </header>
    );
};

export default DocumentHeader;
