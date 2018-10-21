const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
const SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;

const grammar = `#JSGF V1.0;
grammar openspace;
public <command> = <goto> | <zoom> | <spin>;
<goto> = go to (mars | earth);
<zoom> = zoom (in | out);
<spin> = spin (faster | slower);
`;

class BabbleAPI {
	constructor() {
		this.recognition = new SpeechRecognition();
		this.grammarList = new SpeechGrammarList();

		this.grammarList.addFromString(grammar, 1);
		this.recognition.grammars = this.grammarList;
		this.recognition.lang = 'en-US';
		this.recognition.interimResults = false;
		this.recognition.maxAlternatives = 1;
		
		this.recognition.onresult = event => {
			console.log("onresult occurred");
			console.log(JSON.stringify(event));
			alert(event.results[0][0].transcript);
		}

		this.recognition.onspeechend = event => {
			this.recognition.stop();
		}
		this.recognition.onerror = event => {
			alert("error occurred " + event.error);
		}
		this.recognition.onaudiostart = event => {
			console.log('SpeechRecognition.onaudiostart');
		}
		this.recognition.onaudioend = event => {
			console.log('SpeechRecognition.onaudioend');
		}
		this.recognition.onend = event => {
			console.log('SpeechRecognition.onend');
		}
		this.recognition.onnomatch = event => {
			console.log('SpeechRecognition.onnomatch');
		}
		this.recognition.onsoundstart = event => {
			console.log('SpeechRecognition.onsoundstart');
		}
		this.recognition.onsoundend = event => {
			console.log('SpeechRecognition.onsoundend');
		}
		this.recognition.onspeechstart = event => {
			console.log('SpeechRecognition.onspeechstart');
		}
		this.recognition.onstart = event => {
			console.log('SpeechRecognition.onstart');
		}
	}

	test() {
		this.recognition.start();
	}
}

export default BabbleAPI;

