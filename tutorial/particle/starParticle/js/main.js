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
		'particleCount': 10000,
		'particleAlphaTest': 0.5,
		'particleMaterialColor': '#156289',
		'particleSizeAttenuation': false,
		'particleSize': 0.1,
		'particlePositionX': 0,
		'particlePositionY': 0,
		'particlePositionZ': 0,
		'particleRotationX': 0,
		'particleRotationY': 0,
		'particleRotationZ': 0,
		'particleScaleX': 1,
		'particleScaleY': 1,
		'particleScaleZ': 1
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

		this.particles = null;
		this.sprite = null;
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
		this.sprite = new THREE.TextureLoader().load( "../../../resources/texture/sprite/circle.png");

		this.axisHelper = new THREE.AxisHelper(25);
		this.scene.add(this.axisHelper);

		this.gridHelper = new THREE.GridHelper(50, 50);
		this.scene.add(this.gridHelper);

		this.particles = new THREE.Points(
			new THREE.Geometry(),
			new THREE.Material()
		);
		this.scene.add(this.particles);

		this.createGeometry();
		this.createMaterial();
	};

	Main.prototype.createGeometry = function() {
		var geometry = new THREE.Geometry();

		for(var i = 0; i < properties.particleCount; ++i)
		{
			var sprite = new THREE.Vector3();

			// Random float from -range/2 to range/2 interval
			sprite.x = THREE.Math.randFloatSpread(50);
			sprite.y = THREE.Math.randFloatSpread(50);
			sprite.z = THREE.Math.randFloatSpread(50);

			geometry.vertices.push(sprite);
		}

		this.particles.geometry.dispose();
		this.particles.geometry = geometry;
	};

	Main.prototype.createMaterial = function() {
		this.particles.material.dispose();
		this.particles.material = new THREE.PointsMaterial(
		{
			alphaTest: properties.particleAlphaTest,
			color: properties.particleMaterialColor,
			map: this.sprite,
			size: properties.particleSize,
			sizeAttenuation: properties.particleSizeAttenuation,
			transparent: true
		});
	};

	Main.prototype.createGui = function() {
		var self = this;

		this.gui.add(properties, 'axisHelperVisible').onChange(function(value) {
			self.axisHelper.visible = value;
		});
		this.gui.add(properties, 'gridHelperVisible').onChange(function(value) {
			self.gridHelper.visible = value;
		});

		var folderGeometry = this.gui.addFolder('Particle Geometry');
		folderGeometry.add(properties, 'particleCount', 100, 100000).step(100).onChange(function(value) {
			self.createGeometry();
		});

		var folderMaterial = this.gui.addFolder('Particle Material');
		folderMaterial.add(properties, 'particleAlphaTest', 0.01, 1).step(0.01).onChange(function(value) {
			self.createMaterial();
		});
		folderMaterial.add(properties, 'particleSize', 0.1, 2).step(0.1).onChange(function(value) {
			self.particles.material.size = value;
		});
		folderMaterial.add(properties, 'particleSizeAttenuation').onChange(function(value) {
			self.createMaterial();
		});
		folderMaterial.addColor(properties, 'particleMaterialColor').onChange(function(value) {
			self.particles.material.color.setHex(rdo.helper.cssColorToHex(value));
		});

		var folderTransformation = this.gui.addFolder('Particle Transformation');
		folderTransformation.add(properties, 'particlePositionX', -10, 10).step(0.1).onChange(function(value) {
			self.particles.position.x = value;
		});
		folderTransformation.add(properties, 'particlePositionY', -10, 10).step(0.1).onChange(function(value) {
			self.particles.position.y = value;
		});
		folderTransformation.add(properties, 'particlePositionZ', -10, 10).step(0.1).onChange(function(value) {
			self.particles.position.z = value;
		});
		folderTransformation.add(properties, 'particleRotationX', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.particles.rotation.x = value;
		});
		folderTransformation.add(properties, 'particleRotationY', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.particles.rotation.y = value;
		});
		folderTransformation.add(properties, 'particleRotationZ', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.particles.rotation.z = value;
		});
		folderTransformation.add(properties, 'particleScaleX', 0.1, 10).step(0.1).onChange(function(value) {
			self.particles.scale.x = value;
		});
		folderTransformation.add(properties, 'particleScaleY', 0.1, 10).step(0.1).onChange(function(value) {
			self.particles.scale.y = value;
		});
		folderTransformation.add(properties, 'particleScaleZ', 0.1, 10).step(0.1).onChange(function(value) {
			self.particles.scale.z = value;
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