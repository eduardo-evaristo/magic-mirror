/* global NotificationFx */

Module.register("alert", {
	alerts: {},

	defaults: {
		effect: "slide", // scale|slide|genie|jelly|flip|bouncyflip|exploader
		alert_effect: "jelly", // scale|slide|genie|jelly|flip|bouncyflip|exploader
		display_time: 3500, // time a notification is displayed in seconds
		position: "center",
		welcome_message: false // shown at startup
	},

	getScripts () {
		return ["notificationFx.js"];
	},

	getStyles () {
		return ["font-awesome.css", this.file("./styles/notificationFx.css"), this.file(`./styles/${this.config.position}.css`)];
	},

	getTranslations () {
		return {
			bg: "translations/bg.json",
			da: "translations/da.json",
			de: "translations/de.json",
			en: "translations/en.json",
			es: "translations/es.json",
			fr: "translations/fr.json",
			hu: "translations/hu.json",
			nl: "translations/nl.json",
			ru: "translations/ru.json",
			th: "translations/th.json"
		};
	},

	getTemplate (type) {
		return `templates/${type}.njk`;
	},

	async start () {
		Log.info(`Starting module: ${this.name}`);

		if (this.config.effect === "slide") {
			this.config.effect = `${this.config.effect}-${this.config.position}`;
		}

		if (this.config.welcome_message) {
			const message = this.config.welcome_message === true ? this.translate("welcome") : this.config.welcome_message;
			await this.showNotification({ title: this.translate("sysTitle"), message });
		}
	},

	async notificationReceived (notification, payload, sender) {
		if (notification === "SHOW_ALERT") {
			if (payload.type === "notification") {
				this.showNotification(payload);
			} else {
				//TODO: Maybe refactor this later
				// Getting audio to be plaeyd along with alert
				const res = await fetch("http://localhost:5006/voice", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ text: payload.message })
				});

				// Creating audio context with the right sample rate
				const audioContext = new AudioContext({ sampleRate: 22050 });
				await audioContext.resume();

				// Creatinfg reader to read the stream from the http response
				const reader = res.body.getReader();
				let audioBufferQueue = [];
				this.isPlaying = false;
				let leftover = new Uint8Array(0);
				let nextStartTime = audioContext.currentTime;

				// Await at least 500ms of audio to begin
				let minBufferTime = 0.5;
				let startPlayback = false;

				const processStream = async () => {
					while (true) {
						const { done, value } = await reader.read();
						if (done) break;

						let chunk = new Uint8Array(leftover.length + value.length);
						chunk.set(leftover, 0);
						chunk.set(value, leftover.length);

						let remainder = chunk.length % 2;
						if (remainder !== 0) {
							leftover = chunk.slice(-remainder);
							chunk = chunk.slice(0, -remainder);
						} else {
							leftover = new Uint8Array(0);
						}

						const int16Array = new Int16Array(chunk.buffer);
						const float32Array = new Float32Array(int16Array.length);
						for (let i = 0; i < int16Array.length; i++) {
							float32Array[i] = int16Array[i] / 32768.0;
						}

						const audioBuffer = audioContext.createBuffer(
							1,
							float32Array.length,
							22050
						);
						audioBuffer.copyToChannel(float32Array, 0);

						audioBufferQueue.push(audioBuffer);

						// If we got at least 500ms in audio, we start playing it
						const totalBufferedTime = audioBufferQueue.reduce(
							(sum, buf) => sum + buf.duration,
							0
						);
						if (!startPlayback && totalBufferedTime >= minBufferTime) {
							startPlayback = true;
							// Set function to arrow function
							this.showAlert(payload, sender);
							playNextBuffer();
						}
					}
				};

				function playNextBuffer () {
					if (audioBufferQueue.length === 0) {
						this.isPlaying = false;
						return;
					}

					this.isPlaying = true;
					const buffer = audioBufferQueue.shift();
					const source = audioContext.createBufferSource();
					source.buffer = buffer;
					source.connect(audioContext.destination);

					const now = audioContext.currentTime;
					nextStartTime = Math.max(nextStartTime, now);
					source.start(nextStartTime);
					nextStartTime += buffer.duration;

					source.onended = () => {
						playNextBuffer();
					};
				}

				await processStream();
				this.sendNotification("AUDIO_FINISHED");
				console.log("alertou");
			}
		} else if (notification === "HIDE_ALERT") {
			this.hideAlert(sender);
		}
	},

	async showNotification (notification) {
		const message = await this.renderMessage(notification.templateName || "notification", notification);

		new NotificationFx({
			message,
			layout: "growl",
			effect: this.config.effect,
			ttl: notification.timer || this.config.display_time
		}).show();
	},

	async showAlert (alert, sender) {
		// If module already has an open alert close it
		if (this.alerts[sender.name]) {
			this.hideAlert(sender, false);
		}

		// Add overlay
		if (!Object.keys(this.alerts).length) {
			this.toggleBlur(true);
		}

		const message = await this.renderMessage(alert.templateName || "alert", alert);

		// Store alert in this.alerts
		this.alerts[sender.name] = new NotificationFx({
			message,
			effect: this.config.alert_effect,
			ttl: alert.timer,
			onClose: () => this.hideAlert(sender),
			al_no: "ns-alert"
		});

		// Show alert
		this.alerts[sender.name].show();

		// Add timer to dismiss alert and overlay
		if (alert.timer) {
			setTimeout(() => {
				this.hideAlert(sender);
			}, alert.timer);
		}
	},

	hideAlert (sender, close = true) {
		// Dismiss alert and remove from this.alerts
		if (this.alerts[sender.name]) {
			this.alerts[sender.name].dismiss(close);
			delete this.alerts[sender.name];
			// Remove overlay
			if (!Object.keys(this.alerts).length) {
				this.toggleBlur(false);
			}
		}
	},

	renderMessage (type, data) {
		return new Promise((resolve) => {
			this.nunjucksEnvironment().render(this.getTemplate(type), data, function (err, res) {
				if (err) {
					Log.error("Failed to render alert", err);
				}

				resolve(res);
			});
		});
	},

	toggleBlur (add = false) {
		const method = add ? "add" : "remove";
		const modules = document.querySelectorAll(".module");
		for (const module of modules) {
			module.classList[method]("alert-blur");
		}
	}
});
