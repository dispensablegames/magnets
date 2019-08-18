"use strict";

const e = React.createElement;

class Door extends React.Component {

	constructor(props) {
		super(props);
		this.state = { 
			'magnets': {},
		}
		fetch(window.location + '/magnets')
			.then((response) => {
    			return response.json();
  			})
  			.then((myJson) => {
				const newmagnets = {}
				for (const magnet of myJson.magnets) {
					const newmagnet = {
						...magnet,
						'pk': magnet.pk,
						'xOffset': 0,
						'yOffset': 0
					}
					newmagnets[magnet.pk] = newmagnet;
				}
				this.setState({ 'magnets': newmagnets });
  			});
	}

	handleMouseDown(pk, ev) {	
		ev.preventDefault();

		const magnet = this.state.magnets[pk];
		const newmagnet = {
			...magnet,
			'offsetX': magnet.xpos - ev.clientX,
			'offsetY': magnet.ypos - ev.clientY
		};
		const newmagnets = {
			...this.state.magnets
		}
		newmagnets[pk] = newmagnet
		this.setState({
			'magnets': newmagnets
		});

		 const handleMouseMove = (ev) => {
		 	const magnet = this.state.magnets[pk];
		 	const newmagnet = {
				...magnet,
				'xpos': ev.clientX + magnet.offsetX,
				'ypos': ev.clientY + magnet.offsetY
			};
			const newmagnets = {
				...this.state.magnets
			}
			newmagnets[pk] = newmagnet
			this.setState({
				'magnets': newmagnets
			});
		}
		
		 const handleMouseUp = (ev) => {
			ev.preventDefault();
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		}
		
		document.addEventListener("mouseup", handleMouseUp);
		document.addEventListener("mousemove", handleMouseMove);
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
				'onMouseDown': (ev) => this.handleMouseDown(magnet.pk, ev)
			});
			magnetsRendered.push(magnetRendered);
		}
		return magnetsRendered;
	}

	render() {
		return e('div', { className: 'door' }, this.renderMagnets());
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

ReactDOM.render(
	e(Door),
	document.getElementById("root")
);


