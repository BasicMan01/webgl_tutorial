/* globals dat,rdo,BABYLON */

(function(window) {
	'use strict';

	var config = {
		'CAMERA_FOV': 70,
		'CAMERA_NEAR_PLANE': 0.1,
		'CAMERA_FAR_PLANE': 500
	};

	var properties = {
		'waterWidth': 50,
		'waterHeight': 50,
		'waterSubdivisions': 16,
		'waterMaterialBumpHeight': 1,
		'waterMaterialWaveHeight': 0.5,
		'waterMaterialWaveLength': 0.3,
		'waterMaterialWindForce': -15,
		'waterMaterialWindDirectionX': 0.5,
		'waterMaterialWindDirectionY': 0.5,
		'waterMaterialColor': '#2D9CBE',
		'waterMaterialColorBlendFactor': 0.5
	};



	var Main = function(canvas)	{
		this.canvas = canvas;

		this.camera = null;
		this.engine = null;
		this.gui = null;
		this.scene = null;

		this.ground = null;
		this.light = null;
		this.water = null;
	};

	Main.prototype.init = function() {
		this.engine = new BABYLON.Engine(this.canvas, true);

		this.scene = new BABYLON.Scene(this.engine);
		this.scene.clearColor = new BABYLON.Color3(0, 0, 0);
		this.scene.useRightHandedSystem = true;

		this.camera = new BABYLON.ArcRotateCamera('arcRotateCamera', 0, 0, 0, BABYLON.Vector3.Zero(), this.scene);
		this.camera.setPosition(new BABYLON.Vector3(0, 10, 20));
		this.camera.attachControl(this.canvas, false);
		this.camera.lowerRadiusLimit = 0.01;

		this.gui = new dat.GUI({ width: 400 });
		this.gui.close();

		window.addEventListener('resize', this.onResizeHandler.bind(this), false);

		this.createGui();
		this.createObject();

		this.render();
	};

	Main.prototype.createObject = function() {
		this.light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), this.scene);

		this.ground = new BABYLON.Mesh('ground', this.scene);
		this.ground.position.y = -1;
		this.ground.material = new BABYLON.StandardMaterial("materialGround", this.scene);
		this.ground.material.diffuseTexture = new BABYLON.Texture("../../../../resources/texture/soilBeach0087.jpg", this.scene);
		this.ground.material.diffuseTexture.uScale = 4;
		this.ground.material.diffuseTexture.vScale = 4;

		this.water = new BABYLON.Mesh('water', this.scene);
		this.water.material = new BABYLON.WaterMaterial("materialWater", this.scene);
		this.water.material.bumpTexture = new BABYLON.Texture("../../../../resources/texture/babylon/normal/water.png", this.scene);

		this.water.material.addToRenderList(this.ground);

		this.createGeometry();
		this.createMaterial();
	};

	Main.prototype.createGeometry = function() {
		var vertexData = BABYLON.VertexData.CreateGround({
			'height': properties.waterHeight,
			'width': properties.waterWidth,
			'subdivisions': properties.waterSubdivisions
		});

		vertexData.applyToMesh(this.ground, true);
		vertexData.applyToMesh(this.water, true);
	};

	Main.prototype.createGui = function() {
		var self = this;

		var folderGeometry = this.gui.addFolder('Water Geometry');
		folderGeometry.add(properties, 'waterWidth', 1, 100).step(1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'waterHeight', 1, 100).step(1).onChange(function(value) {
			self.createGeometry();
		});
		folderGeometry.add(properties, 'waterSubdivisions', 1, 64).step(1).onChange(function(value) {
			self.createGeometry();
		});

		var folderMaterial = this.gui.addFolder('Water Material');
		folderMaterial.add(properties, 'waterMaterialBumpHeight', 0, 2).step(0.01).onChange(function(value) {
			self.createMaterial();
		});
		folderMaterial.add(properties, 'waterMaterialWaveHeight', 0, 2).step(0.01).onChange(function(value) {
			self.createMaterial();
		});
		folderMaterial.add(properties, 'waterMaterialWaveLength', 0, 2).step(0.01).onChange(function(value) {
			self.createMaterial();
		});
		folderMaterial.add(properties, 'waterMaterialWindForce', -50, 50).step(1).onChange(function(value) {
			self.createMaterial();
		});
		folderMaterial.add(properties, 'waterMaterialWindDirectionX', 0, 5).step(0.1).onChange(function(value) {
			self.createMaterial();
		});
		folderMaterial.add(properties, 'waterMaterialWindDirectionY', 0, 5).step(0.1).onChange(function(value) {
			self.createMaterial();
		});
		folderMaterial.addColor(properties, 'waterMaterialColor').onChange(function(value) {
			self.createMaterial();
		});
		folderMaterial.add(properties, 'waterMaterialColorBlendFactor', 0, 1).step(0.1).onChange(function(value) {
			self.createMaterial();
		});
	};

	Main.prototype.createMaterial = function() {
		this.water.material.bumpHeight = properties.waterMaterialBumpHeight;
		this.water.material.waveHeight = properties.waterMaterialWaveHeight;
		this.water.material.waveLength = properties.waterMaterialWaveLength;
		this.water.material.windForce = properties.waterMaterialWindForce;
		this.water.material.waterColor = new BABYLON.Color3.FromHexString(properties.waterMaterialColor);
		this.water.material.windDirection.x = properties.waterMaterialWindDirectionX;
		this.water.material.windDirection.y = properties.waterMaterialWindDirectionY;
		this.water.material.colorBlendFactor = properties.waterMaterialColorBlendFactor;
	};

	Main.prototype.render = function() {
		var self = this;

		this.engine.runRenderLoop(function() {
			self.scene.render();
		});
	};

	Main.prototype.onResizeHandler = function(event) {
		this.engine.resize();
	};



	var main = new Main(document.getElementById('webGlCanvas'));
	document.addEventListener('DOMContentLoaded', function() {
		main.init();
	});
}(window));