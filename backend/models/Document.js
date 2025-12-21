const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
    title: { type: String, default: 'Untitled Document' },
    markdown: { type: String, required: true },
    htmlPreview: { type: String }, // Cached HTML preview
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    folder: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder' },
    status: { type: String, enum: ['draft', 'pending', 'approved'], default: 'draft' },
    githubUrl: { type: String }, // Reference to original GitHub file
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Document', DocumentSchema);
