const NodeHelper = require("node_helper")
const { createClient } = require("@deepgram/sdk");
const fs = require("fs")
const fsS = require('node:fs/promises')
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
      try {
        const { data } = await axios.post(process.env.API_BASE_URL + '/ai', {question: transcribed_text, neededData: {blabla: 'hello'}})
        console.log(data)
        return data

      } catch(err) {
        console.log(err)
        this.sendSocketNotification('AI_ERR')
        return 'Something went wrong'
      }
      
    },

  async socketNotificationReceived(notification, payload) {
    if (notification === "AUDIO_RECORDED") {
      try {
        //Needs to be comverted first to binary
        const buffer = Buffer.from(new Uint8Array(payload));

        // The file of the first audio clip is not written by the time it gets to the transcription part.
        // This causes the second audio clip to actually process the first one,
        // because the first one will be written by the time the second one reaches here.
        // However, the second one won't be written until the transcription part is hit.

        // fs.writeFileSync(__dirname + "/audio.wav", buffer);

        // I'll leave this here for reference, however, I'm using the buffer straight away now

        // console.log('Writing audio file...');
        // await fsS.writeFile(__dirname + "/audio.wav", buffer)
        // console.log('Audio file written...');

        // Sending audio for Deepgram to transcribe
        const { result, error } = await this.deepgram.listen.prerecorded.transcribeFile(
          buffer,
          {punctuate: true, model: 'nova-2', language: 'pt-BR' },
        );
        
        // After Deepgram has responded we check for errors, if any, we return a notification
        console.log(error)

        //At the first recording, deepgram is not checking my audio clip, at the second one, it checks the FIRST one, not the second, gotta fix this!!!!
        console.log(result.results?.channels[0]?.alternatives[0]?.transcript)
        if (error !== null) return this.sendSocketNotification('ERR_AUDIO_TRANSCRIBED')
        
        // After Deepgram has responded with the transcription, we check if words were recognized, if not, we return a notification
        const text = result?.results?.channels[0]?.alternatives[0]?.transcript;
        if (!text) return this.sendSocketNotification('ERR_AUDIO_TRANSCRIBED');
        console.log('There is text')

        

        // Else, send it to the backend to get a response from the AI
        const data = await this.sendToAi(text)
        
        // Upon receving response, send it to the front end
        this.sendSocketNotification('AUDIO_TRANSCRIBED', data)
        
      } catch (error) {
        console.log('Transcription failed!', error)
        this.sendSocketNotification('ERR_AUDIO_TRANSCRIBED');
      }
        
          
    }
  },
})
