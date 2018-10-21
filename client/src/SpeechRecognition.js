import React, { Component } from 'react'

export default function SpeechRecognition(options) {
  const SpeechRecognitionInner = function (WrappedComponent) {
    const BrowserSpeechRecognition =
      typeof window !== 'undefined' &&
      (window.SpeechRecognition ||
        window.webkitSpeechRecognition ||
        window.mozSpeechRecognition ||
        window.msSpeechRecognition ||
        window.oSpeechRecognition)
	  /* Edits */
	const SpeechGrammarList =
      typeof window !== 'undefined' &&
      (window.SpeechGrammarList ||
        window.webkitSpeechGrammarList ||
        window.mozSpeechGrammarList ||
        window.msSpeechGrammarList ||
        window.oSpeechGrammarList )
	  /*********/
    const recognition = BrowserSpeechRecognition
      ? new BrowserSpeechRecognition()
      : null
    const browserSupportsSpeechRecognition = recognition !== null
    let listening
    if (
      !browserSupportsSpeechRecognition ||
      (options && options.autoStart === false)
    ) {
      listening = false
    } else {
      recognition.start()
      listening = true
    }
    let pauseAfterDisconnect = false
    let interimTranscript = ''
    let finalTranscript = ''
	  /* Edits */
	  let lastCommand = '';
	  /*********/
    return class SpeechRecognitionContainer extends Component {
      constructor(props) {
        super(props)

        this.state = {
          interimTranscript,
          finalTranscript,
			lastCommand,
          listening: false
        }
      }

      componentWillMount() {
        if (recognition) {
          recognition.continuous = true
          recognition.interimResults = /* Edit */ false  /********/
          recognition.onresult = this.updateTranscript.bind(this)
          recognition.onend = this.onRecognitionDisconnect.bind(this)

			/* Edits */
			if (SpeechGrammarList) {
				const grammar = `#JSGF V1.0;
grammar openspace;
public <command> = <look> | < downzoom> | <speed> | <goto>;
<look> = look at (mars | earth);
<goto> = go to (mars | earth);
<zoom> = zoom (in | out);
<speed> = speed up | slow down);
`;
				this.grammarList = new SpeechGrammarList();
				this.grammarList.addFromString(grammar, 1);
				recognition.grammars = this.grammarList;
			}
			/*********/

          this.setState({ listening })
        }
      }

      disconnect = disconnectType => {
        if (recognition) {
          switch (disconnectType) {
            case 'ABORT':
              pauseAfterDisconnect = true
              recognition.abort()
              break
            case 'RESET':
              pauseAfterDisconnect = false
              recognition.abort()
              break
            case 'STOP':
            default:
              pauseAfterDisconnect = true
              recognition.stop()
          }
        }
      }

      onRecognitionDisconnect() {
        listening = false
        if (pauseAfterDisconnect) {
          this.setState({ listening })
        } else {
          this.startListening()
        }
        pauseAfterDisconnect = false
      }

      updateTranscript(event) {
        interimTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript = this.concatTranscripts(
              finalTranscript,
              event.results[i][0].transcript
            )
          } else {
            interimTranscript = this.concatTranscripts(
              interimTranscript,
              event.results[i][0].transcript
            )
          }
        }
		  /* Edits */
		  console.log("here you go: " + finalTranscript);
		  console.log("inter: " + interimTranscript);
		  const remoteIP = '10.10.0.64';
		  //const remoteIP = 'localhost';
		  const remotePROC = 'update';
		  const remotePORT = '8080';
		  const requestURL = `http://${remoteIP}:${remotePORT}/${remotePROC}`;
		  const requestBODY = {
			  command: finalTranscript
		  };
		  const requestMETHODS = {
			  method: "POST",
			  mode: "cors",
			  cache: "no-cache",
			  headers: {
				  "Content-Type": "application/json; charset=utf-8"
			  },
			  body: JSON.stringify(requestBODY)
		  };
		  
		  fetch(requestURL, requestMETHODS)
			.then(response => {
				console.log(response);
				lastCommand = finalTranscript;
				this.setState({ finalTranscript, lastCommand });
			})
			.catch(error => {
				console.log(error);
				lastCommand = 'ERROR: command not sent';
				this.setState({ finalTranscript, lastCommand });
			});

		  finalTranscript = '';
		  /********/
        this.setState({ finalTranscript, interimTranscript, lastCommand })
      }

      concatTranscripts(...transcriptParts) {
        return transcriptParts.map(t => t.trim()).join(' ').trim()
      }

      resetTranscript = () => {
        interimTranscript = ''
        finalTranscript = ''
        this.disconnect('RESET')
        this.setState({ interimTranscript, finalTranscript })
      }

      startListening = () => {
        if (recognition && !listening) {
          try {
            recognition.start()
          } catch (DOMException) {
            // Tried to start recognition after it has already started - safe to swallow this error
          }
          listening = true
          this.setState({ listening })
        }
      }

      abortListening = () => {
        listening = false
        this.setState({ listening })
        this.disconnect('ABORT')
      }

      stopListening = () => {
        listening = false
        this.setState({ listening })
        this.disconnect('STOP')
      }

      render() {
        const transcript = this.concatTranscripts(
          finalTranscript,
          interimTranscript
        )

        return (
          <WrappedComponent
            resetTranscript={this.resetTranscript}
            startListening={this.startListening}
            abortListening={this.abortListening}
            stopListening={this.stopListening}
            transcript={transcript}
            recognition={recognition}
            browserSupportsSpeechRecognition={browserSupportsSpeechRecognition}
			lastCommand={this.lastCommand}

            {...this.state}
            {...this.props} />
        )
      }
    }
  }

  if (typeof options === 'function') {
    return SpeechRecognitionInner(options)
  } else {
    return SpeechRecognitionInner
  }
}
