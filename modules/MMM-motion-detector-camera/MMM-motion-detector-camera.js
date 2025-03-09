const blazeface = require("@tensorflow-models/blazeface")
const tf = require("@tensorflow/tfjs-node")
const modeltf = tf.io.fileSystem("./modules/MMM-motion-detector-camera/model/model.json")
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
    console.log("blazeface model has been loaded")
    this.test = await tf.loadLayersModel(modeltf, false)
    console.log(this.test)
    // Calling detectFaces passing in our model
    this.detectFaces(model)
  },

  async detectFaces(model) {
    setInterval(async () => {
      const a = await model.estimateFaces(this.video, false)
      const [topLeftX, topLeftY] = a[0].topLeft
      console.log("top left X")
      console.log(topLeftX)
      console.log(topLeftY)
      if (a.length === 1) {
        // Screenshot and send pic
        const blob = await this.takeScreenshot(topLeftX, topLeftY)
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

  takeScreenshot(x, y) {
    return new Promise((resolve, reject) => {
      const ctx = this.canvas.getContext("2d")
      this.canvas.width = this.video.videoWidth
      this.canvas.height = this.video.videoHeight
      ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height)
      // const frame = ctx.getImageData(x, y, this.canvas.width - 200, this.canvas.height - 200)

      // // Create a temporary canvas to draw the image data
      // const tempCanvas = document.createElement('canvas');
      // const tempCtx = tempCanvas.getContext('2d');

      // // Set the temporary canvas size to match the image data size
      // tempCanvas.width = frame.width;
      // tempCanvas.height = frame.height;

      // // Put the ImageData into the temporary canvas
      // tempCtx.putImageData(frame, 0, 0);

      // // Convert the canvas content to a base64 image (png format)
      // const base64Image = tempCanvas.toDataURL('image/png');

      // console.log(base64Image);  // This will log the base64-encoded image string



      // console.log(frame)
      // const imgTensor = tf.browser.fromPixels(frame)
      // console.log(imgTensor)
      // let wtf = tf.image.resizeBilinear(imgTensor, [48, 48])
      // // Convert to grayscale by averaging the RGB channels
      // wtf = wtf.mean(2) // Now shape is [48, 48]

      // // Normalize pixel values to range [0, 1]
      // wtf = wtf.div(255.0)

      // const imageTensor = wtf.expandDims(0).expandDims(-1)
      // console.log(imageTensor)
      // const result = this.test.predict(imageTensor)

      // const predictedValue = result.arraySync()

      // const emotions = ["Angry", "Disgust", "Fear", "Happy", "Sad", "Surprise", "Neutral"]

      // // Find the index of the highest probability
      // const predictedIndex = predictedValue[0].indexOf(Math.max(...predictedValue[0]))

      // // Log the predicted emotion
      // console.log("Predicted Emotion:", emotions[predictedIndex])

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
    } else if (notification === "GET_SCREENSHOT") {
      try {
        const screenshot = await this.takeScreenshot()
        payload.pic = screenshot
        this.sendNotification("CURRENT_SCREENSHOT_TAKEN", payload)
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
