const NodeHelper = require("node_helper")
const fs = require("fs")

module.exports = NodeHelper.create({

  async socketNotificationReceived(notification, payload) {
    if (notification === "SCREENSHOT_TAKEN") {
        fs.writeFile(__dirname + "/screenshot.png", payload.blob, (err) => {
            if (err) console.log("Could not save pic")
        })
    }
  },
})
