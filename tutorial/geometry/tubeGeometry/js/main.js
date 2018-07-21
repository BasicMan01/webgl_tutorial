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
		'tubeRadius': 0.2,
		'tubeTubularSegments': 300,
		'tubeRadialSegments': 10,
		'tubeMaterialColor': '#156289',
		'tubeWireframeColor': '#FFFFFF',
		'tubePositionX': 0,
		'tubePositionY': 0,
		'tubePositionZ': 0,
		'tubeRotationX': 0,
		'tubeRotationY': 0,
		'tubeRotationZ': 0,
		'tubeScaleX': 1,
		'tubeScaleY': 1,
		'tubeScaleZ': 1,
		'tubeWireframe': false
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

		this.axisHelper = null;
		this.gridHelper = null;

		this.curveGeometry = null;
		this.tube = null;
		this.tubeGeometry = null;
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
	};

	Main.prototype.createObject = function() {
		var self = this;

		this.axisHelper = new THREE.AxisHelper(25);
		this.scene.add(this.axisHelper);

		this.gridHelper = new THREE.GridHelper(50, 50);
		this.scene.add(this.gridHelper);

		this.tube = new THREE.Object3D();
		this.scene.add(this.tube);

		this.tube.add(new THREE.Mesh(
			new THREE.Geometry(),
			new THREE.MeshBasicMaterial( { color: properties.tubeMaterialColor, side: THREE.DoubleSide } )
		));

		this.tube.add(new THREE.LineSegments(
			new THREE.Geometry(),
			new THREE.LineBasicMaterial( { color: properties.tubeWireframeColor } )
		));


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

				self.curveGeometry = new THREE.CatmullRomCurve3(pathPointsCollection, true);

				self.createGeometry();

				self.render();
			} catch(e) {
				console.error(e);
			}
		}, onProgress, onError);
	};

	Main.prototype.createGeometry = function() {
		this.tubeGeometry = new THREE.TubeBufferGeometry(
			this.curveGeometry,
			properties.tubeTubularSegments,
			properties.tubeRadius,
			properties.tubeRadialSegments,
			true
		);

		this.tube.children[0].geometry.dispose();
		this.tube.children[0].geometry = this.tubeGeometry;

		this.tube.children[1].geometry.dispose();
		this.tube.children[1].geometry = new THREE.WireframeGeometry(this.tubeGeometry);
	};

	Main.prototype.createGui = function() {
		var self = this;

		this.gui.add(properties, 'axisHelperVisible').onChange(function(value) {
			self.axisHelper.visible = value;
		});
		this.gui.add(properties, 'gridHelperVisible').onChange(function(value) {
			self.gridHelper.visible = value;
		});

		var folderGeometry = this.gui.addFolder('Tube Geometry');
		folderGeometry.add(properties, 'tubeWireframe').onChange(function(value) {
			self.tube.children[0].visible = !value;
			/*
				self.tube.children[0].material.wireframe = value;
				self.tube.children[1].visible = !value;
			*/
		});
		folderGeometry.add(properties, 'tubeRadius', 0.1, 1).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'tubeTubularSegments', 50, 1000).step(50).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'tubeRadialSegments', 3, 12).step(1).onChange(function(value) {
			self.createGeometry();
		});

		var folderMaterial = this.gui.addFolder('Tube Material');
		folderMaterial.addColor(properties, 'tubeMaterialColor').onChange(function(value) {
			self.tube.children[0].material.color.setHex(rdo.helper.cssColorToHex(value));
		});
		folderMaterial.addColor(properties, 'tubeWireframeColor').onChange(function(value) {
			self.tube.children[1].material.color.setHex(rdo.helper.cssColorToHex(value));
		});

		var folderTransformation = this.gui.addFolder('Tube Transformation');
		folderTransformation.add(properties, 'tubePositionX', -10, 10).step(0.1).onChange(function(value) {
			self.tube.position.x = value;
		});
		folderTransformation.add(properties, 'tubePositionY', -10, 10).step(0.1).onChange(function(value) {
			self.tube.position.y = value;
		});
		folderTransformation.add(properties, 'tubePositionZ', -10, 10).step(0.1).onChange(function(value) {
			self.tube.position.z = value;
		});
		folderTransformation.add(properties, 'tubeRotationX', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.tube.rotation.x = value;
		});
		folderTransformation.add(properties, 'tubeRotationY', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.tube.rotation.y = value;
		});
		folderTransformation.add(properties, 'tubeRotationZ', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.tube.rotation.z = value;
		});
		folderTransformation.add(properties, 'tubeScaleX', 0.1, 10).step(0.1).onChange(function(value) {
			self.tube.scale.x = value;
		});
		folderTransformation.add(properties, 'tubeScaleY', 0.1, 10).step(0.1).onChange(function(value) {
			self.tube.scale.y = value;
		});
		folderTransformation.add(properties, 'tubeScaleZ', 0.1, 10).step(0.1).onChange(function(value) {
			self.tube.scale.z = value;
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
