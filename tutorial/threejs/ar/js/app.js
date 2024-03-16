import * as THREE from 'three';

import { GUI } from '../../../../lib/threejs_158/examples/jsm/libs/lil-gui.module.min.js';
import { GLTFLoader } from '../../../../lib/threejs_158/examples/jsm/loaders/GLTFLoader.js';


document.addEventListener('DOMContentLoaded', () => {
	(() => new App(document.getElementById('webGlCanvas')))();
});


class App {
	constructor(canvas)	{
		this._canvas = canvas;
		this._canvasVideo = document.getElementById("canvasVideo");
		this._ctx = this._canvasVideo.getContext("2d");

		this._ambientLight = null;
		this._gltfModel = null;
		this._plane = null;
		this._stream = null;
		this._video = document.getElementById('video');
		this._videoTexture = null;

		this._scales = [1.0];
		this._scaleTemplates = {};
		this._templateImage = null;
		this._runImageTracking = false;

		this._properties = {
			'planeWidth': 12,
			'planeHeight': 12 / 1.77,
			'planePositionX': 0,
			'planePositionY': 0,
			'planePositionZ': -1.5,
			'arThreshold': 0.6
		};

		this._clock = new THREE.Clock();
		this._scene = new THREE.Scene();

		this._camera = new THREE.PerspectiveCamera(70, this._getCameraAspect(), 0.1, 500);
		this._camera.position.set(0, 0, 3.2);

		this._renderer = new THREE.WebGLRenderer({antialias: true});
		this._renderer.setClearColor(0x000000, 1);
		this._renderer.setPixelRatio(window.devicePixelRatio);
		this._renderer.setSize(this._getCanvasWidth(), this._getCanvasHeight());

		// add renderer to the DOM-Tree
		this._canvas.appendChild(this._renderer.domElement);

		window.addEventListener('click', this._onClickHandler.bind(this), false);
		window.addEventListener('resize', this._onResizeHandler.bind(this), false);

		this._init();
	}

	_init() {
		this._createGui();
		this._createObject();
		this._createLight();

		this._initVideo();
	}

	_createObject() {
		const gltfLoader = new GLTFLoader();

		const geometry = new THREE.PlaneGeometry(
			this._properties.planeWidth,
			this._properties.planeHeight
		);

		this._videoTexture = new THREE.VideoTexture(this._video);

		this._plane = new THREE.Mesh(
			geometry,
			new THREE.MeshBasicMaterial({
				color: '#FFFFFF',
				map: this._videoTexture,
				side: THREE.DoubleSide
			})
		);
		this._plane.position.set(
			this._properties.planePositionX,
			this._properties.planePositionY,
			this._properties.planePositionZ
		);
		this._scene.add(this._plane);

		this._templateImage = new Image();
		this._templateImage.src = "template.png";
		this._templateImage.onload = () => {
			this._runImageTracking = true;

			for (let i = 0; i < this._scales.length; ++i) {
				let scale = this._scales[i];

				this._scaleTemplates[scale] = this._createScaledTemplate(scale);
			}
		};

		gltfLoader.setResourcePath('../../../resources/texture/');
		gltfLoader.load('../../../resources/mesh/gltf/house.glb', (object) => {
			this._gltfModel = object.scene;
			this._gltfModel.visible = false;

			this._scene.add(this._gltfModel);
		}, this._onProgress, this._onError);
	}

	_initVideo() {
		navigator.mediaDevices.getUserMedia({
			audio: false,
			video: true
		}).then((stream) => {
			this._stream = stream;

			if ("srcObject" in this._video) {
				this._video.srcObject = stream;
			} else {
				this._video.src = window.URL.createObjectURL(stream);
			}

			setInterval(() => {
				if (this._runImageTracking) {
					// Capture the current frame from the video stream
					this._ctx.drawImage(this._video, 0, 0, this._canvasVideo.width, this._canvasVideo.height);
					let imageData = this._ctx.getImageData(0, 0, this._canvasVideo.width, this._canvasVideo.height);
					let src = cv.matFromImageData(imageData);

					// Convert the current frame to grayscale using OpenCV.js
					let gray = new cv.Mat();
					cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

					// Iterate over different scales of the template image
					for (let i = 0; i < this._scales.length; i++) {
						let scale = this._scales[i];

						// Convert the scaled template image to grayscale using OpenCV.js
						let templateCvMat = cv.imread(this._scaleTemplates[scale]);
						let templateGrayCvMat = new cv.Mat();
						cv.cvtColor(templateCvMat, templateGrayCvMat, cv.COLOR_RGBA2GRAY);

						// Perform template matching
						let result = new cv.Mat();
						cv.matchTemplate(gray, templateGrayCvMat, result, cv.TM_CCOEFF_NORMED);

						// Find the location of the best match
						let minMaxLoc = cv.minMaxLoc(result);
						let confidence = minMaxLoc.maxVal;

						// Check if the confidence exceeds the threshold
						if (confidence >= this._properties.arThreshold) {
							this._gltfModel.visible = true;
							break;
						} else {
							this._gltfModel.visible = false;
						}

						// Clean up
						templateCvMat.delete();
						templateGrayCvMat.delete();
						result.delete();
					}

					// Clean up
					gray.delete();
					src.delete();
				}

				this._render();
			}, 25);
		}).catch((error) => {
			console.error(error);
		});
	}

	_createScaledTemplate(scale) {
		// Resize the template image
		let scaledWidth = this._templateImage.width * scale;
		let scaledHeight = this._templateImage.height * scale;

		// Create a scaled canvas for the template image
		let templateCanvas = document.createElement("canvas");
		templateCanvas.width = scaledWidth;
		templateCanvas.height = scaledHeight;

		let templateCtx = templateCanvas.getContext("2d");
		templateCtx.drawImage(this._templateImage, 0, 0, scaledWidth, scaledHeight);

		return templateCanvas;
	}

	_createGui() {
		const gui = new GUI();

		const folderAr = gui.addFolder('AR Properties');
		folderAr.add(this._properties, 'arThreshold', 0, 1).step(0.01).onChange((value) => {
		});

		const folderTransformation = gui.addFolder('Video Plane Transformation');
		folderTransformation.add(this._properties, 'planePositionX', -10, 10).step(0.1).onChange((value) => {
			this._plane.position.x = value;
		});
		folderTransformation.add(this._properties, 'planePositionY', -10, 10).step(0.1).onChange((value) => {
			this._plane.position.y = value;
		});
		folderTransformation.add(this._properties, 'planePositionZ', -10, 10).step(0.1).onChange((value) => {
			this._plane.position.z = value;
		});

		gui.close();
	}

	_createLight() {
		this._ambientLight = new THREE.AmbientLight(
			this._properties.ambientColor,
			this._properties.ambientIntensity
		);
		this._scene.add(this._ambientLight);
	}

	_render() {
		const timeDelta = this._clock.getDelta();

		this._gltfModel.rotation.y += timeDelta;

		// use setInterval from image tracking for a better performance
		this._renderer.render(this._scene, this._camera);
	}

	_getCanvasHeight() { return this._canvas.offsetHeight; }
	_getCanvasWidth() { return this._canvas.offsetWidth; }

	_getCameraAspect() { return this._getCanvasWidth() / this._getCanvasHeight(); }

	_onError(xhr) {
		console.error(xhr);
	}

	_onProgress(xhr) {
		if (xhr.lengthComputable) {
			const percentComplete = xhr.loaded / xhr.total * 100;

			console.log(Math.round(percentComplete, 2) + '% downloaded');
		}
	}

	_onResizeHandler(event) {
		this._camera.aspect = this._getCameraAspect();
		this._camera.updateProjectionMatrix();

		this._renderer.setSize(this._getCanvasWidth(), this._getCanvasHeight());
	}

	_onClickHandler(event) {
		document.getElementById('video').play();
	}
}
