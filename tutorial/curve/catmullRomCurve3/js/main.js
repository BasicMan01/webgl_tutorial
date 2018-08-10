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
		'catmullRom3Points': 200,
		'catmullRom3Color': '#FFFFFF',
		'catmullRom3PositionX': 0,
		'catmullRom3PositionY': 0,
		'catmullRom3PositionZ': 0,
		'catmullRom3RotationX': 0,
		'catmullRom3RotationY': 0,
		'catmullRom3RotationZ': 0,
		'catmullRom3ScaleX': 1,
		'catmullRom3ScaleY': 1,
		'catmullRom3ScaleZ': 1
	};

	var onProgress = function(xhr) {
		if(xhr.lengthComputable) {
			var percentComplete = xhr.loaded / xhr.total * 100;

			console.log(Math.round(percentComplete, 2) + '% downloaded');
		}
	};

	var onError = function(xhr) {
		console.error(xhr);
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

		this.catmullRom3 = null;
		this.catmullRom3Geometry = null;
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
		var self = this;

		this.axesHelper = new THREE.AxesHelper(25);
		this.scene.add(this.axesHelper);

		this.gridHelper = new THREE.GridHelper(50, 50);
		this.scene.add(this.gridHelper);

		this.catmullRom3 = new THREE.Line(
			new THREE.Geometry(),
			new THREE.LineBasicMaterial( { color: properties.catmullRom3Color } )
		);
		this.scene.add(this.catmullRom3);


		var loadingManager = new THREE.LoadingManager();

		loadingManager.onProgress = function(item, loaded, total) {
			console.log(item, '(' + loaded + '/' + total + ')');
		};


		var fileLoader = new THREE.FileLoader(loadingManager);

		fileLoader.load('../../../resources/mesh/catmullRom/catmullRom.json', function(json) {
			try {
				var pathPointsCollection = [];
				var pathPointsJson = JSON.parse(json).data;

				for (var i = 0; i < pathPointsJson.length; ++i) {
					pathPointsCollection.push(new THREE.Vector3(pathPointsJson[i].x, pathPointsJson[i].y, pathPointsJson[i].z));
				}

				self.catmullRom3Geometry = new THREE.CatmullRomCurve3(pathPointsCollection, false);

				self.createGeometry();

				self.render();
			} catch(e) {
				console.error(e);
			}
		}, onProgress, onError);
	};

	Main.prototype.createGeometry = function() {
		this.catmullRom3.geometry.dispose();
		this.catmullRom3.geometry = new THREE.Geometry();
		this.catmullRom3.geometry.vertices = this.catmullRom3Geometry.getPoints(properties.catmullRom3Points);
		this.catmullRom3.geometry.vertices.push(this.catmullRom3.geometry.vertices[0]);
	};

	Main.prototype.createGui = function() {
		var self = this;

		this.gui.add(properties, 'axesHelperVisible').onChange(function(value) {
			self.axesHelper.visible = value;
		});
		this.gui.add(properties, 'gridHelperVisible').onChange(function(value) {
			self.gridHelper.visible = value;
		});

		var folderGeometry = this.gui.addFolder('Catmull Rom Curve');
		folderGeometry.add(properties, 'catmullRom3Points', 50, 300).step(1).onChange(function(value) {
			self.createGeometry();
		});

		var folderMaterial = this.gui.addFolder('Catmull Rom Material');
		folderMaterial.addColor(properties, 'catmullRom3Color').onChange(function(value) {
			self.catmullRom3.material.color.setHex(rdo.helper.cssColorToHex(value));
		});

		var folderTransformation = this.gui.addFolder('Catmull Rom Transformation');
		folderTransformation.add(properties, 'catmullRom3PositionX', -10, 10).step(0.1).onChange(function(value) {
			self.catmullRom3.position.x = value;
		});
		folderTransformation.add(properties, 'catmullRom3PositionY', -10, 10).step(0.1).onChange(function(value) {
			self.catmullRom3.position.y = value;
		});
		folderTransformation.add(properties, 'catmullRom3PositionZ', -10, 10).step(0.1).onChange(function(value) {
			self.catmullRom3.position.z = value;
		});
		folderTransformation.add(properties, 'catmullRom3RotationX', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.catmullRom3.rotation.x = value;
		});
		folderTransformation.add(properties, 'catmullRom3RotationY', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.catmullRom3.rotation.y = value;
		});
		folderTransformation.add(properties, 'catmullRom3RotationZ', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.catmullRom3.rotation.z = value;
		});
		folderTransformation.add(properties, 'catmullRom3ScaleX', 0.1, 10).step(0.1).onChange(function(value) {
			self.catmullRom3.scale.x = value;
		});
		folderTransformation.add(properties, 'catmullRom3ScaleY', 0.1, 10).step(0.1).onChange(function(value) {
			self.catmullRom3.scale.y = value;
		});
		folderTransformation.add(properties, 'catmullRom3ScaleZ', 0.1, 10).step(0.1).onChange(function(value) {
			self.catmullRom3.scale.z = value;
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