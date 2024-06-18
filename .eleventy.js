import { DateTime } from "luxon";
import pluginRss from "@11ty/eleventy-plugin-rss";

export default function (eleventyConfig) {
	eleventyConfig.addFilter("readableDate", dateObj => {
		return DateTime.fromJSDate(dateObj).toFormat("dd LLLL, yyyy");
	});

	eleventyConfig.addFilter("isoDate", dateObj => {
		return DateTime.fromJSDate(dateObj).toISO();
	});

	eleventyConfig.addPassthroughCopy({ './src/robots.txt': '/robots.txt' });

	eleventyConfig.addPlugin(pluginRss);

	return {
		dir: {
			input: "src",
		},
		passthroughFileCopy: true,
	};
}