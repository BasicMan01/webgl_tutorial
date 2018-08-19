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
		'fbxModelMaterialColor': '#FFFFFF',
		'fbxModelPositionX': 0,
		'fbxModelPositionY': 0,
		'fbxModelPositionZ': 0,
		'fbxModelRotationX': 0,
		'fbxModelRotationY': 0,
		'fbxModelRotationZ': 0,
		'fbxModelScaleX': 1,
		'fbxModelScaleY': 1,
		'fbxModelScaleZ': 1,
		'fbxModelWireframe': false
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

		this.fbxModel = null;
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


		var loadingManager = new THREE.LoadingManager();

		loadingManager.onProgress = function(item, loaded, total) {
			console.log(item, '(' + loaded + '/' + total + ')');
		};


		var fbxLoader = new THREE.FBXLoader(loadingManager);
		var textureLoader = new THREE.TextureLoader(loadingManager);

		fbxLoader.load('../../../../resources/mesh/fbx/fbxCube.fbx', function(object)
		{
			self.fbxModel = object;

			textureLoader.load('../../../../resources/texture/stones.jpg', function (texture) {
				var material = new THREE.MeshBasicMaterial({
					color: properties.fbxModelMaterialColor,
					map: texture,
					side: THREE.DoubleSide
				});

				self.fbxModel.getObjectByName('Cube').material = material;

				self.scene.add(self.fbxModel);
			}, onProgress, onError);
		}, onProgress, onError);
	};

	Main.prototype.createGui = function() {
		var self = this;

		this.gui.add(properties, 'axesHelperVisible').onChange(function(value) {
			self.axesHelper.visible = value;
		});
		this.gui.add(properties, 'gridHelperVisible').onChange(function(value) {
			self.gridHelper.visible = value;
		});

		var folderGeometry = this.gui.addFolder('FBX Model Geometry');
		folderGeometry.add(properties, 'fbxModelWireframe').onChange(function(value) {
			self.fbxModel.getObjectByName('Cube').material.wireframe = value;
		});

		var folderMaterial = this.gui.addFolder('FBX Model Material');
		folderMaterial.addColor(properties, 'fbxModelMaterialColor').onChange(function(value) {
			self.fbxModel.getObjectByName('Cube').material.color.setHex(rdo.helper.cssColorToHex(value));
		});

		var folderTransformation = this.gui.addFolder('FBX Model Transformation');
		folderTransformation.add(properties, 'fbxModelPositionX', -10, 10).step(0.1).onChange(function(value) {
			self.fbxModel.position.x = value;
		});
		folderTransformation.add(properties, 'fbxModelPositionY', -10, 10).step(0.1).onChange(function(value) {
			self.fbxModel.position.y = value;
		});
		folderTransformation.add(properties, 'fbxModelPositionZ', -10, 10).step(0.1).onChange(function(value) {
			self.fbxModel.position.z = value;
		});
		folderTransformation.add(properties, 'fbxModelRotationX', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.fbxModel.rotation.x = value;
		});
		folderTransformation.add(properties, 'fbxModelRotationY', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.fbxModel.rotation.y = value;
		});
		folderTransformation.add(properties, 'fbxModelRotationZ', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.fbxModel.rotation.z = value;
		});
		folderTransformation.add(properties, 'fbxModelScaleX', 0.1, 10).step(0.1).onChange(function(value) {
			self.fbxModel.scale.x = value;
		});
		folderTransformation.add(properties, 'fbxModelScaleY', 0.1, 10).step(0.1).onChange(function(value) {
			self.fbxModel.scale.y = value;
		});
		folderTransformation.add(properties, 'fbxModelScaleZ', 0.1, 10).step(0.1).onChange(function(value) {
			self.fbxModel.scale.z = value;
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