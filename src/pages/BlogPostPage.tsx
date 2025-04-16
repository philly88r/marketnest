import React, { useState, useEffect, lazy, Suspense } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Import the blog loader utility
import { loadGeneratedBlogs } from '../utils/blogLoader';

// Sample blog post data - in a real app, you would fetch this data based on the slug
const blogPosts = [
  {
    id: 1,
    title: '10 SEO Strategies That Actually Work in 2025',
    slug: '10-seo-strategies-that-actually-work-in-2025',
    category: 'SEO',
    author: 'Sarah Johnson',
    authorTitle: 'SEO Director',
    authorImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    date: 'March 15, 2025',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1562577309-4932fdd64cd1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    content: `
      <h2>Introduction</h2>
      <p>Search engine optimization continues to evolve at a rapid pace. What worked a few years ago may not only be ineffective today but could actually harm your rankings. In this article, we'll explore the SEO strategies that are delivering real results in 2025, backed by data from our client work.</p>
      
      <h2>1. User Intent Optimization</h2>
      <p>Google's algorithms have become increasingly sophisticated at understanding user intent. It's no longer enough to match keywords; your content must satisfy the underlying reason behind a search query.</p>
      <p>Our research shows that pages optimized for user intent see a 43% higher click-through rate and 37% lower bounce rate compared to those that focus solely on keyword density.</p>
      
      <h2>2. AI-Powered Content Creation</h2>
      <p>AI tools have transformed content creation, but the most successful SEO strategies use AI as a supplement to human creativity, not a replacement. The best approach combines AI efficiency with human expertise.</p>
      <p>We've found that AI-assisted content that undergoes human editing and enhancement performs 52% better in search rankings than either purely AI-generated or purely human-written content.</p>
      
      <h2>3. Voice Search Optimization</h2>
      <p>With voice search continuing to grow, optimizing for conversational queries has become essential. This means focusing on natural language patterns and question-based content.</p>
      <p>Our data shows that websites optimized for voice search are seeing an average of 27% more organic traffic from mobile devices.</p>
      
      <h2>4. Core Web Vitals Mastery</h2>
      <p>Google's Core Web Vitals have become increasingly important ranking factors. Websites that excel in loading performance, interactivity, and visual stability consistently outrank competitors.</p>
      <p>In our client work, improving Core Web Vitals scores from "Poor" to "Good" resulted in an average ranking improvement of 14 positions for competitive keywords.</p>
      
      <h2>5. E-E-A-T Focus</h2>
      <p>Google's E-E-A-T (Experience, Expertise, Authoritativeness, and Trustworthiness) principles continue to guide content quality assessment. Demonstrating real-world experience has become particularly important.</p>
      <p>Content that clearly demonstrates first-hand experience with a topic receives 68% more backlinks and social shares than content that lacks experiential insights.</p>
      
      <h2>6. Semantic SEO Implementation</h2>
      <p>Semantic SEO focuses on the meaning behind content rather than specific keywords. This approach involves creating comprehensive content that covers topics in depth and addresses related concepts.</p>
      <p>Our semantic SEO implementations have resulted in a 76% increase in keyword rankings for not just target terms but also related terms that weren't specifically targeted.</p>
      
      <h2>7. Video Content Integration</h2>
      <p>Video content continues to dominate search results, with Google increasingly showing video snippets for informational queries.</p>
      <p>Pages that include relevant, high-quality video content alongside text see 157% more organic traffic than text-only pages targeting the same keywords.</p>
      
      <h2>8. Mobile-First Indexing Optimization</h2>
      <p>With Google's mobile-first indexing fully implemented, ensuring your site performs flawlessly on mobile devices is non-negotiable.</p>
      <p>Our mobile optimization work has resulted in an average 31% increase in mobile search visibility for client websites.</p>
      
      <h2>9. Local SEO Enhancement</h2>
      <p>For businesses with physical locations, local SEO remains one of the highest-ROI strategies. Google Business Profile optimization, local content, and review management are critical components.</p>
      <p>Our local SEO clients have seen an average 83% increase in "near me" search visibility and a 47% increase in store visits attributed to search.</p>
      
      <h2>10. Structured Data Implementation</h2>
      <p>Structured data helps search engines understand your content and can result in rich snippets that increase visibility and click-through rates.</p>
      <p>Our structured data implementations have resulted in a 38% average increase in click-through rates for client websites.</p>
      
      <h2>Conclusion</h2>
      <p>SEO continues to evolve, but the fundamental principle remains the same: create exceptional content that serves user needs, and make it easily accessible to both users and search engines. By implementing these strategies, you'll be well-positioned for SEO success in 2025 and beyond.</p>
    `,
    relatedPosts: [2, 4, 7]
  },
  {
    id: 2,
    title: 'How to Build a PPC Campaign That Converts',
    slug: 'how-to-build-a-ppc-campaign-that-converts',
    category: 'PPC',
    author: 'Michael Chen',
    authorTitle: 'PPC Specialist',
    authorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    date: 'March 10, 2025',
    readTime: '9 min read',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    content: `
      <h2>Introduction to High-Converting PPC Campaigns</h2>
      <p>Pay-per-click advertising remains one of the most effective ways to drive targeted traffic to your website. However, many businesses struggle to create campaigns that actually convert that traffic into leads and sales. In this article, we'll share our proven process for building high-converting PPC campaigns.</p>
      
      <h2>The Complete PPC Campaign Process</h2>
      <p>Our approach follows a systematic process that has been refined through years of campaign management across various industries.</p>
      
      <h3>1. Audience Research and Segmentation</h3>
      <p>Before creating any ads, we conduct thorough audience research to understand who we're targeting. This includes:</p>
      <ul>
        <li>Demographic analysis</li>
        <li>Psychographic profiling</li>
        <li>Customer journey mapping</li>
        <li>Pain point identification</li>
      </ul>
      <p>This research allows us to segment audiences effectively and create targeted messaging that resonates with each segment.</p>
      
      <h3>2. Keyword Strategy Development</h3>
      <p>Our keyword strategy focuses on intent rather than volume. We categorize keywords into:</p>
      <ul>
        <li>Awareness stage keywords</li>
        <li>Consideration stage keywords</li>
        <li>Decision stage keywords</li>
      </ul>
      <p>This intent-based approach ensures we're targeting users at the right stage of their buying journey.</p>
      
      <h3>3. Compelling Ad Creation</h3>
      <p>Our ad creation process follows a proven formula:</p>
      <ul>
        <li>Headline: Address the user's primary pain point or desire</li>
        <li>Description: Highlight unique value proposition and include proof points</li>
        <li>Call to action: Use clear, action-oriented language</li>
      </ul>
      <p>We also leverage ad extensions extensively to maximize ad real estate and provide additional information to potential customers.</p>
      
      <h3>4. Landing Page Optimization</h3>
      <p>The landing page is where conversion happens, so we ensure:</p>
      <ul>
        <li>Message match between ad and landing page</li>
        <li>Clear, compelling headline</li>
        <li>Concise value proposition</li>
        <li>Social proof elements (testimonials, reviews, case studies)</li>
        <li>Single, clear call to action</li>
        <li>Minimal distractions</li>
      </ul>
      <p>Our landing pages are continuously tested and optimized to improve conversion rates.</p>
      
      <h3>5. Conversion Tracking Setup</h3>
      <p>Proper conversion tracking is essential for campaign optimization. We implement:</p>
      <ul>
        <li>Primary conversion tracking (form submissions, purchases)</li>
        <li>Micro-conversion tracking (video views, scroll depth)</li>
        <li>Cross-device conversion tracking</li>
        <li>Attribution modeling</li>
      </ul>
      <p>This comprehensive tracking allows us to understand the true performance of our campaigns.</p>
      
      <h3>6. Campaign Structure Implementation</h3>
      <p>We structure campaigns to maximize quality score and control budget allocation:</p>
      <ul>
        <li>Tightly themed ad groups (5-10 keywords per ad group)</li>
        <li>Separate campaigns for search and display</li>
        <li>Device-specific campaigns when appropriate</li>
        <li>Budget allocation based on performance and priority</li>
      </ul>
      <p>This structured approach ensures efficient spend and higher quality scores.</p>
      
      <h3>7. Bid Strategy Optimization</h3>
      <p>Our bid strategies are tailored to campaign objectives:</p>
      <ul>
        <li>For lead generation: Target CPA bidding</li>
        <li>For e-commerce: ROAS-based bidding</li>
        <li>For brand awareness: Impression share bidding</li>
      </ul>
      <p>We regularly review and adjust bid strategies based on performance data.</p>
      
      <h3>8. Continuous Testing and Optimization</h3>
      <p>Our optimization process includes:</p>
      <ul>
        <li>A/B testing of ad copy and creative</li>
        <li>Landing page variant testing</li>
        <li>Bid adjustments based on device, location, and time</li>
        <li>Regular search term analysis and negative keyword addition</li>
        <li>Audience refinement</li>
      </ul>
      <p>This ongoing optimization ensures continual improvement in campaign performance.</p>
      
      <h2>Case Study: 215% Increase in Conversion Rate</h2>
      <p>Using this process, we helped an e-commerce client achieve a 215% increase in conversion rate and a 43% reduction in cost per acquisition within 90 days. The key factors in this success were:</p>
      <ul>
        <li>Detailed audience segmentation that revealed previously untargeted high-value segments</li>
        <li>Comprehensive keyword restructuring that focused on high-intent terms</li>
        <li>Landing page redesign that simplified the purchase process</li>
        <li>Automated bid adjustments based on conversion probability</li>
      </ul>
      
      <h2>Conclusion</h2>
      <p>Building high-converting PPC campaigns isn't about quick fixes or "hacks." It's about following a systematic process, understanding your audience deeply, and continuously optimizing based on data. By implementing the process outlined in this article, you'll be well on your way to creating PPC campaigns that not only drive traffic but convert that traffic into valuable customers.</p>
    `,
    relatedPosts: [1, 5, 8]
  }
];

const BlogPostPage: React.FC = () => {
  const params = useParams();
  const slug = params.slug;
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchPost = async () => {
      // First check the hardcoded blog posts
      let foundPost = blogPosts.find(p => p.slug === slug);
      
      // If not found in hardcoded posts, check generated blogs
      if (!foundPost && slug) {
        try {
          const generatedBlogs = await loadGeneratedBlogs();
          // Add missing properties required by the blog post type
          const generatedPost = generatedBlogs.find(p => p.slug === slug);
          if (generatedPost) {
            foundPost = {
              ...generatedPost,
              content: '', // Add empty content as it will be rendered by the component
              relatedPosts: [] // Add empty related posts array
            };
          }
        } catch (error) {
          console.error('Error loading generated blogs:', error);
        }
      }
      
      setPost(foundPost || null);
      setLoading(false);
    };
    
    fetchPost();
  }, [slug]);
  
  // Special case for AI videos blog post - direct component rendering
  if (slug === 'ai-videos-the-future-of-content-creation-marketing') {
    const AIVideoBlogPost = lazy(() => import('../content/blog/ai-videos-the-future-of-content-creation-marketing'));
    
    return (
      <Suspense fallback={
        <>
          <Header />
          <PageContainer>
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
              <h2>Loading blog post...</h2>
            </div>
          </PageContainer>
          <Footer />
        </>
      }>
        <AIVideoBlogPost />
      </Suspense>
    );
  }
  
  // Show loading state
  if (loading) {
    return (
      <>
        <Header />
        <PageContainer>
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <h2>Loading blog post...</h2>
          </div>
        </PageContainer>
        <Footer />
      </>
    );
  }
  
  // If post not found, show error message
  if (!post) {
    return (
      <>
        <Header />
        <PageContainer>
          <ErrorSection>
            <ErrorTitle>Blog Post Not Found</ErrorTitle>
            <ErrorMessage>The blog post you're looking for doesn't exist or has been moved.</ErrorMessage>
            <BackButton as={Link} to="/blog">Back to Blog</BackButton>
          </ErrorSection>
        </PageContainer>
        <Footer />
      </>
    );
  }
  
  // Find related posts
  const relatedPostsData = post.relatedPosts
    ? post.relatedPosts.map((id: number) => blogPosts.find(p => p.id === id)).filter(Boolean)
    : [];

  return (
    <>
      <Header />
      <PageContainer>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <BreadcrumbNav>
            <BreadcrumbLink as={Link} to="/">Home</BreadcrumbLink> &gt; 
            <BreadcrumbLink as={Link} to="/blog">Blog</BreadcrumbLink> &gt; 
            <BreadcrumbCurrent>{post.title}</BreadcrumbCurrent>
          </BreadcrumbNav>
          
          <PostHeader>
            <PostCategory>{post.category}</PostCategory>
            <PostTitle>{post.title}</PostTitle>
            <PostMeta>
              <AuthorSection>
                <AuthorImage src={post.authorImage} alt={post.author} />
                <AuthorInfo>
                  <AuthorName>{post.author}</AuthorName>
                  <AuthorTitle>{post.authorTitle}</AuthorTitle>
                </AuthorInfo>
              </AuthorSection>
              <PostDetails>
                <PostDate>{post.date}</PostDate>
                <PostReadTime>{post.readTime}</PostReadTime>
              </PostDetails>
            </PostMeta>
          </PostHeader>
          
          <FeaturedImage src={post.image} alt={post.title} />
          
          <PostContent dangerouslySetInnerHTML={{ __html: post.content }} />
          
          <ShareSection>
            <ShareTitle>Share this article</ShareTitle>
            <ShareButtons>
              <ShareButton>
                <span>Twitter</span>
              </ShareButton>
              <ShareButton>
                <span>LinkedIn</span>
              </ShareButton>
              <ShareButton>
                <span>Facebook</span>
              </ShareButton>
              <ShareButton>
                <span>Email</span>
              </ShareButton>
            </ShareButtons>
          </ShareSection>
          
          <AuthorBioSection>
            <AuthorBioImage src={post.authorImage} alt={post.author} />
            <AuthorBioContent>
              <AuthorBioName>{post.author}</AuthorBioName>
              <AuthorBioTitle>{post.authorTitle}</AuthorBioTitle>
              <AuthorBioText>
                {post.author} is a digital marketing expert with over 10 years of experience in the industry. 
                Specializing in {post.category}, they have helped numerous businesses achieve their marketing goals.
              </AuthorBioText>
            </AuthorBioContent>
          </AuthorBioSection>
          
          {relatedPostsData.length > 0 && (
            <RelatedPostsSection>
              <RelatedPostsTitle>Related Articles</RelatedPostsTitle>
              <RelatedPostsGrid>
                {relatedPostsData.map((relatedPost: any) => (
                  relatedPost && (
                    <RelatedPostCard 
                      key={relatedPost.id}
                      as={motion.div}
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    >
                      <Link to={`/blog/${relatedPost.slug}`} style={{ textDecoration: 'none' }}>
                        <RelatedPostImage style={{ backgroundImage: `url(${relatedPost.image})` }} />
                        <RelatedPostContent>
                          <RelatedPostCategory>{relatedPost.category}</RelatedPostCategory>
                          <RelatedPostTitle>{relatedPost.title}</RelatedPostTitle>
                        </RelatedPostContent>
                      </Link>
                    </RelatedPostCard>
                  )
                ))}
              </RelatedPostsGrid>
            </RelatedPostsSection>
          )}
          
          <CTASection>
            <CTATitle>Ready to improve your digital marketing strategy?</CTATitle>
            <CTADescription>
              Our team of experts can help you implement the strategies discussed in this article.
            </CTADescription>
            <CTAButton as={Link} to="/contact">Schedule a Free Consultation</CTAButton>
          </CTASection>
        </motion.div>
      </PageContainer>
      <Footer />
    </>
  );
};

// Styled Components
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

const BreadcrumbNav = styled.div`
  margin: 100px 0 30px;
  color: #B0B7C3;
  font-size: 0.9rem;
`;

const BreadcrumbLink = styled.span`
  color: #B0B7C3;
  margin: 0 8px;
  
  &:first-child {
    margin-left: 0;
  }
  
  &:hover {
    color: #FFFFFF;
  }
`;

const BreadcrumbCurrent = styled.span`
  color: #FFFFFF;
  margin-left: 8px;
`;

const PostHeader = styled.div`
  margin-bottom: 40px;
`;

const PostCategory = styled.div`
  display: inline-block;
  background: linear-gradient(90deg, #673AB7 0%, #03A9F4 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 20px;
`;

const PostTitle = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 30px;
  color: #FFFFFF;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const PostMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
`;

const AuthorSection = styled.div`
  display: flex;
  align-items: center;
`;

const AuthorImage = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 15px;
  object-fit: cover;
`;

const AuthorInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const AuthorName = styled.span`
  font-size: 1rem;
  font-weight: 500;
  color: #FFFFFF;
`;

const AuthorTitle = styled.span`
  font-size: 0.9rem;
  color: #B0B7C3;
`;

const PostDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const PostDate = styled.span`
  font-size: 0.9rem;
  color: #B0B7C3;
`;

const PostReadTime = styled.span`
  font-size: 0.9rem;
  color: #B0B7C3;
`;

const FeaturedImage = styled.img`
  width: 100%;
  height: auto;
  border-radius: 12px;
  margin-bottom: 40px;
`;

const PostContent = styled.div`
  color: #E0E0E0;
  line-height: 1.8;
  font-size: 1.1rem;
  
  h2 {
    font-size: 1.8rem;
    font-weight: 600;
    margin: 40px 0 20px;
    color: #FFFFFF;
  }
  
  h3 {
    font-size: 1.4rem;
    font-weight: 600;
    margin: 30px 0 15px;
    color: #FFFFFF;
  }
  
  p {
    margin-bottom: 20px;
  }
  
  ul, ol {
    margin: 20px 0;
    padding-left: 20px;
  }
  
  li {
    margin-bottom: 10px;
  }
  
  a {
    color: #03A9F4;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  blockquote {
    border-left: 4px solid #673AB7;
    padding-left: 20px;
    font-style: italic;
    margin: 30px 0;
  }
  
  @media (max-width: 768px) {
    font-size: 1rem;
    
    h2 {
      font-size: 1.5rem;
    }
    
    h3 {
      font-size: 1.2rem;
    }
  }
`;

const ShareSection = styled.div`
  margin: 60px 0;
  padding: 30px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const ShareTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: #FFFFFF;
`;

const ShareButtons = styled.div`
  display: flex;
  gap: 15px;
`;

const ShareButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: none;
  color: #FFFFFF;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const AuthorBioSection = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 30px;
  margin: 40px 0;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
`;

const AuthorBioImage = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin-right: 30px;
  object-fit: cover;
  
  @media (max-width: 768px) {
    margin-right: 0;
    margin-bottom: 20px;
  }
`;

const AuthorBioContent = styled.div`
  flex: 1;
`;

const AuthorBioName = styled.h3`
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 5px;
  color: #FFFFFF;
`;

const AuthorBioTitle = styled.p`
  font-size: 1rem;
  color: #B0B7C3;
  margin-bottom: 15px;
`;

const AuthorBioText = styled.p`
  font-size: 1rem;
  color: #E0E0E0;
  line-height: 1.6;
`;

const RelatedPostsSection = styled.div`
  margin: 60px 0;
`;

const RelatedPostsTitle = styled.h3`
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 30px;
  color: #FFFFFF;
`;

const RelatedPostsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const RelatedPostCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }
`;

const RelatedPostImage = styled.div`
  height: 180px;
  background-size: cover;
  background-position: center;
`;

const RelatedPostContent = styled.div`
  padding: 20px;
`;

const RelatedPostCategory = styled.div`
  font-size: 0.8rem;
  color: #03A9F4;
  margin-bottom: 10px;
`;

const RelatedPostTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: #FFFFFF;
  line-height: 1.4;
`;

const CTASection = styled.div`
  text-align: center;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  padding: 60px 30px;
  margin: 80px 0 60px;
`;

const CTATitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 20px;
  color: #FFFFFF;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const CTADescription = styled.p`
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto 30px;
  color: #B0B7C3;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const CTAButton = styled.button`
  background: linear-gradient(90deg, #673AB7 0%, #03A9F4 100%);
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 6px;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }
`;

const ErrorSection = styled.div`
  text-align: center;
  padding: 100px 0;
`;

const ErrorTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 20px;
  color: #FFFFFF;
`;

const ErrorMessage = styled.p`
  font-size: 1.2rem;
  color: #B0B7C3;
  margin-bottom: 30px;
`;

const BackButton = styled.button`
  background: linear-gradient(90deg, #673AB7 0%, #03A9F4 100%);
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 6px;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }
`;

export default BlogPostPage;
