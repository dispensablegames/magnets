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

	render() {
		const magnet = this.props.magnet;
		const style = {
			top: magnet.ypos,
			left: magnet.xpos,
			zIndex: magnet.zpos
		}
		return e('span', 
		         { className: 'magnet', style: style },
				 magnet.text);
	}

}

ReactDOM.render(
	e(Door),
	document.getElementById("root")
);
