import BLOG_PIXELS from "../config/blogPixels";

export const getBlogPixelConfig = (blog) => {
  try {
    const key = blog?.pixelKey || blog?.category || blog?.slug;
    const configByKey = key ? BLOG_PIXELS[key] : null;
    const configByBlogId = Object.values(BLOG_PIXELS).find(
      (candidate) => candidate.blogId === blog?.id,
    );
    const config = configByKey || configByBlogId;
    if (config?.blogId && config.blogId !== blog?.id) return null;
    if (!config?.enabled || !config.pixelId) return null;
    return config;
  } catch {
    return null;
  }
};

const getBlogPixel = (blog) => getBlogPixelConfig(blog)?.pixelId || null;

export default getBlogPixel;