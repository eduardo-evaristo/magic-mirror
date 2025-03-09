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

    //TODO: Fix the body
    async sendToAi(transcribedText) {
      try {
        const { data } = await axios.post(process.env.API_BASE_URL + '/ai', {question: transcribedText, neededData: {blabla: 'hello'}})
        return data  
      } catch (err) {
        console.log('Deu erro nessa porraaaaaaa')
        return this.sendSocketNotification('NOTHING_IN_TRANSCRIPTION')
      }
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
        
          if (error) {
            console.log('Deuerro nesse fela da gaita')
            return this.sendSocketNotification('NOTHING_IN_TRANSCRIPTION')
          }
          // if (!error) console.dir(result, {depth: null});
          // fs.rm(this.pathToFile)
          
          // If no transcription is found, return
          const text = result.results?.channels[0]?.alternatives[0]?.transcript;
          console.log(text)
          if (!text) return this.sendSocketNotification('NOTHING_IN_TRANSCRIPTION')

          // Upon receving transcription, send it to rasa, for intent extraction
          const data = await this.getIntent(text)
          const intent = data.intent

          // If the user's intent is NOT internal, we just pipe that to the AI API already
          if (intent === 'handle_to_ai') {
            console.log('here')
            // We get the AI's response by destructuring
            const aiResponse = await this.sendToAi(data.text)

            // Upon receving response, send it to the front end
            return this.sendSocketNotification('AUDIO_TRANSCRIBED', aiResponse)
          }

          if (intent.includes('module')) {
            //Getting module's name
            const entity = data.entities
            
            // Alerting the front end so can it forward the word to other modules
            this.sendSocketNotification(intent, entity)
          }

          // {
          //   text: 'Gostaria que removesse o relógio da tela por favor?',
          //   intent: { name: 'show_module', confidence: 0.9853608012199402 },
          //   entities: [
          //     {
          //       entity: 'module',
          //       start: 25,
          //       end: 32,
          //       confidence_entity: 0.9899289011955261,
          //       value: 'relógio',
          //       extractor: 'DIETClassifier',
          //       processors: [Array]
          //     }
          //   ],
          //   text_tokens: [
          //     [ 0, 8 ],   [ 9, 12 ],
          //     [ 13, 22 ], [ 23, 24 ],
          //     [ 25, 32 ], [ 33, 35 ],
          //     [ 36, 40 ], [ 41, 44 ],
          //     [ 45, 50 ]
          //   ],
          //   intent_ranking: [
          //     { name: 'show_module', confidence: 0.9853608012199402 },
          //     { name: 'hide_module', confidence: 0.008354680612683296 },
          //     { name: 'handle_to_ai', confidence: 0.006284565664827824 }
          //   ],
          //   response_selector: {
          //     all_retrieval_intents: [],
          //     default: { response: [Object], ranking: [] }
          //   }
          // } 
          

          // if (/(quero|gostaria).*\bregistr\w*/i.test(text)) {
          //   const regex = /(?:meu\s*)?(?:nome\s*)(?:é\s*)?(\w+)/i;
          //   const match = text.match(regex);
          //   if (!match) return this.sendSocketNotification('REGISTER_NEW_USER', {error: true})
              
          //   this.sendSocketNotification('REGISTER_NEW_USER', {name: match[1]})
          // }

          
          
    }
  },
  
  async getIntent(textToGetIntentFrom) {
    const {data: {intent, entities, text}} = await axios.post('http://localhost:5005/model/parse', {text: textToGetIntentFrom})

    //TODO: Handel errors

    return {intent: intent.name, entities: entities.length === 0 ? [] : entities[0].value, text}
  }
})
