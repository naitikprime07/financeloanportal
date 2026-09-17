import AdUnit from "./AdUnit";

const BlogAd = ({ slot, placement, className = "" }) => {
  // Keep this slot compatible with the actual width of the poster column.
  const adSize = placement === "poster" ? "blog-poster" : "blog-normal";

  return (
    <div className={`blog-ad-frame blog-ad-frame--${placement}`.trim()}>
      <AdUnit
        slot={slot}
        size={adSize}
        className={`blog-normal-ad blog-normal-ad--${placement} ${className}`.trim()}
      />
    </div>
  );
};

export default BlogAd;