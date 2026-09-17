import { Link } from "react-router-dom";
import { blogPosts, getBlogLanguage, getBlogTopicKey, orderBlogsByPriority } from "../data/blogData";
import { getPriorityBlog } from "../config/siteConfig";
import "./NonCategoryBlogLinks.css";

import personalLoanBtn from "../assets/buttons/personalLoan.svg";
import carLoanBtn from "../assets/buttons/carLoan.svg";
import goldLoanBtn from "../assets/buttons/goldLoan.svg";
import studentLoanBtn from "../assets/buttons/studentLoan.svg";
import homeLoanBtn from "../assets/buttons/homeLoan.svg";
import ePersonalLoanBtn from "../assets/buttons/e_personalLoan.svg";
import eCarLoanBtn from "../assets/buttons/e_carLoan.svg";
import eGoldLoanBtn from "../assets/buttons/e_goldLoan.svg";
import eStudentLoanBtn from "../assets/buttons/e_studentLoan.svg";
import eHomeLoanBtn from "../assets/buttons/e_homeLoan.svg";

const buttonMap = {
  "personal-loan-online-eligibility-check-apply": personalLoanBtn,
  "personal-loan-online-apply-guide": personalLoanBtn,
  "car-loan-check-offers-apply-online": carLoanBtn,
  "gold-loan-check-offers-apply-online": goldLoanBtn,
  "student-loan-education-finance-options": studentLoanBtn,
  "student-loan-online-education-finance-guide": studentLoanBtn,
  "home-loan-housing-finance-options": homeLoanBtn,
  "personal-loan-online-check-eligibility-apply": ePersonalLoanBtn,
  "personal-loan-online-application-guide": ePersonalLoanBtn,
  "car-loan-explore-financing-next-car": eCarLoanBtn,
  "gold-loan-explore-options-against-gold": eGoldLoanBtn,
  "student-loan-explore-education-financing": eStudentLoanBtn,
  "home-loan-explore-financing-dream-home": eHomeLoanBtn,
};

const NonCategoryBlogLinks = ({
  currentPostId,
  onGuideClick,
  rewardStatus,
  activeTargetSlug,
}) => {
  const aadhaarBlogs = [
    "aadhaarpe-loan-online-eligibility-check-apply", // Hindi
    "aadhaarpe-loan-online-check-eligibility-apply", // English
    "aadhaarpe-loan-online-application-guide", // Hindi variant
    "aadhaarpe-loan-online-application-process-guide" // English variant
  ];

  if (!aadhaarBlogs.includes(currentPostId)) return null;

  const currentPost = blogPosts.find((post) => post.id === currentPostId);
  const currentLanguage = getBlogLanguage(currentPost);
  const posts = orderBlogsByPriority(blogPosts.filter(
    (post) =>
      !post.category &&
      post.id !== currentPostId &&
      getBlogLanguage(post) === currentLanguage,
  ), getPriorityBlog());

  if (!posts.length) return null;

  const topicGroups = Array.from(
    posts.reduce((groups, post) => {
      const topicKey = getBlogTopicKey(post);
      if (!topicKey || !buttonMap[post.id]) return groups;

      const existing = groups.get(topicKey);
      if (existing) {
        existing.targetSlugs.push(post.id);
      } else {
        groups.set(topicKey, {
          topicKey,
          representative: post,
          targetSlugs: [post.id],
        });
      }
      return groups;
    }, new Map()).values(),
  );

  if (!topicGroups.length) return null;

  const disabled =
    Boolean(onGuideClick) &&
    ["waiting", "opened", "showing", "closable", "closed"].includes(
      rewardStatus,
    );

  const handleClick = (event, targetSlugs) => {
    if (!onGuideClick) return;
    event.preventDefault();
    if (disabled) return;
    onGuideClick(targetSlugs);
  };

  return (
    <nav className="non-category-blog-nav" aria-label="Loan guides">
      <div className="non-category-blog-grid">
        {topicGroups.map(({ topicKey, representative, targetSlugs }) => {
          const isActive = targetSlugs.includes(activeTargetSlug);
          return (
            <Link
              key={topicKey}
              to={`/blog/${representative.id}`}
              className={`non-category-blog-card${disabled ? " is-disabled" : ""}${isActive ? " is-active" : ""}`}
              onClick={(event) => handleClick(event, targetSlugs)}
              aria-disabled={disabled}
              aria-busy={isActive}
              tabIndex={disabled ? -1 : undefined}
            >
              <img
                src={buttonMap[representative.id]}
                alt={representative.categoryName}
                loading="lazy"
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default NonCategoryBlogLinks;
