import { createTexture } from "../Helpers/textures.js";
import { getAutoResizedShapeTextureVaiables, getShapeCenter } from "../math.js";
import { closestSegmentPoint } from "../Helpers/collision.js";
import { normalIsCollidesCircle, normalIsPointInside } from "../Helpers/collision.js";

export function getPortal(vertexes, images, isTeleporterOrEndpoint, uniqueName, targetPortalName) {
    const portal = {
        vertexes: vertexes,
        name: "portal",
        isShouldDisappear: false,
        id: Math.random() * Number.MAX_SAFE_INTEGER,
        gridIndexes: [],

        textureX: 0,
        textureY: 0,
        texture: null,
        textureWidth: 0,
        textureHeight: 0,
        imageToUseInTexture: isTeleporterOrEndpoint ? (images.portalTeleporter ?? null) : (images.portalEndpoint ?? null),

        isSelected: false,
        isTeleporter: isTeleporterOrEndpoint,
        name: uniqueName,
        targetPortalName: targetPortalName,
        centerX: 0,
        centerY: 0,
        targetX: null,
        targetY: null,

        updateCenter() {
            [this.centerX, this.centerY] = getShapeCenter(this.vertexes);
        },

        isPointInside(x, y) {
            return normalIsPointInside(this.vertexes, x, y);
        },

        draw(ctx, offsetX, offsetY, zoomInRate) {
            let textureOffsetY = this.isSelected ? -5 : 0;
            if (this.texture) {
                const x = (this.textureX - offsetX) * zoomInRate;
                const y = (this.textureY - offsetY) * zoomInRate;
                ctx.drawImage(this.texture, x, y + textureOffsetY, this.textureWidth * zoomInRate, this.textureHeight * zoomInRate);
            }

            const angle = Math.atan2(this.targetY - this.centerY, this.targetX - this.centerX);

            const screenX = (this.centerX - offsetX) * zoomInRate;
            const screenY = (this.centerY - offsetY) * zoomInRate;

            if (this.targetX !== null) {
                const radius = (this.textureWidth * 0.8) * zoomInRate;
                const arrowLength = 25 * zoomInRate;
                const arrowWidth = 15 * zoomInRate;
                ctx.save();
                ctx.translate(screenX, screenY);
                ctx.rotate(angle);
                ctx.beginPath();
                ctx.moveTo(radius + arrowLength, 0);
                ctx.lineTo(radius, -arrowWidth);
                ctx.lineTo(radius, arrowWidth);
                ctx.closePath();

                ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
                ctx.shadowBlur = 10 * zoomInRate;
                ctx.shadowColor = "white";
                ctx.fill();
                ctx.restore();
            }
        },

        drawDirectionalArrow(ctx, offsetX, offsetY, zoomInRate, angle) {
            const screenX = (this.centerX - offsetX) * zoomInRate;
            const screenY = (this.centerY - offsetY) * zoomInRate;
            const radius = (this.textureWidth / 1.5) * zoomInRate;

            ctx.save();
            ctx.translate(screenX, screenY);
            ctx.rotate(angle);

            ctx.beginPath();
            ctx.moveTo(radius, 0);
            ctx.lineTo(radius - 10 * zoomInRate, -5 * zoomInRate);
            ctx.lineTo(radius - 10 * zoomInRate, 5 * zoomInRate);
            ctx.closePath();

            ctx.fillStyle = "white";
            ctx.fill();
            ctx.restore();
        },

        drawHitbox(ctx, offsetX, offsetY, zoomInRate) {
            ctx.beginPath();
            ctx.moveTo((this.vertexes[0][0] - offsetX) * zoomInRate, (this.vertexes[0][1] - offsetY) * zoomInRate);

            for (let i = 1; i < this.vertexes.length; ++i) {
                ctx.lineTo((this.vertexes[i][0] - offsetX) * zoomInRate, (this.vertexes[i][1] - offsetY) * zoomInRate);
            }
            ctx.closePath();
            ctx.fillStyle = "gray";
            ctx.fill();
        },

        resolveCollisionCircle(x, y, radius) { },

        isCollidesCircle(x, y, radius) {
            return normalIsCollidesCircle(this.vertexes, x, y, radius);
        },

        getVertexes() {
            return this.vertexes;
        },

        generateTexture() {
            const size = 64;
            this.texture = createTexture(size, size, (ctx) => {
                ctx.clearRect(0, 0, size, size);

                if (this.imageToUseInTexture !== null) {
                    ctx.drawImage(this.imageToUseInTexture, 0, 0, size, size);
                }
            });

            const shapePosition = getAutoResizedShapeTextureVaiables(this.vertexes);
            this.textureX = shapePosition.x;
            this.textureY = shapePosition.y;
            this.textureWidth = shapePosition.size;
            this.textureHeight = shapePosition.size;
        },

        updateFrame(player, world, inventory, mouse, images, gameStepsCount) {
            if (this.targetX === null) {
                const portals = world.objects.portals;
                for (let i = 0; i < portals.length; ++i) {
                    const portal = portals[i];
                    if (portal.name == this.targetPortalName) {
                        this.targetX = portal.centerX;
                        this.targetY = portal.centerY;
                        return;
                    }
                }
            }
        },
        updateStep(player, world, inventory, mouse, images, gameStepsCount) {
            this.isSelected = this.isPointInside(player.x, player.y) || this.isCollidesCircle(player.x, player.y, player.radius);
            if (this.isSelected && player.isInteracting) {
                player.isInteracting = false;
                const portals = world.objects.portals;
                for (let i = 0; i < portals.length; ++i) {
                    const portal = portals[i];
                    if (portal.name == this.targetPortalName) {
                        player.x = portal.centerX;
                        player.y = portal.centerY;
                        break;
                    }
                }
            }
        }
    }
    portal.updateCenter();
    portal.generateTexture();
    return portal;
}