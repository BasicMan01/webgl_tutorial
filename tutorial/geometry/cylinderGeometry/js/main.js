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
		'cylinderRadiusTop': 3,
		'cylinderRadiusBottom': 3,
		'cylinderHeight': 5,
		'cylinderRadialSegments': 8,
		'cylinderHeightSegments': 1,
		'cylinderOpenEnded': false,
		'cylinderThetaStart': 0,
		'cylinderThetaLength': 2 * Math.PI,
		'cylinderMaterialColor': '#156289',
		'cylinderWireframeColor': '#FFFFFF',
		'cylinderPositionX': 0,
		'cylinderPositionY': 0,
		'cylinderPositionZ': 0,
		'cylinderRotationX': 0,
		'cylinderRotationY': 0,
		'cylinderRotationZ': 0,
		'cylinderScaleX': 1,
		'cylinderScaleY': 1,
		'cylinderScaleZ': 1,
		'cylinderWireframe': false
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

		this.cylinder = null;
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

		this.cylinder = new THREE.Object3D();
		this.scene.add(this.cylinder);

		this.cylinder.add(new THREE.Mesh(
			new THREE.Geometry(),
			new THREE.MeshBasicMaterial( { color: properties.cylinderMaterialColor, side: THREE.DoubleSide } )
		));

		this.cylinder.add(new THREE.LineSegments(
			new THREE.Geometry(),
			new THREE.LineBasicMaterial( { color: properties.cylinderWireframeColor } )
		));

		this.createGeometry();
	};

	Main.prototype.createGeometry = function() {
		var geometry = new THREE.CylinderGeometry(
			properties.cylinderRadiusTop,
			properties.cylinderRadiusBottom,
			properties.cylinderHeight,
			properties.cylinderRadialSegments,
			properties.cylinderHeightSegments,
			properties.cylinderOpenEnded,
			properties.cylinderThetaStart,
			properties.cylinderThetaLength
		);

		this.cylinder.children[0].geometry.dispose();
		this.cylinder.children[0].geometry = geometry;

		this.cylinder.children[1].geometry.dispose();
		this.cylinder.children[1].geometry = new THREE.WireframeGeometry(geometry);
	};

	Main.prototype.createGui = function() {
		var self = this;

		this.gui.add(properties, 'axisHelperVisible').onChange(function(value) {
			self.axisHelper.visible = value;
		});
		this.gui.add(properties, 'gridHelperVisible').onChange(function(value) {
			self.gridHelper.visible = value;
		});

		var folderGeometry = this.gui.addFolder('Cylinder Geometry');
		folderGeometry.add(properties, 'cylinderWireframe').onChange(function(value) {
			self.cylinder.children[0].visible = !value;
			/*
				self.cylinder.children[0].material.wireframe = value;
				self.cylinder.children[1].visible = !value;
			*/
		});
		folderGeometry.add(properties, 'cylinderOpenEnded').onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'cylinderRadiusTop', 0.1, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'cylinderRadiusBottom', 0.1, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'cylinderHeight', 0.1, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'cylinderRadialSegments', 3, 64).step(1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'cylinderHeightSegments', 1, 64).step(1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'cylinderThetaStart', 0, 2*Math.PI).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'cylinderThetaLength', 0, 2*Math.PI).step(0.1).onChange(function(value) {
			self.createGeometry();
		});

		var folderMaterial = this.gui.addFolder('Cylinder Material');
		folderMaterial.addColor(properties, 'cylinderMaterialColor').onChange(function(value) {
			self.cylinder.children[0].material.color.setHex(rdo.helper.cssColorToHex(value));
		});
		folderMaterial.addColor(properties, 'cylinderWireframeColor').onChange(function(value) {
			self.cylinder.children[1].material.color.setHex(rdo.helper.cssColorToHex(value));
		});

		var folderTransformation = this.gui.addFolder('Cylinder Transformation');
		folderTransformation.add(properties, 'cylinderPositionX', -10, 10).step(0.1).onChange(function(value) {
			self.cylinder.position.x = value;
		});
		folderTransformation.add(properties, 'cylinderPositionY', -10, 10).step(0.1).onChange(function(value) {
			self.cylinder.position.y = value;
		});
		folderTransformation.add(properties, 'cylinderPositionZ', -10, 10).step(0.1).onChange(function(value) {
			self.cylinder.position.z = value;
		});
		folderTransformation.add(properties, 'cylinderRotationX', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.cylinder.rotation.x = value;
		});
		folderTransformation.add(properties, 'cylinderRotationY', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.cylinder.rotation.y = value;
		});
		folderTransformation.add(properties, 'cylinderRotationZ', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.cylinder.rotation.z = value;
		});
		folderTransformation.add(properties, 'cylinderScaleX', 0.1, 10).step(0.1).onChange(function(value) {
			self.cylinder.scale.x = value;
		});
		folderTransformation.add(properties, 'cylinderScaleY', 0.1, 10).step(0.1).onChange(function(value) {
			self.cylinder.scale.y = value;
		});
		folderTransformation.add(properties, 'cylinderScaleZ', 0.1, 10).step(0.1).onChange(function(value) {
			self.cylinder.scale.z = value;
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