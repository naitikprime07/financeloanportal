import { Link } from 'react-router-dom';
import mainLogo from '../assets/logo/mainLogo.png';
import { categories } from '../data/blogData';
import './Footer.css';

const Footer = () => {
  const companyLinks = [
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const legalLinks = [
    { name: 'Terms of Service', path: '/terms' },
    { name: 'Privacy Policy', path: '/privacy' },
  ];

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section footer-brand">
            <Link to="/" className="footer-logo">
              <img className="footer-logo-image" src={mainLogo} alt="FinanceLoan" />
            </Link>
            <p className="footer-description">
              Your ultimate destination for finance news, reviews, and insights. Making finance knowledge accessible for everyone.
            </p>
          </div>

          <div className="footer-section">
            <h3>Categories</h3>
            <ul className="footer-links">
              {categories.map((item) => (
                <li key={item.id}>
                  <Link to={"/category/" + item.slug}>{item.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-section">
            <h3>Company</h3>
            <ul className="footer-links">
              {companyLinks.map((item) => (
                <li key={item.path}>
                  <Link to={item.path}>{item.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-section">
            <h3>Legal</h3>
            <ul className="footer-links">
              {legalLinks.map((item) => (
                <li key={item.path}>
                  <Link to={item.path}>{item.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} FinanceLoan. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
