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
		'circle1CenterX': 4.5,
		'circle1CenterY': 6,
		'circle1Radius': 5,
		'circle1Color': '#FFFFFF',
		'circle2CenterX': 5.5,
		'circle2CenterY': -1,
		'circle2Radius': 5,
		'circle2Color': '#FFFFFF',
		'circle3CenterX': -3.5,
		'circle3CenterY': 2,
		'circle3Radius': 5,
		'circle3Color': '#FFFFFF',
		'circlePoints': 50,
		'circleTolerance': 0
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

		this.circle1 = null;
		this.circle2 = null;
		this.circle3 = null;
		this.lineCenterToCenter = null;
		this.lineIntersectToIntersect = [];
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

		this.circle1 = new THREE.Line(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: properties.circle1Color } )
		);
		this.scene.add(this.circle1);

		this.circle2 = new THREE.Line(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: properties.circle2Color } )
		);
		this.scene.add(this.circle2);

		this.circle3 = new THREE.Line(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: properties.circle3Color } )
		);
		this.scene.add(this.circle3);

		this.lineCenterToCenter = new THREE.Line(
			new THREE.BufferGeometry(),
			new THREE.LineBasicMaterial( { color: 0x00FFFF } )
		);
		this.scene.add(this.lineCenterToCenter);

		for(let i = 0; i < 3; ++i) {
			this.lineIntersectToIntersect[i] = new THREE.Line(
				new THREE.BufferGeometry(),
				new THREE.LineBasicMaterial( { color: 0xFFFF00 } )
			);

			this.scene.add(this.lineIntersectToIntersect[i]);
		}

		this.createGeometry();
	};

	Main.prototype.createGeometry = function() {
		let intersectionPoints = [];

		this.createCircle(this.circle1, properties.circle1CenterX, properties.circle1CenterY, properties.circle1Radius);
		this.createCircle(this.circle2, properties.circle2CenterX, properties.circle2CenterY, properties.circle2Radius);
		this.createCircle(this.circle3, properties.circle3CenterX, properties.circle3CenterY, properties.circle3Radius);


		this.lineCenterToCenter.geometry.dispose();
		this.lineCenterToCenter.geometry = new THREE.BufferGeometry().setFromPoints([
			new THREE.Vector3(properties.circle1CenterX, properties.circle1CenterY, 0),
			new THREE.Vector3(properties.circle2CenterX, properties.circle2CenterY, 0),
			new THREE.Vector3(properties.circle3CenterX, properties.circle3CenterY, 0),
			new THREE.Vector3(properties.circle1CenterX, properties.circle1CenterY, 0)
		]);


		rdo.helper.resetOutput();
		rdo.helper.addOutput('<b>Circle 1 - Circle 2</b>');

		intersectionPoints[0] = this.calculateCircleIntersection(
			new rdo.Vector3(properties.circle1CenterX, properties.circle1CenterY, 0),
			properties.circle1Radius,
			new rdo.Vector3(properties.circle2CenterX, properties.circle2CenterY, 0),
			properties.circle2Radius,
			properties.circleTolerance
		);

		rdo.helper.addOutput('<hr>');
		rdo.helper.addOutput('<b>Circle 2 - Circle 3</b>');

		intersectionPoints[1] = this.calculateCircleIntersection(
			new rdo.Vector3(properties.circle2CenterX, properties.circle2CenterY, 0),
			properties.circle2Radius,
			new rdo.Vector3(properties.circle3CenterX, properties.circle3CenterY, 0),
			properties.circle3Radius,
			properties.circleTolerance
		);

		rdo.helper.addOutput('<hr>');
		rdo.helper.addOutput('<b>Circle 3 - Circle 1</b>');

		intersectionPoints[2] = this.calculateCircleIntersection(
			new rdo.Vector3(properties.circle3CenterX, properties.circle3CenterY, 0),
			properties.circle3Radius,
			new rdo.Vector3(properties.circle1CenterX, properties.circle1CenterY, 0),
			properties.circle1Radius,
			properties.circleTolerance
		);
		rdo.helper.addOutput('<hr>');


		for(let i = 0; i < 3; ++i) {
			this.lineIntersectToIntersect[i].geometry.dispose();

			if (intersectionPoints[i].length) {
				this.lineIntersectToIntersect[i].geometry = new THREE.BufferGeometry().setFromPoints([
					new THREE.Vector3(intersectionPoints[i][0].x, intersectionPoints[i][0].y, 0),
					new THREE.Vector3(intersectionPoints[i][1].x, intersectionPoints[i][1].y, 0)
				]);
			}
		}
	};

	Main.prototype.createCircle = function(obj, circleCenterX, circleCenterY, circleRadius) {
		let curve = new THREE.EllipseCurve(
			circleCenterX,
			circleCenterY,
			circleRadius,
			circleRadius,
			0,
			2 * Math.PI,
			false,
			0
		);

		obj.geometry.dispose();
		obj.geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(properties.circlePoints));
	};

	Main.prototype.createGui = function() {
		let self = this;

		this.gui.add(properties, 'axesHelperVisible').onChange(function(value) {
			self.axesHelper.visible = value;
		});
		this.gui.add(properties, 'gridHelperVisible').onChange(function(value) {
			self.gridHelper.visible = value;
		});
		this.gui.add(properties, 'circleTolerance', 0, 5).step(0.1).onChange(function(value) {
			self.createGeometry();
		});

		let folderCircle1 = this.gui.addFolder('Circle 1');
		folderCircle1.add(properties, 'circle1CenterX', -10, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderCircle1.add(properties, 'circle1CenterY', -10, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderCircle1.add(properties, 'circle1Radius', 0.1, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderCircle1.addColor(properties, 'circle1Color').onChange(function(value) {
			self.circle1.material.color.set(value);
		});

		let folderCircle2 = this.gui.addFolder('Circle 2');
		folderCircle2.add(properties, 'circle2CenterX', -10, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderCircle2.add(properties, 'circle2CenterY', -10, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderCircle2.add(properties, 'circle2Radius', 0.1, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderCircle2.addColor(properties, 'circle2Color').onChange(function(value) {
			self.circle2.material.color.set(value);
		});

		let folderCircle3 = this.gui.addFolder('Circle 3');
		folderCircle3.add(properties, 'circle3CenterX', -10, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderCircle3.add(properties, 'circle3CenterY', -10, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderCircle3.add(properties, 'circle3Radius', 0.1, 10).step(0.1).onChange(function(value) {
			self.createGeometry();
		});
		folderCircle3.addColor(properties, 'circle3Color').onChange(function(value) {
			self.circle3.material.color.set(value);
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

	Main.prototype.calculateCircleIntersection = function(circleCenter1, circleRadius1, circleCenter2, circleRadius2, tolerance) {
		// compute the distance between center of the circle 1 and the circle 2
		let distanceVector = circleCenter2.sub(circleCenter1);

		// compute the length of the distance vector (Pythagorean theorem)
		let distancePow = Math.pow(distanceVector.x, 2) + Math.pow(distanceVector.y, 2);
		let distance = Math.sqrt(distancePow);

		rdo.helper.addOutput('Center 1: ' + circleCenter1.toString());
		rdo.helper.addOutput('Center 2: ' + circleCenter2.toString());
		rdo.helper.addOutput('Distance: ' + distanceVector.toString());
		rdo.helper.addOutput('Length  : ' + distance);

		// if the distance is 0, circle 1 and circle 2 have the same center
		if(distance == 0) {
			return [];
		}


		let u = (Math.pow(circleRadius1, 2) - Math.pow(circleRadius2, 2) + distancePow) / (2 * distance);
		let v = (Math.pow(circleRadius2, 2) - Math.pow(circleRadius1, 2) + distancePow) / (2 * distance);

		let hPow = Math.pow(circleRadius1 + tolerance, 2) - Math.pow(u, 2);

		rdo.helper.addOutput('u       : ' + u);
		rdo.helper.addOutput('v       : ' + v);
		rdo.helper.addOutput('hPow    : ' + hPow);

		if(hPow < 0) {
			return [];
		}


		let h = Math.sqrt(hPow);

		let s1 = new rdo.Vector3();
		let s2 = new rdo.Vector3();

		s1.x = rdo.helper.roundDecimal(circleCenter1.x + ( (u * distanceVector.x) / distance) + ( (h * distanceVector.y) / distance), 5);
		s1.y = rdo.helper.roundDecimal(circleCenter1.y + ( (u * distanceVector.y) / distance) - ( (h * distanceVector.x) / distance), 5);

		s2.x = rdo.helper.roundDecimal(circleCenter1.x + ( (u * distanceVector.x) / distance) - ( (h * distanceVector.y) / distance), 5);
		s2.y = rdo.helper.roundDecimal(circleCenter1.y + ( (u * distanceVector.y) / distance) + ( (h * distanceVector.x) / distance), 5);

		rdo.helper.addOutput('h       : ' + h);
		rdo.helper.addOutput('S1      : ' + s1.toString());
		rdo.helper.addOutput('S2      : ' + s2.toString());

		let distanceIntersection = s2.sub(s1);

		s1 = s1.sub(distanceIntersection);
		s2 = s2.add(distanceIntersection);

		return [s1, s2];
	};



	let main = new Main(document.getElementById('webGlCanvas'));
	document.addEventListener('DOMContentLoaded', function() {
		main.init();
	});
}(window));