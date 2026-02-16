import { closestSegmentPoint } from "./Helpers/collision.js";

const PI180 = Math.PI / 180;

export function getRays(numRays) {
	let rayDirections = [];
	for (let i = 0; i < numRays; ++i) {
		let angle = (i / numRays) * twoPI;
		let x = Math.cos(angle);
		let y = Math.sin(angle);
		rayDirections.push({ x, y });
	}
	return rayDirections;
}

function getMaxLengthPoint(x, y, dx, dy, maxLength) {
	let scale = maxLength / Math.sqrt(dx * dx + dy * dy);
	return {
		x: x + dx * scale,
		y: y + dy * scale,
		length: maxLength
	};
}

export function getRayHit(x, y, dx, dy, minX, minY, maxX, maxY, maxLength) {
	let tNearX = (minX - x) / dx;
	let tFarX = (maxX - x) / dx;
	let tNearY = (minY - y) / dy;
	let tFarY = (maxY - y) / dy;

	if (tNearX > tFarX) [tNearX, tFarX] = [tFarX, tNearX];
	if (tNearY > tFarY) [tNearY, tFarY] = [tFarY, tNearY];

	let tNear = Math.max(tNearX, tNearY);
	let tFar = Math.min(tFarX, tFarY);

	if (tNear > tFar || tFar < 0) {
		return getMaxLengthPoint(x, y, dx, dy, maxLength);
	}

	let hitX = x + tNear * dx;
	let hitY = y + tNear * dy;
	let length = Math.sqrt((hitX - x) ** 2 + (hitY - y) ** 2);

	if (length > maxLength) {
		return getMaxLengthPoint(x, y, dx, dy, maxLength);
	}

	return {
		x: hitX,
		y: hitY,
		length
	};
}

export function getDistance(x1, y1, x2, y2) {
	const distanceX = x2 - x1;
	const distanceY = y2 - y1;
	return Math.sqrt(distanceX * distanceX + distanceY * distanceY);
}

export function getRotatedDirection(x, y, degrees) {
	const radians = degrees * PI180;
	const rotatedX = x * Math.cos(radians) - y * Math.sin(radians);
	const rotatedY = x * Math.sin(radians) + y * Math.cos(radians);
	return [rotatedX, rotatedY];
}

export function getPath(grid, startX, startY, goalX, goalY) {
	const rows = grid.length,
		cols = grid[0].length;
	if (startX < 0 || startX >= cols || startY < 0 || startY >= rows ||
		grid[startY][startX] || grid[goalY][goalX]) return null;

	const h = (x, y) => Math.abs(x - goalX) + Math.abs(y - goalY);
	const openSet = new Map();
	const closedSet = new Set();
	const dirs = [[0, -1], [1, 0], [0, 1], [-1, 0]];

	openSet.set(`${startX},${startY}`, { x: startX, y: startY, g: 0, h: h(startX, startY), f: h(startX, startY) });

	while (openSet.size) {
		let current = Array.from(openSet.entries()).reduce((a, b) => a[1].f <= b[1].f ? a : b)[1];
		let currentKey = `${current.x},${current.y}`;

		if (current.x == goalX && current.y == goalY) {
			const path = [];
			while (current) {
				path.unshift([current.x, current.y]);
				current = current.parent;
			}
			return path;
		}

		openSet.delete(currentKey);
		closedSet.add(currentKey);

		for (const [dx, dy] of dirs) {
			const newX = current.x + dx,
				newY = current.y + dy;
			const newKey = `${newX},${newY}`;

			if (newX < 0 || newX >= cols || newY < 0 || newY >= rows ||
				grid[newY][newX] || closedSet.has(newKey)) continue;

			const gScore = current.g + 1;
			const existing = openSet.get(newKey);

			if (!existing) {
				openSet.set(newKey, {
					x: newX,
					y: newY,
					g: gScore,
					h: h(newX, newY),
					f: gScore + h(newX, newY),
					parent: current
				});
			} else if (gScore < existing.g) {
				existing.g = gScore;
				existing.f = gScore + existing.h;
				existing.parent = current;
			}
		}
	}
	return null;
}

export function getShapeCenter(vertexes) {
	if (!vertexes.length) return [0, 0];

	const sum = vertexes.reduce((acc, curr) => {
		return [acc[0] + curr[0], acc[1] + curr[1]];
	}, [0, 0]);

	return [sum[0] / vertexes.length, sum[1] / vertexes.length];
}

function welzl(P, n, R) {
	if (n === 0 || R.length === 3) {
		return getTrivialCircle(R);
	}
	const p = P[n - 1];
	const d = welzl(P, n - 1, R);

	if (isPointInCircle(d, p)) {
		return d;
	}
	return welzl(P, n - 1, [...R, p]);
}
function isPointInCircle(c, p) {
	const dx = c.x - p[0];
	const dy = c.y - p[1];
	return Math.sqrt(dx * dx + dy * dy) <= c.r + 1e-9;
}
function getTrivialCircle(R) {
	if (R.length === 0) return { x: 0, y: 0, r: 0 };
	if (R.length === 1) return { x: R[0][0], y: R[0][1], r: 0 };
	if (R.length === 2) {
		const [p1, p2] = R;
		const x = (p1[0] + p2[0]) / 2;
		const y = (p1[1] + p2[1]) / 2;
		const r = Math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2) / 2;
		return { x, y, r };
	}
	const [A, B, C] = R;
	const D = 2 * (A[0] * (B[1] - C[1]) + B[0] * (C[1] - A[1]) + C[0] * (A[1] - B[1]));
	const x = ((A[0] ** 2 + A[1] ** 2) * (B[1] - C[1]) + (B[0] ** 2 + B[1] ** 2) * (C[1] - A[1]) + (C[0] ** 2 + C[1] ** 2) * (A[1] - B[1])) / D;
	const y = ((A[0] ** 2 + A[1] ** 2) * (C[0] - B[0]) + (B[0] ** 2 + B[1] ** 2) * (A[0] - C[0]) + (C[0] ** 2 + C[1] ** 2) * (B[0] - A[0])) / D;
	const r = Math.sqrt((A[0] - x) ** 2 + (A[1] - y) ** 2);
	return { x, y, r };
}

export function getSmallestEnclosingCircle(vertices) {
	if (!vertices.length) return { x: 0, y: 0, r: 0 };
	const points = [...vertices].sort(() => Math.random() - 0.5);
	return welzl(points, points.length, []);
}

export function getAutoResizedShapeTextureVaiables(vertices) {
	if (!vertices.length) return null;
	const sumX = vertices.reduce((acc, v) => acc + v[0], 0);
	const sumY = vertices.reduce((acc, v) => acc + v[1], 0);
	const centerX = sumX / vertices.length;
	const centerY = sumY / vertices.length;
	const xs = vertices.map(v => v[0]);
	const ys = vertices.map(v => v[1]);
	const width = Math.max(...xs) - Math.min(...xs);
	const height = Math.max(...ys) - Math.min(...ys);
	const size = Math.max(width, height);
	const textureX = centerX - size * 0.5;
	const textureY = centerY - size * 0.5;
	return {
		x: textureX,
		y: textureY,
		size: size
	};
}
export function getAutoResizedShapeTextureVariablesRectangle(vertices) {
	if (!vertices.length) return null;

	const xs = vertices.map(v => v[0]);
	const ys = vertices.map(v => v[1]);
	const minX = Math.min(...xs);
	const maxX = Math.max(...xs);
	const minY = Math.min(...ys);
	const maxY = Math.max(...ys);

	const width = maxX - minX;
	const height = maxY - minY;

	const textureX = minX;
	const textureY = minY;

	return {
		x: textureX,
		y: textureY,
		width: width,
		height: height 
	};
}
export function getRectangleVertexes(x, y, width, height) {
	const topLeft = [x, y];
	const topRight = [x + width, y];
	const bottomRight = [x + width, y + height];
	const bottomLeft = [x, y + height];
	return [
		topLeft,
		topRight,
		bottomRight,
		bottomLeft
	];
}
export function getRectangleVertexesRotated(x, y, width, height, rotationDegrees = 0) {
	const corners = [
		[x, y],
		[x + width, y], 
		[x + width, y + height],
		[x, y + height]
	];

	const centerX = x + width / 2;
	const centerY = y + height / 2;

	const rad = (rotationDegrees * Math.PI) / 180;
	const cos = Math.cos(rad);
	const sin = Math.sin(rad);

	return corners.map(([px, py]) => {
		const dx = px - centerX;
		const dy = py - centerY;

		const rotatedX = dx * cos - dy * sin;
		const rotatedY = dx * sin + dy * cos;

		return [rotatedX + centerX, rotatedY + centerY];
	});
}
export function getCircleVertexes(x, y, radius, numSides) {
	const vertices = [];

	const sides = Math.max(3, numSides);

	for (let i = 0; i < sides; i++) {
		const angle = (i / sides) * 2 * Math.PI - Math.PI / 2;

		const vx = x + radius * Math.cos(angle);
		const vy = y + radius * Math.sin(angle);

		vertices.push([vx, vy]);
	}

	return vertices;
}
export function isShapeCollidesCircle(vertexes, x, y, radius) {
	for (let i = 0; i < vertexes.length; ++i) {
		const start = vertexes[i];
		const end = vertexes[(i + 1) % vertexes.length];

		const point = closestSegmentPoint(x, y, start, end);

		const dx = x - point[0];
		const dy = y - point[1];
		const distance = Math.sqrt(dx * dx + dy * dy);

		if (distance < radius) {
			return true;
		}
	}
	return false;
}

export function isPointInsideShape(vertexes, x, y) {
	let inside = false;
	for (let i = 0, j = vertexes.length - 1; i < vertexes.length; j = ++i) {
		const xi = vertexes[i][0],
			yi = vertexes[i][1];
		const xj = vertexes[j][0],
			yj = vertexes[j][1];

		const intersect = ((yi > y) != (yj > y)) &&
			(x < (xj - xi) * (y - yi) / (yj - yi) + xi);
		if (intersect) inside = !inside;
	}
	return inside;
}

export function isPointInsideCircle(pointX, pointY, circleX, circleY, circleRadius) {
	const dx = pointX - circleX;
	const dy = pointY - circleY;

	const distanceSquared = (dx * dx) + (dy * dy);
	const radiusSquared = circleRadius * circleRadius;

	return distanceSquared <= radiusSquared;
}

function projectShape(shape, axis) {
	let min = Infinity;
	let max = -Infinity;
	for (let i = 0; i < shape.length; i++) {
		const dot = shape[i][0] * axis[0] + shape[i][1] * axis[1];
		if (dot < min) min = dot;
		if (dot > max) max = dot;
	}
	return [min, max];
}
function hasSeparatingAxis(shape1, shape2) {
	for (let i = 0; i < shape1.length; i++) {
		const p1 = shape1[i];
		const p2 = shape1[(i + 1) % shape1.length];
		const axis = [-(p2[1] - p1[1]), p2[0] - p1[0]];
		const [min1, max1] = projectShape(shape1, axis);
		const [min2, max2] = projectShape(shape2, axis);
		if (max1 < min2 || max2 < min1) {
			return true;
		}
	}
	return false;
}
export function isShapeCollidesShape(shapeA, shapeB) {
	if (hasSeparatingAxis(shapeA, shapeB)) return false;
	if (hasSeparatingAxis(shapeB, shapeA)) return false;
	return true;
}

export function downloadUint8ArrayData(data, filename = 'data.bin') {
	const blob = new Blob([data], { type: 'application/octet-stream' });

	const url = URL.createObjectURL(blob);

	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();

	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

export async function decodeFileToArray16(path) {
	const response = await fetch(path);

	if (!response.ok) {
		throw new Error(`Failed to load file at ${path}: ${response.statusText}`);
	}

	const buffer = await response.arrayBuffer();

	const int16Array = new Int16Array(buffer);

	return Array.from(int16Array);
}

export function downloadTextAsFile(text, filename = 'data.txt') {
	const blob = new Blob([text], { type: 'text/plain' });

	const url = URL.createObjectURL(blob);

	const link = document.createElement('a');
	link.href = url;
	link.download = filename;

	document.body.appendChild(link);
	link.click();

	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}
export async function fetchFileAsString(path) {
	const response = await fetch(path);

	if (!response.ok) {
		throw new Error(`Failed to load file at ${path}: ${response.statusText}`);
	}

	const text = await response.text();

	return text;
}