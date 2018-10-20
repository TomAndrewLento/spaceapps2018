var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

var speechBtn = document.querySelector('button');

var grammar = `#JSGF V1.0;
grammar openspace;
public <command> = <goto> | <zoom> | <spin>;
<goto> = go to (mars | earth);
<zoom> = zoom (in | out);
<spin> = spin (faster | slower);
`;

function testSpeech() {
	var recognition = new SpeechRecognition();
	var grammarList = new SpeechGrammarList();

	grammarList.addFromString(grammar, 1);
	recognition.grammrs = grammarList;
	recognition.lang = 'en-US';
	recognition.interimResults = false;
	recognition.maxAlternatives = 1;

	recognition.start();

	recognition.onresult = function(event) {
		console.log("onresult occurred");
		console.log(JSON.stringify(event));
		alert(event.results[0][0].transcript);
	}

	recognition.onspeechend = function(event) {
		recognition.stop();
	}
	recognition.onerror = function(event) {
		alert("error occurred " + event.error);
	}
	recognition.onaudiostart = function(event) {
		console.log('SpeechRecognition.onaudiostart');
	}
	recognition.onaudioend = function(event) {
		console.log('SpeechRecognition.onaudioend');
	}
	recognition.onend = function(event) {
		console.log('SpeechRecognition.onend');
	}
	recognition.onnomatch = function(event) {
		console.log('SpeechRecognition.onnomatch');
	}
	recognition.onsoundstart = function(event) {
		console.log('SpeechRecognition.onsoundstart');
	}
	recognition.onsoundend = function(event) {
		console.log('SpeechRecognition.onsoundend');
	}
	recognition.onspeechstart = function(event) {
		console.log('SpeechRecognition.onspeechstart');
	}
	recognition.onstart = function(event) {
		console.log('SpeechRecognition.onstart');
	}

}

speechBtn.addEventListener('click', testSpeech)
