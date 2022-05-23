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
		this._polyhedron = null;
		this._polyhedronContainer = {
			'Tetrahedron': 0,
			'Octahedron': 1,
			'Dodecahedron': 2,
			'Icosahedron': 3,
			'Rhombicuboctahedron': 4,
			'Triangular Prism': 5,
			'Pentagonal Prism': 6,
			'Hexagonal Prism': 7,
			'Square Pyramid (J1)': 8,
			'Pentagonal Pyramid (J2)': 9,
			'Triangular Dipyramid (J12)': 10,
			'Pentagonal Dipyramid (J13)': 11,
			'Elongated Square_dipyramid (J15)': 12,
			'Elongated Pentagonal Dipyramid (J16)': 13,
			'Elongated Pentagonal Cupola (J20)': 14
		};

		this._properties = {
			'axesHelperVisible': true,
			'gridHelperVisible': true,
			'polyhedronType': 'Tetrahedron',
			'polyhedronSizeX': 3,
			'polyhedronSizeY': 3,
			'polyhedronSizeZ': 3,
			'polyhedronMaterialColor': '#156289',
			'polyhedronWireframeColor': '#FFFFFF',
			'polyhedronPositionX': 0,
			'polyhedronPositionY': 0,
			'polyhedronPositionZ': 0,
			'polyhedronRotationX': 0,
			'polyhedronRotationY': 0,
			'polyhedronRotationZ': 0,
			'polyhedronScaleX': 1,
			'polyhedronScaleY': 1,
			'polyhedronScaleZ': 1,
			'polyhedronWireframe': false
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

		this._polyhedron = new BABYLON.Mesh("polyhedron", this._scene);

		const polyhedronChild1 = new BABYLON.Mesh('polyhedronChild1', this._scene);
		const polyhedronChild2 = new BABYLON.Mesh('polyhedronChild2', this._scene);

		polyhedronChild1.material = new BABYLON.StandardMaterial("materialPolyhedronChild1", this._scene);
		polyhedronChild1.material.emissiveColor = new BABYLON.Color3.FromHexString(this._properties.polyhedronMaterialColor);
		polyhedronChild1.parent = this._polyhedron;

		polyhedronChild2.material = new BABYLON.StandardMaterial("materialPolyhedronChild2", this._scene);
		polyhedronChild2.material.emissiveColor = new BABYLON.Color3.FromHexString(this._properties.polyhedronWireframeColor);
		polyhedronChild2.material.wireframe = true;
		polyhedronChild2.parent = this._polyhedron;

		this._createGeometry();
	}

	_createGeometry() {
		const vertexData = BABYLON.VertexData.CreatePolyhedron({
			'sizeX': this._properties.polyhedronSizeX,
			'sizeY': this._properties.polyhedronSizeY,
			'sizeZ': this._properties.polyhedronSizeZ,
			'flat': true,
			'type': this._polyhedronContainer[this._properties.polyhedronType],
			'sideOrientation': BABYLON.Mesh.DOUBLESIDE
		});

		vertexData.applyToMesh(this._polyhedron.getChildren()[0], true);
		vertexData.applyToMesh(this._polyhedron.getChildren()[1], true);
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

		gui.add(this._properties, 'polyhedronType', Object.keys(this._polyhedronContainer)).onChange((value) => {
			this._createGeometry();
		});

		const folderGeometry = gui.addFolder('Polyhedron Geometry');
		folderGeometry.add(this._properties, 'polyhedronWireframe').onChange((value) => {
			this._polyhedron.getChildren()[0].visibility = !value;
		});
		folderGeometry.add(this._properties, 'polyhedronSizeX', 0.1, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'polyhedronSizeY', 0.1, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});
		folderGeometry.add(this._properties, 'polyhedronSizeZ', 0.1, 10).step(0.1).onChange((value) => {
			this._createGeometry();
		});

		const folderMaterial = gui.addFolder('Polyhedron Material');
		folderMaterial.addColor(this._properties, 'polyhedronMaterialColor').onChange((value) => {
			this._polyhedron.getChildren()[0].material.emissiveColor = new BABYLON.Color3.FromHexString(value);
		});
		folderMaterial.addColor(this._properties, 'polyhedronWireframeColor').onChange((value) => {
			this._polyhedron.getChildren()[1].material.emissiveColor = new BABYLON.Color3.FromHexString(value);
		});

		const folderTransformation = gui.addFolder('Polyhedron Transformation');
		folderTransformation.add(this._properties, 'polyhedronPositionX', -10, 10).step(0.1).onChange((value) => {
			this._polyhedron.position.x = value;
		});
		folderTransformation.add(this._properties, 'polyhedronPositionY', -10, 10).step(0.1).onChange((value) => {
			this._polyhedron.position.y = value;
		});
		folderTransformation.add(this._properties, 'polyhedronPositionZ', -10, 10).step(0.1).onChange((value) => {
			this._polyhedron.position.z = value;
		});
		folderTransformation.add(this._properties, 'polyhedronRotationX', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._polyhedron.rotation.x = value;
		});
		folderTransformation.add(this._properties, 'polyhedronRotationY', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._polyhedron.rotation.y = value;
		});
		folderTransformation.add(this._properties, 'polyhedronRotationZ', 0, 2*Math.PI).step(0.01).onChange((value) => {
			this._polyhedron.rotation.z = value;
		});
		folderTransformation.add(this._properties, 'polyhedronScaleX', 0.1, 10).step(0.1).onChange((value) => {
			this._polyhedron.scaling.x = value;
		});
		folderTransformation.add(this._properties, 'polyhedronScaleY', 0.1, 10).step(0.1).onChange((value) => {
			this._polyhedron.scaling.y = value;
		});
		folderTransformation.add(this._properties, 'polyhedronScaleZ', 0.1, 10).step(0.1).onChange((value) => {
			this._polyhedron.scaling.z = value;
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
