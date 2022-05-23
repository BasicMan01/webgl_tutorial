/* globals BABYLON */

class BabylonHelper {
	static createAxesHelper(size, scene) {
		const axesMesh = new BABYLON.Mesh("axesHelper", scene);

		const axesX = BABYLON.Mesh.CreateLines("axesX", [
			new BABYLON.Vector3.Zero(),
			new BABYLON.Vector3(size, 0, 0)
		], scene);

		const axesY = BABYLON.Mesh.CreateLines("axesY", [
			new BABYLON.Vector3.Zero(),
			new BABYLON.Vector3(0, size, 0)
		], scene);

		const axesZ = BABYLON.Mesh.CreateLines("axesZ", [
			new BABYLON.Vector3.Zero(),
			new BABYLON.Vector3(0, 0, size)
		], scene);

		axesX.color = new BABYLON.Color3(1, 0, 0);
		axesY.color = new BABYLON.Color3(0, 1, 0);
		axesZ.color = new BABYLON.Color3(0, 0, 1);

		axesX.parent = axesMesh;
		axesY.parent = axesMesh;
		axesZ.parent = axesMesh;

		return axesMesh;
	}

	static createGridHelper(size, scene) {
		const gridMesh = new BABYLON.Mesh("gridHelper", scene);

		const start =  size / -2;
		const end = start + size;
		const color = new BABYLON.Color3.FromInts(112, 112, 112);

		for (let i = start; i <= end; ++i) {
			const lineX = BABYLON.Mesh.CreateLines('gridHelperLine', [
				new BABYLON.Vector3(start, 0, i),
				new BABYLON.Vector3(end, 0, i)
			], scene);

			const lineZ = BABYLON.Mesh.CreateLines('gridHelperLine', [
				new BABYLON.Vector3(i, 0, start),
				new BABYLON.Vector3(i, 0, end)
			], scene);

			lineX.color = color;
			lineZ.color = color;

			lineX.parent = gridMesh;
			lineZ.parent = gridMesh;
		}

		return gridMesh;
	}
}

export default BabylonHelper;
