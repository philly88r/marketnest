require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { marked } = require('marked');
const cheerio = require('cheerio');

// Gemini API key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('Missing GEMINI_API_KEY in environment variables');
  process.exit(1);
}

// Create output directory if it doesn't exist
const outputDir = process.env.BLOG_OUTPUT_DIR || path.join(__dirname, '../src/content/blog');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
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
 * Search the web for information about a topic
 * @param {string} topic - The topic to search for
 * @returns {Promise<string>} - The search results
 */
async function searchWeb(topic) {
  try {
    const searchPrompt = `
    I need to research the topic "${topic}" for a blog post. 
    Please provide me with the following information:
    1. Key facts and statistics about ${topic}
    2. Current trends related to ${topic}
    3. Expert opinions on ${topic}
    4. Best practices for ${topic}
    5. Common challenges and solutions related to ${topic}
    
    Format your response as a structured research document with clear sections.
    `;
    
    return await generateWithGemini(searchPrompt);
  } catch (error) {
    console.error('Error searching web:', error);
    throw error;
  }
}

/**
 * Generate a blog outline based on research
 * @param {string} topic - The blog topic
 * @param {string} research - The research results
 * @param {string[]} keywords - Keywords to include
 * @returns {Promise<Object>} - The blog outline
 */
async function generateBlogOutline(topic, research, keywords = []) {
  try {
    const outlinePrompt = `
    Based on this research about "${topic}":
    
    ${research}
    
    Create a detailed outline for a comprehensive blog post. Include the following:
    
    1. A catchy title that includes the main keyword
    2. A meta description for SEO (150-160 characters)
    3. 5-7 main sections with 2-3 subsections each
    4. Key points to cover in each section
    5. A compelling introduction paragraph
    6. A strong conclusion paragraph
    7. A list of relevant keywords (include these specific keywords: ${keywords.join(', ')})
    
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
    
    Ensure the JSON is valid and properly formatted.
    `;
    
    const outlineResponse = await generateWithGemini(outlinePrompt);
    
    // Extract JSON from the response
    const jsonMatch = outlineResponse.match(/```json\n([\s\S]*?)\n```/) || 
                     outlineResponse.match(/```\n([\s\S]*?)\n```/) || 
                     outlineResponse.match(/{[\s\S]*}/);
                     
    const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : outlineResponse;
    
    try {
      return JSON.parse(jsonString.trim());
    } catch (e) {
      console.error('Error parsing JSON from Gemini response:', e);
      console.log('Raw response:', outlineResponse);
      throw new Error('Failed to parse blog outline JSON');
    }
  } catch (error) {
    console.error('Error generating blog outline:', error);
    throw error;
  }
}

/**
 * Generate content for each section of the blog post
 * @param {string} title - The blog title
 * @param {Object} outline - The blog outline
 * @returns {Promise<Object>} - The complete blog content
 */
async function generateBlogContent(title, outline) {
  try {
    const contentPrompt = `
    Write detailed content for a blog post titled "${title}" based on this outline:
    
    ${JSON.stringify(outline, null, 2)}
    
    For each section and subsection, write 2-3 paragraphs of engaging, informative content.
    Include relevant examples, statistics, and actionable advice.
    Maintain a professional but conversational tone throughout.
    
    Format your response as a JSON object with the following structure:
    {
      "sections": [
        {
          "title": "Section title",
          "content": "Section content",
          "subsections": [
            {
              "title": "Subsection title",
              "content": "Subsection content"
            },
            ...
          ]
        },
        ...
      ]
    }
    
    Ensure the JSON is valid and properly formatted.
    `;
    
    const contentResponse = await generateWithGemini(contentPrompt);
    
    // Extract JSON from the response
    const jsonMatch = contentResponse.match(/```json\n([\s\S]*?)\n```/) || 
                     contentResponse.match(/```\n([\s\S]*?)\n```/) || 
                     contentResponse.match(/{[\s\S]*}/);
                     
    const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : contentResponse;
    
    try {
      return JSON.parse(jsonString.trim());
    } catch (e) {
      console.error('Error parsing JSON from Gemini response:', e);
      console.log('Raw response:', contentResponse);
      throw new Error('Failed to parse blog content JSON');
    }
  } catch (error) {
    console.error('Error generating blog content:', error);
    throw error;
  }
}

/**
 * Generate a complete blog post
 * @param {string} topic - The blog topic
 * @param {string[]} keywords - Keywords to include
 * @returns {Promise<Object>} - The generated blog post
 */
async function generateBlogPost(topic, keywords = []) {
  try {
    console.log(`Generating blog post for topic: ${topic}`);
    console.log('Keywords:', keywords.join(', '));
    
    console.log('Researching topic...');
    const research = await searchWeb(topic);
    
    console.log('Generating blog outline...');
    const outline = await generateBlogOutline(topic, research, keywords);
    
    console.log('Generating blog content...');
    const content = await generateBlogContent(outline.title, outline);
    
    // Combine outline and content
    const blogPost = {
      ...outline,
      content: content.sections
    };
    
    // Generate a slug from the title
    const slug = outline.title
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '-');
    
    // Create the blog post file
    const blogComponent = generateBlogComponent(blogPost, slug);
    
    // Save the blog post
    const fileName = `${slug}.tsx`;
    const filePath = path.join(outputDir, fileName);
    fs.writeFileSync(filePath, blogComponent);
    
    console.log(`Blog post generated and saved to ${filePath}`);
    return { slug, filePath, blogPost };
  } catch (error) {
    console.error('Error generating blog post:', error);
    throw error;
  }
}

/**
 * Generate a React component for the blog post
 * @param {Object} blogPost - The blog post data
 * @param {string} slug - The blog post slug
 * @returns {string} - The React component code
 */
function generateBlogComponent(blogPost, slug) {
  const { title, meta_description, keywords, introduction, conclusion, content } = blogPost;
  
  // Generate the blog post content
  const blogPostContent = `
import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import Header from '../components/Header';
import Footer from '../components/Footer';

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

const ${slug.replace(/-/g, '_')}BlogPage = () => {
  return (
    <>
      <Helmet>
        <title>${title}</title>
        <meta name="description" content="${meta_description}" />
        <meta name="keywords" content="${keywords.join(', ')}" />
      </Helmet>
      
      <Header />
      <PageContainer>
        <BlogContainer>
          <BlogTitle>${title}</BlogTitle>
          
          <KeywordsList>
            ${keywords.map(keyword => `<Keyword>${keyword}</Keyword>`).join('\n            ')}
          </KeywordsList>
          
          <Paragraph>${introduction}</Paragraph>
          
          ${content.map(section => `
          <BlogSection>
            <SectionTitle>${section.title}</SectionTitle>
            <Paragraph>${section.content}</Paragraph>
            
            ${section.subsections.map((subsection, index) => `
            <SubsectionTitle>${subsection.title}</SubsectionTitle>
            <Paragraph>${subsection.content}</Paragraph>
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

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Please provide a topic for the blog post');
    console.error('Usage: node gemini-generator.js "Blog Topic" [keyword1,keyword2,...]');
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

module.exports = { generateBlogPost, generateWithGemini };
