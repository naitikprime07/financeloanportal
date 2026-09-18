import AdUnit from "./AdUnit";

const BlogTopAd = ({ instanceKey }) => (
  <section className="blog-top-ad-frame" aria-label="Top advertisement">
    <AdUnit
      key={instanceKey}
      slot="MIDDLE_1"
      size="blog-normal"
      className="blog-normal-ad"
    />
  </section>
);

export default BlogTopAd;
