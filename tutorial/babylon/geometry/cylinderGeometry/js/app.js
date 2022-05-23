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
		this._cylinder = null;

		this._properties = {
			'axesHelperVisible': true,
			'gridHelperVisible': true,
			'cylinderDiameterTop': 6,
			'cylinderDiameterBottom': 6,
			'cylinderHeight': 5,
			'cylinderTessellation': 8,
			'cylinderSubdivisions': 1,
			'cylinderArc': 1,
			'cylinderEnclose': false,
			'cylinderMaterialColor': '#156289',
			'cylinderWireframeColor': '#FFFFFF',
			'cylinderPositionX': 0,
			'cylinderPositionY': 0,
			'cylinderPositionZ': 0,
			'cylinderRotationX': 0,
			'cylinderRotationY': 0,
			'cylinderRotationZ': 0,
			'cylinderScaleX': 1,
			'cylinderScaleY': 1,
			'cylinderScaleZ': 1,
			'cylinderWireframe': false
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

		this._cylinder = new BABYLON.Mesh('cylinder', this._scene);

		const cylinderChild1 = new BABYLON.Mesh('cylinderChild1', this._scene);
		const cylinderChild2 = new BABYLON.Mesh('cylinderChild1', this._scene);

		cylinderChild1.material = new BABYLON.StandardMaterial('materialCylinderChild1', this._scene);
		cylinderChild1.material.emissiveColor = new BABYLON.Color3.FromHexString(this._properties.cylinderMaterialColor);
		cylinderChild1.parent = this._cylinder;

		cylinderChild2.material = new BABYLON.StandardMaterial('materialCylinderChild2', this._scene);
		cylinderChild2.material.emissiveColor = new BABYLON.Color3.FromHexString(this._properties.cylinderWireframeColor);
		cylinderChild2.material.wireframe = true;
		cylinderChild2.parent = this._cylinder;

		this._createGeometry();
	}

	_createGeometry() {
		const vertexData = BABYLON.VertexData.CreateCylinder({
			'diameterTop': this._properties.cylinderDiameterTop,
			'diameterBottom': this._properties.cylinderDiameterBottom,
			'height': this._properties.cylinderHeight,
			'tessellation': this._properties.cylinderTessellation,
			'subdivisions': this._properties.cylinderSubdivisions,
			'arc': this._properties.cylinderArc,
			'enclose': this._properties.cylinderEnclose,
			'sideOrientation': BABYLON.Mesh.DOUBLESIDE
		});

		vertexData.applyToMesh(this._cylinder.getChildren()[0], true);
		vertexData.applyToMesh(this._cylinder.getChildren()[1], true);
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

		const folderGeometry = gui.addFolder('Cylinder Geometry');
		folderGeometry.add(this._properties, 'cylinderWireframe').onChange((value) => {
			this._cylinder.getChildren()[0].visibility = !value;
		});
		folderGeometry.add(this._properties, 'cylinderEnclose').onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'cylinderDiameterTop', 0.1, 20).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'cylinderDiameterBottom', 0.1, 20).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'cylinderHeight', 0.1, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'cylinderTessellation', 3, 64).step(1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'cylinderSubdivisions', 1, 64).step(1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'cylinderArc', 0.01, 1).step(0.01).onChange((value) => {
			this._createGeometry();
		});

		const folderMaterial = gui.addFolder('Cylinder Material');
		folderMaterial.addColor(this._properties, 'cylinderMaterialColor').onChange((value) => {
			this._cylinder.getChildren()[0].material.emissiveColor = new BABYLON.Color3.FromHexString(value);
		});
		folderMaterial.addColor(this._properties, 'cylinderWireframeColor').onChange((value) => {
			this._cylinder.getChildren()[1].material.emissiveColor = new BABYLON.Color3.FromHexString(value);
		});

		const folderTransformation = gui.addFolder('Cylinder Transformation');
		folderTransformation.add(this._properties, 'cylinderPositionX', -10, 10).step(0.1).onChange((value) => {
			this._cylinder.position.x = value;
		});
		folderTransformation.add(this._properties, 'cylinderPositionY', -10, 10).step(0.1).onChange((value) => {
			this._cylinder.position.y = value;
		});
		folderTransformation.add(this._properties, 'cylinderPositionZ', -10, 10).step(0.1).onChange((value) => {
			this._cylinder.position.z = value;
		});
		folderTransformation.add(this._properties, 'cylinderRotationX', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._cylinder.rotation.x = value;
		});
		folderTransformation.add(this._properties, 'cylinderRotationY', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._cylinder.rotation.y = value;
		});
		folderTransformation.add(this._properties, 'cylinderRotationZ', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._cylinder.rotation.z = value;
		});
		folderTransformation.add(this._properties, 'cylinderScaleX', 0.1, 10).step(0.1).onChange((value) => {
			this._cylinder.scaling.x = value;
		});
		folderTransformation.add(this._properties, 'cylinderScaleY', 0.1, 10).step(0.1).onChange((value) => {
			this._cylinder.scaling.y = value;
		});
		folderTransformation.add(this._properties, 'cylinderScaleZ', 0.1, 10).step(0.1).onChange((value) => {
			this._cylinder.scaling.z = value;
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
