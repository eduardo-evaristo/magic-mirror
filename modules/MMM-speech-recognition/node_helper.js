const NodeHelper = require("node_helper")
const { createClient } = require("@deepgram/sdk");
const fs = require("fs")
const axios = require('axios').default;

module.exports = NodeHelper.create({
    start() {
        // The API key we created in step 3
        const deepgramApiKey = process.env.DEEPGRAM_API_KEY;

        // Replace with your file path and audio mimetype
        this.pathToFile = __dirname + "/audio.wav";

        // Initializes the Deepgram SDK
        this.deepgram = createClient(deepgramApiKey);
    },

    async sendToAi(transcribed_text) {
      const { data } = await axios.post(process.env.API_BASE_URL + '/ai', {question: transcribed_text, neededData: {blabla: 'hello'}})
      console.log(data)
      return data
    },

  async socketNotificationReceived(notification, payload) {
    if (notification === "AUDIO_RECORDED") {
        //Needs to be comverted first to binary
        const buffer = Buffer.from(new Uint8Array(payload)); 
        //fs.writeFileSync(__dirname + "/audio.wav", buffer);

        const { result, error } = await this.deepgram.listen.prerecorded.transcribeFile(
            buffer,
            {punctuate: true, model: 'nova-2', language: 'pt-BR' },
          );
        
          if (error) throw error;
          if (!error) console.dir(result, {depth: null});
          fs.rm(this.pathToFile)
          
          // If no transcription is found, return
          const text = result.results?.channels[0]?.alternatives[0]?.transcript;
          if (!text) return;

          if (/(quero|gostaria).*\bregistr\w*/i.test(text)) {
            const regex = /(?:meu\s*)?(?:nome\s*)(?:é\s*)?(\w+)/i;
            const match = text.match(regex);
            if (!match) return this.sendSocketNotification('REGISTER_NEW_USER', {error: true})
              
            this.sendSocketNotification('REGISTER_NEW_USER', {name: match[1]})
          }

          // Else, send it to the backend
          const data = await this.sendToAi(text)
          
          // Upon receving response, send it to the front end
          this.sendSocketNotification('AUDIO_TRANSCRIBED', data)
          
    }
  },
})
