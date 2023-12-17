import * as THREE from 'three';

import { GUI } from '../../../../../lib/threejs_158/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from '../../../../../lib/threejs_158/examples/jsm/controls/OrbitControls.js';

import HelperUtil from '../../../../../resources/js/helperUtil.js';
import Vector3 from '../../../../../resources/js/vector3.js';


document.addEventListener('DOMContentLoaded', () => {
	(() => new App(document.getElementById('webGlCanvas')))();
});


class App {
	constructor(canvas)	{
		this._canvas = canvas;

		this._axesHelper = null;
		this._gridHelper = null;
		this._line1 = null;
		this._line2 = null;
		this._rLine = null;
		this._rtLine = null;
		this._sLine = null;
		this._stLine = null;
		this._qLine = null;

		this._properties = {
			'axesHelperVisible': true,
			'gridHelperVisible': false,
			'line1v1X': 0.5,
			'line1v1Y': 2,
			'line1v2X': 10,
			'line1v2Y': 5,
			'line1Color': '#FFFFFF',
			'line2v1X': 3,
			'line2v1Y': 6,
			'line2v2X': 10,
			'line2v2Y': 4,
			'line2Color': '#FFFFFF'
		};

		this._scene = new THREE.Scene();

		this._camera = new THREE.PerspectiveCamera(70, this._getCameraAspect(), 0.1, 500);
		this._camera.position.set(0, 10, 20);

		this._renderer = new THREE.WebGLRenderer({antialias: true});
		this._renderer.setClearColor(0x000000, 1);
		this._renderer.setPixelRatio(window.devicePixelRatio);
		this._renderer.setSize(this._getCanvasWidth(), this._getCanvasHeight());

		this._controls = new OrbitControls(this._camera, this._renderer.domElement);

		// add renderer to the DOM-Tree
		this._canvas.appendChild(this._renderer.domElement);

		window.addEventListener('resize', this._onResizeHandler.bind(this), false);

		this._init();
	}

	_init() {
		this._createGui();
		this._createObject();

		this._render();
	}

	_createObject() {
		this._axesHelper = new THREE.AxesHelper(25);
		this._scene.add(this._axesHelper);

		this._gridHelper = new THREE.GridHelper(50, 50);
		this._gridHelper.visible = this._properties.gridHelperVisible;
		this._scene.add(this._gridHelper);

		this._line1 = new THREE.Line(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: this._properties.line1Color } )
		);
		this._scene.add(this._line1);

		this._line2 = new THREE.Line(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: this._properties.line2Color } )
		);
		this._scene.add(this._line2);

		this._qLine = new THREE.Line(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: 0xFFFF00 } )
		);
		this._scene.add(this._qLine);

		this._rLine = new THREE.Line(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: 0xFF0000 } )
		);
		this._scene.add(this._rLine);

		this._rtLine = new THREE.Line(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: 0xFF0000 } )
		);
		this._scene.add(this._rtLine);

		this._sLine = new THREE.Line(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: 0xFF0000 } )
		);
		this._scene.add(this._sLine);

		this._stLine = new THREE.Line(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: 0xFF0000 } )
		);
		this._scene.add(this._stLine);

		this._createGeometry();
	}

	_createGeometry() {
		const curve1 = new THREE.LineCurve(
			new THREE.Vector3(this._properties.line1v1X, this._properties.line1v1Y),
			new THREE.Vector3(this._properties.line1v2X, this._properties.line1v2Y)
		);

		this._line1.geometry.dispose();
		this._line1.geometry = new THREE.BufferGeometry().setFromPoints(curve1.getPoints(1));


		const curve2 = new THREE.LineCurve(
			new THREE.Vector3(this._properties.line2v1X, this._properties.line2v1Y),
			new THREE.Vector3(this._properties.line2v2X, this._properties.line2v2Y)
		);

		this._line2.geometry.dispose();
		this._line2.geometry = new THREE.BufferGeometry().setFromPoints(curve2.getPoints(1));


		HelperUtil.resetOutput();
		HelperUtil.addOutput('<b>Line 1 - Line 2</b>');

		this._calculateLineIntersection(
			new Vector3(this._properties.line1v1X, this._properties.line1v1Y, 0),
			new Vector3(this._properties.line1v2X, this._properties.line1v2Y, 0),
			new Vector3(this._properties.line2v1X, this._properties.line2v1Y, 0),
			new Vector3(this._properties.line2v2X, this._properties.line2v2Y, 0)
		);
		HelperUtil.addOutput('<hr>');
	}

	_createGui() {
		const gui = new GUI();

		gui.add(this._properties, 'axesHelperVisible').onChange((value) => {
			this._axesHelper.visible = value;
		});
		gui.add(this._properties, 'gridHelperVisible').onChange((value) => {
			this._gridHelper.visible = value;
		});

		const folderLine1 = gui.addFolder('Line 1');
		folderLine1.add(this._properties, 'line1v1X', -10, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderLine1.add(this._properties, 'line1v1Y', -10, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderLine1.add(this._properties, 'line1v2X', -10, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderLine1.add(this._properties, 'line1v2Y', -10, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderLine1.addColor(this._properties, 'line1Color').onChange((value) => {
			this._line1.material.color.set(value);
		});

		const folderLine2 = gui.addFolder('Line 2');
		folderLine2.add(this._properties, 'line2v1X', -10, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderLine2.add(this._properties, 'line2v1Y', -10, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderLine2.add(this._properties, 'line2v2X', -10, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderLine2.add(this._properties, 'line2v2Y', -10, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderLine2.addColor(this._properties, 'line2Color').onChange((value) => {
			this._line2.material.color.set(value);
		});

		gui.close();
	}

	_render() {
		requestAnimationFrame(this._render.bind(this));

		this._renderer.render(this._scene, this._camera);
	}

	_getCanvasHeight() { return this._canvas.offsetHeight; }
	_getCanvasWidth() { return this._canvas.offsetWidth; }

	_getCameraAspect() { return this._getCanvasWidth() / this._getCanvasHeight(); }

	_onResizeHandler(event) {
		this._camera.aspect = this._getCameraAspect();
		this._camera.updateProjectionMatrix();

		this._renderer.setSize(this._getCanvasWidth(), this._getCanvasHeight());
	}

	_calculateLineIntersection(line1p1, line1p2, line2p1, line2p2) {
		const pq = line2p1.sub(line1p1);

		HelperUtil.addOutput('P   : ' + line1p1.toString());
		HelperUtil.addOutput('Q   : ' + line2p1.toString());
		HelperUtil.addOutput('PQ  : ' + pq.toString());

		const r = line1p2.sub(line1p1).normalize();
		const s = line2p2.sub(line2p1).normalize();

		HelperUtil.addOutput('r   : ' + r.toString());
		HelperUtil.addOutput('s   : ' + s.toString());

		const rx = r.x;
		const ry = r.y;
		const rxt = -ry;
		const ryt = rx;


		const curve1 = new THREE.LineCurve(
			new THREE.Vector3(line1p1.x, line1p1.y),
			new THREE.Vector3(line1p1.x + rx, line1p1.y + ry)
		);
		this._rLine.geometry.dispose();
		this._rLine.geometry = new THREE.BufferGeometry().setFromPoints(curve1.getPoints(1));

		const curve2 = new THREE.LineCurve(
			new THREE.Vector3(line1p1.x, line1p1.y),
			new THREE.Vector3(line1p1.x + rxt, line1p1.y + ryt)
		);
		this._rtLine.geometry.dispose();
		this._rtLine.geometry = new THREE.BufferGeometry().setFromPoints(curve2.getPoints(1));

		HelperUtil.addOutput('rx  : ' + rx);
		HelperUtil.addOutput('ry  : ' + ry);
		HelperUtil.addOutput('rxt : ' + rxt);
		HelperUtil.addOutput('ryt : ' + ryt);


		const qx = pq.x * rx + pq.y * ry;
		const qy = pq.x * rxt + pq.y * ryt;

		this._qLine.geometry.dispose();
		this._qLine.geometry = new THREE.BufferGeometry().setFromPoints([
			new THREE.Vector3(line1p1.x, line1p1.y, 0),
			new THREE.Vector3(line1p1.x + qx * rx, line1p1.y + qx * ry, 0),
			new THREE.Vector3(line1p1.x + qx * rx + qy * rxt, line1p1.y + qx * ry + qy * ryt, 0),
			new THREE.Vector3(line1p1.x + qy * rxt, line1p1.y + qy * ryt, 0),
			new THREE.Vector3(line1p1.x, line1p1.y, 0)
		]);

		HelperUtil.addOutput('qx  : ' + qx);
		HelperUtil.addOutput('qy  : ' + qy);


		const sx = s.x * rx + s.y * ry;
		const sy = s.x * rxt + s.y * ryt;
		const sxt = -sy;
		const syt = sx;

		const curve3 = new THREE.LineCurve(
			new THREE.Vector3(line2p1.x, line2p1.y),
			new THREE.Vector3(line2p1.x + sx, line2p1.y + sy)
		);
		this._sLine.geometry.dispose();
		this._sLine.geometry = new THREE.BufferGeometry().setFromPoints(curve3.getPoints(1));

		const curve4 = new THREE.LineCurve(
			new THREE.Vector3(line2p1.x, line2p1.y),
			new THREE.Vector3(line2p1.x + sxt, line2p1.y + syt)
		);
		this._stLine.geometry.dispose();
		this._stLine.geometry = new THREE.BufferGeometry().setFromPoints(curve4.getPoints(1));

		HelperUtil.addOutput('sx  : ' + sx);
		HelperUtil.addOutput('sy  : ' + sy);

		if (sy == 0)
		{
			return [];
		}

		const a = qx - qy * sx / sy;

		HelperUtil.addOutput('a   : ' + a);

		const resultX = HelperUtil.roundDecimal(line1p1.x + a * rx, 2);
		const resultY = HelperUtil.roundDecimal(line1p1.y + a * ry, 2);

		HelperUtil.addOutput('resultX: ' + resultX);
		HelperUtil.addOutput('resultY: ' + resultY);

		return [resultX, resultY];
	}
}
