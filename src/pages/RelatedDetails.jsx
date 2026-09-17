import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { getBlogPost, isBlogAvailableForLanguage } from "../data/blogData";
import { getCurrentSiteLanguage } from "../config/siteConfig";
import "./RelatedDetails.css";

import personalLoanBtn from "../assets/buttons/personalLoan.svg";
import aadhaarLoanBtn from "../assets/buttons/aadharPeLoan.svg";
import carLoanBtn from "../assets/buttons/carLoan.svg";
import goldLoanBtn from "../assets/buttons/goldLoan.svg";
import studentLoanBtn from "../assets/buttons/studentLoan.svg";
import homeLoanBtn from "../assets/buttons/homeLoan.svg";
import localImage from "../assets/buttons/localImage.svg";

const buttonImageMap = {
  "personal-loan-online-eligibility-check-apply": personalLoanBtn,
  "personal-loan-online-apply-guide": personalLoanBtn,
  "aadhaarpe-loan-online-eligibility-check-apply": aadhaarLoanBtn,
  "aadhaarpe-loan-online-application-guide": aadhaarLoanBtn,
  "car-loan-check-offers-apply-online": carLoanBtn,
  "gold-loan-check-offers-apply-online": goldLoanBtn,
  "student-loan-education-finance-options": studentLoanBtn,
  "student-loan-online-education-finance-guide": studentLoanBtn,
  "home-loan-housing-finance-options": homeLoanBtn,
};

const RelatedDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const requestedPost = getBlogPost(slug);
  const post =
    requestedPost &&
    isBlogAvailableForLanguage(requestedPost, getCurrentSiteLanguage())
      ? requestedPost
      : null;
  const [mobile, setMobile] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!post) {
    return (
      <div className="container">
        <div className="blog-error">
          <span>404</span>
          <h1>Article not found</h1>
          <Link to="/">Return to home</Link>
        </div>
      </div>
    );
  }

  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 10) {
      setMobile(value);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();

    if (mobile.length !== 10) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    alert(`Application submitted for ${post.categoryName}\nMobile: ${mobile}`);
    setIsSubmitting(false);
    setMobile("");
  };

  // Function to render section text (same as BlogDetail)
  const renderSectionText = (text) =>
    text.split("\n\n").map((block, index) => {
      const lines = block.split("\n").filter(Boolean);
      if (lines.length > 1)
        return (
          <ul key={index}>
            {lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        );
      return <p key={index}>{block}</p>;
    });

  // Calculate middle point for image insertion
  const sections = post.content?.sections || [];
  const middleIndex = Math.floor(sections.length / 2);

  return (
    <>
      <Helmet>
        <title>{post.title} - Apply Now | FinanceLoan</title>
        <meta name="description" content={post.excerpt} />
      </Helmet>

      <div className="related-details-page">
        <div className="container">
          <nav className="related-breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to={`/blog/${post.id}`}>{post.title}</Link>
            <span>/</span>
            <span>Apply Now</span>
          </nav>

          <div className="related-details-content">
            <div className="related-blog-header">
              <div className="related-category-badge">{post.categoryName}</div>
              <h1 className="related-title">{post.title}</h1>
              <p className="related-excerpt">{post.excerpt}</p>
            </div>

            {/* Complete Blog Content */}
            <div className="related-blog-content">
              {sections.map((section, index) => {
                // Skip FAQ section
                if (section.faqs) {
                  return null;
                }

                return (
                  <div key={index}>
                    <section className="blog-content-section">
                      <h2>{section.heading}</h2>
                      {section.text && (
                        <div className="blog-section-text">
                          {renderSectionText(section.text)}
                        </div>
                      )}
                      {section.details && (
                        <div className="rewards-details">
                          {section.details.map((item, i) => (
                            <div key={i} className="reward-card">
                              <div className="reward-icon">+</div>
                              <div className="reward-content">
                                <h4 className="reward-heading">{item.title}</h4>
                                <p className="reward-description">{item.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>

                    {/* Insert image in the middle of content */}
                    {index === middleIndex && (
                      <div className="middle-image-section">
                        <img src={localImage} alt="Apply for loan" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <form className="related-apply-form" onSubmit={handleApply}>
              <h3>अभी आवेदन करें</h3>
              <p>अपना मोबाइल नंबर दर्ज करें और आवेदन शुरू करें</p>

              <div className="form-group">
                <label htmlFor="mobile">Mobile Numbers</label>
                <input
                  type="tel"
                  id="mobile"
                  className="mobile-number-input"
                  value={mobile}
                  onChange={handleMobileChange}
                  placeholder=""
                  required
                  pattern="[0-9]{10}"
                  maxLength="10"
                />
              </div>

              <button
                type="submit"
                className="apply-submit-btn"
                disabled={isSubmitting || mobile.length !== 10}
              >
                {isSubmitting
                  ? "आवेदन जमा हो रहा है..."
                  : "लोन के लिए अप्लाई करें"}
              </button>

              <p className="privacy-note">
                आवेदन करके आप हमारी शर्तों और गोपनीयता नीति से सहमत होते हैं
              </p>
            </form>

            <button
              className="back-to-article-btn"
              onClick={() => navigate(`/blog/${post.id}`)}
            >
              ← ब्लॉग पर वापस जाएं
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default RelatedDetails;
