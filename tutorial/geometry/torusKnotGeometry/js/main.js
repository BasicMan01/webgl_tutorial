/* globals dat,rdo,THREE */

(function(window) {
	'use strict';

	var config = {
		'CAMERA_FOV': 70,
		'CAMERA_NEAR_PLANE': 0.1,
		'CAMERA_FAR_PLANE': 500
	};

	var properties = {
		'axisHelperVisible': true,
		'gridHelperVisible': true,
		'torusKnotRadius': 3,
		'torusKnotTube': 1,
		'torusKnotRadialSegments': 10,
		'torusKnotTubularSegments': 10,
		'torusKnotP': 0.1,
		'torusKnotQ': 0.1,
		'torusKnotMaterialColor': '#156289',
		'torusKnotWireframeColor': '#FFFFFF',
		'torusKnotPositionX': 0,
		'torusKnotPositionY': 0,
		'torusKnotPositionZ': 0,
		'torusKnotRotationX': 0,
		'torusKnotRotationY': 0,
		'torusKnotRotationZ': 0,
		'torusKnotScaleX': 1,
		'torusKnotScaleY': 1,
		'torusKnotScaleZ': 1,
		'torusKnotWireframe': false
	};



	var Main = function(canvas)	{
		this.canvas = canvas;

		this.camera = null;
		this.controls = null;
		this.gui = null;
		this.renderer = null;
		this.scene = null;

		this.axisHelper = null;
		this.gridHelper = null;

		this.torusKnot = null;
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
		this.axisHelper = new THREE.AxisHelper(25);
		this.scene.add(this.axisHelper);

		this.gridHelper = new THREE.GridHelper(50, 50);
		this.scene.add(this.gridHelper);

		this.torusKnot = new THREE.Object3D();
		this.scene.add(this.torusKnot);

		this.torusKnot.add(new THREE.Mesh(
			new THREE.Geometry(),
			new THREE.MeshBasicMaterial( { color: properties.torusKnotMaterialColor, side: THREE.DoubleSide } )
		));

		this.torusKnot.add(new THREE.LineSegments(
			new THREE.Geometry(),
			new THREE.LineBasicMaterial( { color: properties.torusKnotWireframeColor } )
		));

		this.createGeometry();
	};

	Main.prototype.createGeometry = function() {
		var geometry = new THREE.TorusKnotGeometry(
			properties.torusKnotRadius,
			properties.torusKnotTube,
			properties.torusKnotTubularSegments,
			properties.torusKnotRadialSegments,
			properties.torusKnotP,
			properties.torusKnotQ
		);

		this.torusKnot.children[0].geometry.dispose();
		this.torusKnot.children[0].geometry = geometry;

		this.torusKnot.children[1].geometry.dispose();
		this.torusKnot.children[1].geometry = new THREE.WireframeGeometry(geometry);
	};

	Main.prototype.createGui = function() {
		var self = this;

		this.gui.add(properties, 'axisHelperVisible').onChange(function(value) {
			self.axisHelper.visible = value;
		});
		this.gui.add(properties, 'gridHelperVisible').onChange(function(value) {
			self.gridHelper.visible = value;
		});

		var folderGeometry = this.gui.addFolder('TorusKnot Geometry');
		folderGeometry.add(properties, 'torusKnotWireframe').onChange(function(value) {
			self.torusKnot.children[0].visible = !value;
			/*
				self.torusKnot.children[0].material.wireframe = value;
				self.torusKnot.children[1].visible = !value;
			*/
		});
		folderGeometry.add(properties, 'torusKnotRadius', 0.1, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'torusKnotTube', 0.1, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'torusKnotRadialSegments', 3, 64).step(1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'torusKnotTubularSegments', 3, 64).step(1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'torusKnotP', 0.1, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'torusKnotQ', 0.1, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});

		var folderMaterial = this.gui.addFolder('TorusKnot Material');
		folderMaterial.addColor(properties, 'torusKnotMaterialColor').onChange(function(value) {
			self.torusKnot.children[0].material.color.setHex(rdo.helper.cssColorToHex(value));
		});
		folderMaterial.addColor(properties, 'torusKnotWireframeColor').onChange(function(value) {
			self.torusKnot.children[1].material.color.setHex(rdo.helper.cssColorToHex(value));
		});

		var folderTransformation = this.gui.addFolder('TorusKnot Transformation');
		folderTransformation.add(properties, 'torusKnotPositionX', -10, 10).step(0.1).onChange(function(value) {
			self.torusKnot.position.x = value;
		});
		folderTransformation.add(properties, 'torusKnotPositionY', -10, 10).step(0.1).onChange(function(value) {
			self.torusKnot.position.y = value;
		});
		folderTransformation.add(properties, 'torusKnotPositionZ', -10, 10).step(0.1).onChange(function(value) {
			self.torusKnot.position.z = value;
		});
		folderTransformation.add(properties, 'torusKnotRotationX', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.torusKnot.rotation.x = value;
		});
		folderTransformation.add(properties, 'torusKnotRotationY', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.torusKnot.rotation.y = value;
		});
		folderTransformation.add(properties, 'torusKnotRotationZ', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.torusKnot.rotation.z = value;
		});
		folderTransformation.add(properties, 'torusKnotScaleX', 0.1, 10).step(0.1).onChange(function(value) {
			self.torusKnot.scale.x = value;
		});
		folderTransformation.add(properties, 'torusKnotScaleY', 0.1, 10).step(0.1).onChange(function(value) {
			self.torusKnot.scale.y = value;
		});
		folderTransformation.add(properties, 'torusKnotScaleZ', 0.1, 10).step(0.1).onChange(function(value) {
			self.torusKnot.scale.z = value;
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