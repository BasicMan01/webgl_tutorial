class HelperUtil {
	static addOutput(htmlLine) {
		const output = document.getElementById('output');

		htmlLine = htmlLine.replace(/ /g, '&nbsp;');

		output.innerHTML += '<div>' + htmlLine + '</div>';
	}

	static cssColorToHex(cssColor) {
		return cssColor.replace('#', '0x');
	}

	static cssColorToRgb(cssColor) {
		const colorInt = parseInt(cssColor.replace('#', ''), 16);

		return {
			r: (colorInt >> 16) & 255,
			g: (colorInt >> 8) & 255,
			b: colorInt & 255
		};
	}

	static resetOutput() {
		document.getElementById('output').innerHTML = '';
	}

	static roundDecimal(value, decimalPlace) {
		const factor = Math.pow(10, decimalPlace);

		return Math.round(value * factor) / factor;
	}

	static vectorToString(vector) {
		const result =
			HelperUtil.roundDecimal(vector.x, 6).toFixed(6) + ', ' +
			HelperUtil.roundDecimal(vector.y, 6).toFixed(6) + ', ' +
			HelperUtil.roundDecimal(vector.z, 6).toFixed(6);

		return result;
	}
}

export default HelperUtil;
