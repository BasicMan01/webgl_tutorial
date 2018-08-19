/* globals dat,rdo,THREE */

(function(window) {
	'use strict';

	var config = {
		'CAMERA_FOV': 70,
		'CAMERA_NEAR_PLANE': 0.1,
		'CAMERA_FAR_PLANE': 500
	};

	var properties = {
		'axesHelperVisible': true,
		'gridHelperVisible': true,
		'ringInnerRadius': 3,
		'ringOuterRadius': 5,
		'ringThetaSegments': 8,
		'ringPhiSegments': 8,
		'ringThetaStart': 0,
		'ringThetaLength': 2*Math.PI,
		'ringMaterialColor': '#156289',
		'ringWireframeColor': '#FFFFFF',
		'ringPositionX': 0,
		'ringPositionY': 0,
		'ringPositionZ': 0,
		'ringRotationX': 0,
		'ringRotationY': 0,
		'ringRotationZ': 0,
		'ringScaleX': 1,
		'ringScaleY': 1,
		'ringWireframe': false
	};



	var Main = function(canvas)	{
		this.canvas = canvas;

		this.camera = null;
		this.controls = null;
		this.gui = null;
		this.renderer = null;
		this.scene = null;

		this.axesHelper = null;
		this.gridHelper = null;

		this.ring = null;
	};

	Main.prototype.init = function() {
		this.scene = new THREE.Scene();

		this.camera = new THREE.PerspectiveCamera(config.CAMERA_FOV, this.getCameraAspect(), config.CAMERA_NEAR_PLANE, config.CAMERA_FAR_PLANE);
		this.camera.position.set(0, 10, 20);

		this.renderer = new THREE.WebGLRenderer({antialias: true});
		this.renderer.setClearColor(0x000000, 1);
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(this.getGameAreaWidth(), this.getGameAreaHeight());

		this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);

		this.gui = new dat.GUI({ width: 400 });
		this.gui.close();

		// add renderer to the DOM-Tree
		this.canvas.appendChild(this.renderer.domElement);

		window.addEventListener('resize', this.onResizeHandler.bind(this), false);

		this.createGui();
		this.createObject();

		this.render();
	};

	Main.prototype.createObject = function() {
		this.axesHelper = new THREE.AxesHelper(25);
		this.scene.add(this.axesHelper);

		this.gridHelper = new THREE.GridHelper(50, 50);
		this.scene.add(this.gridHelper);

		this.ring = new THREE.Object3D();
		this.scene.add(this.ring);

		this.ring.add(new THREE.Mesh(
			new THREE.Geometry(),
			new THREE.MeshBasicMaterial( { color: properties.ringMaterialColor, side: THREE.DoubleSide } )
		));

		this.ring.add(new THREE.LineSegments(
			new THREE.Geometry(),
			new THREE.LineBasicMaterial( { color: properties.ringWireframeColor } )
		));

		this.createGeometry();
	};

	Main.prototype.createGeometry = function() {
		var geometry = new THREE.RingGeometry(
			properties.ringInnerRadius,
			properties.ringOuterRadius,
			properties.ringThetaSegments,
			properties.ringPhiSegments,
			properties.ringThetaStart,
			properties.ringThetaLength
		);

		this.ring.children[0].geometry.dispose();
		this.ring.children[0].geometry = geometry;

		this.ring.children[1].geometry.dispose();
		this.ring.children[1].geometry = new THREE.WireframeGeometry(geometry);
	};

	Main.prototype.createGui = function() {
		var self = this;

		this.gui.add(properties, 'axesHelperVisible').onChange(function(value) {
			self.axesHelper.visible = value;
		});
		this.gui.add(properties, 'gridHelperVisible').onChange(function(value) {
			self.gridHelper.visible = value;
		});

		var folderGeometry = this.gui.addFolder('Ring Geometry');
		folderGeometry.add(properties, 'ringWireframe').onChange(function(value) {
			self.ring.children[0].visible = !value;
			/*
				self.ring.children[0].material.wireframe = value;
				self.ring.children[1].visible = !value;
			*/
		});
		folderGeometry.add(properties, 'ringInnerRadius', 0.1, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'ringOuterRadius', 0.1, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'ringThetaSegments', 3, 64).step(1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'ringPhiSegments', 1, 64).step(1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'ringThetaStart', 0, 2*Math.PI).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'ringThetaLength', 0.1, 2*Math.PI).step(0.1).onChange(function(value) {
			self.createGeometry();
		});

		var folderMaterial = this.gui.addFolder('Ring Material');
		folderMaterial.addColor(properties, 'ringMaterialColor').onChange(function(value) {
			self.ring.children[0].material.color.setHex(rdo.helper.cssColorToHex(value));
		});
		folderMaterial.addColor(properties, 'ringWireframeColor').onChange(function(value) {
			self.ring.children[1].material.color.setHex(rdo.helper.cssColorToHex(value));
		});

		var folderTransformation = this.gui.addFolder('Ring Transformation');
		folderTransformation.add(properties, 'ringPositionX', -10, 10).step(0.1).onChange(function(value) {
			self.ring.position.x = value;
		});
		folderTransformation.add(properties, 'ringPositionY', -10, 10).step(0.1).onChange(function(value) {
			self.ring.position.y = value;
		});
		folderTransformation.add(properties, 'ringPositionZ', -10, 10).step(0.1).onChange(function(value) {
			self.ring.position.z = value;
		});
		folderTransformation.add(properties, 'ringRotationX', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.ring.rotation.x = value;
		});
		folderTransformation.add(properties, 'ringRotationY', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.ring.rotation.y = value;
		});
		folderTransformation.add(properties, 'ringRotationZ', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.ring.rotation.z = value;
		});
		folderTransformation.add(properties, 'ringScaleX', 0.1, 10).step(0.1).onChange(function(value) {
			self.ring.scale.x = value;
		});
		folderTransformation.add(properties, 'ringScaleY', 0.1, 10).step(0.1).onChange(function(value) {
			self.ring.scale.y = value;
		});
	};

	Main.prototype.render = function() {
		requestAnimationFrame(this.render.bind(this));

		this.renderer.render(this.scene, this.camera);
	};

	Main.prototype.getGameAreaHeight = function() { return this.canvas.offsetHeight; };
	Main.prototype.getGameAreaWidth = function() { return this.canvas.offsetWidth; };

	Main.prototype.getCameraAspect = function() { return this.getGameAreaWidth() / this.getGameAreaHeight(); };

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