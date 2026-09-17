import { useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import BlogSidebar from "../components/BlogSidebar";
import AdUnit from "../components/AdUnit";
import BlogAd from "../components/BlogAd";
import BlogRewardedAd from "../components/BlogRewardedAd";
import BlogBottomImage from "../components/BlogBottomImage";
import BlogPixel from "../components/BlogPixel";
import LanguageToggle from "../components/LanguageToggle";

import NonCategoryBlogLinks from "../components/NonCategoryBlogLinks";

import { getBlogPost, blogPosts, getBlogLanguage, getBlogTopicKey } from "../data/blogData";
import { isBlogAvailableForLanguage, orderBlogsByPriority } from "../data/blogData";
import { getCurrentSiteLanguage, getPriorityBlog, getCanonicalUrl } from "../config/siteConfig";
import { BLOG_VIEW_EVENT_NAME, useBlogViewTracking } from "../tracking";
import "./BlogDetail.css";
const HINDI_LOAN_CTA_TEXTS = [
  "लोन अप्लाई",
  "अभी लोन लें",
  "लोन के लिए",
  "अपना लोन लें",
  "अभी आवेदन करें",
  "लोन के लिए अप्लाई",
  "लोन अभी पाएं",
  "लोन शुरू करें",
  "लोन चेक करें",
];

const ENGLISH_LOAN_CTA_TEXTS = [
  "Apply for Loan",
  "Get Loan Now",
  "Apply Now",
  "Get Your Loan",
  "Apply Today",
  "Apply for a Loan",
  "Get Loan Now",
  "Start Your Loan",
  "Check Your Loan",
];

const AADHAAR_LOAN_SLUG = "aadhaarpe-loan-online-eligibility-check-apply";
const ENGLISH_AADHAAR_LOAN_SLUG =
  "aadhaarpe-loan-online-check-eligibility-apply";
const AADHAAR_LOAN_SLUGS = [
  AADHAAR_LOAN_SLUG,
  ENGLISH_AADHAAR_LOAN_SLUG,
  "aadhaarpe-loan-online-application-guide",
  "aadhaarpe-loan-online-application-process-guide",
];
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

const cleanPromptText = (value = "") =>
  value.replace(/[\p{Extended_Pictographic}\uFE0F]/gu, "").trim();

const BlogScrollPrompt = ({ section }) => {
  const headingHasScroll = section.heading.includes("Scroll");
  const textHasScroll = section.text?.includes("Scroll");
  const source = headingHasScroll
    ? section.heading
    : textHasScroll
      ? section.text
      : section.heading;
  const sourceHasScroll = source.includes("Scroll");
  const [beforeScroll, afterScroll = ""] = source.split("Scroll");
  const cleanedLead = cleanPromptText(
    headingHasScroll ? beforeScroll : section.heading,
  );
  const hindiFor = "\u0915\u0947 \u0932\u093f\u090f";
  const markerIndex = cleanedLead.lastIndexOf(hindiFor);
  const leadWords = cleanedLead.split(/\s+/);
  const fallbackSplit = Math.max(1, Math.ceil(leadWords.length / 2));
  const primary = headingHasScroll
    ? markerIndex > 0
      ? cleanedLead.slice(0, markerIndex).trim()
      : leadWords.slice(0, fallbackSplit).join(" ")
    : sourceHasScroll
      ? cleanedLead
      : leadWords.slice(0, fallbackSplit).join(" ");
  const context = sourceHasScroll
    ? headingHasScroll
      ? markerIndex > 0
        ? cleanedLead.slice(markerIndex).trim()
        : leadWords.slice(fallbackSplit).join(" ") ||
          "\u0915\u0947 \u0932\u093f\u090f"
      : cleanPromptText(beforeScroll)
    : leadWords.slice(fallbackSplit).join(" ");
  const actionSuffix = cleanPromptText(afterScroll);
  const accessibleText = [primary, context, "Scroll", actionSuffix]
    .filter(Boolean)
    .join(" ");

  return (
    <h2 className="scroll-heading" aria-label={accessibleText}>
      <span className="scroll-heading-primary">{primary}</span>
      {context && <span className="scroll-heading-hindi">{context}</span>}
      <span className="scroll-heading-action">
        Scroll {actionSuffix && <b>{actionSuffix}</b>}
      </span>
      <span className="scroll-heading-icons" aria-hidden="true">
        <span>&#128241;</span>
        <span>&#128071;</span>
      </span>
    </h2>
  );
};

const BlogDetail = () => {
  const { slug } = useParams();
  const requestedPost = getBlogPost(slug);
  const siteLanguage = getCurrentSiteLanguage();
  const post =
    requestedPost &&
    isBlogAvailableForLanguage(requestedPost, siteLanguage)
      ? requestedPost
      : null;
  const middlePosterRef = useRef(null);
  const [loanCtaOffset] = useState(
    () => Math.floor(Math.random() * HINDI_LOAN_CTA_TEXTS.length),
  );
  useBlogViewTracking(post);

  const sitePosts = orderBlogsByPriority(
    blogPosts.filter((item) => isBlogAvailableForLanguage(item, siteLanguage)),
    getPriorityBlog(),
  );
  const articleIndex = post
    ? sitePosts.findIndex((item) => item.id === post.id)
    : -1;
  const loanCtaTexts =
    siteLanguage === "en" ? ENGLISH_LOAN_CTA_TEXTS : HINDI_LOAN_CTA_TEXTS;
  const loanCtaText =
    loanCtaTexts[(Math.max(articleIndex, 0) + loanCtaOffset) % loanCtaTexts.length];
  const rewardTargetSlug =
    siteLanguage === "en" ? ENGLISH_AADHAAR_LOAN_SLUG : AADHAAR_LOAN_SLUG;
  const aadhaarRewardTargets = sitePosts
    .filter(
      (item) =>
        item.id !== post?.id &&
        getBlogLanguage(item) === siteLanguage &&
        getBlogTopicKey(item) === "aadhaar-loan",
    )
    .map((item) => item.id);
  const previousPost = articleIndex > 0 ? sitePosts[articleIndex - 1] : null;
  const nextPost =
    articleIndex >= 0 && articleIndex < sitePosts.length - 1
      ? sitePosts[articleIndex + 1]
      : null;

  if (!post)
    return (
      <div className="container">
        <div className="blog-error">
          <span>404</span>
          <h1>Article not found</h1>
          <p>The article may have moved or is no longer available.</p>
          <Link to="/">Return to latest stories</Link>
        </div>
      </div>
    );

  return (
    <>
      <Helmet>
        <title>{post.title} | FinanceLoan</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:title" content={`${post.title} | FinanceLoan`} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={post.image} />
        <link rel="canonical" href={getCanonicalUrl(`/blog/${slug}`)} />
        <script type="application/json" data-event-name={BLOG_VIEW_EVENT_NAME}>
          {JSON.stringify({
            event: BLOG_VIEW_EVENT_NAME,
            blog_slug: post.id,
            blog_title: post.title,
            blog_category: post.categoryName || post.category,
          })}
        </script>
      </Helmet>

      <div className="blog-detail-page">
        <div className="container">
          <nav className="blog-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            {post.category && (
              <>
                <Link to={`/category/${post.category}`}>
                  {post.categoryName}
                </Link>
                <span>/</span>
              </>
            )}
            <span>{post.title}</span>
          </nav>
          <div className="blog-ad-frame blog-top-ad-frame">
            <AdUnit
              key={`${post.id}-blog-top`}
              slot="MIDDLE_1"
              size="blog-normal"
              className="blog-normal-ad"
            />
          </div>
          <div className="blog-detail-layout">
            <article className="blog-detail-content">
              <header className="blog-detail-header">
                <BlogPixel blog={post} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                  <Link
                    className="blog-category-badge"
                    to={post.category ? `/category/${post.category}` : "/"}
                  >
                    {post.categoryName}
                  </Link>
                  <LanguageToggle />
                </div>
                <h1 className="blog-detail-title">{post.title}</h1>
                <div className="blog-detail-meta">
                  <span className="blog-meta-avatar" aria-hidden="true">
                    {post.author.charAt(0)}
                  </span>
                  <span>
                    <strong>{post.author}</strong>
                    <small>Author</small>
                  </span>
                  <span className="meta-divider" />
                  <span>
                    <strong>{post.date}</strong>
                    <small>Published</small>
                  </span>
                </div>
              </header>

              <figure className="blog-detail-image">
                <img
                  src={post.image}
                  alt={post.title}
                  width="1200"
                  height="675"
                  fetchPriority="high"
                />
                <figcaption>{post.title}</figcaption>
              </figure>
              <BlogAd
                key={'featured-image-ad-' + post.id}
                slot="MIDDLE_2"
                placement="featured"
              />
              <p className="blog-detail-lead">{post.excerpt}</p>
              <div className="blog-detail-body">
                {post.content.sections.map((section, index) => (
                  <section key={section.heading} className="blog-section">
                    {index === 1 ? (
                      <BlogScrollPrompt section={section} />
                    ) : (
                      <h2>{section.heading}</h2>
                    )}
                    {section.text &&
                      !(
                        index === 1 &&
                        section.text.includes("Scroll") &&
                        section.text.length < 100
                      ) && (
                        <div className="blog-text">
                          {renderSectionText(section.text)}
                        </div>
                      )}
                    {section.details && (
                      <div className="rewards-details">
                        <h3 className="rewards-title">
                          Top Ways to Get Rewards
                        </h3>
                        {section.details.map((item, i) => (
                          <details key={i} className="reward-item">
                            <summary>
                              <strong>{item.title}</strong>
                            </summary>
                            <p>{item.description}</p>
                          </details>
                        ))}
                      </div>
                    )}
                    {section.faqs && (
                      <div className="faq-section">
                        {section.faqs.map((faq, i) => (
                          <details key={i} className="faq-item">
                            <summary>
                              <strong>{faq.question}</strong>
                            </summary>
                            <p>{faq.answer}</p>
                          </details>
                        ))}
                      </div>
                    )}
                    {index === 1 && (
                      <>
                        <BlogBottomImage postId={post.id} imageRef={middlePosterRef} />
                        <BlogAd
                          key={'poster-ad-' + post.id}
                          slot="MIDDLE_2"
                          placement="poster"
                        />
                        {AADHAAR_LOAN_SLUGS.includes(post.id) ? (
                          <BlogRewardedAd
                            key={'guide-rewarded-' + post.id}
                            post={post}
                            renderTrigger={({ status, activeTargetSlug, openRewardedAd }) => (
                              <NonCategoryBlogLinks
                                currentPostId={post.id}
                                rewardStatus={status}
                                activeTargetSlug={activeTargetSlug}
                                onGuideClick={openRewardedAd}
                              />
                            )}
                          />
                        ) : (
                          <BlogRewardedAd
                            key={'rewarded-' + post.id}
                            post={post}
                            targetSlug={rewardTargetSlug}
                            targetSlugs={aadhaarRewardTargets}
                            ctaText={loanCtaText}
                          />
                        )}
                      </>
                    )}
                    {index === 3 && (
                      <BlogAd key={`${post.id}-middle-2`} slot="MIDDLE_2" placement="middle" />
                    )}
                    {index === 5 && (
                      <BlogAd key={`${post.id}-middle-3`} slot="MIDDLE_3" placement="middle" />
                    )}
                  </section>
                ))}
              </div>

              <div className="article-tags">
                <span>Topics</span>
                <Link to={post.category ? `/category/${post.category}` : "/"}>
                  {post.categoryName}
                </Link>
                <span>Business insights</span>
                <span>FinanceLoan guides</span>
              </div>
              <nav
                className="article-navigation"
                aria-label="Article navigation"
              >
                {previousPost ? (
                  <Link to={`/blog/${previousPost.id}`}>
                    <small>Previous article</small>
                    <strong>{previousPost.title}</strong>
                  </Link>
                ) : (
                  <span />
                )}
                {nextPost ? (
                  <Link className="next" to={`/blog/${nextPost.id}`}>
                    <small>Next article</small>
                    <strong>{nextPost.title}</strong>
                  </Link>
                ) : (
                  <span />
                )}
              </nav>

              <aside className="article-disclosures">
                <h2>Editorial information</h2>
                <div>
                  <section>
                    <h3>Disclaimer</h3>
                    <p>
                      FinanceLoan provides general informational and educational
                      content. Verify important financial or business decisions
                      with an appropriately qualified professional.
                    </p>
                  </section>
                  <section>
                    <h3>Advertiser disclosure</h3>
                    <p>
                      This website is supported by advertising. Advertising
                      relationships do not change our commitment to clear,
                      useful editorial content.
                    </p>
                  </section>
                </div>
              </aside>
            </article>
            <BlogSidebar currentPostId={post.id} />
          </div>
        </div>
      </div>
    </>
  );
};
export default BlogDetail;
