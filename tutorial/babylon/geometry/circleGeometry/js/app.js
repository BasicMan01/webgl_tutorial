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
		this._circle = null;

		this._properties = {
			'axesHelperVisible': true,
			'gridHelperVisible': true,
			'circleRadius': 2.5,
			'circleTessellation': 8,
			'circleArc': 1,
			'circleMaterialColor': '#156289',
			'circleWireframeColor': '#FFFFFF',
			'circlePositionX': 0,
			'circlePositionY': 0,
			'circlePositionZ': 0,
			'circleRotationX': 0,
			'circleRotationY': 0,
			'circleRotationZ': 0,
			'circleScaleX': 1,
			'circleScaleY': 1,
			'circleWireframe': false
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

		this._circle = new BABYLON.Mesh("circle", this._scene);

		const circleChild1 = new BABYLON.Mesh('circleChild1', this._scene);
		const circleChild2 = new BABYLON.Mesh('circleChild2', this._scene);

		circleChild1.material = new BABYLON.StandardMaterial("materialCircleChild1", this._scene);
		circleChild1.material.emissiveColor = new BABYLON.Color3.FromHexString(this._properties.circleMaterialColor);
		circleChild1.parent = this._circle;

		circleChild2.material = new BABYLON.StandardMaterial("materialCircleChild2", this._scene);
		circleChild2.material.emissiveColor = new BABYLON.Color3.FromHexString(this._properties.circleWireframeColor);
		circleChild2.material.wireframe = true;
		circleChild2.parent = this._circle;

		this._createGeometry();
	}

	_createGeometry() {
		const vertexData = BABYLON.VertexData.CreateDisc({
			'radius': this._properties.circleRadius,
			'tessellation': this._properties.circleTessellation,
			'arc': this._properties.circleArc,
			'sideOrientation': BABYLON.Mesh.DOUBLESIDE
		});

		vertexData.applyToMesh(this._circle.getChildren()[0], true);
		vertexData.applyToMesh(this._circle.getChildren()[1], true);
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

		const folderGeometry = gui.addFolder('Circle Geometry');
		folderGeometry.add(this._properties, 'circleWireframe').onChange((value) => {
			this._circle.getChildren()[0].visibility = !value;
		});
		folderGeometry.add(this._properties, 'circleRadius', 0.1, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'circleTessellation', 3, 64).step(1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'circleArc', 0.01, 1).step(0.01).onChange((value) => {
			this._createGeometry();
		});

		const folderMaterial = gui.addFolder('Circle Material');
		folderMaterial.addColor(this._properties, 'circleMaterialColor').onChange((value) => {
			this._circle.getChildren()[0].material.emissiveColor = new BABYLON.Color3.FromHexString(value);
		});
		folderMaterial.addColor(this._properties, 'circleWireframeColor').onChange((value) => {
			this._circle.getChildren()[1].material.emissiveColor = new BABYLON.Color3.FromHexString(value);
		});

		const folderTransformation = gui.addFolder('Circle Transformation');
		folderTransformation.add(this._properties, 'circlePositionX', -10, 10).step(0.1).onChange((value) => {
			this._circle.position.x = value;
		});
		folderTransformation.add(this._properties, 'circlePositionY', -10, 10).step(0.1).onChange((value) => {
			this._circle.position.y = value;
		});
		folderTransformation.add(this._properties, 'circlePositionZ', -10, 10).step(0.1).onChange((value) => {
			this._circle.position.z = value;
		});
		folderTransformation.add(this._properties, 'circleRotationX', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._circle.rotation.x = value;
		});
		folderTransformation.add(this._properties, 'circleRotationY', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._circle.rotation.y = value;
		});
		folderTransformation.add(this._properties, 'circleRotationZ', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._circle.rotation.z = value;
		});
		folderTransformation.add(this._properties, 'circleScaleX', 0.1, 10).step(0.1).onChange((value) => {
			this._circle.scaling.x = value;
		});
		folderTransformation.add(this._properties, 'circleScaleY', 0.1, 10).step(0.1).onChange((value) => {
			this._circle.scaling.y = value;
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
