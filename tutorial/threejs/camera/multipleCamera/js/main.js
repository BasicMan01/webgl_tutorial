/* globals dat,rdo,THREE */

(function(window) {
	'use strict';

	var config = {
		'CAMERA_FOV': 40,
		'CAMERA_NEAR_PLANE': 0.1,
		'CAMERA_FAR_PLANE': 500
	};

	var properties = {
		'axesHelperVisible': true,
		'gridHelperVisible': true,
		'coneMaterialColor': '#156289',
		'coneWireframeColor': '#FFFFFF',
		'cubeMaterialColor': '#156289',
		'cubeWireframeColor': '#FFFFFF',
		'sphereMaterialColor': '#156289',
		'sphereWireframeColor': '#FFFFFF',
		'conePositionX': 0,
		'conePositionY': 0,
		'conePositionZ': 2.5,
		'cubePositionX': 0,
		'cubePositionY': 0,
		'cubePositionZ': 0,
		'spherePositionX': 2.5,
		'spherePositionY': 0,
		'spherePositionZ': 0,
		'wireframe': false,
		'cameraLeftPositionX': 0,
		'cameraLeftPositionY': 10,
		'cameraLeftPositionZ': 20,
		'cameraLeftRotationX': 5.82,
		'cameraLeftRotationY': 0,
		'cameraLeftRotationZ': 1.57,
		'cameraFrontPositionX': 20,
		'cameraFrontPositionY': 10,
		'cameraFrontPositionZ': 0,
		'cameraFrontRotationX': 1.57,
		'cameraFrontRotationY': 2.03,
		'cameraFrontRotationZ': 4.71,
		'cameraRightPositionX': 0,
		'cameraRightPositionY': 10,
		'cameraRightPositionZ': -20,
		'cameraRightRotationX': 3.6,
		'cameraRightRotationY': 0,
		'cameraRightRotationZ': 1.57
	};



	var Main = function(canvas)	{
		this.canvas = canvas;

		this.cameraFront = null;
		this.cameraRight = null;
		this.cameraLeft = null;
		this.gui = null;
		this.renderer = null;
		this.scene = null;

		this.axesHelper = null;
		this.gridHelper = null;

		this.cone = null;
		this.cube = null;
		this.sphere = null;

		this.sceneRotY = 0;
	};

	Main.prototype.init = function() {
		this.scene = new THREE.Scene();

		this.renderer = new THREE.WebGLRenderer({antialias: true});
		this.renderer.setClearColor(0x000000, 1);
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(this.getCanvasWidth(), this.getCanvasHeight());
		
		this.cameraFront = new THREE.PerspectiveCamera(config.CAMERA_FOV, 1, config.CAMERA_NEAR_PLANE, config.CAMERA_FAR_PLANE);
		this.cameraRight = new THREE.PerspectiveCamera(config.CAMERA_FOV, 1, config.CAMERA_NEAR_PLANE, config.CAMERA_FAR_PLANE);
		this.cameraLeft = new THREE.PerspectiveCamera(config.CAMERA_FOV, 1, config.CAMERA_NEAR_PLANE, config.CAMERA_FAR_PLANE);
		
		this.cameraLeft.position.set(
			properties.cameraLeftPositionX,
			properties.cameraLeftPositionY,
			properties.cameraLeftPositionZ
		);

		this.cameraLeft.rotation.set(
			properties.cameraLeftRotationX,
			properties.cameraLeftRotationY,
			properties.cameraLeftRotationZ
		);

		this.cameraFront.position.set(
			properties.cameraFrontPositionX,
			properties.cameraFrontPositionY,
			properties.cameraFrontPositionZ
		);

		this.cameraFront.rotation.set(
			properties.cameraFrontRotationX,
			properties.cameraFrontRotationY,
			properties.cameraFrontRotationZ
		);

		this.cameraRight.position.set(
			properties.cameraRightPositionX,
			properties.cameraRightPositionY,
			properties.cameraRightPositionZ
		);

		this.cameraRight.rotation.set(
			properties.cameraRightRotationX,
			properties.cameraRightRotationY,
			properties.cameraRightRotationZ
		);

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
		this.axesHelper = new THREE.AxesHelper(25);
		this.scene.add(this.axesHelper);

		this.gridHelper = new THREE.GridHelper(50, 50);
		this.scene.add(this.gridHelper);
		

		this.cone = new THREE.Object3D();
		this.cone.position.set(properties.conePositionX, properties.conePositionY, properties.conePositionZ);
		
		this.cone.add(new THREE.Mesh(
			new THREE.Geometry(),
			new THREE.MeshBasicMaterial( { color: properties.coneMaterialColor } )
		));
		
		this.cone.add(new THREE.LineSegments(
			new THREE.Geometry(),
			new THREE.LineBasicMaterial( { color: properties.coneWireframeColor } )
		));
		
		this.cube = new THREE.Object3D();
		this.cube.position.set(properties.cubePositionX, properties.cubePositionY, properties.cubePositionZ);
		
		this.cube.add(new THREE.Mesh(
			new THREE.Geometry(),
			new THREE.MeshBasicMaterial( { color: properties.cubeMaterialColor } )
		));
		
		this.cube.add(new THREE.LineSegments(
			new THREE.Geometry(),
			new THREE.LineBasicMaterial( { color: properties.cubeWireframeColor } )
		));
	
		this.sphere = new THREE.Object3D();
		this.sphere.position.set(properties.spherePositionX, properties.spherePositionY, properties.spherePositionZ);
		
		this.sphere.add(new THREE.Mesh(
			new THREE.Geometry(),
			new THREE.MeshBasicMaterial( { color: properties.sphereMaterialColor } )
		));

		this.sphere.add(new THREE.LineSegments(
			new THREE.Geometry(),
			new THREE.LineBasicMaterial( { color: properties.sphereWireframeColor } )
		));
		
		this.scene.add(this.cone);
		this.scene.add(this.cube);
		this.scene.add(this.sphere);

		this.createGeometry();
	};

	Main.prototype.createGeometry = function() {
		var geometryCone = new THREE.ConeGeometry(2.5, 5, 32);
		var geometryCube = new THREE.BoxGeometry(5, 5, 5);
		var geometrySphere = new THREE.SphereGeometry(2.5, 32, 32);

		this.cone.children[0].geometry.dispose();
		this.cone.children[0].geometry = geometryCone;
		this.cone.children[1].geometry.dispose();
		this.cone.children[1].geometry = new THREE.WireframeGeometry(geometryCone);
		
		this.cube.children[0].geometry.dispose();
		this.cube.children[0].geometry = geometryCube;
		this.cube.children[1].geometry.dispose();
		this.cube.children[1].geometry = new THREE.WireframeGeometry(geometryCube);
		
		this.sphere.children[0].geometry.dispose();
		this.sphere.children[0].geometry = geometrySphere;
		this.sphere.children[1].geometry.dispose();
		this.sphere.children[1].geometry = new THREE.WireframeGeometry(geometrySphere);
	};

	Main.prototype.createGui = function() {
		var self = this;

		this.gui.add(properties, 'axesHelperVisible').onChange(function(value) {
			self.axesHelper.visible = value;
		});
		this.gui.add(properties, 'gridHelperVisible').onChange(function(value) {
			self.gridHelper.visible = value;
		});
		
		var folderGeometry = this.gui.addFolder('Geometry');
		folderGeometry.add(properties, 'wireframe').onChange(function(value) {
			self.cone.children[0].visible = !value;
			self.cube.children[0].visible = !value;
			self.sphere.children[0].visible = !value;
		});

		var folderMaterial = this.gui.addFolder('Material');
		folderMaterial.addColor(properties, 'coneMaterialColor').onChange(function(value) {
			self.cone.children[0].material.color.setHex(rdo.helper.cssColorToHex(value));
		});
		folderMaterial.addColor(properties, 'coneWireframeColor').onChange(function(value) {
			self.cone.children[1].material.color.setHex(rdo.helper.cssColorToHex(value));
		});
		folderMaterial.addColor(properties, 'cubeMaterialColor').onChange(function(value) {
			self.cube.children[0].material.color.setHex(rdo.helper.cssColorToHex(value));
		});
		folderMaterial.addColor(properties, 'cubeWireframeColor').onChange(function(value) {
			self.cube.children[1].material.color.setHex(rdo.helper.cssColorToHex(value));
		});
		folderMaterial.addColor(properties, 'sphereMaterialColor').onChange(function(value) {
			self.sphere.children[0].material.color.setHex(rdo.helper.cssColorToHex(value));
		});
		folderMaterial.addColor(properties, 'sphereWireframeColor').onChange(function(value) {
			self.sphere.children[1].material.color.setHex(rdo.helper.cssColorToHex(value));
		});

		var folderTransformation = this.gui.addFolder('Transformation');
		folderTransformation.add(properties, 'conePositionX', -10, 10).step(0.1).onChange(function(value) {
			self.cone.position.x = value;
		});
		folderTransformation.add(properties, 'conePositionY', -10, 10).step(0.1).onChange(function(value) {
			self.cone.position.y = value;
		});
		folderTransformation.add(properties, 'conePositionZ', -10, 10).step(0.1).onChange(function(value) {
			self.cone.position.z = value;
		});
		folderTransformation.add(properties, 'cubePositionX', -10, 10).step(0.1).onChange(function(value) {
			self.cube.position.x = value;
		});
		folderTransformation.add(properties, 'cubePositionY', -10, 10).step(0.1).onChange(function(value) {
			self.cube.position.y = value;
		});
		folderTransformation.add(properties, 'cubePositionZ', -10, 10).step(0.1).onChange(function(value) {
			self.cube.position.z = value;
		});
		folderTransformation.add(properties, 'spherePositionX', -10, 10).step(0.1).onChange(function(value) {
			self.sphere.position.x = value;
		});
		folderTransformation.add(properties, 'spherePositionY', -10, 10).step(0.1).onChange(function(value) {
			self.sphere.position.y = value;
		});
		folderTransformation.add(properties, 'spherePositionZ', -10, 10).step(0.1).onChange(function(value) {
			self.sphere.position.z = value;
		});

		var folderCameraLeft = this.gui.addFolder('Transformation Camera Left');
		folderCameraLeft.add(properties, 'cameraLeftPositionX', -50, 50).step(1).onChange(function(value) {
			self.cameraLeft.position.x = value;
		});
		folderCameraLeft.add(properties, 'cameraLeftPositionY', -50, 50).step(1).onChange(function(value) {
			self.cameraLeft.position.y = value;
		});
		folderCameraLeft.add(properties, 'cameraLeftPositionZ', -50, 50).step(1).onChange(function(value) {
			self.cameraLeft.position.z = value;
		});
		folderCameraLeft.add(properties, 'cameraLeftRotationX', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.cameraLeft.rotation.x = value;
		});
		folderCameraLeft.add(properties, 'cameraLeftRotationY', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.cameraLeft.rotation.y = value;
		});
		folderCameraLeft.add(properties, 'cameraLeftRotationZ', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.cameraLeft.rotation.z = value;
		});

		var folderCameraFront = this.gui.addFolder('Transformation Camera Front');
		folderCameraFront.add(properties, 'cameraFrontPositionX', -50, 50).step(1).onChange(function(value) {
			self.cameraFront.position.x = value;
		});
		folderCameraFront.add(properties, 'cameraFrontPositionY', -50, 50).step(1).onChange(function(value) {
			self.cameraFront.position.y = value;
		});
		folderCameraFront.add(properties, 'cameraFrontPositionZ', -50, 50).step(1).onChange(function(value) {
			self.cameraFront.position.z = value;
		});
		folderCameraFront.add(properties, 'cameraFrontRotationX', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.cameraFront.rotation.x = value;
		});
		folderCameraFront.add(properties, 'cameraFrontRotationY', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.cameraFront.rotation.y = value;
		});
		folderCameraFront.add(properties, 'cameraFrontRotationZ', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.cameraFront.rotation.z = value;
		});

		var folderCameraRight = this.gui.addFolder('Transformation Camera Right');
		folderCameraRight.add(properties, 'cameraRightPositionX', -50, 50).step(1).onChange(function(value) {
			self.cameraRight.position.x = value;
		});
		folderCameraRight.add(properties, 'cameraRightPositionY', -50, 50).step(1).onChange(function(value) {
			self.cameraRight.position.y = value;
		});
		folderCameraRight.add(properties, 'cameraRightPositionZ', -50, 50).step(1).onChange(function(value) {
			self.cameraRight.position.z = value;
		});
		folderCameraRight.add(properties, 'cameraRightRotationX', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.cameraRight.rotation.x = value;
		});
		folderCameraRight.add(properties, 'cameraRightRotationY', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.cameraRight.rotation.y = value;
		});
		folderCameraRight.add(properties, 'cameraRightRotationZ', 0, 2*Math.PI).step(0.01).onChange(function(value) {
			self.cameraRight.rotation.z = value;
		});
	};
	
	Main.prototype.render = function() {
		requestAnimationFrame(this.render.bind(this));

		var size = this.getCanvasHeight() / 2;
		var border = (this.getCanvasWidth() - 1.5 * this.getCanvasHeight()) / 2;

		this.scene.rotation.y = this.sceneRotY;
		this.sceneRotY += 0.002;

		this.renderer.setScissorTest(true);

		this.renderer.setViewport(border, size, size, size);
		this.renderer.setScissor(border, size, size, size);
		this.renderer.render(this.scene, this.cameraLeft);

		this.renderer.setViewport(border + size, 0, size, size);
		this.renderer.setScissor(border + size, 0, size, size);
		this.renderer.render(this.scene, this.cameraFront);

		this.renderer.setViewport(border + 2 * size, size, size, size);
		this.renderer.setScissor(border + 2 * size, size, size, size);
		this.renderer.render(this.scene, this.cameraRight);

		this.renderer.setScissorTest(false);
	};

	Main.prototype.getCanvasHeight = function() { return this.canvas.offsetHeight; };
	Main.prototype.getCanvasWidth = function() { return this.canvas.offsetWidth; };

	Main.prototype.getCameraAspect = function() { return this.getCanvasWidth() / this.getCanvasHeight(); };

	
	Main.prototype.onResizeHandler = function(event) {
		this.renderer.setSize(this.getCanvasWidth(), this.getCanvasHeight());
	};


	var main = new Main(document.getElementById('webGlCanvas'));
	document.addEventListener('DOMContentLoaded', function() {
		main.init();
	});
}(window));