import { DOMParser } from 'xmldom';
import React from 'react';

interface ParsedContent {
  navigationItems?: string[];
  buttonTexts?: string[];
  products?: Array<{
    name: string;
    price: string;
  }>;
  images?: Array<{
    src: string;
    alt: string;
    width?: number;
    height?: number;
  }>;
  headings?: string[];
  paragraphs?: string[];
}

/**
 * Parse HTML content into structured data
 * @param htmlContent Raw HTML content
 * @returns Structured data extracted from HTML
 */
export const parseHtmlContent = (htmlContent: string): ParsedContent => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  
  const result: ParsedContent = {
    navigationItems: [],
    buttonTexts: [],
    products: [],
    images: [],
    headings: [],
    paragraphs: []
  };

  // Extract navigation items
  const navItems = doc.getElementsByTagName('nav');
  for (let i = 0; i < navItems.length; i++) {
    const links = navItems[i].getElementsByTagName('a');
    for (let j = 0; j < links.length; j++) {
      const text = links[j].textContent?.trim();
      if (text && !result.navigationItems?.includes(text)) {
        result.navigationItems?.push(text);
      }
    }
  }

  // Extract buttons
  const buttons = doc.getElementsByTagName('button');
  for (let i = 0; i < buttons.length; i++) {
    const text = buttons[i].textContent?.trim();
    if (text && !result.buttonTexts?.includes(text)) {
      result.buttonTexts?.push(text);
    }
  }

  // Extract products
  const productElements = doc.getElementsByClassName('product');
  for (let i = 0; i < productElements.length; i++) {
    const nameElement = productElements[i].getElementsByClassName('product-title')[0];
    const priceElement = productElements[i].getElementsByClassName('product-price')[0];
    
    if (nameElement && priceElement) {
      result.products?.push({
        name: nameElement.textContent?.trim() || '',
        price: priceElement.textContent?.trim() || ''
      });
    }
  }

  // Extract images
  const images = doc.getElementsByTagName('img');
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    result.images?.push({
      src: img.getAttribute('src') || '',
      alt: img.getAttribute('alt') || '',
      width: img.getAttribute('width') ? parseInt(img.getAttribute('width') || '0') : undefined,
      height: img.getAttribute('height') ? parseInt(img.getAttribute('height') || '0') : undefined
    });
  }

  // Extract headings
  for (let i = 1; i <= 6; i++) {
    const headings = doc.getElementsByTagName(`h${i}`);
    for (let j = 0; j < headings.length; j++) {
      const text = headings[j].textContent?.trim();
      if (text) {
        result.headings?.push(text);
      }
    }
  }

  // Extract paragraphs
  const paragraphs = doc.getElementsByTagName('p');
  for (let i = 0; i < paragraphs.length; i++) {
    const text = paragraphs[i].textContent?.trim();
    if (text) {
      result.paragraphs?.push(text);
    }
  }

  return result;
};

/**
 * Parse JSON content that contains HTML elements
 * @param jsonContent JSON string containing HTML elements
 * @returns Structured data extracted from the JSON
 */
export const parseJsonWithHtml = (jsonContent: string): ParsedContent => {
  try {
    const parsedJson = JSON.parse(jsonContent);
    
    // Handle navigation items that might contain HTML
    if (parsedJson.navigationItems) {
      const cleanedNavItems = parsedJson.navigationItems.map((item: string) => {
        // If the item contains HTML tags, extract text content
        if (item.includes('<') && item.includes('>')) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(item, 'text/html');
          return doc.documentElement.textContent?.trim() || item;
        }
        return item;
      });
      parsedJson.navigationItems = cleanedNavItems;
    }
    
    return parsedJson;
  } catch (error) {
    console.error('Error parsing JSON with HTML:', error);
    return {};
  }
};

/**
 * Extract images from HTML content
 * @param htmlContent Raw HTML content
 * @returns Array of image objects with src, alt, width, height
 */
export const extractImagesFromHtml = (htmlContent: string): Array<{
  src: string;
  alt: string;
  width?: number;
  height?: number;
}> => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  
  const images: Array<{
    src: string;
    alt: string;
    width?: number;
    height?: number;
  }> = [];
  
  const imgElements = doc.getElementsByTagName('img');
  for (let i = 0; i < imgElements.length; i++) {
    const img = imgElements[i];
    images.push({
      src: img.getAttribute('src') || '',
      alt: img.getAttribute('alt') || '',
      width: img.getAttribute('width') ? parseInt(img.getAttribute('width') || '0') : undefined,
      height: img.getAttribute('height') ? parseInt(img.getAttribute('height') || '0') : undefined
    });
  }
  
  return images;
};

/**
 * Analyze HTML content for SEO issues
 * @param htmlContent Raw HTML content
 * @returns Object with SEO issues and recommendations
 */
export const analyzeSeoIssues = (htmlContent: string): {
  issues: Array<{
    title: string;
    description: string;
    severity: 'high' | 'medium' | 'low';
    impact: string;
    recommendation: string;
  }>;
  score: number;
} => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const issues: Array<{
    title: string;
    description: string;
    severity: 'high' | 'medium' | 'low';
    impact: string;
    recommendation: string;
  }> = [];
  
  // Check for missing alt attributes on images
  const images = doc.getElementsByTagName('img');
  const totalImages = images.length;
  let imagesWithoutAlt = 0;
  
  for (let i = 0; i < images.length; i++) {
    if (!images[i].hasAttribute('alt') || images[i].getAttribute('alt') === '') {
      imagesWithoutAlt++;
    }
  }
  
  if (imagesWithoutAlt > 0) {
    issues.push({
      title: 'Missing alt attributes on images',
      description: `${imagesWithoutAlt} out of ${totalImages} images are missing alt attributes.`,
      severity: imagesWithoutAlt > totalImages / 2 ? 'high' : 'medium',
      impact: 'Reduces accessibility and SEO value of images',
      recommendation: 'Add descriptive alt attributes to all images'
    });
  }
  
  // Check for heading structure
  const h1Elements = doc.getElementsByTagName('h1');
  const h1Count = h1Elements.length;
  
  if (h1Count === 0) {
    issues.push({
      title: 'Missing H1 heading',
      description: 'The page does not have an H1 heading.',
      severity: 'high',
      impact: 'Negatively impacts SEO and content hierarchy',
      recommendation: 'Add a single H1 heading that describes the main topic of the page'
    });
  } else if (h1Count > 1) {
    issues.push({
      title: 'Multiple H1 headings',
      description: `The page has ${h1Count} H1 headings.`,
      severity: 'medium',
      impact: 'May confuse search engines about the main topic of the page',
      recommendation: 'Use only one H1 heading per page'
    });
  }
  
  // Check for empty links
  const links = doc.getElementsByTagName('a');
  let emptyLinks = 0;
  
  for (let i = 0; i < links.length; i++) {
    if (links[i].textContent?.trim() === '' && links[i].getElementsByTagName('img').length === 0) {
      emptyLinks++;
    }
  }
  
  if (emptyLinks > 0) {
    issues.push({
      title: 'Empty links',
      description: `The page has ${emptyLinks} links without text or images.`,
      severity: 'medium',
      impact: 'Reduces accessibility and SEO value of links',
      recommendation: 'Add descriptive text to all links'
    });
  }
  
  // Calculate score based on issues
  let score = 100;
  issues.forEach(issue => {
    if (issue.severity === 'high') score -= 15;
    else if (issue.severity === 'medium') score -= 10;
    else score -= 5;
  });
  
  // Ensure score is between 0 and 100
  score = Math.max(0, Math.min(100, score));
  
  return {
    issues,
    score
  };
};

export default {
  parseHtmlContent,
  parseJsonWithHtml,
  extractImagesFromHtml,
  analyzeSeoIssues
};
