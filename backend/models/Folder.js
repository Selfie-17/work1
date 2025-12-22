const mongoose = require('mongoose');

const FolderSchema = new mongoose.Schema({
    name: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null },
    isPublished: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Folder', FolderSchema);
