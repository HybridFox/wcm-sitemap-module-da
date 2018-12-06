const R = require("ramda");
const request = require("request-promise-native");
const wcmEventWrapper = require("@wcm/module-helper").emitter;
const variablesHelper = require("./variables");
const ContentTypeModel = require("@wcm/module-helper").models.ContentType;

const getContentType = (_id) => ContentTypeModel.findOne({ _id }).lean().exec();

const prefixes = {
	"blogpost": "blog/"
};

// Generate an object representation of a sitemap entry
const generateCustomMap = (contentType, [lang, location], lastmod, changefreq) => {
	let routePrefix = "";
	if (prefixes.hasOwnProperty(contentType)) {
		routePrefix = prefixes[contentType];
	}

	const langPrefix = lang ? `${lang}/` : ""

	return { loc: variablesHelper.get().baseURL + langPrefix + routePrefix + location, lastmod, changefreq };
};

const getLocations = (contentItem) => {
	const memes = R.compose(
		R.toPairs,
		R.omit(["multiLanguage"]),
		R.pathOr(null, ["meta", "slug"])
	)(contentItem);

	console.log(memes);
	return memes;
}

const generateSitemapObject = (contentType, content) => {
	const lastmod = R.pathOr(new Date().toISOString(), ["meta", "lastModified"])(content);

	return R.compose(
		R.map((loc) => generateCustomMap(contentType, loc, lastmod, "daily")),
		getLocations
	)(content);
};

const sendUpdate = (data) => request({
	url: variablesHelper.get().ssrURL,
	headers: {
		authorization: `token ${variablesHelper.get().ssrApiKey}`
	},
	method: "POST",
	json: true,
	body: data,
});

const contentChangeHandler = (content) => {
	if (content.toObject) {
		content = content.toObject();
	}
	// Skip if the content item is not published
	if (!R.path(["meta", "published"])(content)) {
		return;
	}

	return getContentType(R.pathOr(null, ["meta", "contentType"], content))
		.then((contentType) => {
			if (!R.path(["meta", "canBeFiltered"], contentType)) {
				return;
			}

			console.log("valid page")

			return generateSitemapObject(contentType.meta.safeLabel, content);
		})
		.then((data) => console.log(data) || sendUpdate(data))
		.then((res) => console.log(res.body))
};

const contentRemoveHandler = (content) => {
	if (content.toObject) {
		content = content.toObject();
	}

	return isPage(content).then((contentIsPage) => {
		// Skip if the content is not a page
		if (!contentIsPage) {
			return;
		}

		const data = generateSitemapObjects(content);

		console.log("send remove data", data);
	});
};

module.exports.start = () => {
	wcmEventWrapper.on("content.created", contentChangeHandler);
	wcmEventWrapper.on("content.updated", contentChangeHandler);
	wcmEventWrapper.on("content.removed", contentRemoveHandler);
	wcmEventWrapper.on("content.unpublished", contentRemoveHandler);
}

module.exports.stop = () => {
	wcmEventWrapper.off("content.created", contentChangeHandler);
	wcmEventWrapper.off("content.updated", contentChangeHandler);
	wcmEventWrapper.off("content.removed", contentRemoveHandler);
	wcmEventWrapper.off("content.unpublished", contentRemoveHandler);
}