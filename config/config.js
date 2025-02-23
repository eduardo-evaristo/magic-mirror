const { time } = require("systeminformation");

let config = {
    language: 'pt-br',
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
		{
			module: 'weather',
			position: 'top_right',
			config: {
				type: 'current',
				weatherProvider: 'openmeteo',
				apiBase: 'https://api.open-meteo.com/v1',
				unis: 'metric',
				showSun: false,
				degreeLabel: true,
				timeFormat: 24,
				lat: -20.1286,
				lon: -40.3080,
				showHumidity: true,
			}
		},
		{
			module: 'weather',
			position: 'top_right',
			config: {
				type: 'forecast',
				weatherProvider: 'openmeteo',
				apiBase: 'https://api.open-meteo.com/v1',
				unis: 'metric',
				degreeLabel: true,
				timeFormat: 24,
				lat: -20.1957,
				lon: -40.2473,
				showHumidity: false,
			}
		}
    ]
}

/*************** DO NOT EDIT THE LINE BELOW ***************/
if (typeof module !== "undefined") { module.exports = config; }