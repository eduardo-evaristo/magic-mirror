const blazeface = require("@tensorflow-models/blazeface")
const tf = require("@tensorflow/tfjs-node")
const baseURL = "http://localhost:5000"

Module.register("MMM-motion-detector-camera", {

  defaults: {
    waitingText: "waiting...",
    secondsBetweenChecks: 5000
  },

  /**
   * Pseudo-constructor for our module. Initialize stuff here.
   */
  async start() {
    this.waitingText = this.config.waitingText
    this.secondsBetweenChecks = this.config.secondsBetweenChecks

    // Getting camera
    const cam = await navigator.mediaDevices.getUserMedia({ video: true })
    // If we get our camera instance
    if (cam) {
        this.cam = cam
        // Updating DOM so we can see the camera, this should be hidden later on
        this.updateDom()
        this.test()
    } else {
      throw new Error("Camera is unavailable")
    }
  },

  async test() {
    // Setting tensorflow as backend
    await tf.setBackend("tensorflow")
    console.log("TensorFlow backend set to:", tf.getBackend())
    // Loading blazeface
    let model = await blazeface.load()
    console.log(model)
    // Calling detectFaces passing in our model
    this.detectFaces(model)
  },

  async detectFaces(model) {
    setInterval(async () => {
      const a = await model.estimateFaces(this.video, false)
      if (a.length === 1) {
        // Screenshot and send pic
        const blob = await this.takeScreenshot()
        console.log(blob)
        const result = await this.compareWithKnownFaces(blob)
        console.log(result)
      }
      console.log(a)
    }, this.secondsBetweenChecks)
  },

  async compareWithKnownFaces(blob) {
    const formData = new FormData()
    formData.append("screenshot", blob)

    const res = await fetch(baseURL + "/recognize", {
      method: "POST", body: formData
    })
    return res.json()
  },

  takeScreenshot() {
    return new Promise((resolve, reject) => {
      const ctx = this.canvas.getContext("2d")
      this.canvas.width = this.video.videoWidth
      this.canvas.height = this.video.videoHeight
      ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height)

      this.canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
          // this.sendSocketNotification("SCREENSHOT_TAKEN", { blob })
        } else {
          reject(new Error("Could not take screenshot"))
        }
      }, "image/png")
    })
  },

  async notificationReceived(notification, payload, sender) {
    if (notification === "GET_SCREENSHOT_FOR_REGISTER") {
      try {
        const screenshot = await this.takeScreenshot()
        console.log("foto tirada")
        this.sendNotification("SCREENSHOT_RECEIVED", { screenshot: screenshot, name: payload.name })
        console.log("Notificação enviada com sucesso!")
      } catch (error) {
        console.log(error)
      }
    }
  },

  /**
   * Render the page we're on.
   */
  getDom() {
    // If our cam is available, we show it
    if (this.cam) {
      const element = document.createElement("video")
      element.className = "video"
      const canvas = document.createElement("canvas")
      element.srcObject = this.cam
      element.play()
      this.canvas = canvas
      this.video = element
      return element
    }

    // Otherwise we show a 'waiting' placeholder text
    const wrapper = document.createElement("div")
    wrapper.innerHTML = `${this.waitingText}`

    return wrapper
  },

  getStyles() {
    return ["template.css"]
  },
})
