const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('./models/User');
const OTP = require('./models/OTP');
const Document = require('./models/Document');
const Folder = require('./models/Folder');
const { sendOTPEmail } = require('./utils/mailer');
const { htmlToMarkdown, markdownToHtml } = require('./utils/converter');

const app = express();
app.use(cors());
app.use(express.json());

// Request Logging Middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// --- Helper Functions ---
const ensureUniqueTitle = async (title, authorId, excludeId = null) => {
    let uniqueTitle = title;
    let counter = 1;
    while (true) {
        const query = { title: uniqueTitle, author: authorId };
        if (excludeId) query._id = { $ne: excludeId };

        const existing = await Document.findOne(query);
        if (!existing) break;

        uniqueTitle = `${title} (${counter})`;
        counter++;
    }
    return uniqueTitle;
};

// --- Auth Routes ---

// Signup Request - Generates OTP and Sends Email
app.post('/api/auth/signup-request', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser.isVerified) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // 1. Generate secure OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // 2. Hash OTP
        const otpHash = await bcrypt.hash(otp, 10);

        // 3. Store OTP (Use expiresAt for manual control or TTL index)
        await OTP.deleteMany({ email }); // Invalidate old ones
        await OTP.create({
            email,
            otpHash,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        });

        // 4. Send the OTP email
        console.log(`[VERIFICATION] OTP for ${email}: ${otp}`);
        await sendOTPEmail(name, email, otp);

        res.status(200).json({ message: 'OTP sent to verification email' });
    } catch (error) {
        console.error('Error in signup request:', error);
        res.status(500).json({ message: 'Error in signup request', error: error.message });
    }
});

// Verify OTP and Complete Registration
app.post('/api/auth/verify-otp', async (req, res) => {
    const { name, email, password, otp } = req.body;

    try {
        const record = await OTP.findOne({ email });
        if (!record) {
            return res.status(400).json({ message: 'OTP record not found' });
        }

        if (record.expiresAt < new Date()) {
            return res.status(400).json({ message: 'OTP expired' });
        }

        if (record.attempts >= 5) {
            return res.status(429).json({ message: 'Too many attempts' });
        }

        const isValid = await bcrypt.compare(otp, record.otpHash);
        if (!isValid) {
            record.attempts += 1;
            await record.save();
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // OTP is valid
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create or Update User
        const user = await User.findOneAndUpdate(
            { email },
            { name, email, password: hashedPassword, isVerified: true },
            { upsert: true, new: true }
        );

        await OTP.deleteOne({ email });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ message: 'Error verifying OTP' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !user.isVerified) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (error) {
        res.status(500).json({ message: 'Login error' });
    }
});

// --- Document Routes (Invisible Markdown) ---

// Create Document (from HTML)
app.post('/api/docs', async (req, res) => {
    let { title, markdown, htmlContent, authorId, folderId } = req.body;

    // Invisible Sync Rule: Markdown is the internal source of truth.
    // If frontend sends HTML, convert it to MD first.
    if (!markdown && htmlContent) {
        markdown = htmlToMarkdown(htmlContent);
    }

    if (!markdown) {
        return res.status(400).json({ message: 'Content is required' });
    }

    const reRenderedHtml = markdownToHtml(markdown);

    try {
        const uniqueTitle = await ensureUniqueTitle(title, authorId);
        const doc = new Document({
            title: uniqueTitle,
            markdown,
            htmlPreview: reRenderedHtml,
            author: authorId,
            folder: folderId || null
        });
        await doc.save();
        res.status(201).json(doc);
    } catch (error) {
        console.error('Error creating document:', error);
        res.status(500).json({ message: 'Error creating document' });
    }
});

// Update Document (from HTML)
app.put('/api/docs/:id', async (req, res) => {
    let { title, markdown, htmlContent } = req.body;

    if (!markdown && htmlContent) {
        markdown = htmlToMarkdown(htmlContent);
    }

    if (!markdown) {
        return res.status(400).json({ message: 'Content is required' });
    }

    const reRenderedHtml = markdownToHtml(markdown);

    try {
        const existingDoc = await Document.findById(req.params.id);
        if (!existingDoc) return res.status(404).json({ message: 'Document not found' });

        const uniqueTitle = await ensureUniqueTitle(title || existingDoc.title, existingDoc.author, req.params.id);

        const doc = await Document.findByIdAndUpdate(req.params.id, {
            title: uniqueTitle,
            markdown,
            htmlPreview: reRenderedHtml,
            updatedAt: Date.now()
        }, { new: true });
        res.status(200).json(doc);
    } catch (error) {
        console.error('Error updating document:', error);
        res.status(500).json({ message: 'Error updating document' });
    }
});

// Get Document (returns HTML)
app.get('/api/docs/:id', async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ message: 'Document not found' });

        // Ensure preview is up to date with markdown
        const htmlPreview = markdownToHtml(doc.markdown);
        res.status(200).json({ ...doc._doc, htmlPreview });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching document' });
    }
});

// List Documents
app.get('/api/docs', async (req, res) => {
    const { folderId, authorId } = req.query;
    try {
        const query = {};
        if (folderId) query.folder = folderId === 'root' ? null : folderId;
        if (authorId) query.author = authorId;

        const docs = await Document.find(query).sort({ updatedAt: -1 });
        res.status(200).json(docs);
    } catch (error) {
        console.error('Error listing documents:', error);
        res.status(500).json({ message: 'Error listing documents' });
    }
});

// --- Folder Routes ---

// Get Single Folder (for breadcrumbs)
app.get('/api/folders/:id', async (req, res) => {
    try {
        const folder = await Folder.findById(req.params.id);
        if (!folder) return res.status(404).json({ message: 'Folder not found' });
        res.status(200).json(folder);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching folder' });
    }
});

// List Folders
app.get('/api/folders', async (req, res) => {
    const { authorId, parentId } = req.query;
    try {
        const query = { author: authorId };
        if (parentId) {
            query.parent = parentId === 'root' ? null : parentId;
        }

        const folders = await Folder.find(query).sort({ name: 1 });
        res.status(200).json(folders);
    } catch (error) {
        console.error('Error listing folders:', error);
        res.status(500).json({ message: 'Error listing folders' });
    }
});

// Create Folder
app.post('/api/folders', async (req, res) => {
    const { name, authorId } = req.body;
    try {
        const folder = new Folder({ name, author: authorId });
        await folder.save();
        res.status(201).json(folder);
    } catch (error) {
        console.error('Error creating folder:', error);
        res.status(500).json({ message: 'Error creating folder' });
    }
});

// Delete Folder
app.delete('/api/folders/:id', async (req, res) => {
    try {
        await Folder.findByIdAndDelete(req.params.id);
        // Optional: Move documents to root or delete them
        await Document.updateMany({ folder: req.params.id }, { $set: { folder: null } });
        res.status(200).json({ message: 'Folder deleted' });
    } catch (error) {
        console.error('Error deleting folder:', error);
        res.status(500).json({ message: 'Error deleting folder' });
    }
});

// Delete Document
app.delete('/api/docs/:id', async (req, res) => {
    try {
        const doc = await Document.findByIdAndDelete(req.params.id);
        if (!doc) return res.status(404).json({ message: 'Document not found' });
        res.status(200).json({ message: 'Document deleted successfully' });
    } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({ message: 'Error deleting document' });
    }
});

// Helper to parse GitHub URL
function parseGitHubUrl(url) {
    const cleanUrl = url.trim().replace(/\/$/, "");
    const parts = cleanUrl.split('/');
    const gitIndex = parts.indexOf('github.com');
    if (gitIndex === -1 || parts.length < gitIndex + 3) return null;

    return {
        owner: parts[gitIndex + 1],
        repo: parts[gitIndex + 2],
        branch: parts[gitIndex + 3] === 'blob' || parts[gitIndex + 3] === 'tree' ? parts[gitIndex + 4] : 'main',
        path: parts.slice(gitIndex + (parts[gitIndex + 3] === 'blob' || parts[gitIndex + 3] === 'tree' ? 5 : 3)).join('/')
    };
}

// Recursive GitHub Importer
async function importFromGithubRecursive(owner, repo, branch, path, authorId, parentFolderId = null) {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;

    try {
        const response = await fetch(apiUrl, {
            headers: { 'User-Agent': 'Lesson-Planner-App' } // Required by GitHub API
        });

        if (!response.ok) {
            // If failed, maybe try master instead of main if it was guessed
            if (branch === 'main') return importFromGithubRecursive(owner, repo, 'master', path, authorId, parentFolderId);
            return;
        }

        const items = await response.json();
        const itemsArray = Array.isArray(items) ? items : [items];

        for (const item of itemsArray) {
            if (item.type === 'dir') {
                // Create Folder
                let folder = await Folder.findOne({ name: item.name, author: authorId, parent: parentFolderId });
                if (!folder) {
                    folder = new Folder({ name: item.name, author: authorId, parent: parentFolderId });
                    await folder.save();
                }
                // Recurse
                await importFromGithubRecursive(owner, repo, branch, item.path, authorId, folder._id);
            } else if (item.type === 'file' && item.name.toLowerCase().endsWith('.md')) {
                // Fetch Content
                const contentRes = await fetch(item.download_url);
                if (contentRes.ok) {
                    const markdown = await contentRes.text();
                    const htmlPreview = markdownToHtml(markdown);

                    let title = item.name.replace(/\.md$/i, '');
                    if (title.toLowerCase() === 'readme' && parentFolderId) {
                        const parent = await Folder.findById(parentFolderId);
                        if (parent) title = parent.name;
                    }

                    const uniqueTitle = await ensureUniqueTitle(title, authorId);
                    const doc = new Document({
                        title: uniqueTitle,
                        markdown,
                        htmlPreview,
                        author: authorId,
                        folder: parentFolderId,
                        githubUrl: item.html_url
                    });
                    await doc.save();
                }
            }
        }
    } catch (error) {
        console.error(`Error importing path ${path}:`, error);
    }
}

// Overhauled Import Route
app.post('/api/docs/import', async (req, res) => {
    const { githubUrl, authorId } = req.body;

    if (!githubUrl || !authorId) {
        return res.status(400).json({ message: 'GitHub URL and Author ID are required' });
    }

    const githubInfo = parseGitHubUrl(githubUrl);
    if (!githubInfo) {
        return res.status(400).json({ message: 'Invalid GitHub URL' });
    }

    const { owner, repo, branch, path } = githubInfo;

    try {
        // Create a root folder for the repo if importing from repo root
        let rootFolderId = null;
        if (!path) {
            let rootFolder = await Folder.findOne({ name: repo, author: authorId, parent: null });
            if (!rootFolder) {
                rootFolder = new Folder({ name: repo, author: authorId, parent: null });
                await rootFolder.save();
            }
            rootFolderId = rootFolder._id;
        }

        // Start recursive import
        await importFromGithubRecursive(owner, repo, branch, path, authorId, rootFolderId);

        res.status(201).json({ message: 'Import started successfully. Your repository structure is being mirrored.' });
    } catch (error) {
        console.error('Error in recursive import:', error);
        res.status(500).json({ message: 'Error importing from GitHub', error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
