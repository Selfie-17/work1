import hljs from 'highlight.js/lib/core';

// Register common languages for auto-detection
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import cpp from 'highlight.js/lib/languages/cpp';
import c from 'highlight.js/lib/languages/c';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';
import sql from 'highlight.js/lib/languages/sql';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import typescript from 'highlight.js/lib/languages/typescript';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('java', java);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('c', c);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('json', json);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('css', css);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('go', go);
hljs.registerLanguage('rust', rust);

/**
 * Auto-detect programming language from code snippet
 * Uses highlight.js heuristics (not perfect, but good for UX)
 * @param {string} code - The code to analyze
 * @returns {string} - Detected language or 'text'
 */
export const detectLanguage = (code = '') => {
  if (!code.trim()) return 'text';

  try {
    const result = hljs.highlightAuto(code);
    return result.language || 'text';
  } catch (error) {
    console.warn('Language detection failed:', error);
    return 'text';
  }
};

export default detectLanguage;
