/* globals dat,BABYLON */
import BabylonHelper from '../../../../../resources/js/babylonHelper.js';


document.addEventListener('DOMContentLoaded', () => {
	(() => new App(document.getElementById('webGlCanvas')))();
});


class App {
	constructor(canvas)	{
		this._canvas = canvas;

		this._axesHelper = null;
		this._gridHelper = null;
		this._torus = null;

		this._properties = {
			'axesHelperVisible': true,
			'gridHelperVisible': true,
			'torusDiameter': 5,
			'torusThickness': 1,
			'torusTessellation': 15,
			'torusMaterialColor': '#156289',
			'torusWireframeColor': '#FFFFFF',
			'torusPositionX': 0,
			'torusPositionY': 0,
			'torusPositionZ': 0,
			'torusRotationX': 0,
			'torusRotationY': 0,
			'torusRotationZ': 0,
			'torusScaleX': 1,
			'torusScaleY': 1,
			'torusScaleZ': 1,
			'torusWireframe': false
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
		this._axesHelper = BabylonHelper.createAxesHelper(25, this._scene);
		this._gridHelper = BabylonHelper.createGridHelper(50, this._scene);

		this._torus = new BABYLON.Mesh("torus", this._scene);

		const torusChild1 = new BABYLON.Mesh('torusChild1', this._scene);
		const torusChild2 = new BABYLON.Mesh('torusChild1', this._scene);

		torusChild1.material = new BABYLON.StandardMaterial("materialTorusChild1", this._scene);
		torusChild1.material.emissiveColor = new BABYLON.Color3.FromHexString(this._properties.torusMaterialColor);
		torusChild1.parent = this._torus;

		torusChild2.material = new BABYLON.StandardMaterial("materialTorusChild2", this._scene);
		torusChild2.material.emissiveColor = new BABYLON.Color3.FromHexString(this._properties.torusWireframeColor);
		torusChild2.material.wireframe = true;
		torusChild2.parent = this._torus;

		this._createGeometry();
	}

	_createGeometry() {
		const vertexData = BABYLON.VertexData.CreateTorus({
			'diameter': this._properties.torusDiameter,
			'thickness': this._properties.torusThickness,
			'tessellation': this._properties.torusTessellation,
			'sideOrientation': BABYLON.Mesh.DOUBLESIDE
		});

		vertexData.applyToMesh(this._torus.getChildren()[0], true);
		vertexData.applyToMesh(this._torus.getChildren()[1], true);
	}

	_createGui() {
		const gui = new dat.GUI({ width: 400 });

		gui.add(this._properties, 'axesHelperVisible').onChange((value) => {
			this._axesHelper.visible = value;
			this._axesHelper.setEnabled(value);
		});

		gui.add(this._properties, 'gridHelperVisible').onChange((value) => {
			this._gridHelper.setEnabled(value);
		});

		const folderGeometry = gui.addFolder('Torus Geometry');
		folderGeometry.add(this._properties, 'torusWireframe').onChange((value) => {
			this._torus.getChildren()[0].visibility = !value;
		});
		folderGeometry.add(this._properties, 'torusDiameter', 0.1, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'torusThickness', 0.1, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'torusTessellation', 3, 64).step(1).onChange((value) => {
			this._createGeometry();
		});

		const folderMaterial = gui.addFolder('Torus Material');
		folderMaterial.addColor(this._properties, 'torusMaterialColor').onChange((value) => {
			this._torus.getChildren()[0].material.emissiveColor = new BABYLON.Color3.FromHexString(value);
		});
		folderMaterial.addColor(this._properties, 'torusWireframeColor').onChange((value) => {
			this._torus.getChildren()[1].material.emissiveColor = new BABYLON.Color3.FromHexString(value);
		});

		const folderTransformation = gui.addFolder('Torus Transformation');
		folderTransformation.add(this._properties, 'torusPositionX', -10, 10).step(0.1).onChange((value) => {
			this._torus.position.x = value;
		});
		folderTransformation.add(this._properties, 'torusPositionY', -10, 10).step(0.1).onChange((value) => {
			this._torus.position.y = value;
		});
		folderTransformation.add(this._properties, 'torusPositionZ', -10, 10).step(0.1).onChange((value) => {
			this._torus.position.z = value;
		});
		folderTransformation.add(this._properties, 'torusRotationX', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._torus.rotation.x = value;
		});
		folderTransformation.add(this._properties, 'torusRotationY', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._torus.rotation.y = value;
		});
		folderTransformation.add(this._properties, 'torusRotationZ', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._torus.rotation.z = value;
		});
		folderTransformation.add(this._properties, 'torusScaleX', 0.1, 10).step(0.1).onChange((value) => {
			this._torus.scaling.x = value;
		});
		folderTransformation.add(this._properties, 'torusScaleY', 0.1, 10).step(0.1).onChange((value) => {
			this._torus.scaling.y = value;
		});
		folderTransformation.add(this._properties, 'torusScaleZ', 0.1, 10).step(0.1).onChange((value) => {
			this._torus.scaling.z = value;
		});

		gui.close();
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
