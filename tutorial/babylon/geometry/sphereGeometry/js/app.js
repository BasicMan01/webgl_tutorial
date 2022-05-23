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
		this._sphere = null;

		this._properties = {
			'axesHelperVisible': true,
			'gridHelperVisible': true,
			'sphereDiameter': 5,
			'sphereSegments': 8,
			'sphereArc': 1,
			'sphereSlice': 1,
			'sphereMaterialColor': '#156289',
			'sphereWireframeColor': '#FFFFFF',
			'spherePositionX': 0,
			'spherePositionY': 0,
			'spherePositionZ': 0,
			'sphereRotationX': 0,
			'sphereRotationY': 0,
			'sphereRotationZ': 0,
			'sphereScaleX': 1,
			'sphereScaleY': 1,
			'sphereScaleZ': 1,
			'sphereWireframe': false
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

		this._sphere = new BABYLON.Mesh("sphere", this._scene);

		const sphereChild1 = new BABYLON.Mesh('sphereChild1', this._scene);
		const sphereChild2 = new BABYLON.Mesh('sphereChild1', this._scene);

		sphereChild1.material = new BABYLON.StandardMaterial("materialSphereChild1", this._scene);
		sphereChild1.material.emissiveColor = new BABYLON.Color3.FromHexString(this._properties.sphereMaterialColor);
		sphereChild1.parent = this._sphere;

		sphereChild2.material = new BABYLON.StandardMaterial("materialSphereChild2", this._scene);
		sphereChild2.material.emissiveColor = new BABYLON.Color3.FromHexString(this._properties.sphereWireframeColor);
		sphereChild2.material.wireframe = true;
		sphereChild2.parent = this._sphere;

		this._createGeometry();
	}

	_createGeometry() {
		const vertexData = BABYLON.VertexData.CreateSphere({
			'diameter': this._properties.sphereDiameter,
			'segments': this._properties.sphereSegments,
			'arc': this._properties.sphereArc,
			'slice': this._properties.sphereSlice,
			'sideOrientation': BABYLON.Mesh.DOUBLESIDE
		});

		vertexData.applyToMesh(this._sphere.getChildren()[0], true);
		vertexData.applyToMesh(this._sphere.getChildren()[1], true);
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

		const folderGeometry = gui.addFolder('Sphere Geometry');
		folderGeometry.add(this._properties, 'sphereWireframe').onChange((value) => {
			this._sphere.getChildren()[0].visibility = !value;
		});
		folderGeometry.add(this._properties, 'sphereDiameter', 0.1, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'sphereSegments', 1, 32).step(1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'sphereArc', 0.01, 1).step(0.01).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'sphereSlice', 0.01, 1).step(0.01).onChange((value) => {
			this._createGeometry();
		});

		const folderMaterial = gui.addFolder('Sphere Material');
		folderMaterial.addColor(this._properties, 'sphereMaterialColor').onChange((value) => {
			this._sphere.getChildren()[0].material.emissiveColor = new BABYLON.Color3.FromHexString(value);
		});
		folderMaterial.addColor(this._properties, 'sphereWireframeColor').onChange((value) => {
			this._sphere.getChildren()[1].material.emissiveColor = new BABYLON.Color3.FromHexString(value);
		});

		const folderTransformation = gui.addFolder('Sphere Transformation');
		folderTransformation.add(this._properties, 'spherePositionX', -10, 10).step(0.1).onChange((value) => {
			this._sphere.position.x = value;
		});
		folderTransformation.add(this._properties, 'spherePositionY', -10, 10).step(0.1).onChange((value) => {
			this._sphere.position.y = value;
		});
		folderTransformation.add(this._properties, 'spherePositionZ', -10, 10).step(0.1).onChange((value) => {
			this._sphere.position.z = value;
		});
		folderTransformation.add(this._properties, 'sphereRotationX', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._sphere.rotation.x = value;
		});
		folderTransformation.add(this._properties, 'sphereRotationY', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._sphere.rotation.y = value;
		});
		folderTransformation.add(this._properties, 'sphereRotationZ', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._sphere.rotation.z = value;
		});
		folderTransformation.add(this._properties, 'sphereScaleX', 0.1, 10).step(0.1).onChange((value) => {
			this._sphere.scaling.x = value;
		});
		folderTransformation.add(this._properties, 'sphereScaleY', 0.1, 10).step(0.1).onChange((value) => {
			this._sphere.scaling.y = value;
		});
		folderTransformation.add(this._properties, 'sphereScaleZ', 0.1, 10).step(0.1).onChange((value) => {
			this._sphere.scaling.z = value;
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
