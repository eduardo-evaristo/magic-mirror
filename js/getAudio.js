// // function getAudio() {
// //     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
// //     const recognition = new SpeechRecognition();
// //     recognition.continuous  = true
// //     recognition.interimResults = false;

// //     recognition.onresult = (event ) => {
// //         const transcript = event.results[event.results.length - 1][0].transcript.trim();
// //         const document1 = document.createElement('h1')
// //         document1.textContent = 'hello'
        
// //         if (transcript === "show weather") {
// //             document.body.appendChild(document1)
// //         } else if (transcript === "take a picture") {
// //             document.body.appendChild(document1)
// //         }
// //     } 
// //     recognition.start();
// // }

// // getAudio()

// async function getAudio() {
//     const audioSrc = await navigator.mediaDevices.getUserMedia({audio: true});
//     if (audioSrc) {
//         const tracks = audioSrc.getAudioTracks()
//         console.log('got mic')
//         console.log(tracks)

//     } else {
//         console.log('nope');
//     }
// };

// getAudio();