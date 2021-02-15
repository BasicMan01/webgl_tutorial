// jshint esversion: 6
/* globals rdo */

import * as THREE from '../../../../../lib/threejs_125/build/three.module.js';
import { GUI } from '../../../../../lib/threejs_125/examples/jsm/libs/dat.gui.module.js';

import { OrbitControls } from '../../../../../lib/threejs_125/examples/jsm/controls/OrbitControls.js';


(function(window) {
	let config = {
		'CAMERA_FOV': 70,
		'CAMERA_NEAR_PLANE': 0.1,
		'CAMERA_FAR_PLANE': 500
	};

	let properties = {
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


	let onProgress = function(xhr) {
		if(xhr.lengthComputable) {
			let percentComplete = xhr.loaded / xhr.total * 100;

			console.log(Math.round(percentComplete, 2) + '% downloaded');
		}
	};

	let onError = function(xhr) {
		console.error(xhr);
	};



	let Main = function(canvas)	{
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
		this.renderer.setSize(this.getCanvasWidth(), this.getCanvasHeight());

		this.controls = new OrbitControls(this.camera, this.renderer.domElement);

		this.gui = new GUI({ width: 400 });
		this.gui.close();

		// add renderer to the DOM-Tree
		this.canvas.appendChild(this.renderer.domElement);

		window.addEventListener('resize', this.onResizeHandler.bind(this), false);

		this.createGui();
		this.createObject();
	};

	Main.prototype.createObject = function() {
		let self = this;

		this.axesHelper = new THREE.AxesHelper(25);
		this.scene.add(this.axesHelper);

		this.gridHelper = new THREE.GridHelper(50, 50);
		this.scene.add(this.gridHelper);

		this.tube = new THREE.Object3D();
		this.curve = new THREE.Line(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color : properties.curveMaterialColor } )
		);

		this.scene.add(this.curve);
		this.scene.add(this.tube);

		this.tube.add(new THREE.Mesh(
			new THREE.BufferGeometry(),
			new THREE.MeshBasicMaterial( { color: properties.tubeMaterialColor, side: THREE.DoubleSide } )
		));

		this.tube.add(new THREE.LineSegments(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: properties.tubeWireframeColor } )
		));

		this.binormalLines = new THREE.LineSegments(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: properties.curveBinormalMaterialColor } )
		);
		this.scene.add(this.binormalLines);

		this.normalLines = new THREE.LineSegments(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: properties.curveNormalMaterialColor } )
		);
		this.scene.add(this.normalLines);

		this.tangentLines = new THREE.LineSegments(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: properties.curveTangentMaterialColor } )
		);
		this.scene.add(this.tangentLines);


		let loadingManager = new THREE.LoadingManager();

		loadingManager.onProgress = function(item, loaded, total) {
			console.log(item, '(' + loaded + '/' + total + ')');
		};


		let fileLoader = new THREE.FileLoader(loadingManager);

		fileLoader.load('../../../../resources/mesh/catmullRom/catmullRom.json', function(json) {
			try {
				let pathPointsCollection = [];
				let pathPointsJson = JSON.parse(json).data;

				for (let i = 0; i < pathPointsJson.length; ++i) {
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
		this.curve.geometry = new THREE.BufferGeometry().setFromPoints(this.curveGeometry.points);

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
		let self = this;

		this.gui.add(properties, 'axesHelperVisible').onChange(function(value) {
			self.axesHelper.visible = value;
		});
		this.gui.add(properties, 'gridHelperVisible').onChange(function(value) {
			self.gridHelper.visible = value;
		});

		let folderCamera = this.gui.addFolder('Camera Properties');
		folderCamera.add(properties, 'cameraTracking').onChange(function(value) {
		});
		folderCamera.add(properties, 'cameraOffset', 0, 2).step(0.01).onChange(function(value) {
		});
		folderCamera.add(properties, 'cameraLoopTime', 10, 1000).step(1).onChange(function(value) {
		});

		let folderTubeGeometry = this.gui.addFolder('Tube Geometry');
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

		let folderTubeMaterial = this.gui.addFolder('Tube Material');
		folderTubeMaterial.addColor(properties, 'tubeMaterialColor').onChange(function(value) {
			self.tube.children[0].material.color.set(value);
		});
		folderTubeMaterial.addColor(properties, 'tubeWireframeColor').onChange(function(value) {
			self.tube.children[1].material.color.set(value);
		});

		let folderCurveGeometry = this.gui.addFolder('Curve Geometry');
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

		let folderCurveMaterial = this.gui.addFolder('Curve Material');
		folderCurveMaterial.addColor(properties, 'curveMaterialColor').onChange(function(value) {
			self.curve.material.color.set(value);
		});
		folderCurveMaterial.addColor(properties, 'curveBinormalMaterialColor').onChange(function(value) {
			self.binormalLines.material.color.set(value);
		});
		folderCurveMaterial.addColor(properties, 'curveNormalMaterialColor').onChange(function(value) {
			self.normalLines.material.color.set(value);
		});
		folderCurveMaterial.addColor(properties, 'curveTangentMaterialColor').onChange(function(value) {
			self.tangentLines.material.color.set(value);
		});
	};

	Main.prototype.render = function() {
		requestAnimationFrame(this.render.bind(this));


		let time = Date.now();
		let looptime = properties.cameraLoopTime * 1000;

		this.deltaTime = (time % looptime) / looptime;

		this.setCameraPositionByDeltaTime(this.deltaTime);

		this.renderer.render(this.scene, properties.cameraTracking ? this.cameraTracking : this.camera);
	};

	Main.prototype.getCanvasHeight = function() { return this.canvas.offsetHeight; };
	Main.prototype.getCanvasWidth = function() { return this.canvas.offsetWidth; };

	Main.prototype.getCameraAspect = function() { return this.getCanvasWidth() / this.getCanvasHeight(); };

	Main.prototype.onResizeHandler = function(event) {
		this.camera.aspect = this.getCameraAspect();
		this.camera.updateProjectionMatrix();

		this.cameraTracking.aspect = this.getCameraAspect();
		this.cameraTracking.updateProjectionMatrix();

		this.renderer.setSize(this.getCanvasWidth(), this.getCanvasHeight());
	};


	Main.prototype.setCameraPositionByDeltaTime = function(deltaTime) {
		rdo.helper.resetOutput();

		let segments = this.tubeGeometry.tangents.length;
		let pickt = deltaTime * segments;
		let pick = Math.floor( pickt );
		let pickNext = ( pick + 1 ) % segments;

		rdo.helper.addOutput('Segments                : ' + segments);
		rdo.helper.addOutput('Current segment by time : ' + rdo.helper.roundDecimal(pickt, 6));

		let binormalPositions = [];
		let normalPositions = [];
		let tangentPositions = [];

		this.binormalLines.geometry.dispose();
		this.binormalLines.geometry = new THREE.BufferGeometry();
		this.normalLines.geometry.dispose();
		this.normalLines.geometry = new THREE.BufferGeometry();
		this.tangentLines.geometry.dispose();
		this.tangentLines.geometry = new THREE.BufferGeometry();

		for (let i = 0; i < segments; ++i) {
			let t = 1 / segments * i;
			let pointStart = this.tubeGeometry.parameters.path.getPointAt(t);
			let pointEnd = null;

			pointEnd = pointStart.clone().add(this.tubeGeometry.binormals[i].clone().multiplyScalar(properties.curveBinormalsLength));
			binormalPositions.push(pointStart.x, pointStart.y, pointStart.z);
			binormalPositions.push(pointEnd.x, pointEnd.y, pointEnd.z);

			pointEnd = pointStart.clone().add(this.tubeGeometry.normals[i].clone().multiplyScalar(properties.curveNormalsLength));
			normalPositions.push(pointStart.x, pointStart.y, pointStart.z);
			normalPositions.push(pointEnd.x, pointEnd.y, pointEnd.z);

			pointEnd = pointStart.clone().add(this.tubeGeometry.tangents[i].clone().multiplyScalar(properties.curveTangentsLength));
			tangentPositions.push(pointStart.x, pointStart.y, pointStart.z);
			tangentPositions.push(pointEnd.x, pointEnd.y, pointEnd.z);
		}

		this.binormalLines.geometry.setAttribute('position', new THREE.Float32BufferAttribute(binormalPositions, 3));
		this.normalLines.geometry.setAttribute('position', new THREE.Float32BufferAttribute(normalPositions, 3));
		this.tangentLines.geometry.setAttribute('position', new THREE.Float32BufferAttribute(tangentPositions, 3));


		this.binormal.subVectors(this.tubeGeometry.binormals[pickNext], this.tubeGeometry.binormals[pick]);
		this.binormal.multiplyScalar(pickt - pick);
		this.binormal.add(this.tubeGeometry.binormals[pick]);


		let dir = this.tubeGeometry.parameters.path.getTangentAt(deltaTime);
		let pos = this.tubeGeometry.parameters.path.getPointAt(deltaTime);

		// calculate position (includes offset)
		pos.add(this.binormal.clone().multiplyScalar(properties.cameraOffset));

		rdo.helper.addOutput('Camera position         : ' + rdo.helper.vectorToString(pos));

		// camera orientation - up orientation via binormal
		let lookAt = pos.clone().add(dir);

		rdo.helper.addOutput('Camera LookAt           : ' + rdo.helper.vectorToString(lookAt));

		this.cameraTracking.position.copy(pos);
		this.cameraTracking.matrix.lookAt(this.cameraTracking.position, lookAt, this.binormal);
		this.cameraTracking.rotation.setFromRotationMatrix(this.cameraTracking.matrix, this.cameraTracking.rotation.order);
	};



	let main = new Main(document.getElementById('webGlCanvas'));
	document.addEventListener('DOMContentLoaded', function() {
		main.init();
	});
}(window));
