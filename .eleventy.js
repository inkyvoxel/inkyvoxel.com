import { DateTime } from "luxon";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";

import fs from "fs/promises";
import path from "path";

async function loadSiteData() {
  const dataPath = path.resolve("./src/_data/site.json");
  const jsonData = await fs.readFile(dataPath, "utf8");
  return JSON.parse(jsonData);
}

export default async function (eleventyConfig) {
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj).toFormat("dd LLLL, yyyy");
  });

  eleventyConfig.addFilter("isoDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj).toISO();
  });

  eleventyConfig.addPassthroughCopy({ "./src/robots.txt": "/robots.txt" });

  const siteData = await loadSiteData();

  eleventyConfig.addPlugin(feedPlugin, {
    type: "atom",
    outputPath: "/feed.atom",
    collection: {
      name: "post",
      limit: 10,
    },
    metadata: {
      language: "en",
      title: siteData.title,
      subtitle: siteData.description,
      base: siteData.url,
      author: {
        name: "Mark Brady",
        email: "hello@inkyvoxel.com",
      },
    },
  });

  return {
    dir: {
      input: "src",
    },
    passthroughFileCopy: true,
  };
}
