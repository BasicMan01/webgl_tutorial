import * as THREE from 'three';

import { GUI } from '../../../../../lib/threejs_140/examples/jsm/libs/lil-gui.module.min.js';
import { VRButton } from '../../../../../lib/threejs_140/examples/jsm/webxr/VRButton.js';

import HelperUtil from '../../../../../resources/js/helperUtil.js';


document.addEventListener('DOMContentLoaded', () => {
	(() => new App(document.getElementById('webGlCanvas')))();
});


class App {
	constructor(canvas)	{
		this._canvas = canvas;

		this._axesHelper = null;
		this._gridHelper = null;
		this._curve = null;
		this._curveGeometry = null;
		this._tube = null;
		this._tubeGeometry = null;
		this._binormalLines = null;
		this._normalLines = null;
		this._tangentLines = null;
		this._binormal = new THREE.Vector3();

		this._properties = {
			'axesHelperVisible': true,
			'gridHelperVisible': true,
			'tubeVisible': true,
			'cameraOffset': 0,
			'cameraLoopTime': 50,
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
			'tubeRadius': 1,
			'tubeTubularSegments': 300,
			'tubeRadialSegments': 10,
			'tubeMaterialColor': '#156289',
			'tubeWireframeColor': '#FFFFFF',
			'tubeWireframe': false
		};

		this._scene = new THREE.Scene();

		this._camera = new THREE.PerspectiveCamera(40, this._getCameraAspect(), 0.1, 500);

		this._cameraGroup = new THREE.Group();
		this._cameraGroup.add(this._camera);

		this._scene.add(this._cameraGroup);

		this._renderer = new THREE.WebGLRenderer({antialias: true});
		this._renderer.setClearColor(0x000000, 1);
		this._renderer.setPixelRatio(window.devicePixelRatio);
		this._renderer.setSize(this._getCanvasWidth(), this._getCanvasHeight());
		this._renderer.xr.enabled = true;
		this._renderer.xr.setReferenceSpaceType('local');

		// add renderer to the DOM-Tree
		this._canvas.appendChild(this._renderer.domElement);
		this._canvas.appendChild(VRButton.createButton(this._renderer));

		window.addEventListener('resize', this._onResizeHandler.bind(this), false);

		this._init();
	}

	_init() {
		this._createGui();
		this._createObject();
	}

	_createObject() {
		const fileLoader = new THREE.FileLoader();

		this._axesHelper = new THREE.AxesHelper(25);
		this._scene.add(this._axesHelper);

		this._gridHelper = new THREE.GridHelper(50, 50);
		this._scene.add(this._gridHelper);

		this._tube = new THREE.Object3D();
		this._curve = new THREE.Line(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color : this._properties.curveMaterialColor } )
		);

		this._scene.add(this._curve);
		this._scene.add(this._tube);

		this._tube.add(new THREE.Mesh(
			new THREE.BufferGeometry(),
			new THREE.MeshBasicMaterial( { color: this._properties.tubeMaterialColor, side: THREE.DoubleSide } )
		));

		this._tube.add(new THREE.LineSegments(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: this._properties.tubeWireframeColor } )
		));

		this._binormalLines = new THREE.LineSegments(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: this._properties.curveBinormalMaterialColor } )
		);
		this._scene.add(this._binormalLines);

		this._normalLines = new THREE.LineSegments(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: this._properties.curveNormalMaterialColor } )
		);
		this._scene.add(this._normalLines);

		this._tangentLines = new THREE.LineSegments(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: this._properties.curveTangentMaterialColor } )
		);
		this._scene.add(this._tangentLines);

		fileLoader.load('../../../../resources/mesh/catmullRom/catmullRom.json', (json) => {
			try {
				const pathPointsCollection = [];
				const pathPointsJson = JSON.parse(json).data;

				for (let i = 0; i < pathPointsJson.length; ++i) {
					pathPointsCollection.push(new THREE.Vector3(pathPointsJson[i].x, pathPointsJson[i].y, pathPointsJson[i].z));
				}

				this._curveGeometry = new THREE.CatmullRomCurve3(pathPointsCollection, true);

				this._createGeometry();

				// For WebVR-Projects use this here
				this._renderer.setAnimationLoop(this._render.bind(this));
			} catch(e) {
				console.error(e);
			}
		}, this._onProgress, this._onError);
	}

	_createGeometry() {
		this._curve.geometry.dispose();
		this._curve.geometry = new THREE.BufferGeometry().setFromPoints(this._curveGeometry.points);

		this._tubeGeometry = new THREE.TubeBufferGeometry(
			this._curveGeometry,
			this._properties.tubeTubularSegments,
			this._properties.tubeRadius,
			this._properties.tubeRadialSegments,
			true
		);

		this._tube.children[0].geometry.dispose();
		this._tube.children[0].geometry = this._tubeGeometry;

		this._tube.children[1].geometry.dispose();
		this._tube.children[1].geometry = new THREE.WireframeGeometry(this._tubeGeometry);
	}

	_createGui() {
		const gui = new GUI();

		gui.add(this._properties, 'axesHelperVisible').onChange((value) => {
			this._axesHelper.visible = value;
		});
		gui.add(this._properties, 'gridHelperVisible').onChange((value) => {
			this._gridHelper.visible = value;
		});

		const folderCamera = gui.addFolder('Camera this._properties');
		folderCamera.add(this._properties, 'cameraOffset', 0, 2).step(0.01).onChange((value) => {
		});
		folderCamera.add(this._properties, 'cameraLoopTime', 10, 1000).step(1).onChange((value) => {
		});

		const folderTubeGeometry = gui.addFolder('Tube Geometry');
		folderTubeGeometry.add(this._properties, 'tubeVisible').onChange((value) => {
			this._tube.visible = value;
		});
		folderTubeGeometry.add(this._properties, 'tubeWireframe').onChange((value) => {
			this._tube.children[0].visible = !value;
			/*
				this._tube.children[0].material.wireframe = value;
				this._tube.children[1].visible = !value;
			*/
		});
		folderTubeGeometry.add(this._properties, 'tubeRadius', 0.1, 1).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderTubeGeometry.add(this._properties, 'tubeTubularSegments', 50, 1000).step(50).onChange((value) => {
			this._createGeometry();
		});
		folderTubeGeometry.add(this._properties, 'tubeRadialSegments', 3, 12).step(1).onChange((value) => {
			this._createGeometry();
		});

		const folderTubeMaterial = gui.addFolder('Tube Material');
		folderTubeMaterial.addColor(this._properties, 'tubeMaterialColor').onChange((value) => {
			this._tube.children[0].material.color.set(value);
		});
		folderTubeMaterial.addColor(this._properties, 'tubeWireframeColor').onChange((value) => {
			this._tube.children[1].material.color.set(value);
		});

		const folderCurveGeometry = gui.addFolder('Curve Geometry');
		folderCurveGeometry.add(this._properties, 'curveBinormalsVisible').onChange((value) => {
			this._binormalLines.visible = value;
		});
		folderCurveGeometry.add(this._properties, 'curveNormalsVisible').onChange((value) => {
			this._normalLines.visible = value;
		});
		folderCurveGeometry.add(this._properties, 'curveTangentsVisible').onChange((value) => {
			this._tangentLines.visible = value;
		});
		folderCurveGeometry.add(this._properties, 'curveBinormalsLength', 0.1, 3).step(0.1).onChange((value) => {
		});
		folderCurveGeometry.add(this._properties, 'curveNormalsLength', 0.1, 3).step(0.1).onChange((value) => {
		});
		folderCurveGeometry.add(this._properties, 'curveTangentsLength', 0.1, 3).step(0.1).onChange((value) => {
		});

		const folderCurveMaterial = gui.addFolder('Curve Material');
		folderCurveMaterial.addColor(this._properties, 'curveMaterialColor').onChange((value) => {
			this._curve.material.color.set(value);
		});
		folderCurveMaterial.addColor(this._properties, 'curveBinormalMaterialColor').onChange((value) => {
			this._binormalLines.material.color.set(value);
		});
		folderCurveMaterial.addColor(this._properties, 'curveNormalMaterialColor').onChange((value) => {
			this._normalLines.material.color.set(value);
		});
		folderCurveMaterial.addColor(this._properties, 'curveTangentMaterialColor').onChange((value) => {
			this._tangentLines.material.color.set(value);
		});

		gui.close();
	}

	_render() {
		const time = Date.now();
		const looptime = this._properties.cameraLoopTime * 1000;

		this.deltaTime = (time % looptime) / looptime;

		this._setCameraPositionByDeltaTime(this.deltaTime);

		this._renderer.render(this._scene, this._camera);
	}

	_getCanvasHeight() { return this._canvas.offsetHeight; }
	_getCanvasWidth() { return this._canvas.offsetWidth; }

	_getCameraAspect() { return this._getCanvasWidth() / this._getCanvasHeight(); }

	_onError(xhr) {
		console.error(xhr);
	}

	_onProgress(xhr) {
		if (xhr.lengthComputable) {
			const percentComplete = xhr.loaded / xhr.total * 100;

			console.log(Math.round(percentComplete, 2) + '% downloaded');
		}
	}

	_onResizeHandler(event) {
		this._camera.aspect = this._getCameraAspect();
		this._camera.updateProjectionMatrix();

		this._renderer.setSize(this._getCanvasWidth(), this._getCanvasHeight());
	}

	_setCameraPositionByDeltaTime(deltaTime) {
		HelperUtil.resetOutput();

		const segments = this._tubeGeometry.tangents.length;
		const pickt = deltaTime * segments;
		const pick = Math.floor( pickt );
		const pickNext = ( pick + 1 ) % segments;

		HelperUtil.addOutput('Segments                : ' + segments);
		HelperUtil.addOutput('Current segment by time : ' + HelperUtil.roundDecimal(pickt, 6));

		const binormalPositions = [];
		const normalPositions = [];
		const tangentPositions = [];

		this._binormalLines.geometry.dispose();
		this._binormalLines.geometry = new THREE.BufferGeometry();
		this._normalLines.geometry.dispose();
		this._normalLines.geometry = new THREE.BufferGeometry();
		this._tangentLines.geometry.dispose();
		this._tangentLines.geometry = new THREE.BufferGeometry();

		for (let i = 0; i < segments; ++i) {
			const t = 1 / segments * i;
			const pointStart = this._tubeGeometry.parameters.path.getPointAt(t);

			let pointEnd = null;

			pointEnd = pointStart.clone().add(this._tubeGeometry.binormals[i].clone().multiplyScalar(this._properties.curveBinormalsLength));
			binormalPositions.push(pointStart.x, pointStart.y, pointStart.z);
			binormalPositions.push(pointEnd.x, pointEnd.y, pointEnd.z);

			pointEnd = pointStart.clone().add(this._tubeGeometry.normals[i].clone().multiplyScalar(this._properties.curveNormalsLength));
			normalPositions.push(pointStart.x, pointStart.y, pointStart.z);
			normalPositions.push(pointEnd.x, pointEnd.y, pointEnd.z);

			pointEnd = pointStart.clone().add(this._tubeGeometry.tangents[i].clone().multiplyScalar(this._properties.curveTangentsLength));
			tangentPositions.push(pointStart.x, pointStart.y, pointStart.z);
			tangentPositions.push(pointEnd.x, pointEnd.y, pointEnd.z);
		}

		this._binormalLines.geometry.setAttribute('position', new THREE.Float32BufferAttribute(binormalPositions, 3));
		this._normalLines.geometry.setAttribute('position', new THREE.Float32BufferAttribute(normalPositions, 3));
		this._tangentLines.geometry.setAttribute('position', new THREE.Float32BufferAttribute(tangentPositions, 3));


		this._binormal.subVectors(this._tubeGeometry.binormals[pickNext], this._tubeGeometry.binormals[pick]);
		this._binormal.multiplyScalar(pickt - pick);
		this._binormal.add(this._tubeGeometry.binormals[pick]);

		const dir = this._tubeGeometry.parameters.path.getTangentAt(deltaTime);
		const pos = this._tubeGeometry.parameters.path.getPointAt(deltaTime);

		// calculate position (includes offset)
		pos.add(this._binormal.clone().multiplyScalar(this._properties.cameraOffset));

		HelperUtil.addOutput('Camera position         : ' + HelperUtil.vectorToString(pos));

		// camera orientation - up orientation via binormal
		const lookAt = pos.clone().add(dir);

		HelperUtil.addOutput('Camera LookAt           : ' + HelperUtil.vectorToString(lookAt));

		this._cameraGroup.position.copy(pos);
		this._camera.matrix.lookAt(this._cameraGroup.position, lookAt, this._binormal);
		this._cameraGroup.rotation.setFromRotationMatrix(this._camera.matrix, this._camera.rotation.order);
	}
}
