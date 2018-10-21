import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './App.css';
import SpeechRecognition from './SpeechRecognition.js';

const speechOptions = {
	autoStart: false
}

const propTypes = {
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
			recognition,
			lastCommand
		} = this.props;

		if (!browserSupportsSpeechRecognition) {
			return (<>
				<Header />
				<h1>ERROR</h1>
				<Footer />
			</>);
		}

		return (<>
			<Header />
			<div className="content">
				<SpeechPanel
					startListening={startListening}
					abortListening={abortListening}
					transcript={finalTranscript}
					lastCommand={lastCommand}
				/>
			</div>
			<Footer />
		</>);
	}
}

const Header = () => (
	<div className="header">
		<span className="pre-title">Welcome</span>
		<span className="title">Babblenauts</span>
	</div>
);

const SpeechPanel = props => (
	<div className="speech-panel">
		<div className="command-panel">
			<button 
				onClick={props.startListening} 
				className="listener"
				>Listen</button>
			<button 
				onClick={props.abortListening} 
				className="stopper"
				>Stop</button>
		</div>
		<span className="cmd-label">Current Command</span>
		<span className="cmd current-cmd">{props.transcript}</span>
		<span className="cmd-label">Last Command</span>
		<span className="cmd last-cmd">{props.lastCommand}</span>
	</div>
);

const Footer = () => (
	<div className="footer">
		<hr />
		<div>(c) Babblenauts, SpaceApps 2018.  Aditya, Connor, Tom</div>
	</div>
);

const App = SpeechRecognition(speechOptions)(Babble);
App.propTypes = propTypes;

export default App;
