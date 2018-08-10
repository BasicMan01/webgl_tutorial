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
		'tubeVisible': true,
		'cameraTracking': false,
		'cameraOffset': 0,
		'cameraLoopTime': 400,
		'curveBinormalsVisible': true,
		'curveNormalsVisible': true,
		'curveTangentsVisible': true,
		'curveBinormalsLength': 0.2,
		'curveNormalsLength': 0.2,
		'curveTangentsLength': 1.5,
		'curveMaterialColor': '#FFFF00',
		'curveBinormalMaterialColor': '#00FFFF',
		'curveNormalMaterialColor': '#FF00FF',
		'curveTangentMaterialColor': '#FF0000',
		'tubeRadius': 0.3,
		'tubeTubularSegments': 300,
		'tubeRadialSegments': 10,
		'tubeMaterialColor': '#156289',
		'tubeWireframeColor': '#FFFFFF',
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
		this.cameraTracking = null;
		this.controls = null;
		this.gui = null;
		this.renderer = null;
		this.scene = null;

		this.axesHelper = null;
		this.gridHelper = null;

		this.curve = null;
		this.curveGeometry = null;
		this.tube = null;
		this.tubeGeometry = null;

		this.binormalLines = null;
		this.normalLines = null;
		this.tangentLines = null;

		this.binormal = new THREE.Vector3();
	};

	Main.prototype.init = function() {
		this.scene = new THREE.Scene();

		this.camera = new THREE.PerspectiveCamera(config.CAMERA_FOV, this.getCameraAspect(), config.CAMERA_NEAR_PLANE, config.CAMERA_FAR_PLANE);
		this.camera.position.set(0, 10, 20);

		this.cameraTracking = new THREE.PerspectiveCamera(85, this.getCameraAspect(), config.CAMERA_NEAR_PLANE, config.CAMERA_FAR_PLANE);

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

		this.axesHelper = new THREE.AxesHelper(25);
		this.scene.add(this.axesHelper);

		this.gridHelper = new THREE.GridHelper(50, 50);
		this.scene.add(this.gridHelper);

		this.tube = new THREE.Object3D();
		this.curve = new THREE.Line(
			new THREE.Geometry(),
			new THREE.LineBasicMaterial( { color : properties.curveMaterialColor } )
		);

		this.scene.add(this.curve);
		this.scene.add(this.tube);

		this.tube.add(new THREE.Mesh(
			new THREE.Geometry(),
			new THREE.MeshBasicMaterial( { color: properties.tubeMaterialColor, side: THREE.DoubleSide } )
		));

		this.tube.add(new THREE.LineSegments(
			new THREE.Geometry(),
			new THREE.LineBasicMaterial( { color: properties.tubeWireframeColor } )
		));

		this.binormalLines = new THREE.LineSegments(
			new THREE.Geometry(),
			new THREE.LineBasicMaterial( { color: properties.curveBinormalMaterialColor } )
		);
		this.scene.add(this.binormalLines);

		this.normalLines = new THREE.LineSegments(
			new THREE.Geometry(),
			new THREE.LineBasicMaterial( { color: properties.curveNormalMaterialColor } )
		);
		this.scene.add(this.normalLines);

		this.tangentLines = new THREE.LineSegments(
			new THREE.Geometry(),
			new THREE.LineBasicMaterial( { color: properties.curveTangentMaterialColor } )
		);
		this.scene.add(this.tangentLines);


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
		this.curve.geometry.dispose();
		this.curve.geometry = new THREE.Geometry();
		this.curve.geometry.vertices = this.curveGeometry.getPoints(properties.tubeTubularSegments);
		this.curve.geometry.vertices.push(this.curve.geometry.vertices[0]);

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

		this.gui.add(properties, 'axesHelperVisible').onChange(function(value) {
			self.axesHelper.visible = value;
		});
		this.gui.add(properties, 'gridHelperVisible').onChange(function(value) {
			self.gridHelper.visible = value;
		});

		var folderCamera = this.gui.addFolder('Camera Properties');
		folderCamera.add(properties, 'cameraTracking').onChange(function(value) {
		});
		folderCamera.add(properties, 'cameraOffset', 0, 2).step(0.01).onChange(function(value) {
		});
		folderCamera.add(properties, 'cameraLoopTime', 10, 1000).step(1).onChange(function(value) {
		});

		var folderTubeGeometry = this.gui.addFolder('Tube Geometry');
		folderTubeGeometry.add(properties, 'tubeVisible').onChange(function(value) {
			self.tube.visible = value;
		});
		folderTubeGeometry.add(properties, 'tubeWireframe').onChange(function(value) {
			self.tube.children[0].visible = !value;
			/*
				self.tube.children[0].material.wireframe = value;
				self.tube.children[1].visible = !value;
			*/
		});
		folderTubeGeometry.add(properties, 'tubeRadius', 0.1, 1).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderTubeGeometry.add(properties, 'tubeTubularSegments', 50, 1000).step(50).onChange(function(value) {
			self.createGeometry();
		});
		folderTubeGeometry.add(properties, 'tubeRadialSegments', 3, 12).step(1).onChange(function(value) {
			self.createGeometry();
		});

		var folderTubeMaterial = this.gui.addFolder('Tube Material');
		folderTubeMaterial.addColor(properties, 'tubeMaterialColor').onChange(function(value) {
			self.tube.children[0].material.color.setHex(rdo.helper.cssColorToHex(value));
		});
		folderTubeMaterial.addColor(properties, 'tubeWireframeColor').onChange(function(value) {
			self.tube.children[1].material.color.setHex(rdo.helper.cssColorToHex(value));
		});

		var folderCurveGeometry = this.gui.addFolder('Curve Geometry');
		folderCurveGeometry.add(properties, 'curveBinormalsVisible').onChange(function(value) {
			self.binormalLines.visible = value;
		});
		folderCurveGeometry.add(properties, 'curveNormalsVisible').onChange(function(value) {
			self.normalLines.visible = value;
		});
		folderCurveGeometry.add(properties, 'curveTangentsVisible').onChange(function(value) {
			self.tangentLines.visible = value;
		});
		folderCurveGeometry.add(properties, 'curveBinormalsLength', 0.1, 3).step(0.1).onChange(function(value) {
		});
		folderCurveGeometry.add(properties, 'curveNormalsLength', 0.1, 3).step(0.1).onChange(function(value) {
		});
		folderCurveGeometry.add(properties, 'curveTangentsLength', 0.1, 3).step(0.1).onChange(function(value) {
		});

		var folderCurveMaterial = this.gui.addFolder('Curve Material');
		folderCurveMaterial.addColor(properties, 'curveMaterialColor').onChange(function(value) {
			self.curve.material.color.setHex(rdo.helper.cssColorToHex(value));
		});
		folderCurveMaterial.addColor(properties, 'curveBinormalMaterialColor').onChange(function(value) {
			self.binormalLines.material.color.setHex(rdo.helper.cssColorToHex(value));
		});
		folderCurveMaterial.addColor(properties, 'curveNormalMaterialColor').onChange(function(value) {
			self.normalLines.material.color.setHex(rdo.helper.cssColorToHex(value));
		});
		folderCurveMaterial.addColor(properties, 'curveTangentMaterialColor').onChange(function(value) {
			self.tangentLines.material.color.setHex(rdo.helper.cssColorToHex(value));
		});
	};

	Main.prototype.render = function() {
		requestAnimationFrame(this.render.bind(this));


		var time = Date.now();
		var looptime = properties.cameraLoopTime * 1000;

		this.deltaTime = (time % looptime) / looptime;

		this.setCameraPositionByDeltaTime(this.deltaTime);

		this.renderer.render(this.scene, properties.cameraTracking ? this.cameraTracking : this.camera);
	};

	Main.prototype.getGameAreaHeight = function() { return this.canvas.offsetHeight; };
	Main.prototype.getGameAreaWidth = function() { return this.canvas.offsetWidth; };

	Main.prototype.getCameraAspect = function() { return this.getGameAreaWidth() / this.getGameAreaHeight(); };

	Main.prototype.onResizeHandler = function(event) {
		this.camera.aspect = this.getCameraAspect();
		this.camera.updateProjectionMatrix();

		this.cameraTracking.aspect = this.getCameraAspect();
		this.cameraTracking.updateProjectionMatrix();

		this.renderer.setSize(this.getGameAreaWidth(), this.getGameAreaHeight());
	};


	Main.prototype.setCameraPositionByDeltaTime = function(deltaTime) {
		rdo.helper.resetOutput();

		var segments = this.tubeGeometry.tangents.length;
		var pickt = deltaTime * segments;
		var pick = Math.floor( pickt );
		var pickNext = ( pick + 1 ) % segments;

		rdo.helper.addOutput('Segments                : ' + segments);
		rdo.helper.addOutput('Current segment by time : ' + rdo.helper.roundDecimal(pickt, 6));


		this.binormalLines.geometry.dispose();
		this.binormalLines.geometry = new THREE.Geometry();
		this.normalLines.geometry.dispose();
		this.normalLines.geometry = new THREE.Geometry();
		this.tangentLines.geometry.dispose();
		this.tangentLines.geometry = new THREE.Geometry();

		for (var i = 0; i < segments; ++i) {
			var t = 1 / segments * i;
			var p = this.tubeGeometry.parameters.path.getPointAt(t);

			this.binormalLines.geometry.vertices.push(p);
			this.binormalLines.geometry.vertices.push(p.clone().add(this.tubeGeometry.binormals[i].clone().multiplyScalar(properties.curveBinormalsLength)));
			this.normalLines.geometry.vertices.push(p);
			this.normalLines.geometry.vertices.push(p.clone().add(this.tubeGeometry.normals[i].clone().multiplyScalar(properties.curveNormalsLength)));
			this.tangentLines.geometry.vertices.push(p);
			this.tangentLines.geometry.vertices.push(p.clone().add(this.tubeGeometry.tangents[i].clone().multiplyScalar(properties.curveTangentsLength)));
		}


		this.binormal.subVectors(this.tubeGeometry.binormals[pickNext], this.tubeGeometry.binormals[pick]);

		this.binormal.multiplyScalar(pickt - pick);
		this.binormal.add(this.tubeGeometry.binormals[pick]);


		var dir = this.tubeGeometry.parameters.path.getTangentAt(deltaTime);
		var pos = this.tubeGeometry.parameters.path.getPointAt(deltaTime);

		// calculate position (includes offset)
		pos.add(this.binormal.clone().multiplyScalar(properties.cameraOffset));

		rdo.helper.addOutput('Camera position         : ' + rdo.helper.vectorToString(pos));

		// camera orientation - up orientation via binormal
		var lookAt = pos.clone().add(dir);

		rdo.helper.addOutput('Camera LookAt           : ' + rdo.helper.vectorToString(lookAt));

		this.cameraTracking.position.copy(pos);
		this.cameraTracking.matrix.lookAt(this.cameraTracking.position, lookAt, this.binormal);
		this.cameraTracking.rotation.setFromRotationMatrix(this.cameraTracking.matrix, this.cameraTracking.rotation.order);
	};



	var main = new Main(document.getElementById('webGlCanvas'));
	document.addEventListener('DOMContentLoaded', function() {
		main.init();
	});
}(window));
