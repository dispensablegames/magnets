"use strict";

const e = React.createElement;

class Door extends React.Component {

	constructor(props) {
		super(props);
		this.state = { 
			'magnets': [],
		}
		fetch(window.location + '/magnets')
			.then((response) => {
    			return response.json();
  			})
  			.then((myJson) => {
				this.setState({
					'magnets' : myJson.magnets,
				});
  			});
	}

	renderMagnets() {
		const magnetsRendered = this.state.magnets.map((magnet) => {
			return e(Magnet, { magnet: magnet, key: magnet.text });
		});
		return magnetsRendered;
	}

	render() {
		return e('div', { className: 'door' }, this.renderMagnets());
	}


}

class Magnet extends React.Component {

	constructor(props) {
		super(props);
		const magnet = props.magnet;
		this.state = {
			'zpos': magnet.zpos,
			'ypos': magnet.ypos,
			'xpos': magnet.xpos,
			'text': magnet.text,
			'offsetX': 0,
			'offsetY': 0,
		};
	}


	handleMouseDown(ev) {	
		ev.preventDefault();

		this.setState({'offsetX': this.state.xpos - ev.clientX, 'offsetY':this.state.ypos - ev.clientY})

		 const handleMouseMove = (ev) => {

			this.setState({'xpos': ev.clientX + this.state.offsetX, 'ypos': ev.clientY + this.state.offsetY});
		}
		
		 const handleMouseUp = (ev) => {
			ev.preventDefault();
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		}
		
		document.addEventListener("mouseup", handleMouseUp);
		document.addEventListener("mousemove", handleMouseMove);
	}


	render() {
		const style = {
				'top': this.state.ypos,
				'left': this.state.xpos,
				'zIndex': this.state.zpos,
			}		
		return e('span', 
		         { className: 'magnet', style: style, onMouseDown: (ev) => this.handleMouseDown(ev) },
				 this.state.text);
	}

}

ReactDOM.render(
	e(Door),
	document.getElementById("root")
);


