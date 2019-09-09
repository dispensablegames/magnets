"use strict";

const e = React.createElement;

class Door extends React.Component {

	constructor(props) {
		super(props);
		this.state = { 
			'magnets': {},
			'wordlists': {},
			'currentwordlist': null,
			'currentzpos': -Infinity,
			'freezerref': React.createRef(),
			'fridgeref': React.createRef()
		}
		fetch(window.location + '/magnets')
			.then((response) => {
    			return response.json();
  			})
  			.then((json) => {
				const newmagnets = {}
				let largestzpos = this.state.currentzpos;
				for (const magnet of json.magnets) {
					let uuid = getUniqueUUID(newmagnets);
					if (magnet.zpos > largestzpos) {
						largestzpos = magnet.zpos;
					}
					const newmagnet = {
						...magnet,
						'pk': uuid,
						'xOffset': 0,
						'yOffset': 0
					}
					newmagnets[uuid] = newmagnet;
				}
				if (largestzpos === -Infinity) {
					largestzpos = 0;
				}
				this.setState({ 
					'magnets': newmagnets,
					'currentzpos': largestzpos + 1
				});
  			});
		fetch('/words')
			.then((response) => {
				return response.json();
			})
			.then((json) => {
				let firstwordlist;
				for (const name in json) {
					firstwordlist = name;
					break;
				}
				this.setState({
					'wordlists': {
						...json
					},
					'currentwordlist': firstwordlist
				});
			});
	}

	putMagnet(magnet, callback) {
		const newmagnets = { ...this.state.magnets };
		newmagnets[magnet.pk] = magnet;
		this.setState({
			'magnets': newmagnets
		}, callback);
	}

	removeMagnet(pk, callback) {
		const newmagnets = { ...this.state.magnets };
		delete newmagnets[pk];
		this.setState({
			'magnets': newmagnets
		}, callback);
	}

	handleMagnetMouseDown(pk, ev) {	

		const magnet = this.state.magnets[pk];
		const newmagnet = {
			...magnet,
			'xOffset': magnet.xpos - ev.clientX,
			'yOffset': magnet.ypos - ev.clientY,
			'zpos': this.state.currentzpos
		};
		this.setState({
			'currentzpos': this.state.currentzpos + 1
		});
		this.putMagnet(newmagnet);

		 const handleMagnetMouseMove = (ev) => {
		 	const magnet = this.state.magnets[pk];
		 	const newmagnet = {
				...magnet,
				'xpos': ev.clientX + magnet.xOffset,
				'ypos': ev.clientY + magnet.yOffset
			};
			this.putMagnet(newmagnet);
		}
		
		 const handleMagnetMouseUp = (ev) => {
			document.removeEventListener("mousemove", handleMagnetMouseMove);
			document.removeEventListener("mouseup", handleMagnetMouseUp);

			const freezernode = this.state.freezerref.current;
			const freezerBox = freezernode.getBoundingClientRect();
			const freezerTop = freezerBox.top;
			const freezerLeft = freezerBox.left;
			const freezerRight = freezerBox.right;
			const freezerBot = freezerBox.bottom;

			if (ev.clientX > freezerLeft && 
			    ev.clientX < freezerRight && 
				ev.clientY > freezerTop && 
				ev.clientY < freezerBot) {
				this.removeMagnet(pk, () => { 
					this.submitMagnets();
				});
			}

			else {
				this.submitMagnets();
			}
		}
		
		document.addEventListener("mouseup", handleMagnetMouseUp);
		document.addEventListener("mousemove", handleMagnetMouseMove);
	}

	handleWordMouseDown(text, ref, ev) {
		ev.persist();
		const magnets = this.state.magnets;
		let uuid = getUniqueUUID(magnets);
		const boundingBox = ref.current.getBoundingClientRect();
		const fridgeBoundingBox = this.state.fridgeref.current.getBoundingClientRect();
		const newmagnet = {
			'xpos': boundingBox.left - fridgeBoundingBox.left,
			'ypos': boundingBox.top - fridgeBoundingBox.top,
			'zpos': this.state.currentzpos,
			'pk': uuid,
			'xOffset': 0,
			'yOffset': 0,
			'text': text
		}
		this.setState({
			'currentzpos': this.state.currentzpos + 1
		});

		this.putMagnet(newmagnet, () => this.handleMagnetMouseDown(newmagnet.pk, ev));


	}

	handleWordListButtonClick(name, ev) {
		this.setState({
			'currentwordlist': name
		});
	}

	handleClearButtonClick(ev) {
		this.setState({
			'magnets': {}
		}, () => this.submitMagnets());
	}

	submitMagnets() {
		const magnets = this.state.magnets;
		const csrf = document.body.dataset['csrf'];
		const data = JSON.stringify({
			'magnets': magnets,
		});
		fetch(window.location, {
			'method': 'POST',
			'body': data, 
			'headers': {
				'X-CSRFToken': csrf
			}
		});
	}

	renderMagnets() {
		const magnetsRendered = [];
		for (const pk in this.state.magnets) {
			const magnet = this.state.magnets[pk];
			const magnetRendered = e(Magnet, {
				'xpos': magnet.xpos,
				'ypos': magnet.ypos,
				'zpos': magnet.zpos,
				'text': magnet.text,
				'key': magnet.pk,
				'onMouseDown': (ev) => this.handleMagnetMouseDown(magnet.pk, ev)
			});
			magnetsRendered.push(magnetRendered);
		}
		return magnetsRendered;
	}

	renderWordList() {
		if (!this.state.currentwordlist) {
			return;
		}
		const wordsRendered = [];
		const wordlist = this.state.wordlists[this.state.currentwordlist];
		for (const word of wordlist) {
			const wordRendered = e(Word, {
				'text': word,
				'key': word,
				'onMouseDown': (ref, ev) => this.handleWordMouseDown(word, ref, ev)
			});
			wordsRendered.push(wordRendered);
		}
		return e('ul', {
			'className': 'wordlist',
		}, wordsRendered);
	}

	renderWordListButtons() {
		const buttonsRendered = [];
		for (const name in this.state.wordlists) {
			const buttonRendered = e('button', {
				'className': 'button-wordlist',
				'onClick': (ev) => this.handleWordListButtonClick(name, ev),
			}, name);
			buttonsRendered.push(e('li', { 'key': name }, buttonRendered));
		}
		return e('ul', {
			'className': 'buttons-wordlist',
		}, buttonsRendered);
	}

	renderFreezer() {
		return e('div', {
			'className': 'freezer',
			'ref': this.state.freezerref
		}, this.renderWordList());
	}

	renderFridge() {
		const clearButton = e('button', {
			'className': 'button-clear',
			'onClick': (ev) => this.handleClearButtonClick(ev)
		}, 'clear');
		return e('div', {
			'className': 'fridge',
			'ref': this.state.fridgeref
		}, this.renderWordListButtons(),
		   clearButton,
		   this.renderMagnets());
	}

	render() {
		return e('div', { className: 'door' }, this.renderFreezer(), this.renderFridge());
	}


}

class Magnet extends React.Component {

	render() {
		const style = {
			'top': this.props.ypos,
			'left': this.props.xpos,
			'zIndex': this.props.zpos,
		};		
		return e('span', { 
			'className': 'magnet', 
			'style': style, 
			'onMouseDown': this.props.onMouseDown 
		}, this.props.text);
	}

}

class Word extends React.Component {

	constructor(props) {
		super(props);
		this.ref = React.createRef();
	}
	
	render() {
		return e('li', {
			'ref': this.ref,
			'className': 'word',
			'onMouseDown': (ev) => this.props.onMouseDown(this.ref, ev)
		}, this.props.text); 
	}

}

ReactDOM.render(
	e(Door),
	document.getElementById("root")
);


function getRandomUUID() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}

function getUniqueUUID(obj) {
	let uuid = getRandomUUID();
	while (obj[uuid]) {
		uuid = getRandomUUID();
	}
	return uuid;
}
