import MarkdownRenderer from "./components/MarkdownRenderer/MarkdownRenderer";

/**
 * COMPLETE WORKING EXAMPLES
 * Copy & paste into your component to test immediately
 */

// ============================================================
// EXAMPLE 1: Simple Java Documentation
// ============================================================

export function JavaDocExample() {
  const markdown = `
# Java Documentation

## Collections Framework

The Java Collections Framework provides data structures for storing and manipulating groups of objects.

### List Example

\`\`\`java
import java.util.ArrayList;
import java.util.List;

public class ListExample {
    public static void main(String[] args) {
        List<String> fruits = new ArrayList<>();
        fruits.add("Apple");
        fruits.add("Banana");
        fruits.add("Orange");
        
        for (String fruit : fruits) {
            System.out.println(fruit);
        }
    }
}
\`\`\`

### HashMap Example

\`\`\`java
import java.util.HashMap;
import java.util.Map;

public class MapExample {
    public static void main(String[] args) {
        Map<String, Integer> scores = new HashMap<>();
        scores.put("Alice", 95);
        scores.put("Bob", 87);
        
        System.out.println(scores.get("Alice")); // 95
    }
}
\`\`\`

### Comparison

| Class | Type | Order | Thread-Safe |
|-------|------|-------|-------------|
| ArrayList | List | Yes | No |
| HashMap | Map | No | No |
| TreeMap | Map | Yes (sorted) | No |
| ConcurrentHashMap | Map | No | Yes |
  `;

  return <MarkdownRenderer content={markdown} />;
}

// ============================================================
// EXAMPLE 2: Multi-Language Tutorial (with auto-detection)
// ============================================================

export function MultiLanguageTutorial() {
  const markdown = `
# Hello World in Different Languages

## Java

\`\`\`java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
\`\`\`

## Python

Auto-detected (no language tag):

\`\`\`
def hello_world():
    print("Hello, World!")

hello_world()
\`\`\`

## JavaScript

\`\`\`javascript
function helloWorld() {
    console.log("Hello, World!");
}

helloWorld();
\`\`\`

## C++

\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}
\`\`\`

## SQL

\`\`\`sql
SELECT 'Hello, World!' AS message;
\`\`\`
  `;

  return <MarkdownRenderer content={markdown} />;
}

// ============================================================
// EXAMPLE 3: Student Assignment with Code Solutions
// ============================================================

export function StudentAssignment() {
  const markdown = `
# Assignment: Fibonacci Sequence

## Problem

Write a function that calculates the nth Fibonacci number.

**Input**: Integer \`n\` (0-indexed)
**Output**: The nth Fibonacci number
**Constraints**: 0 ≤ n ≤ 100

## Examples

| Input | Output | Explanation |
|-------|--------|-------------|
| 0 | 0 | F(0) = 0 |
| 1 | 1 | F(1) = 1 |
| 5 | 5 | F(5) = 0+1+1+2+5 |
| 10 | 55 | F(10) = 55 |

## Solution 1: Iterative (Recommended)

\`\`\`python
def fibonacci(n):
    """Calculate nth Fibonacci number iteratively."""
    if n <= 1:
        return n
    
    prev, curr = 0, 1
    for _ in range(2, n + 1):
        prev, curr = curr, prev + curr
    
    return curr

# Test
print(fibonacci(10))  # Output: 55
\`\`\`

**Time Complexity**: O(n)
**Space Complexity**: O(1)

## Solution 2: Recursive with Memoization

\`\`\`python
def fibonacci_memo(n, memo=None):
    """Calculate nth Fibonacci with memoization."""
    if memo is None:
        memo = {}
    
    if n in memo:
        return memo[n]
    
    if n <= 1:
        return n
    
    memo[n] = fibonacci_memo(n - 1, memo) + fibonacci_memo(n - 2, memo)
    return memo[n]

# Test
print(fibonacci_memo(10))  # Output: 55
\`\`\`

**Time Complexity**: O(n)
**Space Complexity**: O(n)

## Solution 3: Java Implementation

\`\`\`java
public class Fibonacci {
    public static int fibonacci(int n) {
        if (n <= 1) return n;
        
        int prev = 0, curr = 1;
        for (int i = 2; i <= n; i++) {
            int next = prev + curr;
            prev = curr;
            curr = next;
        }
        return curr;
    }
    
    public static void main(String[] args) {
        System.out.println(fibonacci(10)); // Output: 55
    }
}
\`\`\`

## Complexity Analysis

| Approach | Time | Space | Notes |
|----------|------|-------|-------|
| Recursive | O(2^n) | O(n) | Slow, exponential |
| Iterative | O(n) | O(1) | Fast, recommended |
| Memo | O(n) | O(n) | Fast but uses memory |
| Matrix | O(log n) | O(log n) | Fastest, complex |

> **Best Practice**: Use iterative approach for most cases. Use memoization when exploring multiple values.
  `;

  return <MarkdownRenderer content={markdown} />;
}

// ============================================================
// EXAMPLE 4: API Documentation with Code Samples
// ============================================================

export function APIDocumentation() {
  const markdown = `
# REST API Documentation

## Authentication

All requests require an \`Authorization\` header with a Bearer token.

\`\`\`
Authorization: Bearer your_token_here
\`\`\`

## Endpoints

### GET /api/users/:id

Retrieve a user by ID.

#### Request

\`\`\`bash
curl -X GET "https://api.example.com/api/users/123" \\
  -H "Authorization: Bearer token_here"
\`\`\`

#### Response (200 OK)

\`\`\`json
{
  "id": 123,
  "name": "John Doe",
  "email": "john@example.com",
  "created_at": "2024-01-15T10:00:00Z"
}
\`\`\`

### POST /api/users

Create a new user.

#### Request Body

\`\`\`json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "secure_password"
}
\`\`\`

#### Response (201 Created)

\`\`\`json
{
  "id": 124,
  "name": "Jane Smith",
  "email": "jane@example.com",
  "created_at": "2024-01-16T14:30:00Z"
}
\`\`\`

## Error Responses

| Status | Code | Message |
|--------|------|---------|
| 400 | INVALID_INPUT | Missing required fields |
| 401 | UNAUTHORIZED | Invalid or missing token |
| 404 | NOT_FOUND | Resource not found |
| 500 | SERVER_ERROR | Internal server error |

## Rate Limiting

Rate limits are enforced per API key:
- \`1000\` requests per hour
- Headers: \`X-RateLimit-Limit\`, \`X-RateLimit-Remaining\`
  `;

  return <MarkdownRenderer content={markdown} />;
}

// ============================================================
// EXAMPLE 5: Technical Blog Post
// ============================================================

export function TechnicalBlogPost() {
  const markdown = `
# Understanding Async/Await in JavaScript

## Introduction

Async/await makes asynchronous code look and behave more like synchronous code, making it easier to understand and maintain.

## Before: Promises

\`\`\`javascript
function fetchUser(userId) {
    return fetch(\`/api/users/\${userId}\`)
        .then(response => response.json())
        .then(user => {
            console.log('User fetched:', user);
            return user;
        })
        .catch(error => console.error('Error:', error));
}
\`\`\`

## After: Async/Await

\`\`\`javascript
async function fetchUser(userId) {
    try {
        const response = await fetch(\`/api/users/\${userId}\`);
        const user = await response.json();
        console.log('User fetched:', user);
        return user;
    } catch (error) {
        console.error('Error:', error);
    }
}
\`\`\`

## Key Benefits

| Aspect | Promises | Async/Await |
|--------|----------|-------------|
| Readability | Medium | Excellent |
| Error Handling | .catch() | try/catch |
| Sequential Calls | Chaining | Top-to-bottom |
| Learning Curve | Medium | Gentle |

> **Note**: Async/await is syntactic sugar over Promises. Under the hood, it's still using Promises.

## Common Patterns

### Sequential Calls

\`\`\`javascript
async function loadUserData(userId) {
    const user = await fetchUser(userId);
    const posts = await fetchPosts(userId);
    const comments = await fetchComments(user.id);
    
    return { user, posts, comments };
}
\`\`\`

### Parallel Calls

\`\`\`javascript
async function loadDataFaster(userId) {
    // Execute all at once (not sequentially)
    const [user, posts, comments] = await Promise.all([
        fetchUser(userId),
        fetchPosts(userId),
        fetchComments(userId)
    ]);
    
    return { user, posts, comments };
}
\`\`\`

## Summary

- ✅ Use \`async\` to declare async functions
- ✅ Use \`await\` to pause until promise resolves
- ✅ Use \`try/catch\` for error handling
- ✅ Avoid mistakenly using \`async\` without \`await\`
  `;

  return <MarkdownRenderer content={markdown} />;
}

// ============================================================
// EXAMPLE 6: Product Documentation with Mixed Content
// ============================================================

export function ProductDocumentation() {
  const markdown = `
# Product Documentation

## Features

- **Real-time Collaboration**: Work together simultaneously
- **Version Control**: Track all changes with timestamps
- **Export Options**: PDF, HTML, Markdown formats
- **Syntax Highlighting**: 50+ programming languages
- **Mobile Responsive**: Works on all devices

## Getting Started

\`\`\`bash
npm install our-package
\`\`\`

\`\`\`javascript
import { Editor } from 'our-package';

export default function App() {
    return <Editor theme="dark" />;
}
\`\`\`

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| theme | string | 'light' | UI theme (light/dark) |
| language | string | 'javascript' | Default code language |
| readonly | boolean | false | Read-only mode |
| fontSize | number | 14 | Font size in pixels |

## Keyboard Shortcuts

\`\`\`
Ctrl+S (Cmd+S)  → Save
Ctrl+Z (Cmd+Z)  → Undo
Ctrl+Y (Cmd+Y)  → Redo
Ctrl+F (Cmd+F)  → Find
Tab              → Indent
Shift+Tab        → Outdent
\`\`\`

## Advanced Usage

\`\`\`javascript
import { Editor, highlight } from 'our-package';

const handleSave = (content) => {
    console.log('Saving:', content);
    // Send to server
};

<Editor onSave={handleSave} defaultLanguage="python" />
\`\`\`

---

**Need help?** Check our [FAQ](#) or [Community Forum](#).
  `;

  return <MarkdownRenderer content={markdown} />;
}

// ============================================================
// EXPORT ALL EXAMPLES
// ============================================================

export const EXAMPLES = {
  JavaDocExample,
  MultiLanguageTutorial,
  StudentAssignment,
  APIDocumentation,
  TechnicalBlogPost,
  ProductDocumentation,
};
