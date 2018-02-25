/* globals dat,THREE */

(function(window) {
	'use strict';

	var config = {
		'CAMERA_FOV': 70,
		'CAMERA_NEAR_PLANE': 0.1,
		'CAMERA_FAR_PLANE': 500
	};

	var properties = {
		'axisHelperVisible': true,
		'gridHelperVisible': false
	};



	var Main = function(canvas)	{
		this.canvas = canvas;

		this.camera = null;
		this.clock = null;
		this.controls = null;
		this.gui = null;
		this.renderer = null;
		this.scene = null;

		this.axisHelper = null;
		this.gridHelper = null;

		this.circle = null;
		this.plane = null;

		this.raycaster = new THREE.Raycaster();
		this.mouseVector2 = new THREE.Vector2();
	};

	Main.prototype.init = function() {
		this.clock = new THREE.Clock();
		this.scene = new THREE.Scene();

		this.camera = new THREE.PerspectiveCamera(config.CAMERA_FOV, this.getCameraAspect(), config.CAMERA_NEAR_PLANE, config.CAMERA_FAR_PLANE);
		this.camera.position.set(0, 1.7, 0);

		this.renderer = new THREE.WebGLRenderer({antialias: true});
		this.renderer.setClearColor(0x000000, 1);
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(this.getGameAreaWidth(), this.getGameAreaHeight());

		// add renderer to the DOM-Tree
		this.canvas.appendChild(this.renderer.domElement);

		this.controls = new THREE.FirstPersonControls(this.camera, this.renderer.domElement);
		this.controls.lookSpeed = 0.05;
		this.controls.lookVertical = true;

		this.gui = new dat.GUI({ width: 400 });
		this.gui.close();

		// https://kostasbariotis.com/removeeventlistener-and-this/
		this.deviceorientationHandler = this.onDeviceOrientationHandler.bind(this);

		window.addEventListener('click', this.onClickHandler.bind(this), false);
		window.addEventListener('deviceorientation', this.deviceorientationHandler, true);
		window.addEventListener('mousemove', this.onMouseMoveHandler.bind(this), false);
		window.addEventListener('resize', this.onResizeHandler.bind(this), false);

		this.createGui();
		this.createObject();

		this.render();
	};

	Main.prototype.createObject = function() {
		this.axisHelper = new THREE.AxisHelper(25);
		this.scene.add(this.axisHelper);

		this.gridHelper = new THREE.GridHelper(50, 50);
		this.gridHelper.visible = properties.gridHelperVisible;
		this.scene.add(this.gridHelper);

		this.circle = new THREE.Mesh(
			new THREE.RingGeometry(0.15, 0.2, 25),
			new THREE.MeshBasicMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide })
		);

		this.circle.visible = false;
		this.circle.rotation.x = Math.PI / -2;

		this.scene.add(this.circle);


		this.plane = new  THREE.Mesh(
			new THREE.PlaneGeometry(20, 20),
			new THREE.MeshBasicMaterial({ color: 0x156289, side: THREE.DoubleSide })
		);
		this.plane.rotation.x = Math.PI / -2;

		this.scene.add(this.plane);
	};

	Main.prototype.createGui = function() {
		var self = this;

		this.gui.add(properties, 'axisHelperVisible').onChange(function(value) {
			self.axisHelper.visible = value;
		});
		this.gui.add(properties, 'gridHelperVisible').onChange(function(value) {
			self.gridHelper.visible = value;
		});
	};

	Main.prototype.render = function() {
		requestAnimationFrame(this.render.bind(this));

		this.camera.position.y = 1.7;

		this.controls.update(this.clock.getDelta());

		this.renderer.render(this.scene, this.camera);
	};

	Main.prototype.getGameAreaHeight = function() { return this.canvas.offsetHeight; };
	Main.prototype.getGameAreaWidth = function() { return this.canvas.offsetWidth; };

	Main.prototype.getCameraAspect = function() { return this.getGameAreaWidth() / this.getGameAreaHeight(); };

	Main.prototype.onClickHandler = function(event) {
		if(this.circle.visible) {
			this.camera.position.x = this.circle.position.x;
			this.camera.position.z = this.circle.position.z;
		}
	};

	Main.prototype.onDeviceOrientationHandler = function(event) {
		if(!event.alpha)
		{
			return;
		}

		// Create controls for mobile.
		this.controls = new THREE.DeviceOrientationControls(this.camera, true);
		this.controls.connect();
		this.controls.update();

		window.removeEventListener('deviceorientation', this.deviceorientationHandler, true);
	};

	Main.prototype.onMouseMoveHandler = function(event) {
		this.mouseVector2.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		this.mouseVector2.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

		this.raycaster.setFromCamera(this.mouseVector2, this.camera);

		var intersects = this.raycaster.intersectObject(this.plane);

		if(intersects.length > 0) {
			var circleCenter = new THREE.Vector3();

			circleCenter.copy(intersects[0].face.normal);
			circleCenter.applyMatrix4(new THREE.Matrix4().extractRotation(intersects[0].object.matrixWorld));
			// difference to the ground (height)
			circleCenter.multiplyScalar(0.01);
			circleCenter.add(intersects[0].point);

			// move the circel to the calculated intersection point
			this.circle.position.copy(circleCenter);
			this.circle.visible = true;
		}
		else
		{
			this.circle.visible = false;
		}
	};

	Main.prototype.onResizeHandler = function(event) {
		this.camera.aspect = this.getCameraAspect();
		this.camera.updateProjectionMatrix();

		this.renderer.setSize(this.getGameAreaWidth(), this.getGameAreaHeight());
	};


	var main = new Main(document.getElementById('webGlCanvas'));
	document.addEventListener('DOMContentLoaded', function() {
		main.init();
	});
}(window));

// TODO: Threejs 88
// TODO: renderer.domElement before controls
// TODO: ?Haircross
// TODO: instead of click use mouseUp => mouseDown + Move == intersect