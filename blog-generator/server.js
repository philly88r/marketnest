require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { exec } = require('child_process');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Create output directories if they don't exist
const outputDir = process.env.BLOG_OUTPUT_DIR || path.join(__dirname, '../src/content/blog');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const imageOutputDir = process.env.IMAGE_OUTPUT_DIR || path.join(__dirname, '../public/images/blog');
if (!fs.existsSync(imageOutputDir)) {
  fs.mkdirSync(imageOutputDir, { recursive: true });
}

// Check if Gemini API key is available
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('Missing GEMINI_API_KEY in environment variables');
  process.exit(1);
}

/**
 * Generate content using Gemini API
 * @param {string} prompt - The prompt to send to Gemini
 * @returns {Promise<string>} - The generated content
 */
async function generateWithGemini(prompt) {
  try {
    const response = await axios({
      method: 'post',
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        contents: [{
          parts: [{ text: prompt }]
        }]
      }
    });

    if (response.data && response.data.candidates && response.data.candidates[0] && response.data.candidates[0].content) {
      return response.data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Invalid response format from Gemini API');
    }
  } catch (error) {
    console.error('Error generating content with Gemini:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

/**
 * Generate an image using fal-ai/flux/schnell model
 * @param {string} prompt - The image prompt
 * @param {string} filename - The output filename
 * @returns {Promise<string>} - The path to the generated image
 */
async function generateImage(prompt, filename) {
  return new Promise((resolve, reject) => {
    console.log(`Generating image for prompt: ${prompt}`);
    
    // Run the Python script to generate the image
    exec(`python generate_image.py "${prompt}" ${filename}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error generating image: ${error.message}`);
        console.error(stderr);
        reject(error);
        return;
      }
      
      try {
        // Parse the JSON output from the Python script
        const result = JSON.parse(stdout);
        resolve(result.image_path);
      } catch (e) {
        console.error('Error parsing image generation result:', e);
        console.error('Raw output:', stdout);
        reject(e);
      }
    });
  });
}

/**
 * Generate a blog post with an image
 * @param {string} topic - The blog topic
 * @param {string[]} keywords - Keywords to include
 * @returns {Promise<Object>} - The generated blog post
 */
async function generateBlogPost(topic, keywords = []) {
  try {
    console.log(`Generating blog post for topic: ${topic}`);
    console.log('Keywords:', keywords.join(', '));
    
    // Generate blog outline
    console.log('Generating blog outline...');
    const outlinePrompt = `
    Create a detailed outline for a blog post about "${topic}".
    Include the following:
    
    1. A catchy title that includes the main keyword
    2. A meta description for SEO (150-160 characters)
    3. 5-7 main sections with 2-3 subsections each
    4. A compelling introduction paragraph
    5. A strong conclusion paragraph
    6. A list of relevant keywords (include these specific keywords if appropriate: ${keywords.join(', ')})
    
    Format your response as a JSON object with the following structure:
    {
      "title": "Your suggested title",
      "meta_description": "Your meta description",
      "keywords": ["keyword1", "keyword2", ...],
      "outline": [
        {
          "section": "Section title",
          "subsections": ["Subsection 1", "Subsection 2", ...],
          "key_points": ["Key point 1", "Key point 2", ...]
        },
        ...
      ],
      "introduction": "Introduction paragraph",
      "conclusion": "Conclusion paragraph"
    }
    `;
    
    const outlineResponse = await generateWithGemini(outlinePrompt);
    
    // Extract JSON from the response
    const jsonMatch = outlineResponse.match(/```json\n([\s\S]*?)\n```/) || 
                     outlineResponse.match(/```\n([\s\S]*?)\n```/) || 
                     outlineResponse.match(/{[\s\S]*}/);
                     
    const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : outlineResponse;
    
    let outline;
    try {
      outline = JSON.parse(jsonString.trim());
    } catch (e) {
      console.error('Error parsing JSON from Gemini response:', e);
      console.log('Raw response:', outlineResponse);
      throw new Error('Failed to parse blog outline JSON');
    }
    
    // Generate a slug from the title
    const slug = outline.title
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '-');
    
    // Generate an image for the blog post
    console.log('Generating featured image for the blog post...');
    let imagePath = null;
    try {
      const imagePrompt = `Professional marketing blog featured image for article titled "${outline.title}". Modern, clean design with subtle gradient background. Include visual elements related to digital marketing, technology, and business growth. Professional and polished style suitable for a digital marketing agency website.`;
      const imageFilename = `${slug}.jpg`;
      imagePath = await generateImage(imagePrompt, imageFilename);
    } catch (error) {
      console.error('Error generating image:', error);
      // Continue without an image if generation fails
    }
    
    // Create the blog post file
    const blogComponent = generateBlogComponent(outline, slug, imagePath);
    
    // Save the blog post
    const fileName = `${slug}.tsx`;
    const filePath = path.join(outputDir, fileName);
    fs.writeFileSync(filePath, blogComponent);
    
    console.log(`Blog post generated and saved to ${filePath}`);
    return { slug, filePath, title: outline.title, imagePath };
  
  } catch (error) {
    console.error('Error generating blog post:', error);
    throw error;
  }
}

/**
 * Generate a React component for the blog post
 * @param {Object} outline - The blog outline
 * @param {string} slug - The blog post slug
 * @param {string} imagePath - Path to the featured image
 * @returns {string} - The React component code
 */
function generateBlogComponent(outline, slug, imagePath = null) {
  const { title, meta_description, keywords, introduction, conclusion, outline: sections } = outline;
  
  // Generate the blog post content
  const blogPostContent = `
import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

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

const PageContainer = styled.div\`
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 80px;
\`;

const FeaturedImage = styled.div\`
  width: 100%;
  height: 400px;
  background-size: cover;
  background-position: center;
  border-radius: 8px;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    height: 250px;
  }
\`;

const ${slug.replace(/-/g, '_')}BlogPage = () => {
  return (
    <>
      <Header />
      <PageContainer>
        <BlogContainer>
          <BlogTitle>${title}</BlogTitle>
          
          <KeywordsList>
            ${keywords.map(keyword => `<Keyword>${keyword}</Keyword>`).join('\n            ')}
          </KeywordsList>
          
          ${imagePath ? `<FeaturedImage style={{ backgroundImage: \`url(${imagePath})\` }} />` : ''}
          
          <Paragraph>${introduction}</Paragraph>
          
          ${sections.map(section => `
          <BlogSection>
            <SectionTitle>${section.section}</SectionTitle>
            ${section.subsections.map((subsection, index) => `
            <SubsectionTitle>${subsection}</SubsectionTitle>
            <Paragraph>Content for ${subsection} will cover: ${section.key_points[index] || 'Various aspects of this topic'}.</Paragraph>
            `).join('')}
          </BlogSection>
          `).join('')}
          
          <BlogSection>
            <SectionTitle>Conclusion</SectionTitle>
            <Paragraph>${conclusion}</Paragraph>
          </BlogSection>
        </BlogContainer>
      </PageContainer>
      <Footer />
    </>
  );
};

export default ${slug.replace(/-/g, '_')}BlogPage;
`;

  return blogPostContent;
}

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
        title: result.title,
        imagePath: result.imagePath
      }
    });
  } catch (error) {
    console.error('Error generating blog post:', error);
    res.status(500).json({ error: 'Failed to generate blog post' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Blog generator server running at http://localhost:${PORT}`);
});
