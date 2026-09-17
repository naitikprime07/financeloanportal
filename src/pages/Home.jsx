import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import BlogCard from '../components/BlogCard';
import Sidebar from '../components/Sidebar';
import AdUnit from '../components/AdUnit';
import { getBlogsForCurrentSiteOrdered } from '../data/blogData';
import { getCurrentSiteLanguage, getPrimaryCategory, getPriorityBlog, getCanonicalUrl } from '../config/siteConfig';
import './Home.css';

const POSTS_PER_PAGE = 12;

const Home = () => {
  const [currentPage, setCurrentPage] = useState(1);

  // Filter and order blogs based on current site language and primary category
  const filteredBlogs = useMemo(() => getBlogsForCurrentSiteOrdered(getCurrentSiteLanguage, getPrimaryCategory, getPriorityBlog), []);

  const totalPages = Math.ceil(filteredBlogs.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const currentPosts = filteredBlogs.slice(startIndex, startIndex + POSTS_PER_PAGE);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Helmet>
        <title>FinanceLoan - Latest Business News, CRM Reviews, and Growth Strategies</title>
        <meta name="description" content="FinanceLoan brings you latest business insights, CRM reviews, sales automation strategies, and expert guides. Explore trending topics and business solutions." />
        <meta property="og:title" content="FinanceLoan - Latest Business News & Insights" />
        <meta property="og:description" content="Stay updated with business news, CRM reviews, sales automation trends, and expert insights." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={getCanonicalUrl('/')} />
      </Helmet>

      <div className="home-page">
        <div className="container">
          <div className="home-layout">
            <div className="main-content-area">
              <h1 className="page-title">Latest Stories</h1>

              <div className="blog-grid">
                {currentPosts.slice(0, 3).map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>

              <AdUnit slot="MIDDLE_1" />

              <div className="blog-grid">
                {currentPosts.slice(3, 6).map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>

              <AdUnit slot="MIDDLE_2" />

              <div className="blog-grid">
                {currentPosts.slice(6, 9).map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>

              <AdUnit slot="MIDDLE_3" size="native" />

              <div className="blog-grid">
                {currentPosts.slice(9).map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`page-btn ${currentPage === page ? 'active' : ''}`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}

            </div>

            <Sidebar />
          </div>

          <div className="disclaimer-section">
            <h2>DISCLAIMER</h2>
            <p>
              The information provided on FinanceLoan is for general informational and educational purposes only. It is not
              a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other
              qualified health provider with any questions you may have regarding a medical condition.
            </p>

            <h2>ADVERTISER DISCLOSURE</h2>
            <p>
              This website is supported by third-party advertising and promotional programs. Some links and rewards mentioned are
              sponsored content from our partners. All participation in external offers is voluntary and subject to the terms of the
              respective providers.
            </p>

            <h2>EDITORIAL NOTE</h2>
            <p>
              While we strive to keep our health tips and blog information accurate and up-to-date, wellness trends and scientific
              research evolve quickly. Details such as eligibility for rewards or specific health benefits should be verified with the original
              source or a certified professional.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
