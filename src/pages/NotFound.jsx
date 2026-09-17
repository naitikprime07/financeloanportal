import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './NotFound.css';

const NotFound = () => {
  return (
    <>
      <Helmet>
        <title>404 - Page Not Found | FinanceLoan</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="not-found-page">
        <div className="container">
          <div className="not-found-content">
            <h1 className="not-found-title">404</h1>
            <h2 className="not-found-subtitle">Page Not Found</h2>
            <p className="not-found-text">
              Sorry, the page you're looking for doesn't exist or has been moved.
            </p>
            <Link to="/" className="home-btn">
              Go Back Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
