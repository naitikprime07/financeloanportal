import { NavLink } from 'react-router-dom';
import { categories } from '../data/blogData';
import './Sidebar.css';

const CategoryArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

const Sidebar = () => (
  <aside className="sidebar" aria-label="Category navigation">
    <div className="sidebar-section">
      <h3 className="sidebar-title">Categories</h3>
      <nav className="category-list">
        {categories.map((category) => (
          <NavLink
            key={category.id}
            to={`/category/${category.slug}`}
            className={({ isActive }) => `category-item${isActive ? ' active' : ''}`}
          >
            <span>{category.name}</span>
            <CategoryArrow />
          </NavLink>
        ))}
      </nav>
    </div>
  </aside>
);

export default Sidebar;