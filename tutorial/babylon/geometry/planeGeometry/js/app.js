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
		this._plane = null;

		this._properties = {
			'axesHelperVisible': true,
			'gridHelperVisible': true,
			'planeWidth': 5,
			'planeHeight': 5,
			'planeMaterialColor': '#156289',
			'planeWireframeColor': '#FFFFFF',
			'planePositionX': 0,
			'planePositionY': 0,
			'planePositionZ': 0,
			'planeRotationX': 0,
			'planeRotationY': 0,
			'planeRotationZ': 0,
			'planeScaleX': 1,
			'planeScaleY': 1,
			'planeWireframe': false
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

		this._plane = new BABYLON.Mesh("plane", this._scene);

		const planeChild1 = new BABYLON.Mesh('planeChild1', this._scene);
		const planeChild2 = new BABYLON.Mesh('planeChild2', this._scene);

		planeChild1.material = new BABYLON.StandardMaterial("materialPlaneChild1", this._scene);
		planeChild1.material.emissiveColor = new BABYLON.Color3.FromHexString(this._properties.planeMaterialColor);
		planeChild1.parent = this._plane;

		planeChild2.material = new BABYLON.StandardMaterial("materialPlaneChild2", this._scene);
		planeChild2.material.emissiveColor = new BABYLON.Color3.FromHexString(this._properties.planeWireframeColor);
		planeChild2.material.wireframe = true;
		planeChild2.parent = this._plane;

		this._createGeometry();
	}

	_createGeometry() {
		const vertexData = BABYLON.VertexData.CreatePlane({
			'height': this._properties.planeHeight,
			'width': this._properties.planeWidth,
			'sideOrientation': BABYLON.Mesh.DOUBLESIDE
		});

		vertexData.applyToMesh(this._plane.getChildren()[0], true);
		vertexData.applyToMesh(this._plane.getChildren()[1], true);
	}

	_createGui() {
		const gui = new dat.GUI({ width: 400 });

		gui.add(this._properties, 'axesHelperVisible').onChange((value) => {
			this._axesHelper.setEnabled(value);
		});

		gui.add(this._properties, 'gridHelperVisible').onChange((value) => {
			this._gridHelper.setEnabled(value);
		});

		const folderGeometry = gui.addFolder('Plane Geometry');
		folderGeometry.add(this._properties, 'planeWireframe').onChange((value) => {
			this._plane.getChildren()[0].visibility = !value;
		});
		folderGeometry.add(this._properties, 'planeWidth', 0.1, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'planeHeight', 0.1, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});

		const folderMaterial = gui.addFolder('Plane Material');
		folderMaterial.addColor(this._properties, 'planeMaterialColor').onChange((value) => {
			this._plane.getChildren()[0].material.emissiveColor = new BABYLON.Color3.FromHexString(value);
		});
		folderMaterial.addColor(this._properties, 'planeWireframeColor').onChange((value) => {
			this._plane.getChildren()[1].material.emissiveColor = new BABYLON.Color3.FromHexString(value);
		});

		const folderTransformation = gui.addFolder('Plane Transformation');
		folderTransformation.add(this._properties, 'planePositionX', -10, 10).step(0.1).onChange((value) => {
			this._plane.position.x = value;
		});
		folderTransformation.add(this._properties, 'planePositionY', -10, 10).step(0.1).onChange((value) => {
			this._plane.position.y = value;
		});
		folderTransformation.add(this._properties, 'planePositionZ', -10, 10).step(0.1).onChange((value) => {
			this._plane.position.z = value;
		});
		folderTransformation.add(this._properties, 'planeRotationX', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._plane.rotation.x = value;
		});
		folderTransformation.add(this._properties, 'planeRotationY', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._plane.rotation.y = value;
		});
		folderTransformation.add(this._properties, 'planeRotationZ', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._plane.rotation.z = value;
		});
		folderTransformation.add(this._properties, 'planeScaleX', 0.1, 10).step(0.1).onChange((value) => {
			this._plane.scaling.x = value;
		});
		folderTransformation.add(this._properties, 'planeScaleY', 0.1, 10).step(0.1).onChange((value) => {
			this._plane.scaling.y = value;
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
