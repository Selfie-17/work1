// Create a new file
export function createNewFile() {
    return {
        name: 'Untitled.md',
        content: ''
    };
}

// Open a markdown file from disk
export async function openFile() {
    try {
        // Use File System Access API if available
        if ('showOpenFilePicker' in window) {
            const [fileHandle] = await window.showOpenFilePicker({
                types: [
                    {
                        description: 'Markdown files',
                        accept: {
                            'text/markdown': ['.md', '.markdown'],
                            'text/plain': ['.txt']
                        }
                    }
                ],
                multiple: false
            });

            const file = await fileHandle.getFile();
            const content = await file.text();

            return {
                name: file.name,
                content,
                handle: fileHandle
            };
        } else {
            // Fallback for browsers without File System Access API
            return new Promise((resolve, reject) => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.md,.markdown,.txt';

                input.onchange = async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) {
                        reject(new Error('No file selected'));
                        return;
                    }

                    const content = await file.text();
                    resolve({
                        name: file.name,
                        content,
                        handle: null
                    });
                };

                input.click();
            });
        }
    } catch (err) {
        if (err.name === 'AbortError') {
            return null; // User cancelled
        }
        throw err;
    }
}

// Save content to a file
export async function saveFile(content, fileName, existingHandle = null) {
    try {
        // Use File System Access API if available
        if ('showSaveFilePicker' in window) {
            let fileHandle = existingHandle;

            if (!fileHandle) {
                fileHandle = await window.showSaveFilePicker({
                    suggestedName: fileName || 'document.md',
                    types: [
                        {
                            description: 'Markdown files',
                            accept: {
                                'text/markdown': ['.md']
                            }
                        }
                    ]
                });
            }

            const writable = await fileHandle.createWritable();
            await writable.write(content);
            await writable.close();

            return {
                success: true,
                handle: fileHandle,
                name: fileHandle.name
            };
        } else {
            // Fallback: download file
            downloadFile(content, fileName || 'document.md');
            return {
                success: true,
                handle: null,
                name: fileName
            };
        }
    } catch (err) {
        if (err.name === 'AbortError') {
            return { success: false, cancelled: true };
        }
        throw err;
    }
}

// Download file as fallback
export function downloadFile(content, fileName) {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
}
