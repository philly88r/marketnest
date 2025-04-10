require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { marked } = require('marked');
const cheerio = require('cheerio');
const https = require('https');

// Check if required environment variables are set
const requiredEnvVars = ['GEMINI_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error('Please create a .env file based on .env.example');
  process.exit(1);
}

// Create output directory if it doesn't exist
const outputDir = process.env.BLOG_OUTPUT_DIR || path.join(__dirname, '../src/content/blog');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Function to generate a blog post using browser-use
async function generateBlogPost(topic, keywords = []) {
  console.log(`Generating blog post for topic: ${topic}`);
  console.log('Keywords:', keywords.join(', '));
  
  // Create a Python script that will use browser-use to search for the topic and generate content
  const pythonScript = `
import asyncio
import os
import json
import google.generativeai as genai
from browser_use import Agent
from dotenv import load_dotenv

load_dotenv()

async def main():
    # Define the research task
    research_task = f"""
    Research the topic: "${topic}"
    
    Follow these steps:
    1. Search for recent and authoritative information about this topic
    2. Gather key facts, statistics, and insights
    3. Find different perspectives and approaches
    4. Identify best practices and industry trends
    5. Create a detailed outline for a comprehensive blog post
    6. Format the final output as JSON with the following structure:
       {
         "title": "Suggested blog title",
         "meta_description": "SEO-friendly meta description",
         "keywords": ["keyword1", "keyword2", ...],
         "outline": [
           {
             "section": "Section title",
             "subsections": ["Subsection 1", "Subsection 2", ...],
             "key_points": ["Key point 1", "Key point 2", ...]
           },
           ...
         ],
         "introduction": "Suggested introduction paragraph",
         "conclusion": "Suggested conclusion paragraph",
         "references": ["URL1", "URL2", ...]
       }
    
    Additional keywords to focus on: ${', '.join(keywords)}
    """
    
    # Configure the Gemini API
    genai.configure(api_key=os.environ['GEMINI_API_KEY'])
    
    # Create a Gemini model instance
    model = genai.GenerativeModel('gemini-2.0-flash')
    
    # Initialize the agent with the research task
    agent = Agent(
        task=research_task,
        llm=model,
        browser_type="chromium",
        headless=False,  # Set to True for production
        enable_vision=True,
    )
    
    # Run the agent
    result = await agent.run()
    
    # Save the result to a file
    with open("blog_outline.json", "w") as f:
        f.write(result)
    
    print("Blog outline generated and saved to blog_outline.json")

if __name__ == "__main__":
    asyncio.run(main())
  `;
  
  // Write the Python script to a file
  fs.writeFileSync('generate_blog.py', pythonScript);
  
  // Execute the Python script
  return new Promise((resolve, reject) => {
    console.log('Running browser-use to generate blog content...');
    exec('python generate_blog.py', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing Python script: ${error.message}`);
        reject(error);
        return;
      }
      
      console.log(stdout);
      
      // Read the generated JSON file
      try {
        const blogOutline = JSON.parse(fs.readFileSync('blog_outline.json', 'utf8'));
        
        // Generate a slug from the title
        const slug = blogOutline.title
          .toLowerCase()
          .replace(/[^\w\s]/g, '')
          .replace(/\s+/g, '-');
        
        // Create the blog post file
        const blogPost = generateBlogPostFromOutline(blogOutline, slug);
        
        // Save the blog post
        const fileName = `${slug}.tsx`;
        const filePath = path.join(outputDir, fileName);
        fs.writeFileSync(filePath, blogPost);
        
        console.log(`Blog post generated and saved to ${filePath}`);
        resolve({ slug, filePath, outline: blogOutline });
      } catch (err) {
        console.error('Error processing generated content:', err);
        reject(err);
      }
    });
  });
}

// Function to generate content using Gemini API
async function generateContentWithGemini(prompt) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }]
    });
    
    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };
    
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          if (parsedData.candidates && parsedData.candidates[0] && parsedData.candidates[0].content) {
            const generatedText = parsedData.candidates[0].content.parts[0].text;
            resolve(generatedText);
          } else {
            reject(new Error('Invalid response format from Gemini API'));
          }
        } catch (error) {
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(data);
    req.end();
  });
}

// Function to generate a React component from the blog outline
function generateBlogPostFromOutline(outline, slug) {
  const { title, meta_description, keywords, introduction, conclusion, outline: sections, references } = outline;
  
  // Generate the blog post content
  const blogPostContent = `
import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';

// Styled components
const BlogContainer = styled.div\`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  color: white;
\`;

const BlogTitle = styled.h1\`
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  background: linear-gradient(90deg, #0df9b6 0%, #de681d 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
\`;

const BlogSection = styled.section\`
  margin-bottom: 2rem;
\`;

const SectionTitle = styled.h2\`
  font-size: 1.8rem;
  margin-bottom: 1rem;
  background: linear-gradient(90deg, #0df9b6 0%, #de681d 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
\`;

const SubsectionTitle = styled.h3\`
  font-size: 1.4rem;
  margin-bottom: 0.8rem;
  color: #ffffff;
\`;

const Paragraph = styled.p\`
  margin-bottom: 1rem;
  line-height: 1.6;
\`;

const ReferencesList = styled.ul\`
  margin-top: 2rem;
  padding-left: 1.5rem;
\`;

const ReferenceItem = styled.li\`
  margin-bottom: 0.5rem;
\`;

const KeywordsList = styled.div\`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
\`;

const Keyword = styled.span\`
  background: rgba(13, 249, 182, 0.1);
  border: 1px solid rgba(13, 249, 182, 0.3);
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.8rem;
\`;

const ${slug.replace(/-/g, '_')}BlogPage = () => {
  return (
    <BlogContainer>
      <Helmet>
        <title>${title}</title>
        <meta name="description" content="${meta_description}" />
        <meta name="keywords" content="${keywords.join(', ')}" />
      </Helmet>
      
      <BlogTitle>${title}</BlogTitle>
      
      <KeywordsList>
        ${keywords.map(keyword => `<Keyword>${keyword}</Keyword>`).join('\n        ')}
      </KeywordsList>
      
      <Paragraph>${introduction}</Paragraph>
      
      ${sections.map(section => `
      <BlogSection>
        <SectionTitle>${section.section}</SectionTitle>
        ${section.subsections.map((subsection, index) => `
        <SubsectionTitle>${subsection}</SubsectionTitle>
        <Paragraph>Content for ${subsection} will go here, covering key points like: ${section.key_points[index] || 'Various aspects of this topic'}.</Paragraph>
        `).join('')}
      </BlogSection>
      `).join('')}
      
      <BlogSection>
        <SectionTitle>Conclusion</SectionTitle>
        <Paragraph>${conclusion}</Paragraph>
      </BlogSection>
      
      <BlogSection>
        <SectionTitle>References</SectionTitle>
        <ReferencesList>
          ${references.map(reference => `<ReferenceItem><a href="${reference}" target="_blank" rel="noopener noreferrer">${reference}</a></ReferenceItem>`).join('\n          ')}
        </ReferencesList>
      </BlogSection>
    </BlogContainer>
  );
};

export default ${slug.replace(/-/g, '_')}BlogPage;
`;

  return blogPostContent;
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Please provide a topic for the blog post');
    console.error('Usage: node generate.js "Blog Topic" [keyword1,keyword2,...]');
    process.exit(1);
  }
  
  const topic = args[0];
  const keywords = args[1] ? args[1].split(',') : [];
  
  generateBlogPost(topic, keywords)
    .then(() => {
      console.log('Blog post generation completed successfully');
    })
    .catch(err => {
      console.error('Error generating blog post:', err);
      process.exit(1);
    });
}

module.exports = { generateBlogPost };
