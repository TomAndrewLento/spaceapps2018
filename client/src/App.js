import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './App.css';
//import BabbleAPI from './babbleapi.js';
//import SpeechRecognition from 'react-speech-recognition';
import SpeechRecognition from './SpeechRecognition.js';

const speechOptions = {
	autoStart: false
}

const propTypes = {
  // Props injected by SpeechRecognition
	transcript: PropTypes.string,
	resetTranscript: PropTypes.func,
	browserSupportsSpeechRecognition: PropTypes.bool,
	startListening: PropTypes.func,
	abortListening: PropTypes.func,
	listening: PropTypes.bool,
	interimTranscript: PropTypes.string,
	finalTranscript: PropTypes.string,
	recognition: PropTypes.object
}
//const babble = new BabbleAPI();
//console.log(JSON.stringify(babble));

/*
class App extends Component {
	render() {
		return (
		<div className="App">
			<Introduction />
			<SpeechInput />
		</div>);
	}
}*/

/*
class App extends Component {
	render() {
		return (
			<>
			<h1>hello</h1>
			<Example />
			</>
		);
	}
}
*/

class Babble extends Component {
	render() {
		const {
			transcript,
			resetTranscript,
			browserSupportsSpeechRecognition,
			startListening,
			abortListening,
			listening,
			interimTranscript,
			finalTranscript,
			recognition
		} = this.props;

		if (!browserSupportsSpeechRecognition) {
			return (<h1>ERROR</h1>);
		}
				/*<span>{listening ? finalTranscript + interimTranscript : transcript}</span>*/

		return (<>
			<Header />
			<div>
				<button onClick={startListening}>Listen</button>
				<button onClick={abortListening}>Stop</button>
				<button onClick={resetTranscript}>Reset</button>
				<span>{transcript}</span>
			</div>
			<Footer />
		</>);
	}
}

const Header = () => (
	<h1>Welcome, Babblenaut</h1>
);

const Footer = () => (
	<>
		<hr />
		<p>(c) Babblenauts, SpaceApps 2018.  Aditya, Connor, Tom</p>
	</>
);

const App = SpeechRecognition(speechOptions)(Babble);
App.propTypes = propTypes;

/*
class SpeechInput extends Component {
	render() {
		return (
			<MicrophoneButton />
		);
	}
}
*/

/*
class MicrophoneButton extends Component {
	componentDidMount() {
		document.querySelector('.microphone-btn')
			.addEventListener('click', babble.test);
	}

	render() {
		return (
		<button className="microphone-btn">Send Command</button>);
	}
}
*/

export default App;
