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



	let Main = function(canvas)	{
		this.canvas = canvas;

		this.camera = null;
		this.controls = null;
		this.gui = null;
		this.renderer = null;
		this.scene = null;

		this.axesHelper = null;
		this.gridHelper = null;

		this.line1 = null;
		this.line2 = null;
		this.rLine = null;
		this.rtLine = null;
		this.sLine = null;
		this.stLine = null;
		this.qLine = null;
	};

	Main.prototype.init = function() {
		this.scene = new THREE.Scene();

		this.camera = new THREE.PerspectiveCamera(config.CAMERA_FOV, this.getCameraAspect(), config.CAMERA_NEAR_PLANE, config.CAMERA_FAR_PLANE);
		this.camera.position.set(0, 10, 20);

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

		this.render();
	};

	Main.prototype.createObject = function() {
		this.axesHelper = new THREE.AxesHelper(25);
		this.scene.add(this.axesHelper);

		this.gridHelper = new THREE.GridHelper(50, 50);
		this.gridHelper.visible = properties.gridHelperVisible;
		this.scene.add(this.gridHelper);

		this.line1 = new THREE.Line(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: properties.line1Color } )
		);
		this.scene.add(this.line1);

		this.line2 = new THREE.Line(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: properties.line2Color } )
		);
		this.scene.add(this.line2);

		this.qLine = new THREE.Line(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: 0xFFFF00 } )
		);
		this.scene.add(this.qLine);

		this.rLine = new THREE.Line(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: 0xFF0000 } )
		);
		this.scene.add(this.rLine);

		this.rtLine = new THREE.Line(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: 0xFF0000 } )
		);
		this.scene.add(this.rtLine);

		this.sLine = new THREE.Line(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: 0xFF0000 } )
		);
		this.scene.add(this.sLine);

		this.stLine = new THREE.Line(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: 0xFF0000 } )
		);
		this.scene.add(this.stLine);

		this.createGeometry();
	};

	Main.prototype.createGeometry = function() {
		let curve1 = new THREE.LineCurve(
			new THREE.Vector3(properties.line1v1X, properties.line1v1Y),
			new THREE.Vector3(properties.line1v2X, properties.line1v2Y)
		);

		this.line1.geometry.dispose();
		this.line1.geometry = new THREE.BufferGeometry().setFromPoints(curve1.getPoints(1));


		let curve2 = new THREE.LineCurve(
			new THREE.Vector3(properties.line2v1X, properties.line2v1Y),
			new THREE.Vector3(properties.line2v2X, properties.line2v2Y)
		);

		this.line2.geometry.dispose();
		this.line2.geometry = new THREE.BufferGeometry().setFromPoints(curve2.getPoints(1));


		rdo.helper.resetOutput();
		rdo.helper.addOutput('<b>Line 1 - Line 2</b>');

		this.calculateLineIntersection(
			new rdo.Vector3(properties.line1v1X, properties.line1v1Y, 0),
			new rdo.Vector3(properties.line1v2X, properties.line1v2Y, 0),
			new rdo.Vector3(properties.line2v1X, properties.line2v1Y, 0),
			new rdo.Vector3(properties.line2v2X, properties.line2v2Y, 0)
		);
		rdo.helper.addOutput('<hr>');
	};

	Main.prototype.createGui = function() {
		let self = this;

		this.gui.add(properties, 'axesHelperVisible').onChange(function(value) {
			self.axesHelper.visible = value;
		});
		this.gui.add(properties, 'gridHelperVisible').onChange(function(value) {
			self.gridHelper.visible = value;
		});

		let folderLine1 = this.gui.addFolder('Line 1');
		folderLine1.add(properties, 'line1v1X', -10, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderLine1.add(properties, 'line1v1Y', -10, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderLine1.add(properties, 'line1v2X', -10, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderLine1.add(properties, 'line1v2Y', -10, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderLine1.addColor(properties, 'line1Color').onChange(function(value) {
			self.line1.material.color.set(value);
		});

		let folderLine2 = this.gui.addFolder('Line 2');
		folderLine2.add(properties, 'line2v1X', -10, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderLine2.add(properties, 'line2v1Y', -10, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderLine2.add(properties, 'line2v2X', -10, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderLine2.add(properties, 'line2v2Y', -10, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderLine2.addColor(properties, 'line2Color').onChange(function(value) {
			self.line2.material.color.set(value);
		});
	};

	Main.prototype.render = function() {
		requestAnimationFrame(this.render.bind(this));

		this.renderer.render(this.scene, this.camera);
	};

	Main.prototype.getCanvasHeight = function() { return this.canvas.offsetHeight; };
	Main.prototype.getCanvasWidth = function() { return this.canvas.offsetWidth; };

	Main.prototype.getCameraAspect = function() { return this.getCanvasWidth() / this.getCanvasHeight(); };

	Main.prototype.onResizeHandler = function(event) {
		this.camera.aspect = this.getCameraAspect();
		this.camera.updateProjectionMatrix();

		this.renderer.setSize(this.getCanvasWidth(), this.getCanvasHeight());
	};

	Main.prototype.calculateLineIntersection = function(line1p1, line1p2, line2p1, line2p2)
	{
		let pq = line2p1.sub(line1p1);

		rdo.helper.addOutput('P   : ' + line1p1.toString());
		rdo.helper.addOutput('Q   : ' + line2p1.toString());
		rdo.helper.addOutput('PQ  : ' + pq.toString());

		let r = line1p2.sub(line1p1).normalize();
		let s = line2p2.sub(line2p1).normalize();

		rdo.helper.addOutput('r   : ' + r.toString());
		rdo.helper.addOutput('s   : ' + s.toString());

		let rx = r.x;
		let ry = r.y;
		let rxt = -ry;
		let ryt = rx;


		let curve1 = new THREE.LineCurve(
			new THREE.Vector3(line1p1.x, line1p1.y),
			new THREE.Vector3(line1p1.x + rx, line1p1.y + ry)
		);
		this.rLine.geometry.dispose();
		this.rLine.geometry = new THREE.BufferGeometry().setFromPoints(curve1.getPoints(1));

		let curve2 = new THREE.LineCurve(
			new THREE.Vector3(line1p1.x, line1p1.y),
			new THREE.Vector3(line1p1.x + rxt, line1p1.y + ryt)
		);
		this.rtLine.geometry.dispose();
		this.rtLine.geometry = new THREE.BufferGeometry().setFromPoints(curve2.getPoints(1));

		rdo.helper.addOutput('rx  : ' + rx);
		rdo.helper.addOutput('ry  : ' + ry);
		rdo.helper.addOutput('rxt : ' + rxt);
		rdo.helper.addOutput('ryt : ' + ryt);


		let qx = pq.x * rx + pq.y * ry;
		let qy = pq.x * rxt + pq.y * ryt;

		this.qLine.geometry.dispose();
		this.qLine.geometry = new THREE.BufferGeometry().setFromPoints([
			new THREE.Vector3(line1p1.x, line1p1.y, 0),
			new THREE.Vector3(line1p1.x + qx * rx, line1p1.y + qx * ry, 0),
			new THREE.Vector3(line1p1.x + qx * rx + qy * rxt, line1p1.y + qx * ry + qy * ryt, 0),
			new THREE.Vector3(line1p1.x + qy * rxt, line1p1.y + qy * ryt, 0),
			new THREE.Vector3(line1p1.x, line1p1.y, 0)
		]);

		rdo.helper.addOutput('qx  : ' + qx);
		rdo.helper.addOutput('qy  : ' + qy);


		let sx = s.x * rx + s.y * ry;
		let sy = s.x * rxt + s.y * ryt;
		let sxt = -sy;
		let syt = sx;

		let curve3 = new THREE.LineCurve(
			new THREE.Vector3(line2p1.x, line2p1.y),
			new THREE.Vector3(line2p1.x + sx, line2p1.y + sy)
		);
		this.sLine.geometry.dispose();
		this.sLine.geometry = new THREE.BufferGeometry().setFromPoints(curve3.getPoints(1));

		let curve4 = new THREE.LineCurve(
			new THREE.Vector3(line2p1.x, line2p1.y),
			new THREE.Vector3(line2p1.x + sxt, line2p1.y + syt)
		);
		this.stLine.geometry.dispose();
		this.stLine.geometry = new THREE.BufferGeometry().setFromPoints(curve4.getPoints(1));

		rdo.helper.addOutput('sx  : ' + sx);
		rdo.helper.addOutput('sy  : ' + sy);

		if(sy == 0)
		{
			return [];
		}

		let a = qx - qy * sx / sy;

		rdo.helper.addOutput('a   : ' + a);

		let resultX = rdo.helper.roundDecimal(line1p1.x + a * rx, 2);
		let resultY = rdo.helper.roundDecimal(line1p1.y + a * ry, 2);

		rdo.helper.addOutput('resultX: ' + resultX);
		rdo.helper.addOutput('resultY: ' + resultY);

		return [resultX, resultY];
	};



	let main = new Main(document.getElementById('webGlCanvas'));
	document.addEventListener('DOMContentLoaded', function() {
		main.init();
	});
}(window));