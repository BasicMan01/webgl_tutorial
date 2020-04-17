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
		'infoBoxCenter': true,
		'coneMaterialColor': '#156289',
		'coneWireframeColor': '#FFFFFF',
		'cubeMaterialColor': '#156289',
		'cubeWireframeColor': '#FFFFFF',
		'sphereMaterialColor': '#156289',
		'sphereWireframeColor': '#FFFFFF',
		'conePositionX': -10,
		'conePositionY': 0,
		'conePositionZ': 0,
		'cubePositionX': 0,
		'cubePositionY': 0,
		'cubePositionZ': -10,
		'spherePositionX': 10,
		'spherePositionY': 0,
		'spherePositionZ': 10,
		'wireframe': false
	};



	var Main = function(canvas)	{
		this.canvas = canvas;

		this.camera = null;
		this.cameraPersp = null;
		this.controls = null;
		this.gui = null;
		this.renderer = null;
		this.scene = null;

		this.axesHelper = null;
		this.gridHelper = null;

		this.cone = null;
		this.cube = null;
		this.sphere = null;

		this.infoBox = null;
		this.infoBoxTemplate = null;
		this.intersectObject = null;
		this.meshs = [];
		this.raycaster = new THREE.Raycaster();
		this.mouseVector2 = new THREE.Vector2();
	};

	Main.prototype.init = function() {
		this.scene = new THREE.Scene();

		this.camera = new THREE.PerspectiveCamera(config.CAMERA_FOV, this.getCameraAspect(), config.CAMERA_NEAR_PLANE, config.CAMERA_FAR_PLANE);
		this.camera.position.set(0, 10, 20);

		this.renderer = new THREE.WebGLRenderer({antialias: true});
		this.renderer.setClearColor(0x000000, 1);
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(this.getCanvasWidth(), this.getCanvasHeight());

		this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);

		this.gui = new dat.GUI({ width: 400 });
		this.gui.close();

		// add renderer to the DOM-Tree
		this.canvas.appendChild(this.renderer.domElement);

		this.infoBox = document.getElementById('infoBox');
		this.infoBoxTemplate = document.getElementById('infoBoxTemplate');

		window.addEventListener('mousemove', this.onMouseMoveHandler.bind(this), false);
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

		this.meshs.push(this.cone.children[0]);
		this.meshs.push(this.cube.children[0]);
		this.meshs.push(this.sphere.children[0]);

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
		this.gui.add(properties, 'infoBoxCenter').onChange(function(value) {
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

	Main.prototype.render = function() {
		requestAnimationFrame(this.render.bind(this));

		this.updateInfoBoxPosition();

		this.renderer.render(this.scene, this.camera);
	};

	Main.prototype.updateInfoBoxPosition = function() {
		// 3D => 2D
		if (this.intersectObject !== null) {
			var object = this.intersectObject;
			var vector = new THREE.Vector3();

			if (properties.infoBoxCenter) {
				// show info box at the center of the mesh

				// if object.matrixAutoUpdate = false use updateMatrixWorld()
				// object.updateMatrixWorld();

				vector.setFromMatrixPosition(object.matrixWorld);
				vector.project(this.camera);
			} else {
				// show info box at mouse position
				vector = this.mouseVector2.clone();
			}

			vector.x = Math.round((0.5 + vector.x / 2) * this.getCanvasWidth());
			vector.y = Math.round((0.5 - vector.y / 2) * this.getCanvasHeight());

			var templateCode = this.infoBoxTemplate.innerHTML;

			this.infoBox.innerHTML = templateCode.replace('{geometry}', this.intersectObject.geometry.type);
			this.infoBox.style.display = 'block';
			this.infoBox.style.left = vector.x + 'px';
			this.infoBox.style.top = vector.y + 'px';
		} else {
			this.infoBox.style.display = 'none';
		}
	};

	Main.prototype.getCanvasHeight = function() { return this.canvas.offsetHeight; };
	Main.prototype.getCanvasWidth = function() { return this.canvas.offsetWidth; };

	Main.prototype.getCameraAspect = function() { return this.getCanvasWidth() / this.getCanvasHeight(); };

	Main.prototype.onMouseMoveHandler = function(event) {
		// 2D => 3D
		this.mouseVector2.x = (event.clientX / window.innerWidth) * 2 - 1;
		this.mouseVector2.y = - (event.clientY / window.innerHeight) * 2 + 1;

		this.raycaster.setFromCamera(this.mouseVector2, this.camera);

		var intersects = this.raycaster.intersectObjects(this.meshs);

		if(intersects.length > 0) {
			this.intersectObject = intersects[0].object;
		} else {
			this.intersectObject = null;
		}
	};

	Main.prototype.onResizeHandler = function(event) {
		this.camera.aspect = this.getCameraAspect();
		this.camera.updateProjectionMatrix();

		this.renderer.setSize(this.getCanvasWidth(), this.getCanvasHeight());
	};



	var main = new Main(document.getElementById('webGlCanvas'));
	document.addEventListener('DOMContentLoaded', function() {
		main.init();
	});
}(window));