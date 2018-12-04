const variablesHelper = require("../helpers/variables");
const cronController = require("../helpers/cron");

const onEnabled = () => {
	variablesHelper
		.reload()
		.then(() => cronController.init());
};
const onConfigurationChanged = () => {
	variablesHelper
		.reload()
		.then(() => cronController.init());
};

const beforeRemove = () => {
	cronController.stop();
}

module.exports.handleHooks = (hooks) => Object.assign(hooks, {
	onEnabled,
	onConfigurationChanged,
	beforeRemove,
});
