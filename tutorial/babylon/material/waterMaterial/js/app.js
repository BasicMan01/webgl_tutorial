/* globals dat,BABYLON */

document.addEventListener('DOMContentLoaded', () => {
	(() => new App(document.getElementById('webGlCanvas')))();
});


class App {
	constructor(canvas)	{
		this._canvas = canvas;

		this._axesHelper = null;
		this._gridHelper = null;
		this._ground = null;
		this._light = null;
		this._water = null;

		this._properties = {
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

		this._engine = new BABYLON.Engine(this._canvas, true);

		this._scene = new BABYLON.Scene(this._engine);
		this._scene.clearColor = new BABYLON.Color3(0, 0, 0);
		this._scene.useRightHandedSystem = true;

		this._camera = new BABYLON.ArcRotateCamera('arcRotateCamera', 0, 0, 0, BABYLON.Vector3.Zero(), this._scene);
		this._camera.setPosition(new BABYLON.Vector3(0, 10, 20));
		this._camera.attachControl(this._canvas, false);
		this._camera.lowerRadiusLimit = 0.01;

		window.addEventListener('resize', this._onResizeHandler.bind(this), false);

		this._init();
	}

	_init() {
		this._createGui();
		this._createObject();

		this._render();
	}

	_createObject() {
		this._light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), this._scene);

		this._ground = new BABYLON.Mesh('ground', this._scene);
		this._ground.position.y = -1;
		this._ground.material = new BABYLON.StandardMaterial("materialGround", this._scene);
		this._ground.material.diffuseTexture = new BABYLON.Texture("../../../../resources/texture/soilBeach0087.jpg", this._scene);
		this._ground.material.diffuseTexture.uScale = 4;
		this._ground.material.diffuseTexture.vScale = 4;

		this._water = new BABYLON.Mesh('water', this._scene);
		this._water.material = new BABYLON.WaterMaterial("materialWater", this._scene);
		this._water.material.bumpTexture = new BABYLON.Texture("../../../../resources/texture/babylon/normal/water.png", this._scene);

		this._water.material.addToRenderList(this._ground);

		this._createGeometry();
		this._createMaterial();
	}

	_createGeometry() {
		const vertexData = BABYLON.VertexData.CreateGround({
			'height': this._properties.waterHeight,
			'width': this._properties.waterWidth,
			'subdivisions': this._properties.waterSubdivisions
		});

		vertexData.applyToMesh(this._ground, true);
		vertexData.applyToMesh(this._water, true);
	}

	_createGui() {
		const gui = new dat.GUI({ width: 400 });

		const folderGeometry = gui.addFolder('Water Geometry');
		folderGeometry.add(this._properties, 'waterWidth', 1, 100).step(1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'waterHeight', 1, 100).step(1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'waterSubdivisions', 1, 64).step(1).onChange((value) => {
			this._createGeometry();
		});

		const folderMaterial = gui.addFolder('Water Material');
		folderMaterial.add(this._properties, 'waterMaterialBumpHeight', 0, 2).step(0.01).onChange((value) => {
			this._createMaterial();
		});
		folderMaterial.add(this._properties, 'waterMaterialWaveHeight', 0, 2).step(0.01).onChange((value) => {
			this._createMaterial();
		});
		folderMaterial.add(this._properties, 'waterMaterialWaveLength', 0, 2).step(0.01).onChange((value) => {
			this._createMaterial();
		});
		folderMaterial.add(this._properties, 'waterMaterialWindForce', -50, 50).step(1).onChange((value) => {
			this._createMaterial();
		});
		folderMaterial.add(this._properties, 'waterMaterialWindDirectionX', 0, 5).step(0.1).onChange((value) => {
			this._createMaterial();
		});
		folderMaterial.add(this._properties, 'waterMaterialWindDirectionY', 0, 5).step(0.1).onChange((value) => {
			this._createMaterial();
		});
		folderMaterial.addColor(this._properties, 'waterMaterialColor').onChange((value) => {
			this._createMaterial();
		});
		folderMaterial.add(this._properties, 'waterMaterialColorBlendFactor', 0, 1).step(0.1).onChange((value) => {
			this._createMaterial();
		});

		gui.close();
	}

	_createMaterial() {
		this._water.material.bumpHeight = this._properties.waterMaterialBumpHeight;
		this._water.material.waveHeight = this._properties.waterMaterialWaveHeight;
		this._water.material.waveLength = this._properties.waterMaterialWaveLength;
		this._water.material.windForce = this._properties.waterMaterialWindForce;
		this._water.material.waterColor = new BABYLON.Color3.FromHexString(this._properties.waterMaterialColor);
		this._water.material.windDirection.x = this._properties.waterMaterialWindDirectionX;
		this._water.material.windDirection.y = this._properties.waterMaterialWindDirectionY;
		this._water.material.colorBlendFactor = this._properties.waterMaterialColorBlendFactor;
	}

	_render() {
		this._engine.runRenderLoop(() => {
			this._scene.render();
		});
	}

	_onResizeHandler(event) {
		this._engine.resize();
	}
}
