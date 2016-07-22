/**
 * @author spite / https://github.com/spite
 * @author danrossi / https://www.electroteque.org
 */
/*global THREE, console */

THREE.GamepadControls = function ( object ) {

	this.rotMatrix = new THREE.Matrix4();
	this.dir = new THREE.Vector3( 0, 0, 1 );
	this.tmpVector = new THREE.Vector3();
	this.object = object;
	this.lon = -90;
	this.lat = 0;
	this.target = new THREE.Vector3();
	this.threshold = .05;
	this.currentGamePad;


	this.init = function() {

		var gamepadConfig = {
			axisThreshold: 0,
			keyEventsEnabled: false,
			indices: {
				'standard': {
					cursorX: 2,
					cursorY: 3,
					scrollX: 0,
					scrollY: 1,
					back: 9,
					forward: 8,
					vendor: 10,
					zoomIn: 5,
					zoomOut: 1
				},
				'46d-c216-Logitech Dual Action': {
					cursorX: 3,
					cursorY: 4,
					scrollX: 1,
					scrollY: 2,
					back: 8,
					forward: 9,
					vendor: null,
					zoomIn: 7,
					zoomOut: 6
				},
				'79-6-Generic   USB  Joystick': {
					cursorX: null,
					cursorY: null,
					scrollX: 3,
					scrollY: 2,
					back: 6,
					forward: 7,
					vendor: null,
					zoomIn: 9,
					zoomOut: 8
				},
				keyEvents: {
					vendor: {
						detail: {
							charCode: 0,
							key: 'Escape',
							keyCode: 27
						}
					}
				}
			}
		};

		this.gamepads = new Gamepads(gamepadConfig);


		window.addEventListener('gamepadconnected', function (e) {
			this.gamepads.update();

			this.currentGamePad = e.gamepad;

			this.dispatchEvent({ type: e.type, gamepad: e.gamepad});
		}.bind(this));

		window.addEventListener('gamepaddisconnected', function (e) {


			this.dispatchEvent({ type: e.type, gamepad: e.gamepad });
		}.bind(this));

		if (this.gamepads.nonstandardEventsEnabled) {
			window.addEventListener('gamepadaxismove', function (e) {

				this.dispatchEvent({ type: e.type, gamepad: e.gamepad, axis: e.axis, value: e.value });

			}.bind(this));

			window.addEventListener('gamepadbuttondown', function (e) {

				this.dispatchEvent({ type: e.type, gamepad: e.gamepad, button: e.button });
			}.bind(this));

			window.addEventListener('gamepadbuttonup', function (e) {

				this.dispatchEvent({ type: e.type, gamepad: e.gamepad, button: e.button });
			}.bind(this));
		}


	}


	this.update = function() {
		this.gamepads.update();
		this.pollGamepads();
	}

	this.filter = function( v ) {

		return ( Math.abs( v ) > this.threshold ) ? v : 0;

	}

	this.pollGamepads = function() {


			var g = this.currentGamePad;
			
			this.lon += this.filter( g.axes[ 0 ] );
			this.lat -= this.filter( g.axes[ 1 ] );
			this.lat = Math.max( - 85, Math.min( 85, this.lat ) );
			var phi = ( 90 - this.lat ) * Math.PI / 180;
			var theta = this.lon * Math.PI / 180;

			this.target.x = 10 * Math.sin( phi ) * Math.cos( theta );
			this.target.y = 10 * Math.cos( phi );
			this.target.z = 10 * Math.sin( phi ) * Math.sin( theta );

			this.target.add( this.object.position );
			this.object.lookAt( this.target );

			this.rotMatrix.extractRotation( this.object.matrix );
			this.dir.set( 
				this.filter( g.axes[ 2 ] ), 
				this.filter( g.buttons[ 6 ].value ) - this.filter( g.buttons[ 7 ].value ), 
				this.filter( g.axes[ 3 ] ) 
			);
			this.dir.multiplyScalar( .1 );
			this.dir.applyMatrix4( this.rotMatrix );
			this.object.position.add( this.dir );

	}

	this.init();
	
};

THREE.GamepadControls.gamepadsSupported = !!Gamepads && Gamepads.hasGamepads();

THREE.GamepadControls.prototype = Object.create( THREE.EventDispatcher.prototype );