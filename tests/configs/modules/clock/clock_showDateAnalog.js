let config = {
	address: "0.0.0.0",
	ipWhitelist: [],
	timeFormat: 12,

	modules: [
		{
			module: "clock",
			position: "middle_center",
			config: {
				showTime: true,
				showDate: true,
				displayType: "analog"
			}
		}
	]
};

/*************** DO NOT EDIT THE LINE BELOW ***************/
if (typeof module !== "undefined") {
	module.exports = config;
}
