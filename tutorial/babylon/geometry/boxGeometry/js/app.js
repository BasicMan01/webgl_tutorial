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
		this._cube = null;

		this._properties = {
			'axesHelperVisible': true,
			'gridHelperVisible': true,
			'cubeWidth': 5,
			'cubeHeight': 5,
			'cubeDepth': 5,
			'cubeMaterialColor': '#156289',
			'cubeWireframeColor': '#FFFFFF',
			'cubePositionX': 0,
			'cubePositionY': 0,
			'cubePositionZ': 0,
			'cubeRotationX': 0,
			'cubeRotationY': 0,
			'cubeRotationZ': 0,
			'cubeScaleX': 1,
			'cubeScaleY': 1,
			'cubeScaleZ': 1,
			'cubeWireframe': false
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

		this._cube = new BABYLON.Mesh("cube", this._scene);

		const cubeChild1 = new BABYLON.Mesh('cubeChild1', this._scene);
		const cubeChild2 = new BABYLON.Mesh('cubeChild2', this._scene);

		cubeChild1.material = new BABYLON.StandardMaterial("materialCubeChild1", this._scene);
		cubeChild1.material.emissiveColor = new BABYLON.Color3.FromHexString(this._properties.cubeMaterialColor);
		cubeChild1.parent = this._cube;

		cubeChild2.material = new BABYLON.StandardMaterial("materialCubeChild2", this._scene);
		cubeChild2.material.emissiveColor = new BABYLON.Color3.FromHexString(this._properties.cubeWireframeColor);
		cubeChild2.material.wireframe = true;
		cubeChild2.parent = this._cube;

		this._createGeometry();
	}

	_createGeometry() {
		const vertexData = BABYLON.VertexData.CreateBox({
			'depth': this._properties.cubeDepth,
			'height': this._properties.cubeHeight,
			'width': this._properties.cubeWidth,
			'sideOrientation': BABYLON.Mesh.DOUBLESIDE
		});

		vertexData.applyToMesh(this._cube.getChildren()[0], true);
		vertexData.applyToMesh(this._cube.getChildren()[1], true);
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

		const folderGeometry = gui.addFolder('Cube Geometry');
		folderGeometry.add(this._properties, 'cubeWireframe').onChange((value) => {
			this._cube.getChildren()[0].visibility = !value;
		});
		folderGeometry.add(this._properties, 'cubeWidth', 0.1, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'cubeHeight', 0.1, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'cubeDepth', 0.1, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});

		const folderMaterial = gui.addFolder('Cube Material');
		folderMaterial.addColor(this._properties, 'cubeMaterialColor').onChange((value) => {
			this._cube.getChildren()[0].material.emissiveColor = new BABYLON.Color3.FromHexString(value);
		});
		folderMaterial.addColor(this._properties, 'cubeWireframeColor').onChange((value) => {
			this._cube.getChildren()[1].material.emissiveColor = new BABYLON.Color3.FromHexString(value);
		});

		const folderTransformation = gui.addFolder('Cube Transformation');
		folderTransformation.add(this._properties, 'cubePositionX', -10, 10).step(0.1).onChange((value) => {
			this._cube.position.x = value;
		});
		folderTransformation.add(this._properties, 'cubePositionY', -10, 10).step(0.1).onChange((value) => {
			this._cube.position.y = value;
		});
		folderTransformation.add(this._properties, 'cubePositionZ', -10, 10).step(0.1).onChange((value) => {
			this._cube.position.z = value;
		});
		folderTransformation.add(this._properties, 'cubeRotationX', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._cube.rotation.x = value;
		});
		folderTransformation.add(this._properties, 'cubeRotationY', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._cube.rotation.y = value;
		});
		folderTransformation.add(this._properties, 'cubeRotationZ', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._cube.rotation.z = value;
		});
		folderTransformation.add(this._properties, 'cubeScaleX', 0.1, 10).step(0.1).onChange((value) => {
			this._cube.scaling.x = value;
		});
		folderTransformation.add(this._properties, 'cubeScaleY', 0.1, 10).step(0.1).onChange((value) => {
			this._cube.scaling.y = value;
		});
		folderTransformation.add(this._properties, 'cubeScaleZ', 0.1, 10).step(0.1).onChange((value) => {
			this._cube.scaling.z = value;
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
