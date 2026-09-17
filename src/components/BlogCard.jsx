import { Link } from 'react-router-dom';
import './BlogCard.css';

const BlogCard = ({ post }) => {
  return (
    <article className="blog-card">
      <Link to={`/blog/${post.id}`} className="blog-card-link">
        <div className="blog-card-image">
          <div className="blog-card-category">{post.categoryName}</div>
          <img
            src={post.image}
            alt={post.title}
            loading="lazy"
          />
        </div>
        <div className="blog-card-content">
          <div className="blog-card-meta">
            <span className="blog-card-date">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              {post.date}
            </span>
            <span className="blog-card-author">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              {post.author}
            </span>
          </div>
          <h2 className="blog-card-title">{post.title}</h2>
          <p className="blog-card-excerpt">{post.excerpt}</p>
          <div className="blog-card-readmore">
            Read More
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </div>
        </div>
      </Link>
    </article>
  );
};

export default BlogCard;
