const variablesHelper = require("../helpers/variables");
const cronController = require("../helpers/cron");

const onEnabled = () => {
	console.log("ONENABLED HERE")
	// Initiate passport strategies
	variablesHelper
		.reload()
		.then(() => cronController.init());
};
const onConfigurationChanged = () => {
	console.log("ONCONFIGURATIONCHANGED HERE")
	// Initiate passport strategies
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
