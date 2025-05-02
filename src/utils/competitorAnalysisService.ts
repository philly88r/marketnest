import { v4 as uuidv4 } from 'uuid';
import { SEOAudit, SEOReport } from './seoService';
import { supabase } from './supabaseClient';
import axios from 'axios';

// Define SEOIssue interface
interface SEOIssue {
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  recommendation: string;
}

// Interface for competitor analysis results
export interface CompetitorAnalysis {
  id: string;
  client_id: string;
  user_id: string;
  keyword: string;
  status: 'in-progress' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  competitors: CompetitorData[];
  recommendations: string[];
}

export interface CompetitorData {
  url: string;
  title: string;
  position: number;
  seoAudit?: SEOAudit;
  strengths: string[];
  weaknesses: string[];
}

/**
 * Search for a keyword and analyze top competitors
 * @param keyword The keyword to search for
 * @param userId The user ID
 * @param clientId The client ID
 * @returns CompetitorAnalysis object with results
 */
export const analyzeCompetitors = async (
  keyword: string,
  userId: string,
  clientId: string
): Promise<CompetitorAnalysis> => {
  try {
    // Create a new competitor analysis record
    const id = uuidv4();
    const timestamp = new Date().toISOString();
    
    // Make sure userId is a valid UUID
    // If it's not a UUID, use a default UUID
    let validUserId = userId;
    try {
      // Check if userId is a valid UUID
      // If not, this will throw an error
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
        console.warn('userId is not a valid UUID, using a default UUID instead');
        validUserId = '00000000-0000-0000-0000-000000000000';
      }
    } catch (e) {
      console.warn('Error validating userId, using a default UUID instead:', e);
      validUserId = '00000000-0000-0000-0000-000000000000';
    }
    
    const analysisObject: CompetitorAnalysis = {
      id,
      client_id: clientId,
      user_id: validUserId,
      keyword,
      status: 'in-progress',
      created_at: timestamp,
      updated_at: timestamp,
      competitors: [],
      recommendations: []
    };
    
    console.log('Creating competitor analysis with:', {
      id,
      client_id: clientId,
      user_id: validUserId,
      keyword
    });
    
    // Store the initial record in the database
    const { error } = await supabase
      .from('competitor_analysis')
      .insert([analysisObject]);
      
    if (error) {
      console.error('Error creating competitor analysis record:', error);
    }
    
    // Start the analysis process asynchronously
    startCompetitorAnalysis(keyword, analysisObject);
    
    return analysisObject;
  } catch (error) {
    console.error('Error analyzing competitors:', error);
    throw error;
  }
};

/**
 * Start the competitor analysis process
 * @param keyword The keyword to search for
 * @param analysisObject The analysis object to update
 */
const startCompetitorAnalysis = async (
  keyword: string,
  analysisObject: CompetitorAnalysis
) => {
  try {
    // Update status to processing
    await updateAnalysisStatus(analysisObject.id, 'processing');
    
    // Search for the keyword and get top competitors
    const competitors = await searchKeywordCompetitors(keyword);
    
    // Update the analysis object with competitors
    analysisObject.competitors = competitors;
    await updateCompetitors(analysisObject.id, competitors);
    
    // Analyze each competitor
    for (let i = 0; i < competitors.length; i++) {
      const competitor = competitors[i];
      
      // Fetch and analyze the competitor's website
      const auditData = await fetchWebsiteData(competitor.url);
      const seoAudit = await analyzeCompetitorSEO(competitor.url, auditData, analysisObject.user_id);
      
      // Update the competitor with SEO audit data
      competitor.seoAudit = seoAudit;
      
      // Extract strengths and weaknesses
      const { strengths, weaknesses } = extractStrengthsWeaknesses(seoAudit);
      competitor.strengths = strengths;
      competitor.weaknesses = weaknesses;
      
      // Update the competitor in the database
      await updateCompetitor(analysisObject.id, i, competitor);
    }
    
    // Generate recommendations for outranking competitors
    const recommendations = await generateOutrankingRecommendations(keyword, competitors);
    analysisObject.recommendations = recommendations;
    
    // Update the analysis with recommendations
    await updateRecommendations(analysisObject.id, recommendations);
    
    // Update status to completed
    await updateAnalysisStatus(analysisObject.id, 'completed');
  } catch (error) {
    console.error('Error in competitor analysis process:', error);
    await updateAnalysisStatus(analysisObject.id, 'failed');
  }
};

/**
 * Search for a keyword and get top competitors
 * @param keyword The keyword to search for
 * @returns Array of competitor data
 */
const searchKeywordCompetitors = async (keyword: string): Promise<CompetitorData[]> => {
  try {
    // Log the keyword being sent to the backend
    console.log('Sending keyword to backend:', keyword);
    
    // Temporarily go back to the original endpoint while we debug
    const response = await axios.post('http://localhost:5000/api/competitor-analysis/search', { keyword });
    
    if (!response.data || !response.data.competitors) {
      throw new Error('Invalid response from competitor search API');
    }
    
    return response.data.competitors;
  } catch (error) {
    console.error('Error searching for competitors:', error);
    throw error; // Propagate the error to show real errors to the user
  }
};

/**
 * Fetch website data for SEO analysis
 * @param url The URL to fetch data from
 * @returns Website data for analysis
 */
const fetchWebsiteData = async (url: string): Promise<any> => {
  try {
    // Call the real API endpoint that uses Playwright on the server
    const response = await axios.post('http://localhost:5000/api/competitor-analysis/fetch-website', { url });
    
    if (!response.data || !response.data.websiteData) {
      throw new Error('Invalid response from website data API');
    }
    
    return response.data.websiteData;
  } catch (error) {
    console.error('Error fetching website data:', error);
    throw error; // Propagate the error to show real errors to the user
  }
};

/**
 * Analyze a competitor's website using the SEO audit functionality
 * @param url The URL to analyze
 * @param crawlData The website data
 * @param userId The user ID
 * @returns SEO audit data
 */
const analyzeCompetitorSEO = async (url: string, crawlData: any, userId: string): Promise<SEOAudit> => {
  try {
    console.log(`Analyzing SEO for competitor: ${url}`);
    
    // Generate a temporary ID for this audit
    const auditId = uuidv4();
    const timestamp = new Date().toISOString();
    
    // Create a basic SEO audit object
    const auditObject: SEOAudit = {
      id: auditId,
      client_id: 'competitor-analysis',
      user_id: userId,
      url,
      status: 'in-progress',
      score: 0,
      report: null,
      created_at: timestamp,
      updated_at: timestamp
    };
    
    // Call the real SEO audit API with the website data
    console.log('Sending website data to SEO audit API...');
    const response = await axios.post('http://localhost:5000/api/seo-audit/analyze', { 
      websiteData: crawlData
    });
    
    if (!response.data || !response.data.seoReport) {
      throw new Error('Invalid response from SEO audit API');
    }
    
    // Update the audit object with the real SEO report
    const seoReport = response.data.seoReport;
    auditObject.report = seoReport as unknown as SEOReport;
    auditObject.score = seoReport.overall.score;
    auditObject.status = 'completed';
    
    console.log(`SEO analysis complete for ${url} with score: ${auditObject.score}`);
    return auditObject;
  } catch (error) {
    console.error('Error analyzing competitor SEO:', error);
    throw error;
  }
};

/**
 * Extract strengths and weaknesses from SEO audit data
 * @param seoAudit The SEO audit data
 * @returns Object with strengths and weaknesses arrays
 */
const extractStrengthsWeaknesses = (seoAudit: SEOAudit): { strengths: string[], weaknesses: string[] } => {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  
  if (!seoAudit.report) {
    return { strengths, weaknesses };
  }
  
  const report = seoAudit.report;
  
  // Check technical aspects
  if (report.technical) {
    // SSL is a strength
    if (report.technical.ssl) {
      strengths.push('Has SSL certificate (HTTPS)');
    } else {
      weaknesses.push('Missing SSL certificate (not using HTTPS)');
    }
    
    // Mobile-friendly is a strength
    if (report.technical.mobileFriendly) {
      strengths.push('Mobile-friendly website');
    } else {
      weaknesses.push('Not mobile-friendly');
    }
    
    // Robots.txt is a strength
    if (report.technical.robotsTxt) {
      strengths.push('Has robots.txt file');
    } else {
      weaknesses.push('Missing robots.txt file');
    }
    
    // Sitemap is a strength
    if (report.technical.sitemap) {
      strengths.push('Has XML sitemap');
    } else {
      weaknesses.push('Missing XML sitemap');
    }
  }
  
  // Check on-page aspects
  if (report.onPage) {
    // Extract issues as weaknesses
    if (report.onPage.issues && report.onPage.issues.length > 0) {
      report.onPage.issues.forEach((issue: SEOIssue) => {
        weaknesses.push(issue.title);
      });
    }
  }
  
  // Check content aspects
  if (report.content) {
    // Extract issues as weaknesses
    if (report.content.issues && report.content.issues.length > 0) {
      report.content.issues.forEach((issue: SEOIssue) => {
        weaknesses.push(issue.title);
      });
    }
  }
  
  // Check performance aspects
  if (report.performance) {
    // Extract issues as weaknesses
    if (report.performance.issues && report.performance.issues.length > 0) {
      report.performance.issues.forEach((issue: SEOIssue) => {
        weaknesses.push(issue.title);
      });
    }
  }
  
  // Limit the number of strengths and weaknesses
  return {
    strengths: strengths.slice(0, 5),
    weaknesses: weaknesses.slice(0, 5)
  };
};

/**
 * Generate recommendations for outranking competitors
 * @param keyword The target keyword
 * @param competitors The competitor data
 * @returns Array of recommendations
 */
const generateOutrankingRecommendations = async (
  keyword: string,
  competitors: CompetitorData[]
): Promise<string[]> => {
  try {
    // Prepare the prompt for Gemini
    const prompt = `
      As an SEO expert, analyze these top 3 competitors for the keyword "${keyword}" and provide specific, actionable recommendations to outrank them.
      
      Competitor data:
      ${competitors.map((comp, index) => `
        #${index + 1}: ${comp.title} (${comp.url})
        Strengths: ${comp.strengths.join(', ')}
        Weaknesses: ${comp.weaknesses.join(', ')}
        Overall SEO Score: ${comp.seoAudit?.score || 'N/A'}
      `).join('\n')}
      
      Based on this analysis, provide 5-7 specific, actionable recommendations for creating content that would outrank these competitors. 
      Focus on content strategy, on-page SEO, technical improvements, and unique value propositions.
      Format each recommendation as a bullet point starting with "- ".
    `;
    
    // Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent?key=${process.env.REACT_APP_GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });
    
    const data = await response.json();
    
    // Extract recommendations from the response
    let recommendationsText = '';
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      recommendationsText = data.candidates[0].content.parts[0].text;
    }
    
    // Parse bullet points into array
    const recommendations = recommendationsText
      .split('\n')
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.trim().substring(2).trim());
    
    return recommendations.length > 0 ? recommendations : [
      'Create more comprehensive content that covers the topic in greater depth than competitors',
      'Improve page loading speed and mobile responsiveness',
      'Use more relevant and high-quality images with proper alt text',
      'Include expert quotes or original research to add unique value',
      'Optimize meta title and description with the target keyword',
      'Improve internal linking structure to related content',
      'Add schema markup to enhance search result appearance'
    ];
  } catch (error) {
    console.error('Error generating outranking recommendations:', error);
    
    // Return fallback recommendations
    return [
      'Create more comprehensive content that covers the topic in greater depth than competitors',
      'Improve page loading speed and mobile responsiveness',
      'Use more relevant and high-quality images with proper alt text',
      'Include expert quotes or original research to add unique value',
      'Optimize meta title and description with the target keyword',
      'Improve internal linking structure to related content',
      'Add schema markup to enhance search result appearance'
    ];
  }
};

/**
 * Update the status of a competitor analysis
 * @param id The analysis ID
 * @param status The new status
 */
const updateAnalysisStatus = async (id: string, status: 'in-progress' | 'processing' | 'completed' | 'failed') => {
  const { error } = await supabase
    .from('competitor_analysis')
    .update({
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);
    
  if (error) {
    console.error('Error updating analysis status:', error);
  }
};

/**
 * Update the competitors in a competitor analysis
 * @param id The analysis ID
 * @param competitors The competitor data
 */
const updateCompetitors = async (id: string, competitors: CompetitorData[]) => {
  const { error } = await supabase
    .from('competitor_analysis')
    .update({
      competitors,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);
    
  if (error) {
    console.error('Error updating competitors:', error);
  }
};

/**
 * Update a specific competitor in a competitor analysis
 * @param id The analysis ID
 * @param index The competitor index
 * @param competitor The competitor data
 */
const updateCompetitor = async (id: string, index: number, competitor: CompetitorData) => {
  // First get the current competitors array
  const { data, error: fetchError } = await supabase
    .from('competitor_analysis')
    .select('competitors')
    .eq('id', id)
    .single();
    
  if (fetchError || !data) {
    console.error('Error fetching competitors:', fetchError);
    return;
  }
  
  // Update the specific competitor
  const competitors = data.competitors || [];
  competitors[index] = competitor;
  
  // Save the updated competitors array
  const { error: updateError } = await supabase
    .from('competitor_analysis')
    .update({
      competitors,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);
    
  if (updateError) {
    console.error('Error updating competitor:', updateError);
  }
};

/**
 * Update the recommendations in a competitor analysis
 * @param id The analysis ID
 * @param recommendations The recommendations
 */
const updateRecommendations = async (id: string, recommendations: string[]) => {
  const { error } = await supabase
    .from('competitor_analysis')
    .update({
      recommendations,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);
    
  if (error) {
    console.error('Error updating recommendations:', error);
  }
};

/**
 * Get a competitor analysis by ID
 * @param id The analysis ID
 * @returns The competitor analysis
 */
export const getCompetitorAnalysis = async (id: string): Promise<CompetitorAnalysis | null> => {
  const { data, error } = await supabase
    .from('competitor_analysis')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    console.error('Error fetching competitor analysis:', error);
    return null;
  }
  
  return data;
};

/**
 * Get all competitor analyses for a client
 * @param clientId The client ID
 * @returns Array of competitor analyses
 */
export const getCompetitorAnalysesByClientId = async (clientId: string): Promise<CompetitorAnalysis[]> => {
  const { data, error } = await supabase
    .from('competitor_analysis')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching competitor analyses:', error);
    return [];
  }
  
  return data || [];
};

/**
 * Delete a competitor analysis
 * @param id The analysis ID
 * @returns True if successful, false otherwise
 */
export const deleteCompetitorAnalysis = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('competitor_analysis')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Error deleting competitor analysis:', error);
    return false;
  }
  
  return true;
};
