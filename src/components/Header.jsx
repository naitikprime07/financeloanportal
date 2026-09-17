import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import mainLogo from '../assets/logo/mainLogo.png';
import './Header.css';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Customer Management', path: '/category/customer-management' },
    { name: 'Sales Automation', path: '/category/sales-automation' },
    { name: 'Business Growth', path: '/category/business-growth' },
    { name: 'CRM Solutions', path: '/category/crm-solutions' },
  ];

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <img className="logo-image" src={mainLogo} alt="FinanceLoan" />
          </Link>

          <nav className={`nav ${mobileMenuOpen ? 'active' : ''}`}>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </NavLink>
            ))}
          </nav>

          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
