// speech.js

class SpeechHandler {
    constructor() {
        this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        this.recognition.continuous = false;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = this.handleSpeechResult.bind(this);
        this.recognition.onerror = this.handleSpeechError.bind(this);
    }

    startListening() {
        this.recognition.start();
    }

    handleSpeechResult(event) {
        const transcript = event.results[0][0].transcript;
        console.log('Recognized speech:', transcript);
        // Here you can add logic to process the speech and interact with the fire entity
        this.processCommand(transcript);
    }

    handleSpeechError(event) {
        console.error('Speech recognition error:', event.error);
    }

    processCommand(command) {
        // Add logic here to interpret the command and interact with the fire entity
        // For example:
        if (command.toLowerCase().includes('hello fire')) {
            this.speak("Hello! I am the fire entity. How can I help you?");
        }
        // Add more command interpretations as needed
    }

    speak(text) {
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
    }
}

// Create a global instance of SpeechHandler
window.speechHandler = new SpeechHandler();