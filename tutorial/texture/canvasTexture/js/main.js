/* globals dat,rdo,THREE */

(function(window) {
	'use strict';

	var config = {
		'CAMERA_FOV': 70,
		'CAMERA_NEAR_PLANE': 0.1,
		'CAMERA_FAR_PLANE': 500
	};

	var fonts = {
		'Arial': 'Arial',
		'Arial Black': 'Arial Black',
		'Comic Sans MS': 'Comic Sans MS',
		'Courier New': 'Courier New',
		'Georgia': 'Georgia',
		'Impact': 'Impact',
		'Lucida Console': 'Lucida Console',
		'Lucida Sans Unicode': 'Lucida Sans Unicode',
		'Palatino Linotype': 'Palatino Linotype',
		'Tahoma': 'Tahoma',
		'Times New Roman': 'Times New Roman',
		'Trebuchet MS': 'Trebuchet MS',
		'Verdana': 'Verdana'
	};

	var properties = {
		'axisHelperVisible': true,
		'gridHelperVisible': true,
		'planeWidth': 5,
		'planeHeight': 5,
		'planeSegmentsX': 1,
		'planeSegmentsY': 1,
		'planeMaterialBackgroundColor': '#156289',
		'planeMaterialBackgroundOpacity': 0.3,
		'planeMaterialBorderColor': '#00ffff',
		'planeMaterialBorderOpacity': 1,
		'planeMaterialBorderLineWidth': 3,
		'planeMaterialFontColor': '#00ffff',
		'planeMaterialFontOpacity': 1,
		'planeMaterialFontSize': 11,
		'planeMaterialFontFamily': 'Courier New',
		'planeMaterialTextValue': 'Firstname: Max\\nSurname  : Mustermann',
		'planePositionX': 0,
		'planePositionY': 0,
		'planePositionZ': 0,
		'planeRotationX': 0,
		'planeRotationY': 0,
		'planeRotationZ': 0,
		'planeScaleX': 1,
		'planeScaleY': 1
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

		this.plane = new THREE.Mesh(
			new THREE.Geometry(),
			new THREE.SpriteMaterial()
		);
		this.scene.add(this.plane);

		this.createGeometry();
		this.createMaterial();
	};

	Main.prototype.createGeometry = function() {
		var geometry = new THREE.PlaneGeometry(
			properties.planeWidth,
			properties.planeHeight,
			properties.planeSegmentsX,
			properties.planeSegmentsY
		);

		this.plane.geometry.dispose();
		this.plane.geometry = geometry;
	};

	Main.prototype.createMaterial = function()
	{
		var canvas = document.createElement('canvas');

		canvas.height = 256;
		canvas.width = 256;

		var context = canvas.getContext('2d');

		var backgroundColor = rdo.helper.cssColorToRgb(properties.planeMaterialBackgroundColor);
		var borderColor = rdo.helper.cssColorToRgb(properties.planeMaterialBorderColor);
		var fontColor = rdo.helper.cssColorToRgb(properties.planeMaterialFontColor);

		context.fillStyle = 'rgba(' + backgroundColor.r + ', ' + backgroundColor.g + ', ' + backgroundColor.b + ', ' + properties.planeMaterialBackgroundOpacity + ')';
		context.fillRect(0, 0, 256, 256);

		context.strokeStyle = 'rgba(' + borderColor.r + ', ' + borderColor.g + ', ' + borderColor.b + ', ' + properties.planeMaterialBorderOpacity + ')';
		context.lineWidth = properties.planeMaterialBorderLineWidth;
		context.strokeRect(0, 0, 256, 256);

		context.font = properties.planeMaterialFontSize + 'px ' + properties.planeMaterialFontFamily;
		context.fillStyle = 'rgba(' + fontColor.r + ', ' + fontColor.g + ', ' + fontColor.b + ', ' + properties.planeMaterialFontOpacity + ')';

		var topPosition = 0;
		var lineHeight = properties.planeMaterialFontSize + 5;

		var textCollection = properties.planeMaterialTextValue.split('\\n');

		for(var i = 0; i < textCollection.length; ++i)
		{
			context.fillText(textCollection[i], 10, topPosition += lineHeight);
		}

		var texture = new THREE.Texture(canvas);

		texture.needsUpdate = true;

		this.plane.material = new THREE.MeshBasicMaterial( { map: texture, side: THREE.DoubleSide, transparent: true } );
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
		folderGeometry.add(properties, 'planeWidth', 0.1, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'planeHeight', 0.1, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});

		var folderMaterial = this.gui.addFolder('Plane Material');
		folderMaterial.addColor(properties, 'planeMaterialBackgroundColor').onChange(function(value) {
			self.createMaterial();
		});
		folderMaterial.add(properties, 'planeMaterialBackgroundOpacity', 0, 1).step(0.1).onChange(function(value) {
			self.createMaterial();
		});
		folderMaterial.addColor(properties, 'planeMaterialBorderColor').onChange(function(value) {
			self.createMaterial();
		});
		folderMaterial.add(properties, 'planeMaterialBorderOpacity', 0, 1).step(0.1).onChange(function(value) {
			self.createMaterial();
		});
		folderMaterial.add(properties, 'planeMaterialBorderLineWidth', 1, 10).step(1).onChange(function(value) {
			self.createMaterial();
		});
		folderMaterial.addColor(properties, 'planeMaterialFontColor').onChange(function(value) {
			self.createMaterial();
		});
		folderMaterial.add(properties, 'planeMaterialFontOpacity', 0, 1).step(0.1).onChange(function(value) {
			self.createMaterial();
		});
		folderMaterial.add(properties, 'planeMaterialFontSize', 8, 32).step(1).onChange(function(value) {
			self.createMaterial();
		});
		folderMaterial.add(properties, 'planeMaterialFontFamily', Object.keys(fonts)).onChange(function(value) {
			self.createMaterial();
		});
		folderMaterial.add(properties, 'planeMaterialTextValue').onChange(function(value) {
			self.createMaterial();
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