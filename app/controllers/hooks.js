const variablesHelper = require("../helpers/variables");
const cronController = require("../helpers/cron");
const contentListener = require("../helpers/contentListener");

const onEnabled = () => {
	variablesHelper
		.reload()
		.then(() => cronController.init());

	contentListener.start();
};
const onConfigurationChanged = () => {
	variablesHelper
		.reload()
		.then(() => cronController.init());
};

const beforeRemove = () => {
	cronController.stop();
	contentListener.stop();
}

module.exports.handleHooks = (hooks) => Object.assign(hooks, {
	onEnabled,
	onConfigurationChanged,
	beforeRemove,
});
