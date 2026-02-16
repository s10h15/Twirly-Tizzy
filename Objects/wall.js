import { closestSegmentPoint, isRayIntersectsLine } from "../Helpers/collision.js";
import { normalResolveCollisionCircle } from "../Helpers/collision.js";
import { createTexture } from "../Helpers/textures.js";
import { getAutoResizedShapeTextureVariablesRectangle } from "../math.js";
import { normalIsCollidesCircle, normalIsPointInside } from "../Helpers/collision.js";

const twoPI = Math.PI * 2;

export function getWall(vertexes, recommendedTextureAspectRatio, isDrawHitbox = false, kills = false, canClip = true) {
	const wall = {
		vertexes: vertexes,
		name: "wall",
		isShouldDisappear: false,
		id: Math.random() * Number.MAX_SAFE_INTEGER,
		gridIndexes: [],

		textureX: 0,
		textureY: 0,
		texture: null,
		textureWidth: 0,
		textureHeight: 0,
		recommendedTextureAspectRatio: recommendedTextureAspectRatio,
		isDrawHitbox: isDrawHitbox,

		doesKill: kills,
		canClip: canClip,

		isPointInside(x, y) {
			return normalIsPointInside(this.vertexes, x, y);
		},
		isCollidesCircle(x, y, radius) {
			return normalIsCollidesCircle(this.vertexes, x, y, radius);
		},

		getVertexes() {
			return this.vertexes;
		},

		draw(ctx, offsetX, offsetY, zoomInRate) {
			if (this.isDrawHitbox) {
				this.drawHitbox(ctx, offsetX, offsetY, zoomInRate);
				return;
			}
			if (this.texture == null) {
				return;
			}
			const x = (this.textureX - offsetX) * zoomInRate;
			const y = (this.textureY - offsetY) * zoomInRate;
			ctx.drawImage(this.texture, x, y, this.textureWidth * zoomInRate, this.textureHeight * zoomInRate);
		},
		drawHitbox(ctx, offsetX, offsetY, zoomInRate) {
			ctx.beginPath();
			ctx.moveTo((this.vertexes[0][0] - offsetX) * zoomInRate, (this.vertexes[0][1] - offsetY) * zoomInRate);

			for (let i = 1; i < this.vertexes.length; ++i) {
				ctx.lineTo((this.vertexes[i][0] - offsetX) * zoomInRate, (this.vertexes[i][1] - offsetY) * zoomInRate);
			}
			ctx.closePath();
			ctx.fillStyle = this.doesKill ? "rgba(255, 0, 47, 0.8)" : "rgba(235,235,235,0.8)";
			ctx.fill();
		},

		generateTexture() {
			if (this.isDrawHitbox) {
				return;
			}

			const height = 128;
			const width = height * this.recommendedTextureAspectRatio;
			this.texture = createTexture(width, height, (ctx) => {
				ctx.clearRect(0, 0, width, height);
				for (let i = 0; i < 250; i++) {
					const radius = Math.random() * 10 + 1;
					const x = Math.random() * (width - 2 * radius) + radius;
					const y = Math.random() * (height - 2 * radius) + radius;
					const hue = Math.random() * 255;
					ctx.beginPath();
					ctx.arc(x, y, radius, 0, Math.PI * 2);
					ctx.fillStyle = `rgba(${hue}, ${hue}, ${hue}, 0.1)`;
					ctx.fill();
				}
			});

			const shapePosition = getAutoResizedShapeTextureVariablesRectangle(this.vertexes);
			this.textureX = shapePosition.x;
			this.textureY = shapePosition.y;
			this.textureWidth = shapePosition.width;
			this.textureHeight = shapePosition.height;
		},

		resolveCollisionCircle(x, y, radius) {
			if (!this.doesKill) {
				return normalResolveCollisionCircle(this.vertexes, x, y, radius);
			}
		},

		updateFrame(player, world, inventory, mouse, images) {

		},
		updateStep(player, world, inventory, mouse, images) {
			if (this.doesKill && this.isCollidesCircle(player.x, player.y, player.radius)) {
				player.isDead = true;
			}
			if (!this.canClip && this.isPointInside(player.x, player.y)) {
				this.isShouldDisappear = true;
			}
		},
	};
	wall.generateTexture();
	return wall;
}