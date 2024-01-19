const { DateTime } = require("luxon");

module.exports = function (eleventyConfig) {
	eleventyConfig.addFilter("readableDate", dateObj => {
		return DateTime.fromJSDate(dateObj).toFormat("dd LLLL, yyyy");
	});

	eleventyConfig.addFilter("isoDate", dateObj => {
		return DateTime.fromJSDate(dateObj).toISO();
	});

	eleventyConfig.addPassthroughCopy({ './src/robots.txt': '/robots.txt' });

	return {
		dir: {
		  input: "src",
		},
		passthroughFileCopy: true,
	};
}