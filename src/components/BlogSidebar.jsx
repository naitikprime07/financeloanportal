import AdUnit from './AdUnit';
import { blogPosts, isBlogAvailableForLanguage, orderBlogsByPriority } from '../data/blogData';
import { getCurrentSiteLanguage, getPriorityBlog } from '../config/siteConfig';
import './BlogSidebar.css';

const BlogSidebar = ({ currentPostId, onNavigate }) => {
  const handleClick = (e, postId) => {
    if (onNavigate) {
      e.preventDefault();
      e.stopPropagation();
      onNavigate(postId, e);
    }
  };

  const siteLanguage = getCurrentSiteLanguage();
  const trendingPosts = orderBlogsByPriority(
    blogPosts.filter((post) =>
      post.id !== currentPostId &&
      isBlogAvailableForLanguage(post, siteLanguage),
    ),
    getPriorityBlog(),
  )
    .slice(0, 4);
  return <aside className="blog-sidebar" aria-label="Trending articles">
    <section className="blog-sidebar-card">
      <div className="blog-sidebar-heading"><span>Popular stories</span><h2>Trending Now</h2></div>
      <div className="blog-sidebar-list">{trendingPosts.map((post,index)=><a key={post.id} href={`/blog/${post.id}`} onClick={(e) => handleClick(e, post.id)} className="blog-sidebar-item">
        <span className="trending-number">{String(index+1).padStart(2,'0')}</span><img src={post.image} alt="" loading="lazy"/><div><span>{post.categoryName}</span><h3>{post.title}</h3><small>{post.date}</small></div>
      </a>)}</div>
    </section>
  </aside>;
};
export default BlogSidebar;
