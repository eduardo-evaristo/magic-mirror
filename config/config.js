let config = {
    language: 'pt',
    modules: [
        {module: "clock", position: "fullscreen_above", config: {},},
        // {
		// 	module: "weather",
		// 	position: "bottom_bar",
		// 	config: {
		// 		type: "forecast",
		// 		location: "Munich",
		// 		weatherProvider: "openweathermap",
		// 		weatherEndpoint: "/forecast/daily",
		// 		mockData: '"#####WEATHERDATA#####"'
		// 	}
		// },
		{
			module: "MMM-motion-detector-camera",
			position: 'lower_third', 
			config: {
				waitingText: "Esperando...",
				secondsBetweenChecks: 5000
			}
		},
		{
			module: "MMM-speech-recognition",
			position: 'lower_third', 
			config: {
				threshold: 0.6
			}
		},
    ]
}

/*************** DO NOT EDIT THE LINE BELOW ***************/
if (typeof module !== "undefined") { module.exports = config; }