// const { io } = require("socket.io-client")

// const baseURLSpeech = 'http://localhost:5000'

// Module.register("MMM-speech-recognition", {
//     async start() {
//         this.getWebSocket()
//         this.context = new AudioContext()
//         this.processor = this.context.createScriptProcessor(1024 * 16, 1, 1)
//         this.processor.connect(this.context.destination)
//         const audio = await this.getAudio()
//         if (!audio) throw new Error('Couldnt get audio') 
//         this.handleMicStream()
//         this.ws.on('message', (msg) => {
//             console.log(msg)
//         })

//     },

//     handleMicStream() {
//         input = this.context.createMediaStreamSource(this.audio)

//         this.analyser = this.context.createAnalyser();
//         this.analyser.fftSize = 256; // Smaller size for quick response
//         input.connect(this.analyser); // Analyze the audio stream

//         input.connect(this.processor)

//         this.processor.onaudioprocess = e => {
//             this.micProcess(e)
//         }
//     },

//     micProcess(e) {
//         // Check if audio exceeds threshold
//         const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
//         this.analyser.getByteFrequencyData(dataArray);
//         const maxVolume = Math.max(...dataArray) / 255;

//         const threshold = 0.1; // Adjust this as needed
//         if (maxVolume > threshold) {
//             const left = e.inputBuffer.getChannelData(0); // get only one audio channel
//             const left16 = this.convertFloat32ToInt16(left); // skip if you don't need this
//             this.ws.emit('micBinaryStream', left16); // send to server via web socket
//         }
//     },

//     convertFloat32ToInt16(buffer) {
//         let l = buffer.length;
//         const buf = new Int16Array(l / 3);
    
//         while (l--) {
//           if (l % 3 === 0) {
//             buf[l / 3] = buffer[l] * 0xFFFF;
//           }
//         }
//         return buf.buffer;
//     },

//     async getAudio() {
//         const audioSrc = await navigator.mediaDevices.getUserMedia({audio: true})
//         if (audioSrc) {
//             this.audio = audioSrc
//             return audioSrc
//         } else {
//             throw new Error('Could not get audio device')
//         }
//     },

//     getWebSocket() {
//         const ws = io(baseURLSpeech)

//         // Handle successful connection
//         ws.on('connect', () => {
//         console.log('Connected to Flask-SocketIO server');
//         this.ws = ws;  // Save the SocketIO instance to `this.socket`
//     });

//     // Handle messages from the server
//     ws.on('message', (msg) => {
//         console.log('Received message:', msg);
//         // You can process the incoming message here
//     });

//     ws.on('transcriptionResult', (msg) => {
//         console.log('Transcribed Text:', msg.text);
//         this.sendNotification('SPEECH_USER', {text: msg.text});  // Send to MagicMirror
//     });

//     // Handle connection error
//     ws.on('connect_error', (error) => {
//         console.error('SocketIO connection error:', error);
//         throw new Error('Could not connect to Flask-SocketIO');
//     });

//     // Handle connection closure
//     ws.on('disconnect', () => {
//         console.log('Disconnected from Flask-SocketIO server');
//     });
//     },

//     sendAudio() {
//         while (true) {
//             this.ws.send(this.audio.getAudioTracks())
//         }
//     }
// })

// const { io } = require("socket.io-client")

// const baseURLSpeech = 'http://localhost:5000'

// Module.register("MMM-speech-recognition", {
//     async start() {
//         this.audioChunks = []
//         this.threshold = 0.5
//         this.getWebSocket()
//         this.context = new AudioContext()
//         const audio = await this.getAudio()
//         if (!audio) throw new Error('Couldnt get audio') 
//         //Create stream source
//         this.source = this.context.createMediaStreamSource(this.audio)
//         //Attach/Create analyser to the context as well
//         this.analyser = this.context.createAnalyser()
//         //Connect our analyser (run by the context) to our source
//         this.source.connect(this.analyser)
//         this.analyser.fftsize = 256;

//         //Create a media recorder with our stream (audio from mic)
//         this.mediaRecorder = new MediaRecorder(this.audio)
//         this.dataArray = new Uint8Array(this.analyser.frequencyBinCount)
//         this.checkVolume()

//         this.mediaRecorder.ondataavailable = (event) => {
//             if (event.data.size > 0) {
//               this.audioChunks.push(event.data);
//         }
//     }},

//     checkVolume() {
//         this.analyser.getByteFrequencyData(this.dataArray);
//         const maxVol = Math.max(...this.dataArray) / 255;

//         if (maxVol > this.threshold && this.mediaRecorder.state === 'inactive') {
//             this.mediaRecorder.start()
//             console.log('recording')
    
//         } else if (maxVol <= this.threshold && this.mediaRecorder.state === 'recording') {
//             this.mediaRecorder.stop()
//             console.log("Recording stopped");
//             this.sendAudio();
//         }
//         requestAnimationFrame(this.checkVolume.bind(this));
//     },

//     async getAudio() {
//         const audioSrc = await navigator.mediaDevices.getUserMedia({audio: true})
//         if (audioSrc) {
//             this.audio = audioSrc
//             return audioSrc
//         } else {
//             throw new Error('Could not get audio device')
//         }
//     },

//     getWebSocket() {
//         const ws = io(baseURLSpeech)

//         // Handle successful connection
//         ws.on('connect', () => {
//         console.log('Connected to Flask-SocketIO server');
//         this.ws = ws;  // Save the SocketIO instance to `this.socket`
//     });

//     // Handle messages from the server
//     ws.on('message', (msg) => {
//         console.log('Received message:', msg);
//         // You can process the incoming message here
//     });

//     ws.on('transcriptionResult', (msg) => {
//         console.log('Transcribed Text:', msg.text);
//         this.sendNotification('SPEECH_USER', {text: msg.text});  // Send to MagicMirror
//     });

//     // Handle connection error
//     ws.on('connect_error', (error) => {
//         console.error('SocketIO connection error:', error);
//         throw new Error('Could not connect to Flask-SocketIO');
//     });

//     // Handle connection closure
//     ws.on('disconnect', () => {
//         console.log('Disconnected from Flask-SocketIO server');
//     });
//     },

//     sendAudio() {
//         if (this.audioChunks.length > 0) {
//           const blob = new Blob(this.audioChunks, {type: 'audio/wav'});
//           console.log(blob)
//           console.log(this.audioChunks);
//           this.sendSocketNotification("AUDIO_RECORDED", blob)
//           //this.ws.emit('micBinaryStream', blob); // Send audio blob to server
//           this.audioChunks = []; // Clear chunks after sending
//         }
//       },
//       socketNotificationReceived(notification, payload) {
//         if (notification === 'AUDIO_TRANSCRIBED') {
//             console.log(payload)
//         }
//       }
// })

Module.register("MMM-speech-recognition", {

    defaults: {
        threshold: 0.6
    },

    async start() {
        this.audioChunks = []
        this.threshold = this.config.threshold
        this.context = new AudioContext()
        const audio = await this.getAudio()
        if (!audio) throw new Error('Couldnt get audio') 
        this.audio = audio
        //Create stream source
        this.source = this.context.createMediaStreamSource(this.audio)
        //Attach/Create analyser to the context as well
        this.analyser = this.context.createAnalyser()
        //Connect our analyser (run by the context) to our source
        this.source.connect(this.analyser)
        this.analyser.fftSize = 256;
        // Variable to control audio/capturing flow
        this.isProcessing = false
        

        //Create a media recorder with our stream (audio from mic)
        this.mediaRecorder = new MediaRecorder(this.audio)
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount)
        this.checkVolume()

        // This runs AFTER sendAudio is called, to mitigate this, I've added a setTimeout of 500 to sendAudio
        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                this.audioChunks.push(event.data);
        }
    }},

    checkVolume() {
        

        this.analyser.getByteFrequencyData(this.dataArray);
        const maxVol = Math.max(...this.dataArray) / 255;

        if (maxVol > this.threshold && this.mediaRecorder.state === 'inactive') {
            // If there is an audio beign processed already, we dont even check for the possibility of starting recording
            if (this.isProcessing) return requestAnimationFrame(this.checkVolume.bind(this));

            // Upon audio starting recording, we set isProcessing to true
            this.isProcessing = true
            this.updateDom()
            this.mediaRecorder.start()
            console.log('recording')
    
        } else if (maxVol <= this.threshold && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop()
            console.log("Recording stopped");
            console.log(this.isProcessing)
            setTimeout(() => {
                this.sendAudio()
            }, 500)
        }
        requestAnimationFrame(this.checkVolume.bind(this));
    },

    async getAudio() {
        const audioSrc = await navigator.mediaDevices.getUserMedia({audio: {noiseSuppression: true}})
        if (audioSrc) {
            this.audio = audioSrc
            return audioSrc
        } else {
            throw new Error('Could not get audio device')
        }
    },

    // getWebSocket() {
    //     const ws = io(baseURLSpeech)

    //     // Handle successful connection
    //     ws.on('connect', () => {
    //     console.log('Connected to Flask-SocketIO server');
    //     this.ws = ws;  // Save the SocketIO instance to `this.socket`
    // });

    // // Handle messages from the server
    // ws.on('message', (msg) => {
    //     console.log('Received message:', msg);
    //     // You can process the incoming message here
    // });

    // ws.on('transcriptionResult', (msg) => {
    //     console.log('Transcribed Text:', msg.text);
    //     this.sendNotification('SPEECH_USER', {text: msg.text});  // Send to MagicMirror
    // });

    // // Handle connection error
    // ws.on('connect_error', (error) => {
    //     console.error('SocketIO connection error:', error);
    //     throw new Error('Could not connect to Flask-SocketIO');
    // });

    // // Handle connection closure
    // ws.on('disconnect', () => {
    //     console.log('Disconnected from Flask-SocketIO server');
    // });
    // },

    sendAudio() {
        console.log('were here')
        if (this.audioChunks.length > 0) {
          const blob = new Blob(this.audioChunks, {type: 'audio/wav'});
          console.log(blob)
          console.log(this.audioChunks);
          this.sendSocketNotification("AUDIO_RECORDED", blob)
          //this.ws.emit('micBinaryStream', blob); // Send audio blob to server
          this.audioChunks = []; // Clear chunks after sending
          console.log('were here 1')
        } else {
            // If audio is empty, we may record again, so isProcessign is false again
            console.log('were here 3')
            this.isProcessing = false
            this.updateDom()
            console.log('nada aqui')
        }
      },

      socketNotificationReceived(notification, payload) {
        if (notification === 'REGISTER_NEW_USER') {
            // Se o nome não for identificado
            if (payload.error) return this.sendNotification("SHOW_ALERT", {type: "alert", title: 'registro', message: 'Não identificamos o seu nome, por favor, tente novamente.', timer: 3000});

            // Se tudo ocorrer ok
            this.sendNotification("SHOW_ALERT", {type: "alert", title: 'registro', message: 'Certifique-se de estar posicionado na câmera', timer: 3000});
            this.sendNotification('GET_SCREENSHOT_FOR_REGISTER', {name: payload.name})
        }

        // To hide/show modules
        // Each case should be treated individually in each module
        if (notification.includes('module')) {
            this.sendNotification(notification, payload)
            this.isProcessing = false
        }

        if (notification === 'NOTHING_IN_TRANSCRIPTION') {
            // If no text is found in transcription, there is nothing to be processed, so isProcessing is false
            this.isProcessing = false
            this.updateDom()
        }

        //Moved to notificationReceived
        // if (notification === 'AUDIO_TRANSCRIBED') {
        //     const text = payload.response
        //     this.sendNotification("SHOW_ALERT", {type: "alert", title: 'transcrição', message: payload.response, timer: 5000});
        // }

        if (notification === 'GET_WEATHER_DATA') {
            // Passes it to the weather module to get the weather data
            this.sendNotification('GET_WEATHER_DATAA', payload)
        }

      },

      async notificationReceived(notification, payload) {
        if (notification === 'SCREENSHOT_RECEIVED') {
            console.log(payload?.screenshot)
            console.log(payload.name)
            const formData = new FormData()
            formData.append('pic', payload.screenshot)
            formData.append('name', payload.name)
            const res = await fetch(process.env.API_BASE_URL + '/register', {method: 'POST', body: formData})
            const data = await res.json()
            console.log(data)
        } else if (notification === 'AUDIO_FINISHED') {
            console.log('chegou aqui')
            // Upon audio finishing playing, we may record again
            this.isProcessing = false
            console.log(this.isProcessing)
            this.updateDom()
        } else if (notification === 'WEATHER_DATA_RECEIVED') {
            console.log('Data from weather has been received')
            console.log(JSON.stringify(payload))
            this.sendNotification('GET_SCREENSHOT', payload)
        } else if (notification === 'CURRENT_SCREENSHOT_TAKEN') {
            console.log('final payload')
            console.log(payload)

            //Moved this logic into this module, not the node_helper part
            //this.sendSocketNotification('ALL_INFO_GATHERED', payload)

            //TODO: Refactor this into its own function later
            try {
                console.log('contacting AI')
                console.log(payload.pic.size)
                const formData = new FormData()
                formData.append('pic', payload.pic)
                formData.append('text', payload.text)
                formData.append('weather', JSON.stringify(payload.weather))
                console.log(formData)
        
                const response = await fetch(process.env.API_BASE_URL + '/ai', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();
                console.log(data)
                // i dont think the module is receving notifs from itself, I'll create functions to get aroudn that
                //return this.sendNotification('AUDIO_TRANSCRIBED', data) 
                this.speech(data)
              } catch (err) {
                console.log(err)
                
                // i dont think the module is receving notifs from itself, i'll just write the instructions here for now
                //return this.sendNotification('NOTHING_IN_TRANSCRIPTION')
                console.log('Não tinha texto na transcrição')
                this.isProcessing = false
                this.updateDom()
              }
        } else if (notification === 'NOTHING_IN_TRANSCRIPTION') {
            console.log('Não tinha texto na transcrição')
            this.isProcessing = false
            this.updateDom()
        } else if (notification === 'AUDIO_TRANSCRIBED') {
                const text = payload.response
                this.sendNotification("SHOW_ALERT", {type: "alert", title: 'transcrição', message: payload.response, timer: 5000});
        }
      },

      speech(payload) {
            this.sendNotification("SHOW_ALERT", {type: "alert", title: 'transcrição', message: payload.response, timer: 5000});
      },

      getDom() {
        const wrapper = document.createElement('div')
        if (this.isProcessing) {
            wrapper.setAttribute('class', 'loader_processing')
        } else {
            wrapper.setAttribute('class', 'loader_waiting')
        }
        return wrapper
      },

      getStyles() {
        return ['styles.css']
      },

})