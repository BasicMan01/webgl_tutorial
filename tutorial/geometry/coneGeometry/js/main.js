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
		'coneRadius': 5,
		'coneHeight': 5,
		'coneRadialSegments': 8,
		'coneHeightSegments': 1,
		'coneOpenEnded': false,
		'coneThetaStart': 0,
		'coneThetaLength': 2 * Math.PI,
		'coneMaterialColor': '#156289',
		'coneWireframeColor': '#FFFFFF',
		'conePositionX': 0,
		'conePositionY': 0,
		'conePositionZ': 0,
		'coneRotationX': 0,
		'coneRotationY': 0,
		'coneRotationZ': 0,
		'coneScaleX': 1,
		'coneScaleY': 1,
		'coneScaleZ': 1,
		'coneWireframe': false
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

		this.cone = null;
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

		this.cone = new THREE.Object3D();
		this.scene.add(this.cone);

		this.cone.add(new THREE.Mesh(
			new THREE.Geometry(),
			new THREE.MeshBasicMaterial( { color: properties.coneMaterialColor, side: THREE.DoubleSide } )
		));

		this.cone.add(new THREE.LineSegments(
			new THREE.Geometry(),
			new THREE.LineBasicMaterial( { color: properties.coneWireframeColor } )
		));

		this.createGeometry();
	};

	Main.prototype.createGeometry = function() {
		var geometry = new THREE.ConeGeometry(
			properties.coneRadius,
			properties.coneHeight,
			properties.coneRadialSegments,
			properties.coneHeightSegments,
			properties.coneOpenEnded,
			properties.coneThetaStart,
			properties.coneThetaLength
		);

		this.cone.children[0].geometry.dispose();
		this.cone.children[0].geometry = geometry;

		this.cone.children[1].geometry.dispose();
		this.cone.children[1].geometry = new THREE.WireframeGeometry(geometry);
	};

	Main.prototype.createGui = function() {
		var self = this;

		this.gui.add(properties, 'axisHelperVisible').onChange(function(value) {
			self.axisHelper.visible = value;
		});
		this.gui.add(properties, 'gridHelperVisible').onChange(function(value) {
			self.gridHelper.visible = value;
		});

		var folderGeometry = this.gui.addFolder('Cone Geometry');
		folderGeometry.add(properties, 'coneWireframe').onChange(function(value) {
			self.cone.children[0].visible = !value;
			/*
				self.cone.children[0].material.wireframe = value;
				self.cone.children[1].visible = !value;
			*/
		});
		folderGeometry.add(properties, 'coneOpenEnded').onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'coneRadius', 0.1, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'coneHeight', 0.1, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'coneRadialSegments', 3, 64).step(1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'coneHeightSegments', 1, 64).step(1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'coneThetaStart', 0, 2*Math.PI).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'coneThetaLength', 0, 2*Math.PI).step(0.1).onChange(function(value) {
			self.createGeometry();
		});

		var folderMaterial = this.gui.addFolder('Cone Material');
		folderMaterial.addColor(properties, 'coneMaterialColor').onChange(function(value) {
			self.cone.children[0].material.color.setHex(rdo.helper.cssColorToHex(value));
		});
		folderMaterial.addColor(properties, 'coneWireframeColor').onChange(function(value) {
			self.cone.children[1].material.color.setHex(rdo.helper.cssColorToHex(value));
		});

		var folderTransformation = this.gui.addFolder('Cone Transformation');
		folderTransformation.add(properties, 'conePositionX', -10, 10).step(0.1).onChange(function(value) {
			self.cone.position.x = value;
		});
		folderTransformation.add(properties, 'conePositionY', -10, 10).step(0.1).onChange(function(value) {
			self.cone.position.y = value;
		});
		folderTransformation.add(properties, 'conePositionZ', -10, 10).step(0.1).onChange(function(value) {
			self.cone.position.z = value;
		});
		folderTransformation.add(properties, 'coneRotationX', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.cone.rotation.x = value;
		});
		folderTransformation.add(properties, 'coneRotationY', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.cone.rotation.y = value;
		});
		folderTransformation.add(properties, 'coneRotationZ', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.cone.rotation.z = value;
		});
		folderTransformation.add(properties, 'coneScaleX', 0.1, 10).step(0.1).onChange(function(value) {
			self.cone.scale.x = value;
		});
		folderTransformation.add(properties, 'coneScaleY', 0.1, 10).step(0.1).onChange(function(value) {
			self.cone.scale.y = value;
		});
		folderTransformation.add(properties, 'coneScaleZ', 0.1, 10).step(0.1).onChange(function(value) {
			self.cone.scale.z = value;
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