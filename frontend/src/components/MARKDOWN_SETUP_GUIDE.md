/*
 * MARKDOWN RENDERING SETUP - Complete Guide
 * 
 * This setup provides ChatGPT-style markdown rendering with:
 * ✅ Syntax highlighting for 20+ languages
 * ✅ Auto language detection
 * ✅ Copy-to-clipboard buttons
 * ✅ GitHub-flavored markdown (tables, strikethrough, etc)
 * ✅ Professional styling
 */

// USAGE EXAMPLE 1: Basic Markdown Rendering
// ==========================================

import MarkdownRenderer from './components/MarkdownRenderer/MarkdownRenderer';

function DocumentViewer() {
  const markdown = `
# Java Example

Here's a Java class:

\`\`\`java
public class HelloWorld {
  public static void main(String[] args) {
    System.out.println("Hello, World!");
  }
}
\`\`\`

## Auto-detected Python

No language specified, but will auto-detect:

\`\`\`
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
\`\`\`

| Language | Type    | Speed   |
|----------|---------|---------|
| Java     | Compiled| Very Fast|
| Python   | Interpreted| Fast  |
| JS       | Interpreted| Fast  |
  `;

  return <MarkdownRenderer content={markdown} />;
}

export default DocumentViewer;


// USAGE EXAMPLE 2: Dynamic Content
// =================================

import { useState } from 'react';
import MarkdownRenderer from './components/MarkdownRenderer/MarkdownRenderer';

function DynamicDocumentation() {
  const [selectedLanguage, setSelectedLanguage] = useState('java');

  const snippets = {
    java: `
## Java Snippet

\`\`\`java
public class Main {
  public static void main(String[] args) {
    System.out.println("Java");
  }
}
\`\`\`
    `,
    python: `
## Python Snippet

\`\`\`python
def hello():
    print("Python")

hello()
\`\`\`
    `,
    javascript: `
## JavaScript Snippet

\`\`\`javascript
function hello() {
  console.log("JavaScript");
}

hello();
\`\`\`
    `,
  };

  return (
    <div>
      <select onChange={(e) => setSelectedLanguage(e.target.value)}>
        <option value="java">Java</option>
        <option value="python">Python</option>
        <option value="javascript">JavaScript</option>
      </select>
      <MarkdownRenderer content={snippets[selectedLanguage]} />
    </div>
  );
}

export default DynamicDocumentation;


// USAGE EXAMPLE 3: With Student Assignment Display
// ==================================================

import MarkdownRenderer from './components/MarkdownRenderer/MarkdownRenderer';

function StudentAssignment() {
  const assignmentMD = `
# Python Assignment

## Problem Statement

Write a function that calculates the sum of all even numbers.

## Solution

\`\`\`python
def sum_of_evens(numbers):
    """Calculate sum of even numbers in a list."""
    return sum(n for n in numbers if n % 2 == 0)

# Test
test_data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
result = sum_of_evens(test_data)
print(f"Sum of evens: {result}")  # Output: 30
\`\`\`

## Explanation

This solution:
- Uses a generator expression
- Filters even numbers with \`n % 2 == 0\`
- Sums them efficiently

## Complexity

- **Time**: O(n)
- **Space**: O(1)
  `;

  return <MarkdownRenderer content={assignmentMD} />;
}

export default StudentAssignment;


// FEATURE BREAKDOWN
// =================

/*
 * SUPPORTED LANGUAGES (Auto + Explicit)
 * 
 * Explicitly Registered:
 * ✅ JavaScript / TypeScript / JSX / TSX
 * ✅ Java
 * ✅ Python
 * ✅ C / C++
 * ✅ C#
 * ✅ Go
 * ✅ Rust
 * ✅ Bash / PowerShell
 * ✅ JSON / YAML
 * ✅ SQL
 * ✅ HTML / CSS / XML
 * ✅ Markdown
 * 
 * Auto-Detection (highlight.js):
 * Fallback for unlisted languages
 */


// LANGUAGE DETECTION HOW IT WORKS
// ================================

/*
 * Priority:
 * 1. Explicit language (```java)
 * 2. Auto-detection via highlight.js
 * 3. Fallback to 'text'
 * 
 * Example:
 * 
 * ✅ ```java\ncode → Uses Java
 * ✅ ``` auto-detected\ncode → Uses heuristics
 * ✅ Unknown syntax → Falls back to plain text
 * 
 * Note: Auto-detection is NOT perfect (no AST parsing)
 * But provides good UX for casual use
 */


// PERFORMANCE
// ===========

/*
 * Component is memoized: React.memo(MarkdownRenderer)
 * Why? Prevents re-rendering when parent updates
 * 
 * If you're rendering 100+ code blocks:
 * - Component re-renders only when 'content' prop changes
 * - NOT when parent component re-renders for other reasons
 */


// WHAT'S INCLUDED
// ===============

/*
 * Files created:
 * 1. prismLanguages.js - Language registration (import once in App.jsx)
 * 2. languageDetect.js - Auto language detection
 * 3. MarkdownRenderer.jsx - Main component
 * 4. MarkdownRenderer.css - Professional styling
 * 
 * Updated files:
 * 1. CodeBlockViewer.jsx - Improved language normalization
 * 2. App.jsx - Imports prismLanguages
 */


// WHAT'S NOT INCLUDED (By Design)
// ================================

/*
 * ❌ Semantic error checking (requires Monaco + LSP)
 * ❌ IntelliSense / auto-complete (requires Monaco)
 * ❌ Code execution (requires backend)
 * 
 * This is a VIEWER, not an EDITOR
 * Use Monaco for interactive editing
 */


// NEXT STEPS (Tell me what you want!)
// ====================================

/*
 * 1️⃣ Add line numbers toggle
 * 2️⃣ Add theme switcher (dark/light)
 * 3️⃣ Add code folding
 * 4️⃣ Add copy + download code block
 * 5️⃣ Build a collaborative MD editor
 * 6️⃣ Export to PDF
 * 7️⃣ Create a code playground
 */
