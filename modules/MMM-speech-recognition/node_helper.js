const NodeHelper = require("node_helper")
const { createClient } = require("@deepgram/sdk");
const fs = require("fs")

module.exports = NodeHelper.create({
    start() {
        // The API key we created in step 3
        const deepgramApiKey = "API_KEY";

        // Replace with your file path and audio mimetype
        this.pathToFile = __dirname + "/audio.wav";

        // Initializes the Deepgram SDK
        this.deepgram = createClient(deepgramApiKey);
    },

  async socketNotificationReceived(notification, payload) {
    if (notification === "AUDIO_RECORDED") {
        //Needs to be comverted first to binary
        const buffer = Buffer.from(new Uint8Array(payload)); 
        fs.writeFileSync(__dirname + "/audio.wav", buffer);

        const { result, error } = await this.deepgram.listen.prerecorded.transcribeFile(
            fs.readFileSync(this.pathToFile),
            {punctuate: true, model: 'nova-2', language: 'pt-BR' },
          );
        
          if (error) throw error;
          if (!error) console.dir(result, {depth: null});
          this.sendSocketNotification('AUDIO_TRANSCRIBED', result)
          fs.rm(this.pathToFile)
    }
  },
})
