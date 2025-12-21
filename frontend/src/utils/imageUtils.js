/**
 * Transforms various image URLs (GitHub, etc.) into direct/raw image links.
 * @param {string} url - The original image URL.
 * @returns {string} - The transformed raw image URL.
 */
export function transformImageUrl(url) {
    if (!url) return url;

    try {
        const urlObj = new URL(url);

        // 1. GitHub Transformation
        // github.com/.../blob/... -> raw.githubusercontent.com/.../...
        if (urlObj.hostname === 'github.com') {
            const parts = urlObj.pathname.split('/').filter(Boolean);
            // parts: [owner, repo, 'blob', branch, ...path]
            if (parts[2] === 'blob') {
                const owner = parts[0];
                const repo = parts[1];
                const branch = parts[3];
                const path = parts.slice(4).join('/');
                return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
            }
        }

        // 2. Already raw GitHub
        if (urlObj.hostname === 'raw.githubusercontent.com') {
            return url;
        }

        // Add more logic for other providers here if needed (e.g. Google Drive)

    } catch (e) {
        console.error('Invalid URL passed to transformImageUrl', e);
    }

    return url;
}
