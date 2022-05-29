class Vector3 {
	constructor(x = 0, y = 0, z = 0) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	add(vector) {
		return new Vector3(this.x + vector.x, this.y + vector.y, this.z + vector.z);
	}

	length() {
		return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2));
	}

	normalize() {
		const l = this.length();

		return new Vector3(this.x / l, this.y / l, this.z / l);
	}

	sub(vector) {
		return new Vector3(this.x - vector.x, this.y - vector.y, this.z - vector.z);
	}

	toString() {
		return 'x: ' + this.x + ', y: ' + this.y + ', z: ' + this.z;
	}
}

export default Vector3;
