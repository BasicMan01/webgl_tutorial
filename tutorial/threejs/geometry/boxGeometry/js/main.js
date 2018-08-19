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
		'cubeWidth': 5,
		'cubeHeight': 5,
		'cubeDepth': 5,
		'cubeSegmentsX': 1,
		'cubeSegmentsY': 1,
		'cubeSegmentsZ': 1,
		'cubeMaterialColor': '#156289',
		'cubeWireframeColor': '#FFFFFF',
		'cubePositionX': 0,
		'cubePositionY': 0,
		'cubePositionZ': 0,
		'cubeRotationX': 0,
		'cubeRotationY': 0,
		'cubeRotationZ': 0,
		'cubeScaleX': 1,
		'cubeScaleY': 1,
		'cubeScaleZ': 1,
		'cubeWireframe': false
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

		this.cube = null;
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

		this.cube = new THREE.Object3D();
		this.scene.add(this.cube);

		this.cube.add(new THREE.Mesh(
			new THREE.Geometry(),
			new THREE.MeshBasicMaterial( { color: properties.cubeMaterialColor } )
		));

		this.cube.add(new THREE.LineSegments(
			new THREE.Geometry(),
			new THREE.LineBasicMaterial( { color: properties.cubeWireframeColor } )
		));

		this.createGeometry();
	};

	Main.prototype.createGeometry = function() {
		var geometry = new THREE.BoxGeometry(
			properties.cubeWidth,
			properties.cubeHeight,
			properties.cubeDepth,
			properties.cubeSegmentsX,
			properties.cubeSegmentsY,
			properties.cubeSegmentsZ
		);

		this.cube.children[0].geometry.dispose();
		this.cube.children[0].geometry = geometry;

		this.cube.children[1].geometry.dispose();
		this.cube.children[1].geometry = new THREE.WireframeGeometry(geometry);
	};

	Main.prototype.createGui = function() {
		var self = this;

		this.gui.add(properties, 'axesHelperVisible').onChange(function(value) {
			self.axesHelper.visible = value;
		});
		this.gui.add(properties, 'gridHelperVisible').onChange(function(value) {
			self.gridHelper.visible = value;
		});

		var folderGeometry = this.gui.addFolder('Cube Geometry');
		folderGeometry.add(properties, 'cubeWireframe').onChange(function(value) {
			self.cube.children[0].visible = !value;
		});
		folderGeometry.add(properties, 'cubeWidth', 0.1, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'cubeHeight', 0.1, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'cubeDepth', 0.1, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'cubeSegmentsX', 1, 10).step(1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'cubeSegmentsY', 1, 10).step(1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'cubeSegmentsZ', 1, 10).step(1).onChange(function(value) {
			self.createGeometry();
		});

		var folderMaterial = this.gui.addFolder('Cube Material');
		folderMaterial.addColor(properties, 'cubeMaterialColor').onChange(function(value) {
			self.cube.children[0].material.color.setHex(rdo.helper.cssColorToHex(value));
		});
		folderMaterial.addColor(properties, 'cubeWireframeColor').onChange(function(value) {
			self.cube.children[1].material.color.setHex(rdo.helper.cssColorToHex(value));
		});

		var folderTransformation = this.gui.addFolder('Cube Transformation');
		folderTransformation.add(properties, 'cubePositionX', -10, 10).step(0.1).onChange(function(value) {
			self.cube.position.x = value;
		});
		folderTransformation.add(properties, 'cubePositionY', -10, 10).step(0.1).onChange(function(value) {
			self.cube.position.y = value;
		});
		folderTransformation.add(properties, 'cubePositionZ', -10, 10).step(0.1).onChange(function(value) {
			self.cube.position.z = value;
		});
		folderTransformation.add(properties, 'cubeRotationX', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.cube.rotation.x = value;
		});
		folderTransformation.add(properties, 'cubeRotationY', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.cube.rotation.y = value;
		});
		folderTransformation.add(properties, 'cubeRotationZ', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.cube.rotation.z = value;
		});
		folderTransformation.add(properties, 'cubeScaleX', 0.1, 10).step(0.1).onChange(function(value) {
			self.cube.scale.x = value;
		});
		folderTransformation.add(properties, 'cubeScaleY', 0.1, 10).step(0.1).onChange(function(value) {
			self.cube.scale.y = value;
		});
		folderTransformation.add(properties, 'cubeScaleZ', 0.1, 10).step(0.1).onChange(function(value) {
			self.cube.scale.z = value;
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