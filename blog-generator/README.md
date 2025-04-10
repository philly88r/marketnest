# Blog Generator for Digital Marketing Agency Website

This tool helps you automatically generate SEO-optimized blog posts for your digital marketing agency website by leveraging AI to research topics, gather information, and create detailed outlines.

## Features

- Web research using Browser-Use automation
- AI-powered content generation
- SEO optimization with keywords and meta descriptions
- Automatic React component generation for your website
- User-friendly web interface

## Prerequisites

- Node.js (v14 or higher)
- Python 3.11 or higher
- OpenAI API key (or other supported LLM provider)

## Installation

1. Install Node.js dependencies:

```bash
cd blog-generator
npm install
```

2. Install Python dependencies:

```bash
pip install browser-use langchain-openai python-dotenv
```

3. Install Playwright:

```bash
playwright install chromium
```

4. Create a `.env` file based on the `.env.example` file:

```bash
cp .env.example .env
```

5. Add your API keys to the `.env` file:

```
OPENAI_API_KEY=your_openai_api_key_here
```

## Usage

### Using the Web Interface

1. Start the web interface:

```bash
npm start
```

2. Open your browser and navigate to `http://localhost:3001`

3. Fill in the form with:
   - Blog topic or title
   - Keywords (comma-separated)
   - Target URL (optional)

4. Click "Generate Blog Post" and wait for the process to complete

### Using the Command Line

Generate a blog post with a specific topic and keywords:

```bash
node generate.js "Digital Marketing Trends 2025" "SEO,content marketing,social media"
```

## How It Works

1. **Research Phase**: The tool uses Browser-Use to search the web for information about your topic
2. **Content Generation**: AI analyzes the gathered information and creates a detailed outline
3. **React Component Creation**: The tool generates a React component for your website
4. **Integration**: The generated blog post is saved to your project's blog directory

## Integrating with Your Website

The generated blog posts are saved as React components in the `src/content/blog` directory. To display them on your website, you'll need to:

1. Import the generated blog components in your `App.tsx` file
2. Add routes for each blog post

Example:

```tsx
// In App.tsx
import BlogPage from './pages/BlogPage';
import DigitalMarketingTrends2025 from './content/blog/digital-marketing-trends-2025';

// Inside your Routes component
<Route path="/blog/digital-marketing-trends-2025" element={<DigitalMarketingTrends2025 />} />
```

## Customization

You can customize the blog post template by modifying the `generateBlogPostFromOutline` function in `generate.js`.

## Troubleshooting

- **API Key Issues**: Make sure your API keys are correctly set in the `.env` file
- **Browser Automation Problems**: If you encounter issues with Browser-Use, try running with `headless: false` to see what's happening
- **Content Generation Failures**: Check the Python script output for detailed error messages

## License

This project is licensed under the MIT License.
