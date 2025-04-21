// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.com/manual/examples/supabase-functions

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

/**
 * This function analyzes a website for SEO purposes
 * It fetches the website content and extracts relevant information
 */
serve(async (req) => {
  try {
    // Parse the request body
    const { url } = await req.json();
    
    // Validate required parameters
    if (!url) {
      return new Response(
        JSON.stringify({ error: "URL is required" }),
        { headers: { "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Fetch the website content
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      }
    });
    
    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch website: ${response.status} ${response.statusText}` }),
        { headers: { "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    const html = await response.text();
    
    // Parse the HTML
    const parser = new DOMParser();
    const document = parser.parseFromString(html, "text/html");
    
    if (!document) {
      return new Response(
        JSON.stringify({ error: "Failed to parse HTML" }),
        { headers: { "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    // Extract metadata
    const title = document.querySelector("title")?.textContent || "";
    const metaDescription = document.querySelector("meta[name='description']")?.getAttribute("content") || "";
    const metaKeywords = document.querySelector("meta[name='keywords']")?.getAttribute("content") || "";
    const canonicalUrl = document.querySelector("link[rel='canonical']")?.getAttribute("href") || "";
    
    // Extract headings
    const h1s = Array.from(document.querySelectorAll("h1")).map(h => h.textContent?.trim()).filter(Boolean);
    const h2s = Array.from(document.querySelectorAll("h2")).map(h => h.textContent?.trim()).filter(Boolean);
    const h3s = Array.from(document.querySelectorAll("h3")).map(h => h.textContent?.trim()).filter(Boolean);
    
    // Extract links
    const internalLinks = Array.from(document.querySelectorAll("a[href^='/'], a[href^='"+url+"']"))
      .map(a => a.getAttribute("href"))
      .filter(Boolean) as string[];
      
    const externalLinks = Array.from(document.querySelectorAll("a[href^='http']"))
      .map(a => a.getAttribute("href"))
      .filter(href => href && !href.startsWith(url))
      .filter(Boolean) as string[];
    
    // Extract images
    const images = Array.from(document.querySelectorAll("img"))
      .map(img => ({
        src: img.getAttribute("src"),
        alt: img.getAttribute("alt") || "",
        hasAlt: img.hasAttribute("alt")
      }));
    
    // Check for robots meta tag
    const robotsMeta = document.querySelector("meta[name='robots']")?.getAttribute("content") || "";
    
    // Check for viewport meta tag
    const viewportMeta = document.querySelector("meta[name='viewport']")?.getAttribute("content") || "";
    
    // Check for structured data
    const structuredData = Array.from(document.querySelectorAll("script[type='application/ld+json']"))
      .map(script => script.textContent)
      .filter(Boolean) as string[];
    
    // Check for open graph tags
    const ogTitle = document.querySelector("meta[property='og:title']")?.getAttribute("content") || "";
    const ogDescription = document.querySelector("meta[property='og:description']")?.getAttribute("content") || "";
    const ogImage = document.querySelector("meta[property='og:image']")?.getAttribute("content") || "";
    const ogUrl = document.querySelector("meta[property='og:url']")?.getAttribute("content") || "";
    
    // Check for Twitter cards
    const twitterCard = document.querySelector("meta[name='twitter:card']")?.getAttribute("content") || "";
    const twitterTitle = document.querySelector("meta[name='twitter:title']")?.getAttribute("content") || "";
    const twitterDescription = document.querySelector("meta[name='twitter:description']")?.getAttribute("content") || "";
    const twitterImage = document.querySelector("meta[name='twitter:image']")?.getAttribute("content") || "";
    
    // Compile the results
    const results = {
      url,
      metadata: {
        title,
        metaDescription,
        metaKeywords,
        canonicalUrl,
        robotsMeta,
        viewportMeta
      },
      headings: {
        h1: h1s,
        h2: h2s,
        h3: h3s
      },
      links: {
        internal: internalLinks,
        external: externalLinks,
        internalCount: internalLinks.length,
        externalCount: externalLinks.length
      },
      images: {
        total: images.length,
        withAlt: images.filter(img => img.hasAlt).length,
        withoutAlt: images.filter(img => !img.hasAlt).length,
        items: images
      },
      socialMedia: {
        openGraph: {
          title: ogTitle,
          description: ogDescription,
          image: ogImage,
          url: ogUrl
        },
        twitter: {
          card: twitterCard,
          title: twitterTitle,
          description: twitterDescription,
          image: twitterImage
        }
      },
      structuredData: structuredData.length > 0,
      structuredDataItems: structuredData
    };
    
    // Return the results
    return new Response(
      JSON.stringify(results),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    // Handle errors
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});
