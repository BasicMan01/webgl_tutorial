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
		this._torusKnot = null;

		this._properties = {
			'axesHelperVisible': true,
			'gridHelperVisible': true,
			'torusKnotRadius': 3,
			'torusKnotTube': 0.5,
			'torusKnotRadialSegments': 32,
			'torusKnotTubularSegments': 32,
			'torusKnotP': 2,
			'torusKnotQ': 3,
			'torusKnotMaterialColor': '#156289',
			'torusKnotWireframeColor': '#FFFFFF',
			'torusKnotPositionX': 0,
			'torusKnotPositionY': 0,
			'torusKnotPositionZ': 0,
			'torusKnotRotationX': 0,
			'torusKnotRotationY': 0,
			'torusKnotRotationZ': 0,
			'torusKnotScaleX': 1,
			'torusKnotScaleY': 1,
			'torusKnotScaleZ': 1,
			'torusKnotWireframe': false
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

		this._torusKnot = new BABYLON.Mesh("torusKnot", this._scene);

		const torusKnotChild1 = new BABYLON.Mesh('torusKnotChild1', this._scene);
		const torusKnotChild2 = new BABYLON.Mesh('torusKnotChild1', this._scene);

		torusKnotChild1.material = new BABYLON.StandardMaterial("materialTorusKnotChild1", this._scene);
		torusKnotChild1.material.emissiveColor = new BABYLON.Color3.FromHexString(this._properties.torusKnotMaterialColor);
		torusKnotChild1.parent = this._torusKnot;

		torusKnotChild2.material = new BABYLON.StandardMaterial("materialTorusKnotChild2", this._scene);
		torusKnotChild2.material.emissiveColor = new BABYLON.Color3.FromHexString(this._properties.torusKnotWireframeColor);
		torusKnotChild2.material.wireframe = true;
		torusKnotChild2.parent = this._torusKnot;

		this._createGeometry();
	}

	_createGeometry() {
		const vertexData = BABYLON.VertexData.CreateTorusKnot({
			'radius': this._properties.torusKnotRadius,
			'tube': this._properties.torusKnotTube,
			'tubularSegments': this._properties.torusKnotTubularSegments,
			'radialSegments': this._properties.torusKnotRadialSegments,
			'p': this._properties.torusKnotP,
			'q': this._properties.torusKnotQ,
			'sideOrientation': BABYLON.Mesh.DOUBLESIDE
		});

		vertexData.applyToMesh(this._torusKnot.getChildren()[0], true);
		vertexData.applyToMesh(this._torusKnot.getChildren()[1], true);
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

		const folderGeometry = gui.addFolder('TorusKnot Geometry');
		folderGeometry.add(this._properties, 'torusKnotWireframe').onChange((value) => {
			this._torusKnot.getChildren()[0].visibility = !value;
		});
		folderGeometry.add(this._properties, 'torusKnotRadius', 0.1, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'torusKnotTube', 0.1, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'torusKnotRadialSegments', 3, 64).step(1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'torusKnotTubularSegments', 3, 64).step(1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'torusKnotP', 1, 10).step(1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'torusKnotQ', 1, 10).step(1).onChange((value) => {
			this._createGeometry();
		});

		const folderMaterial = gui.addFolder('TorusKnot Material');
		folderMaterial.addColor(this._properties, 'torusKnotMaterialColor').onChange((value) => {
			this._torusKnot.getChildren()[0].material.emissiveColor = new BABYLON.Color3.FromHexString(value);
		});
		folderMaterial.addColor(this._properties, 'torusKnotWireframeColor').onChange((value) => {
			this._torusKnot.getChildren()[1].material.emissiveColor = new BABYLON.Color3.FromHexString(value);
		});

		const folderTransformation = gui.addFolder('TorusKnot Transformation');
		folderTransformation.add(this._properties, 'torusKnotPositionX', -10, 10).step(0.1).onChange((value) => {
			this._torusKnot.position.x = value;
		});
		folderTransformation.add(this._properties, 'torusKnotPositionY', -10, 10).step(0.1).onChange((value) => {
			this._torusKnot.position.y = value;
		});
		folderTransformation.add(this._properties, 'torusKnotPositionZ', -10, 10).step(0.1).onChange((value) => {
			this._torusKnot.position.z = value;
		});
		folderTransformation.add(this._properties, 'torusKnotRotationX', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._torusKnot.rotation.x = value;
		});
		folderTransformation.add(this._properties, 'torusKnotRotationY', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._torusKnot.rotation.y = value;
		});
		folderTransformation.add(this._properties, 'torusKnotRotationZ', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._torusKnot.rotation.z = value;
		});
		folderTransformation.add(this._properties, 'torusKnotScaleX', 0.1, 10).step(0.1).onChange((value) => {
			this._torusKnot.scaling.x = value;
		});
		folderTransformation.add(this._properties, 'torusKnotScaleY', 0.1, 10).step(0.1).onChange((value) => {
			this._torusKnot.scaling.y = value;
		});
		folderTransformation.add(this._properties, 'torusKnotScaleZ', 0.1, 10).step(0.1).onChange((value) => {
			this._torusKnot.scaling.z = value;
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
