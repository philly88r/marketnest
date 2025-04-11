import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link, Routes, Route } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Import dynamic blog loading utility
import { loadGeneratedBlogs } from '../utils/blogLoader';

// Sample blog post data
const sampleBlogPosts = [
  {
    id: 1,
    title: '10 SEO Strategies That Actually Work in 2025',
    slug: '10-seo-strategies-that-actually-work-in-2025',
    excerpt: 'Discover the most effective SEO strategies that are driving real results in 2025, backed by data and case studies from our client work.',
    category: 'SEO',
    author: 'Sarah Johnson',
    authorTitle: 'SEO Director',
    authorImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    date: 'March 15, 2025',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1562577309-4932fdd64cd1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    featured: true
  },
  {
    id: 2,
    title: 'How to Build a PPC Campaign That Converts',
    slug: 'how-to-build-a-ppc-campaign-that-converts',
    excerpt: 'Learn the step-by-step process we use to create high-converting PPC campaigns that deliver consistent ROI for our clients.',
    category: 'PPC',
    author: 'Michael Chen',
    authorTitle: 'PPC Specialist',
    authorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    date: 'March 10, 2025',
    readTime: '9 min read',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    featured: false
  },
  {
    id: 3,
    title: 'The Ultimate Guide to Social Media Marketing in 2025',
    slug: 'the-ultimate-guide-to-social-media-marketing-in-2025',
    excerpt: 'Stay ahead of the curve with our comprehensive guide to social media marketing trends, strategies, and best practices for 2025.',
    category: 'Social Media',
    author: 'Emma Rodriguez',
    authorTitle: 'Social Media Manager',
    authorImage: 'https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    date: 'March 5, 2025',
    readTime: '12 min read',
    image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    featured: true
  },
  {
    id: 4,
    title: 'Content Marketing ROI: Measuring What Matters',
    slug: 'content-marketing-roi-measuring-what-matters',
    excerpt: 'Discover how to measure the true ROI of your content marketing efforts and focus on the metrics that actually drive business results.',
    category: 'Content Marketing',
    author: 'David Wilson',
    authorTitle: 'Content Strategist',
    authorImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    date: 'February 28, 2025',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    featured: false
  },
  {
    id: 5,
    title: 'Email Marketing Automation: Set It and Don\'t Forget It',
    slug: 'email-marketing-automation-set-it-and-dont-forget-it',
    excerpt: 'Learn how to build sophisticated email marketing automation workflows that nurture leads and drive conversions while you sleep.',
    category: 'Email Marketing',
    author: 'Jessica Lee',
    authorTitle: 'Email Marketing Specialist',
    authorImage: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    date: 'February 20, 2025',
    readTime: '10 min read',
    image: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    featured: false
  },
  {
    id: 6,
    title: 'Web Design Trends That Improve Conversion Rates',
    slug: 'web-design-trends-that-improve-conversion-rates',
    excerpt: 'Explore the latest web design trends that not only look great but are proven to boost conversion rates and user engagement.',
    category: 'Web Design',
    author: 'Alex Thompson',
    authorTitle: 'UX/UI Designer',
    authorImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    date: 'February 15, 2025',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    featured: false
  },
  {
    id: 7,
    title: 'Analytics That Matter: Turning Data Into Action',
    slug: 'analytics-that-matter-turning-data-into-action',
    excerpt: 'Cut through the noise and focus on the analytics that actually drive business decisions and marketing strategy improvements.',
    category: 'Analytics',
    author: 'Ryan Park',
    authorTitle: 'Data Analyst',
    authorImage: 'https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    date: 'February 10, 2025',
    readTime: '9 min read',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    featured: false
  },
  {
    id: 8,
    title: 'CRO Techniques That Doubled Our Client\'s Conversion Rate',
    slug: 'cro-techniques-that-doubled-our-clients-conversion-rate',
    excerpt: 'Case study: Learn the exact conversion rate optimization techniques we used to double a client\'s conversion rate in just 60 days.',
    category: 'CRO',
    author: 'Olivia Martinez',
    authorTitle: 'CRO Specialist',
    authorImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    date: 'February 5, 2025',
    readTime: '11 min read',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    featured: true
  }
];

// Categories for filtering
const categories = ['All', 'SEO', 'PPC', 'Social Media', 'Content Marketing', 'Email Marketing', 'Web Design', 'Analytics', 'CRO'];

// Blog post detail component
const BlogPostDetail: React.FC<{ slug: string }> = ({ slug }) => {
  const [post, setPost] = useState<any>(null);
  // const [loading, setLoading] = useState(true); // Commented out as currently unused
  
  useEffect(() => {
    const fetchPost = async () => {
      // First check sample blog posts
      let foundPost = sampleBlogPosts.find(p => p.slug === slug);
      
      // If not found in sample posts, check generated blogs
      if (!foundPost) {
        try {
          const generatedBlogs = await loadGeneratedBlogs();
          foundPost = generatedBlogs.find(p => p.slug === slug);
        } catch (error) {
          console.error('Error loading generated blogs:', error);
        }
      }
      
      // If the post is found in either sample or generated blogs
      setPost(foundPost);
      // Loading state removed as it was unused
    };
    
    fetchPost();
  }, [slug]);
  
  if (!post) {
    return (
      <div>
        <Header />
        <PageContainer>
          <h1>Blog post not found</h1>
          <p>The requested blog post could not be found.</p>
          <Link to="/blog">Back to blog</Link>
        </PageContainer>
        <Footer />
      </div>
    );
  }
  
  // Check if this is a generated blog post by looking at the slug pattern
  const isGeneratedBlog = slug === 'ai-videos-the-future-of-content-creation-marketing';
  
  // For generated blogs, we'll dynamically import the component
  if (isGeneratedBlog) {
    // Import the generated blog component
    const BlogPostComponent = React.lazy(() => import(`../content/blog/${slug}`));
    
    return (
      <div>
        <Header />
        <React.Suspense fallback={<div>Loading blog post...</div>}>
          <BlogPostComponent />
        </React.Suspense>
        <Footer />
      </div>
    );
  }
  
  // For regular sample blog posts
  return (
    <div>
      <Header />
      <PageContainer>
        <BlogPostDetailContainer>
          <BlogPostDetailHeader>
            <BlogPostCategory>{post.category}</BlogPostCategory>
            <BlogPostDetailTitle>{post.title}</BlogPostDetailTitle>
            <BlogPostDetailMeta>
              <AuthorImage src={post.authorImage} alt={post.author} />
              <PostMetaText>
                <AuthorName>{post.author}</AuthorName>
                <PostDate>{post.date} · {post.readTime}</PostDate>
              </PostMetaText>
            </BlogPostDetailMeta>
          </BlogPostDetailHeader>
          
          <BlogPostDetailImage style={{ backgroundImage: `url(${post.image})` }} />
          
          <BlogPostDetailContent>
            <p>{post.excerpt}</p>
            <p>This is where the full blog post content would be displayed. For generated blog posts, this would load the actual React component.</p>
          </BlogPostDetailContent>
        </BlogPostDetailContainer>
      </PageContainer>
      <Footer />
    </div>
  );
};

const BlogPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [allBlogPosts, setAllBlogPosts] = useState(sampleBlogPosts);
  const [filteredPosts, setFilteredPosts] = useState(allBlogPosts);
  const [featuredPosts, setFeaturedPosts] = useState(allBlogPosts.filter(post => post.featured));
  
  // Load generated blog posts
  useEffect(() => {
    const loadBlogs = async () => {
      try {
        // This would be replaced with actual API call or import
        const generatedBlogs = await loadGeneratedBlogs();
        const combinedBlogs = [...sampleBlogPosts, ...generatedBlogs];
        setAllBlogPosts(combinedBlogs);
        setFilteredPosts(combinedBlogs.filter(post => {
          const categoryMatch = selectedCategory === 'All' || post.category === selectedCategory;
          const searchMatch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
          return categoryMatch && searchMatch;
        }));
        setFeaturedPosts(combinedBlogs.filter(post => post.featured));
      } catch (error) {
        console.error('Error loading generated blogs:', error);
      }
    };
    
    loadBlogs();
  }, [searchTerm, selectedCategory]);

  // Filter posts based on category and search term
  useEffect(() => {
    const filtered = allBlogPosts.filter(post => {
      const categoryMatch = selectedCategory === 'All' || post.category === selectedCategory;
      const searchMatch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
      return categoryMatch && searchMatch;
    });
    setFilteredPosts(filtered);
  }, [selectedCategory, searchTerm, allBlogPosts]);

  return (
    <>
      <Header />
      <PageContainer>
        <HeroSection>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <GradientTitle>Digital Marketing Insights</GradientTitle>
            <HeroDescription>
              Stay ahead of the curve with our latest insights, strategies, and tips for digital marketing success.
            </HeroDescription>
          </motion.div>
        </HeroSection>

        {featuredPosts.length > 0 && (
          <FeaturedSection>
            <SectionTitle>Featured Articles</SectionTitle>
            <FeaturedGrid>
              {featuredPosts.map(post => (
                <FeaturedPostCard
                  key={post.id}
                  as={motion.div}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ y: -10, transition: { duration: 0.2 } }}
                >
                  <Link to={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                    <FeaturedPostImage style={{ backgroundImage: `url(${post.image})` }}>
                      <FeaturedPostCategory>{post.category}</FeaturedPostCategory>
                    </FeaturedPostImage>
                    <FeaturedPostContent>
                      <FeaturedPostTitle>{post.title}</FeaturedPostTitle>
                      <FeaturedPostExcerpt>{post.excerpt}</FeaturedPostExcerpt>
                      <FeaturedPostMeta>
                        <AuthorImage src={post.authorImage} alt={post.author} />
                        <PostMetaText>
                          <AuthorName>{post.author}</AuthorName>
                          <PostDate>{post.date} · {post.readTime}</PostDate>
                        </PostMetaText>
                      </FeaturedPostMeta>
                    </FeaturedPostContent>
                  </Link>
                </FeaturedPostCard>
              ))}
            </FeaturedGrid>
          </FeaturedSection>
        )}

        <FiltersSection>
          <SearchContainer>
            <SearchIcon>🔍</SearchIcon>
            <SearchInput 
              type="text" 
              placeholder="Search articles..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <ClearSearchButton onClick={() => setSearchTerm('')}>×</ClearSearchButton>
            )}
          </SearchContainer>
          
          <CategoryFilters>
            {categories.map(category => (
              <CategoryButton
                key={category}
                isActive={selectedCategory === category}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </CategoryButton>
            ))}
          </CategoryFilters>
        </FiltersSection>

        <BlogPostsSection>
          <SectionTitle>Latest Articles</SectionTitle>
          {filteredPosts.length > 0 ? (
            <BlogPostsGrid>
              {filteredPosts.map(post => (
                <BlogPostCard
                  key={post.id}
                  as={motion.div}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <Link to={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                    <BlogPostImage style={{ backgroundImage: `url(${post.image})` }}>
                      <BlogPostCategory>{post.category}</BlogPostCategory>
                    </BlogPostImage>
                    <BlogPostContent>
                      <BlogPostTitle>{post.title}</BlogPostTitle>
                      <BlogPostExcerpt>{post.excerpt}</BlogPostExcerpt>
                      <BlogPostMeta>
                        <AuthorImage src={post.authorImage} alt={post.author} />
                        <PostMetaText>
                          <AuthorName>{post.author}</AuthorName>
                          <PostDate>{post.date} · {post.readTime}</PostDate>
                        </PostMetaText>
                      </BlogPostMeta>
                    </BlogPostContent>
                  </Link>
                </BlogPostCard>
              ))}
            </BlogPostsGrid>
          ) : (
            <NoResultsMessage>
              No articles found matching your search criteria. Try adjusting your filters or search term.
            </NoResultsMessage>
          )}
        </BlogPostsSection>

        <NewsletterSection>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <NewsletterTitle>Subscribe to Our Newsletter</NewsletterTitle>
            <NewsletterDescription>
              Get the latest digital marketing insights, strategies, and tips delivered straight to your inbox.
            </NewsletterDescription>
            <NewsletterForm>
              <NewsletterInput type="email" placeholder="Your email address" />
              <NewsletterButton>Subscribe</NewsletterButton>
            </NewsletterForm>
            <NewsletterDisclaimer>
              We respect your privacy. Unsubscribe at any time.
            </NewsletterDisclaimer>
          </motion.div>
        </NewsletterSection>
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
  padding-top: 80px; /* Add padding to account for fixed header */
`;

const HeroSection = styled.section`
  text-align: center;
  padding: 60px 0 60px;
`;

const GradientTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 20px;
  background: linear-gradient(90deg, #673AB7 0%, #03A9F4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const HeroDescription = styled.p`
  font-size: 1.2rem;
  max-width: 700px;
  margin: 0 auto;
  color: #B0B7C3;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 30px;
  color: #FFFFFF;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const FeaturedSection = styled.section`
  margin: 60px 0;
`;

const FeaturedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FeaturedPostCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
  
  &:hover {
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }
`;

const FeaturedPostImage = styled.div`
  height: 220px;
  background-size: cover;
  background-position: center;
  position: relative;
`;

const FeaturedPostCategory = styled.span`
  position: absolute;
  bottom: 15px;
  left: 15px;
  background: rgba(103, 58, 183, 0.9);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
`;

const FeaturedPostContent = styled.div`
  padding: 25px;
`;

const FeaturedPostTitle = styled.h3`
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 15px;
  color: #FFFFFF;
  line-height: 1.4;
`;

const FeaturedPostExcerpt = styled.p`
  font-size: 1rem;
  color: #B0B7C3;
  margin-bottom: 20px;
  line-height: 1.6;
`;

const FeaturedPostMeta = styled.div`
  display: flex;
  align-items: center;
`;

const AuthorImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
  object-fit: cover;
`;

const PostMetaText = styled.div`
  display: flex;
  flex-direction: column;
`;

const AuthorName = styled.span`
  font-size: 0.9rem;
  font-weight: 500;
  color: #FFFFFF;
`;

const PostDate = styled.span`
  font-size: 0.8rem;
  color: #B0B7C3;
`;

const FiltersSection = styled.section`
  margin: 40px 0;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 20px;
`;

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 20px;
`;

const SearchIcon = styled.span`
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #B0B7C3;
  font-size: 1rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 40px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #FFFFFF;
  font-size: 1rem;
  
  &::placeholder {
    color: #B0B7C3;
  }
  
  &:focus {
    outline: none;
    border-color: rgba(103, 58, 183, 0.5);
  }
`;

const ClearSearchButton = styled.button`
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #B0B7C3;
  font-size: 1.2rem;
  cursor: pointer;
  
  &:hover {
    color: #FFFFFF;
  }
`;

const CategoryFilters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const CategoryButton = styled.button<{ isActive: boolean }>`
  padding: 8px 16px;
  border-radius: 30px;
  border: none;
  background: ${props => props.isActive ? 'linear-gradient(90deg, #673AB7 0%, #03A9F4 100%)' : 'rgba(255, 255, 255, 0.05)'};
  color: ${props => props.isActive ? '#FFFFFF' : '#B0B7C3'};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.isActive ? 'linear-gradient(90deg, #673AB7 0%, #03A9F4 100%)' : 'rgba(255, 255, 255, 0.1)'};
  }
`;

const BlogPostsSection = styled.section`
  margin: 60px 0;
`;

const BlogPostsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const BlogPostCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
  
  &:hover {
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }
`;

const BlogPostImage = styled.div`
  height: 200px;
  background-size: cover;
  background-position: center;
  position: relative;
`;

const BlogPostCategory = styled.span`
  position: absolute;
  bottom: 15px;
  left: 15px;
  background: rgba(103, 58, 183, 0.9);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
`;

const BlogPostContent = styled.div`
  padding: 20px;
`;

const BlogPostTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 10px;
  color: #FFFFFF;
  line-height: 1.4;
`;

const BlogPostExcerpt = styled.p`
  font-size: 0.9rem;
  color: #B0B7C3;
  margin-bottom: 15px;
  line-height: 1.6;
`;

const BlogPostMeta = styled.div`
  display: flex;
  align-items: center;
`;

const NoResultsMessage = styled.div`
  text-align: center;
  padding: 50px 0;
  color: #B0B7C3;
  font-size: 1.1rem;
`;

const NewsletterSection = styled.section`
  text-align: center;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  padding: 60px 30px;
  margin: 80px 0 60px;
`;

const NewsletterTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 20px;
  color: #FFFFFF;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

// Blog post detail styled components
const BlogPostDetailContainer = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 0;
`;

const BlogPostDetailHeader = styled.div`
  margin-bottom: 2rem;
`;

const BlogPostDetailTitle = styled.h1`
  font-size: 2.5rem;
  margin: 1rem 0;
  background: linear-gradient(90deg, #0df9b6 0%, #de681d 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const BlogPostDetailMeta = styled.div`
  display: flex;
  align-items: center;
  margin-top: 1rem;
`;

const BlogPostDetailImage = styled.div`
  width: 100%;
  height: 400px;
  background-size: cover;
  background-position: center;
  border-radius: 8px;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    height: 250px;
  }
`;

const BlogPostDetailContent = styled.div`
  font-size: 1.1rem;
  line-height: 1.8;
  
  p {
    margin-bottom: 1.5rem;
  }
  
  h2 {
    font-size: 1.8rem;
    margin: 2rem 0 1rem;
    background: linear-gradient(90deg, #0df9b6 0%, #de681d 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  h3 {
    font-size: 1.4rem;
    margin: 1.5rem 0 1rem;
  }
`;

const NewsletterDescription = styled.p`
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto 30px;
  color: #B0B7C3;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const NewsletterForm = styled.form`
  display: flex;
  max-width: 500px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
  }
`;

const NewsletterInput = styled.input`
  flex: 1;
  padding: 15px;
  border-radius: 6px 0 0 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: #FFFFFF;
  font-size: 1rem;
  
  &::placeholder {
    color: #B0B7C3;
  }
  
  &:focus {
    outline: none;
    border-color: rgba(103, 58, 183, 0.5);
  }
  
  @media (max-width: 768px) {
    border-radius: 6px;
  }
`;

const NewsletterButton = styled.button`
  background: linear-gradient(90deg, #673AB7 0%, #03A9F4 100%);
  color: white;
  border: none;
  padding: 15px 25px;
  border-radius: 0 6px 6px 0;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    opacity: 0.9;
  }
  
  @media (max-width: 768px) {
    border-radius: 6px;
  }
`;

const NewsletterDisclaimer = styled.p`
  font-size: 0.8rem;
  color: #B0B7C3;
  margin-top: 15px;
`;

// Blog routes component
const BlogRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<BlogPage />} />
      <Route path="/:slug" element={<BlogPostDetail slug={window.location.pathname.split('/').pop() || ''} />} />
    </Routes>
  );
};

export default BlogRoutes;
