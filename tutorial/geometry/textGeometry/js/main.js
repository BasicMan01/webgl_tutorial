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
		'textValue': 'Hello World',
		'textFont': 'gentilis_regular',
		'textSize': 2,
		'textHeight': 1,
		'textCurveSegments': 5,
		'textBevelEnabled': false,
		'textBevelThickness': 0.3,
		'textBevelSize': 0.3,
		'textBevelSegments': 3,
		'textMaterialColor': '#156289',
		'textWireframeColor': '#FFFFFF',
		'textPositionX': 0,
		'textPositionY': 0,
		'textPositionZ': 0,
		'textRotationX': 0,
		'textRotationY': 0,
		'textRotationZ': 0,
		'textScaleX': 1,
		'textScaleY': 1,
		'textScaleZ': 1,
		'textWireframe': false
	};



	var Main = function(canvas)	{
		this.canvas = canvas;

		this.camera = null;
		this.controls = null;
		this.gui = null;
		this.renderer = null;
		this.scene = null;

		this.fontLoader = null;

		this.axisHelper = null;
		this.gridHelper = null;

		this.text = null;
		this.textFont = null;
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
		this.fontLoader = new THREE.FontLoader();

		this.axisHelper = new THREE.AxisHelper(25);
		this.scene.add(this.axisHelper);

		this.gridHelper = new THREE.GridHelper(50, 50);
		this.scene.add(this.gridHelper);

		this.text = new THREE.Object3D();
		this.scene.add(this.text);

		this.text.add(new THREE.Mesh(
			new THREE.Geometry(),
			new THREE.MeshBasicMaterial( { color: properties.textMaterialColor } )
		));

		this.text.add(new THREE.LineSegments(
			new THREE.Geometry(),
			new THREE.LineBasicMaterial( { color: properties.textWireframeColor } )
		));

		this.loadFont(properties.textFont);
	};

	Main.prototype.createGeometry = function() {
		var geometry = new THREE.TextGeometry(
			properties.textValue,
			{
				font: this.textFont,
				size: properties.textSize,
				height: properties.textHeight,
				curveSegments: properties.textCurveSegments,
				bevelEnabled: properties.textBevelEnabled,
				bevelThickness: properties.textBevelThickness,
				bevelSize: properties.textBevelSize,
				bevelSegments: properties.textBevelSegments
			}
		);

		this.text.children[0].geometry.dispose();
		this.text.children[0].geometry = geometry;

		this.text.children[1].geometry.dispose();
		this.text.children[1].geometry = new THREE.WireframeGeometry(geometry);
	};

	Main.prototype.createGui = function() {
		var self = this;

		this.gui.add(properties, 'axisHelperVisible').onChange(function(value) {
			self.axisHelper.visible = value;
		});
		this.gui.add(properties, 'gridHelperVisible').onChange(function(value) {
			self.gridHelper.visible = value;
		});

		var folderGeometry = this.gui.addFolder('Text Geometry');
		folderGeometry.add(properties, 'textWireframe').onChange(function(value) {
			self.text.children[0].visible = !value;
			/*
				self.text.children[0].material.wireframe = value;
				self.text.children[1].visible = !value;
			*/
		});
		folderGeometry.add(properties, 'textValue').onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'textFont',
				['gentilis_bold', 'gentilis_regular', 'helvetiker_bold', 'helvetiker_regular', 'optimer_bold', 'optimer_regular']).onChange(function(value) {
			self.loadFont(value);
		});
		folderGeometry.add(properties, 'textSize', 0.1, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'textHeight', 0.1, 5).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'textCurveSegments', 1, 10).step(1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'textBevelEnabled').onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'textBevelThickness', 0.1, 2).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'textBevelSize', 0.1, 2).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'textBevelSegments', 1, 10).step(1).onChange(function(value) {
			self.createGeometry();
		});

		var folderMaterial = this.gui.addFolder('Text Material');
		folderMaterial.addColor(properties, 'textMaterialColor').onChange(function(value) {
			self.text.children[0].material.color.setHex(rdo.helper.cssColorToHex(value));
		});
		folderMaterial.addColor(properties, 'textWireframeColor').onChange(function(value) {
			self.text.children[1].material.color.setHex(rdo.helper.cssColorToHex(value));
		});

		var folderTransformation = this.gui.addFolder('Text Transformation');
		folderTransformation.add(properties, 'textPositionX', -10, 10).step(0.1).onChange(function(value) {
			self.text.position.x = value;
		});
		folderTransformation.add(properties, 'textPositionY', -10, 10).step(0.1).onChange(function(value) {
			self.text.position.y = value;
		});
		folderTransformation.add(properties, 'textPositionZ', -10, 10).step(0.1).onChange(function(value) {
			self.text.position.z = value;
		});
		folderTransformation.add(properties, 'textRotationX', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.text.rotation.x = value;
		});
		folderTransformation.add(properties, 'textRotationY', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.text.rotation.y = value;
		});
		folderTransformation.add(properties, 'textRotationZ', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.text.rotation.z = value;
		});
		folderTransformation.add(properties, 'textScaleX', 0.1, 10).step(0.1).onChange(function(value) {
			self.text.scale.x = value;
		});
		folderTransformation.add(properties, 'textScaleY', 0.1, 10).step(0.1).onChange(function(value) {
			self.text.scale.y = value;
		});
		folderTransformation.add(properties, 'textScaleZ', 0.1, 10).step(0.1).onChange(function(value) {
			self.text.scale.z = value;
		});
	};

	Main.prototype.loadFont = function(fontName) {
		this.fontLoader.load('../../../resources/font/json/' + fontName + '.typeface.json', function (font) {
			this.textFont = font;

			this.createGeometry();
		}.bind(this));
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