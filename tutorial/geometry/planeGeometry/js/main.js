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
		'planeWidth': 5,
		'planeHeight': 5,
		'planeSegmentsX': 1,
		'planeSegmentsY': 1,
		'planeMaterialColor': '#156289',
		'planeWireframeColor': '#FFFFFF',
		'planePositionX': 0,
		'planePositionY': 0,
		'planePositionZ': 0,
		'planeRotationX': 0,
		'planeRotationY': 0,
		'planeRotationZ': 0,
		'planeScaleX': 1,
		'planeScaleY': 1,
		'planeWireframe': false
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

		this.plane = null;
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

		this.plane = new THREE.Object3D();
		this.scene.add(this.plane);

		this.plane.add(new THREE.Mesh(
			new THREE.Geometry(),
			new THREE.MeshBasicMaterial( { color: properties.planeMaterialColor, side: THREE.DoubleSide } )
		));

		this.plane.add(new THREE.LineSegments(
			new THREE.Geometry(),
			new THREE.LineBasicMaterial( { color: properties.planeWireframeColor } )
		));

		this.createGeometry();
	};

	Main.prototype.createGeometry = function() {
		var geometry = new THREE.PlaneGeometry(
			properties.planeWidth,
			properties.planeHeight,
			properties.planeSegmentsX,
			properties.planeSegmentsY
		);

		this.plane.children[0].geometry.dispose();
		this.plane.children[0].geometry = geometry;

		this.plane.children[1].geometry.dispose();
		this.plane.children[1].geometry = new THREE.WireframeGeometry(geometry);
	};

	Main.prototype.createGui = function() {
		var self = this;

		this.gui.add(properties, 'axisHelperVisible').onChange(function(value) {
			self.axisHelper.visible = value;
		});
		this.gui.add(properties, 'gridHelperVisible').onChange(function(value) {
			self.gridHelper.visible = value;
		});

		var folderGeometry = this.gui.addFolder('Plane Geometry');
		folderGeometry.add(properties, 'planeWireframe').onChange(function(value) {
			self.plane.children[0].visible = !value;
			/*
				self.plane.children[0].material.wireframe = value;
				self.plane.children[1].visible = !value;
			*/
		});
		folderGeometry.add(properties, 'planeWidth', 0.1, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'planeHeight', 0.1, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'planeSegmentsX', 1, 10).step(1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'planeSegmentsY', 1, 10).step(1).onChange(function(value) {
			self.createGeometry();
		});

		var folderMaterial = this.gui.addFolder('Plane Material');
		folderMaterial.addColor(properties, 'planeMaterialColor').onChange(function(value) {
			self.plane.children[0].material.color.setHex(rdo.helper.cssColorToHex(value));
		});
		folderMaterial.addColor(properties, 'planeWireframeColor').onChange(function(value) {
			self.plane.children[1].material.color.setHex(rdo.helper.cssColorToHex(value));
		});

		var folderTransformation = this.gui.addFolder('Plane Transformation');
		folderTransformation.add(properties, 'planePositionX', -10, 10).step(0.1).onChange(function(value) {
			self.plane.position.x = value;
		});
		folderTransformation.add(properties, 'planePositionY', -10, 10).step(0.1).onChange(function(value) {
			self.plane.position.y = value;
		});
		folderTransformation.add(properties, 'planePositionZ', -10, 10).step(0.1).onChange(function(value) {
			self.plane.position.z = value;
		});
		folderTransformation.add(properties, 'planeRotationX', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.plane.rotation.x = value;
		});
		folderTransformation.add(properties, 'planeRotationY', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.plane.rotation.y = value;
		});
		folderTransformation.add(properties, 'planeRotationZ', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.plane.rotation.z = value;
		});
		folderTransformation.add(properties, 'planeScaleX', 0.1, 10).step(0.1).onChange(function(value) {
			self.plane.scale.x = value;
		});
		folderTransformation.add(properties, 'planeScaleY', 0.1, 10).step(0.1).onChange(function(value) {
			self.plane.scale.y = value;
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