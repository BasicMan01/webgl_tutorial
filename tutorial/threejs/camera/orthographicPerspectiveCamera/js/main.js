/* globals dat,rdo,THREE */

(function(window) {
	'use strict';

	var config = {
		'CAMERA_FOV': 25,
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
		'wireframe': false
	};



	var Main = function(canvas)	{
		this.canvas = canvas;

		this.camera = null;
		this.cameraPersp = null;
		this.cameraOrtho = null;
		this.controls = null;
		this.gui = null;
		this.renderer = null;
		this.scene = null;

		this.axesHelper = null;
		this.gridHelper = null;

		this.cone = null;
		this.cube = null;
		this.sphere = null;
	};

	Main.prototype.init = function() {
		this.scene = new THREE.Scene();

		this.renderer = new THREE.WebGLRenderer({antialias: true});
		this.renderer.setClearColor(0x000000, 1);
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(this.getGameAreaWidth(), this.getGameAreaHeight());
		
		this.cameraPersp = new THREE.PerspectiveCamera(config.CAMERA_FOV, this.getCameraAspect(), config.CAMERA_NEAR_PLANE, config.CAMERA_FAR_PLANE);
		this.cameraOrtho = new THREE.OrthographicCamera(0, 0, 0, 0, config.CAMERA_NEAR_PLANE, config.CAMERA_FAR_PLANE);
		
		this.camera = {};
		this.camera.type = 'Perspective';
		this.camera.view = 'User';
		this.camera.object = this.cameraPersp;
		this.camera.object.position.set(30, 20, 10);
		
		this.controls = new THREE.OrbitControls(this.camera.object, this.renderer.domElement);
		// TODO: create event type only for rotation
		this.controls.addEventListener('start', this.onStartOrbitControls.bind(this));

		this.gui = new dat.GUI({ width: 400 });
		this.gui.close();

		// add renderer to the DOM-Tree
		this.canvas.appendChild(this.renderer.domElement);

		window.addEventListener('keydown', this.onKeyDownHandler.bind(this), false);
		window.addEventListener('resize', this.onResizeHandler.bind(this), false);

		this.createGui();
		this.createObject();
		
		this.render();
		this.output();
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
	};
	
	Main.prototype.output = function() {
		rdo.helper.resetOutput();
		rdo.helper.addOutput(this.camera.view + ' ' + this.camera.type);
	};
	
	Main.prototype.switchCameraType = function() {
		if (this.controls.object.type === 'OrthographicCamera') {
			this.cameraPersp.position.copy(this.controls.object.position);
			this.cameraPersp.rotation.copy(this.controls.object.rotation);
			this.cameraPersp.zoom = this.controls.object.zoom;
			
			this.camera.type = 'Perspective';
			this.camera.object = this.cameraPersp;
		} else {
			this.cameraOrtho.position.copy(this.controls.object.position);
			this.cameraOrtho.rotation.copy(this.controls.object.rotation);
			this.cameraOrtho.zoom = this.controls.object.zoom;
			
			var halfY = Math.tan(config.CAMERA_FOV / 2 * Math.PI / 180);
			var top = this.cameraOrtho.position.length() * halfY;
			var right = top * this.getCameraAspect();
			
			this.cameraOrtho.right = right;
			this.cameraOrtho.left = -right;
			this.cameraOrtho.top = top;
			this.cameraOrtho.bottom = -top;
			
			this.camera.type = 'Orthographic';
			this.camera.object = this.cameraOrtho;
		}
		
		this.camera.object.updateProjectionMatrix();
		
		this.controls.object = this.camera.object;
		this.controls.update();
		
		this.output();
	};
	
	Main.prototype.switchCameraView = function(value) {
		switch (value) {
			case 'Back': {
				this.controls.object.position.copy(new THREE.Vector3(0, 0, -50));
			} break;
			
			case 'Front': {
				this.controls.object.position.copy(new THREE.Vector3(0, 0, 50));
			} break;
			
			case 'Right': {
				this.controls.object.position.copy(new THREE.Vector3(-50, 0, 0));
			} break;
			
			case 'Left': {
				this.controls.object.position.copy(new THREE.Vector3(50, 0, 0));
			} break;
			
			case 'Bottom': {
				this.controls.object.position.copy(new THREE.Vector3(0, -50, 0));
			} break;
			
			case 'Top': {
				this.controls.object.position.copy(new THREE.Vector3(0, 50, 0));
			} break;
		}
		
		this.camera.view = value;
		this.output();
	};

	Main.prototype.render = function() {
		requestAnimationFrame(this.render.bind(this));
		
		this.controls.update();
		
		this.renderer.render(this.scene, this.controls.object);
	};

	Main.prototype.getGameAreaHeight = function() { return this.canvas.offsetHeight; };
	Main.prototype.getGameAreaWidth = function() { return this.canvas.offsetWidth; };

	Main.prototype.getCameraAspect = function() { return this.getGameAreaWidth() / this.getGameAreaHeight(); };

	
	Main.prototype.onStartOrbitControls = function() {
		this.camera.view = 'User';
		this.output();
	};
	
	Main.prototype.onKeyDownHandler = function(event) {
		switch (event.keyCode) {
			case 97: { // 1
				event.preventDefault();
			
				if (event.ctrlKey) {
					this.switchCameraView('Back');
				} else {
					this.switchCameraView('Front');
				}
			} break;

			case 99: { // 3
				event.preventDefault();
				
				if (event.ctrlKey) {
					this.switchCameraView('Right');
				} else {
					this.switchCameraView('Left');
				}
			} break;

			case 101: { // 5
				this.switchCameraType();
			} break;

			case 103: { // 7
				event.preventDefault();
				
				if (event.ctrlKey) {
					this.switchCameraView('Bottom');
				} else {
					this.switchCameraView('Top');
				}
			} break;
		}
	};
			
	Main.prototype.onResizeHandler = function(event) {
		this.camera.object.aspect = this.getCameraAspect();
		this.camera.object.updateProjectionMatrix();

		this.renderer.setSize(this.getGameAreaWidth(), this.getGameAreaHeight());
	};



	var main = new Main(document.getElementById('webGlCanvas'));
	document.addEventListener('DOMContentLoaded', function() {
		document.getElementById('btnCamera').addEventListener('click', function() {
			main.switchCameraType();
		});

		document.getElementById('btnTop').addEventListener('click', function() {
			main.switchCameraView('Top');
		});

		document.getElementById('btnBottom').addEventListener('click', function() {
			main.switchCameraView('Bottom');
		});

		document.getElementById('btnLeft').addEventListener('click', function() {
			main.switchCameraView('Left');
		});
		
		document.getElementById('btnRight').addEventListener('click', function() {
			main.switchCameraView('Right');
		});
		
		document.getElementById('btnFront').addEventListener('click', function() {
			main.switchCameraView('Front');
		});
		
		document.getElementById('btnBack').addEventListener('click', function() {
			main.switchCameraView('Back');
		});
		
		main.init();
	});
}(window));