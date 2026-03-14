const fs = require("fs");
const path = require("path");

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL || "https://premier-insight.vercel.app",
  generateRobotsTxt: true,
  sitemapSize: 7000,
  robotsTxtOptions: {
    policies: [{ userAgent: "*", allow: "/" }],
  },
  additionalPaths: async () => {
    const articlesDir = path.join(process.cwd(), "content/articles");
    if (!fs.existsSync(articlesDir)) return [];

    const files = fs
      .readdirSync(articlesDir)
      .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));

    return files.map((filename) => {
      const slug = filename.replace(/\.(mdx|md)$/, "");
      const raw = fs.readFileSync(path.join(articlesDir, filename), "utf-8");
      const match = raw.match(/publishedAt:\s*["']?(\d{4}-\d{2}-\d{2})["']?/);
      const lastmod = match ? match[1] : new Date().toISOString().slice(0, 10);
      return {
        loc: `/articles/${slug}`,
        lastmod,
        changefreq: "monthly",
        priority: 0.7,
      };
    });
  },
};
