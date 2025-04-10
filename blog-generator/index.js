const express = require('express');
const path = require('path');
const fs = require('fs');
const { generateBlogPost } = require('./gemini-generator');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Create HTML interface
const htmlInterface = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blog Generator - Digital Marketing Agency</title>
  <style>
    :root {
      --primary-color: #0df9b6;
      --secondary-color: #de681d;
      --gradient: linear-gradient(90deg, var(--primary-color) 0%, var(--secondary-color) 100%);
      --dark-bg: #121212;
      --card-bg: #1e1e1e;
    }
    
    body {
      font-family: 'DM Sans', sans-serif;
      background-color: var(--dark-bg);
      color: white;
      margin: 0;
      padding: 0;
      min-height: 100vh;
    }
    
    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem;
    }
    
    h1 {
      background: var(--gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-size: 2.5rem;
      margin-bottom: 1.5rem;
    }
    
    .card {
      background-color: var(--card-bg);
      border-radius: 8px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .form-group {
      margin-bottom: 1.5rem;
    }
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    
    input, textarea, select {
      width: 100%;
      padding: 0.75rem;
      border-radius: 4px;
      border: 1px solid #333;
      background-color: #2a2a2a;
      color: white;
      font-family: inherit;
    }
    
    textarea {
      min-height: 100px;
      resize: vertical;
    }
    
    button {
      background: var(--gradient);
      border: none;
      color: black;
      font-weight: bold;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(13, 249, 182, 0.3);
    }
    
    .status {
      margin-top: 1rem;
      padding: 1rem;
      border-radius: 4px;
    }
    
    .status.success {
      background-color: rgba(13, 249, 182, 0.1);
      border: 1px solid rgba(13, 249, 182, 0.3);
    }
    
    .status.error {
      background-color: rgba(255, 66, 66, 0.1);
      border: 1px solid rgba(255, 66, 66, 0.3);
    }
    
    .status.loading {
      background-color: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
    
    .blog-list {
      margin-top: 2rem;
    }
    
    .blog-item {
      background-color: var(--card-bg);
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .blog-item-title {
      font-weight: 500;
    }
    
    .blog-item-actions a {
      color: var(--primary-color);
      text-decoration: none;
      margin-left: 1rem;
    }
    
    .tag-container {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 1rem;
    }
    
    .tag {
      background: rgba(13, 249, 182, 0.1);
      border: 1px solid rgba(13, 249, 182, 0.3);
      padding: 0.3rem 0.6rem;
      border-radius: 4px;
      font-size: 0.8rem;
    }
    
    .loading-spinner {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: var(--primary-color);
      animation: spin 1s ease-in-out infinite;
      margin-right: 10px;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Blog Generator - Digital Marketing Agency</h1>
    
    <div class="card">
      <h2>Generate New Blog Post with Gemini AI</h2>
      <form id="blogForm">
        <div class="form-group">
          <label for="topic">Blog Topic or Title</label>
          <input type="text" id="topic" name="topic" required placeholder="e.g., 'Top Digital Marketing Trends for 2025'">
        </div>
        
        <div class="form-group">
          <label for="keywords">Keywords (comma separated)</label>
          <input type="text" id="keywords" name="keywords" placeholder="e.g., digital marketing, SEO, social media">
        </div>
        
        <div class="form-group">
          <label for="url">Target URL (optional)</label>
          <input type="text" id="url" name="url" placeholder="e.g., /blog/digital-marketing-trends">
        </div>
        
        <button type="submit" id="generateBtn">Generate Blog Post with Gemini</button>
      </form>
      
      <div id="status" class="status" style="display: none;"></div>
    </div>
    
    <div class="card">
      <h2>Generated Blog Posts</h2>
      <div id="blogList" class="blog-list">
        <!-- Blog posts will be listed here -->
        <div class="blog-item">
          <div>
            <div class="blog-item-title">Loading blog posts...</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const blogForm = document.getElementById('blogForm');
      const statusDiv = document.getElementById('status');
      const blogList = document.getElementById('blogList');
      const generateBtn = document.getElementById('generateBtn');
      
      // Load existing blog posts
      fetchBlogPosts();
      
      // Handle form submission
      blogForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const topic = document.getElementById('topic').value;
        const keywords = document.getElementById('keywords').value;
        const url = document.getElementById('url').value;
        
        // Show loading status
        statusDiv.className = 'status loading';
        statusDiv.innerHTML = '<div class="loading-spinner"></div> Generating blog post... This may take a few minutes.';
        statusDiv.style.display = 'block';
        generateBtn.disabled = true;
        
        try {
          const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ topic, keywords, url })
          });
          
          const data = await response.json();
          
          if (response.ok) {
            statusDiv.className = 'status success';
            statusDiv.textContent = 'Blog post generated successfully!';
            fetchBlogPosts(); // Refresh the blog list
          } else {
            statusDiv.className = 'status error';
            statusDiv.textContent = data.error || 'An error occurred while generating the blog post.';
          }
        } catch (error) {
          statusDiv.className = 'status error';
          statusDiv.textContent = 'An error occurred while generating the blog post.';
          console.error('Error:', error);
        } finally {
          generateBtn.disabled = false;
        }
      });
      
      // Fetch and display blog posts
      async function fetchBlogPosts() {
        try {
          const response = await fetch('/api/blogs');
          const data = await response.json();
          
          if (response.ok) {
            if (data.blogs.length === 0) {
              blogList.innerHTML = '<div class="blog-item"><div class="blog-item-title">No blog posts generated yet.</div></div>';
            } else {
              blogList.innerHTML = data.blogs.map(blog => {
                return `
                <div class="blog-item">
                  <div>
                    <div class="blog-item-title">${blog.title}</div>
                    <div class="tag-container">
                      ${blog.keywords.slice(0, 3).map(kw => `<span class="tag">${kw}</span>`).join('')}
                    </div>
                  </div>
                  <div class="blog-item-actions">
                    <a href="/api/blogs/${blog.slug}" target="_blank">View</a>
                    <a href="/api/blogs/${blog.slug}/edit">Edit</a>
                  </div>
                </div>
                `;
              }).join('');
            }
          } else {
            blogList.innerHTML = '<div class="blog-item"><div class="blog-item-title">Error loading blog posts.</div></div>';
          }
        } catch (error) {
          blogList.innerHTML = '<div class="blog-item"><div class="blog-item-title">Error loading blog posts.</div></div>';
          console.error('Error:', error);
        }
      }
    });
  </script>
</body>
</html>
`;

// Write the HTML interface to the public directory
fs.writeFileSync(path.join(publicDir, 'index.html'), htmlInterface);

// API routes
app.post('/api/generate', async (req, res) => {
  try {
    const { topic, keywords, url } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }
    
    const keywordsArray = keywords ? keywords.split(',').map(k => k.trim()) : [];
    
    // Generate the blog post
    const result = await generateBlogPost(topic, keywordsArray);
    
    res.json({ 
      success: true, 
      message: 'Blog post generated successfully',
      blog: {
        slug: result.slug,
        filePath: result.filePath,
        title: result.outline.title
      }
    });
  } catch (error) {
    console.error('Error generating blog post:', error);
    res.status(500).json({ error: 'Failed to generate blog post' });
  }
});

// Get all blog posts
app.get('/api/blogs', (req, res) => {
  try {
    const outputDir = process.env.BLOG_OUTPUT_DIR || path.join(__dirname, '../src/content/blog');
    const files = fs.readdirSync(outputDir).filter(file => file.endsWith('.tsx'));
    
    const blogs = files.map(file => {
      const filePath = path.join(outputDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Extract title from the content
      const titleMatch = content.match(/<title>(.*?)<\/title>/);
      const title = titleMatch ? titleMatch[1] : file.replace('.tsx', '');
      
      // Extract keywords from the content
      const keywordsMatch = content.match(/<meta name="keywords" content="(.*?)" \/>/);
      const keywords = keywordsMatch ? keywordsMatch[1].split(', ') : [];
      
      return {
        slug: file.replace('.tsx', ''),
        title,
        keywords
      };
    });
    
    res.json({ blogs });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Blog generator server running at http://localhost:${PORT}`);
});
