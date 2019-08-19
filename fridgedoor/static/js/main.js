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

	handleMagnetMouseDown(pk, ev) {	
		ev.preventDefault();

		const magnet = this.state.magnets[pk];
		const newmagnet = {
			...magnet,
			'xOffset': magnet.xpos - ev.clientX,
			'yOffset': magnet.ypos - ev.clientY
		};
		
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
			ev.preventDefault();
			this.submitMagnets();
			document.removeEventListener("mousemove", handleMagnetMouseMove);
			document.removeEventListener("mouseup", handleMagnetMouseUp);
		}
		
		document.addEventListener("mouseup", handleMagnetMouseUp);
		document.addEventListener("mousemove", handleMagnetMouseMove);
	}

	handleWordMouseDown(text, ev) {
		ev.persist();
		const magnets = this.state.magnets;
		let uuid = getUniqueUUID(magnets);
		console.log(ev.clientX);
		console.log(ev.clientY);
		const newmagnet = {
			'xpos': ev.clientX,
			'ypos': ev.clientY,
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
		ev.preventDefault();
		this.setState({
			'currentwordlist': name
		});
	}

	handleClearButtonClick(ev) {
		ev.preventDefault();
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
				'onMouseDown': (ev) => this.handleWordMouseDown(word, ev)
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
			'className': 'freezer'
		}, this.renderWordList());
	}

	renderFridge() {
		const clearButton = e('button', {
			'className': 'button-clear',
			'onClick': (ev) => this.handleClearButtonClick(ev)
		}, 'clear');
		return e('div', {
			'className': 'fridge',
		}, this.renderWordListButtons(),
		   clearButton,
		   this.renderMagnets());
	}

	render() {
		return e('div', { className: 'door' }, this.renderFridge(), this.renderFreezer());
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
	
	render() {
		return e('li', {
			'className': 'word',
			'onMouseDown': this.props.onMouseDown
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
