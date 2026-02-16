import { closestSegmentPoint, isRayIntersectsLine } from "../Helpers/collision.js";
import { normalResolveCollisionCircle } from "../Helpers/collision.js";
import { createTexture } from "../Helpers/textures.js";
import { getAutoResizedShapeTextureVariablesRectangle, getDistance, getShapeCenter, getSmallestEnclosingCircle } from "../math.js";
import { normalIsCollidesCircle, normalIsPointInside } from "../Helpers/collision.js";

const twoPI = Math.PI * 2;

export function getBlackHole(vertexes, recommendedTextureAspectRatio, textureResolution = 1024) {
    const blackHole = {
        vertexes: vertexes,
        name: "blackHole",
        isShouldDisappear: false,
        id: Math.random() * Number.MAX_SAFE_INTEGER,
        gridIndexes: [],

        textureX: 0,
        textureY: 0,
        texture: null,
        textureWidth: 0,
        textureHeight: 0,
        recommendedTextureAspectRatio: recommendedTextureAspectRatio,
        textureResolution: textureResolution,

        centerX: 0,
        centerY: 0,
        enclosingCircleX: 0,
        enclosingCircleY: 0,
        enclosingCircleRadius: 0,

        updateEnclosingCircle() {
            const circle = getSmallestEnclosingCircle(this.vertexes);
            this.enclosingCircleX = circle.x;
            this.enclosingCircleY = circle.y;
            this.enclosingCircleRadius = circle.r;
        },

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
            if (this.texture == null) {
                return;
            }
            const x = (this.textureX - offsetX) * zoomInRate;
            const y = (this.textureY - offsetY) * zoomInRate;
            ctx.globalAlpha = 0.7;
            ctx.drawImage(this.texture, x, y, this.textureWidth * zoomInRate, this.textureHeight * zoomInRate);
            ctx.globalAlpha = 1;
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

        generateTexture() {
            const height = this.textureResolution;
            const baseResolution = 128;
            const scaleRate = height / baseResolution;
            const width = height * this.recommendedTextureAspectRatio;

            const randomLoops = 2 + Math.random() * 3;
            const hueShift = Math.random() * 360;
            const lightnessShift = (Math.random() - 0.5) * 20;
            const spiralStartAngle = Math.random() * Math.PI * 2;

            this.texture = createTexture(width, height, (ctx) => {
                const centerX = width / 2;
                const centerY = height / 2;
                const maxRadius = Math.min(width, height) / 2;

                const edgeFade = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);
                edgeFade.addColorStop(0, `hsla(${hueShift}, 50%, ${10 + lightnessShift}%, 1)`);
                edgeFade.addColorStop(0.7, `hsla(${hueShift}, 60%, ${5 + lightnessShift}%, 0.8)`);
                edgeFade.addColorStop(1, 'rgba(0, 0, 0, 0)');

                ctx.clearRect(0, 0, width, height);
                ctx.fillStyle = edgeFade;
                ctx.fillRect(0, 0, width, height);

                for (let i = 0; i < 2000; i++) {
                    const rx = Math.random() * width;
                    const ry = Math.random() * height;
                    const dist = Math.hypot(rx - centerX, ry - centerY);

                    if (dist < maxRadius) {
                        const alpha = (1 - dist / maxRadius) * 0.4;
                        const pSize = 1.2 * scaleRate;
                        ctx.fillStyle = `hsla(${hueShift + (Math.random() * 40 - 20)}, 70%, 80%, ${alpha * 0.25})`;
                        ctx.fillRect(rx, ry, pSize, pSize);
                    }
                }

                const points = 4000;
                for (let i = 0; i < points; i++) {
                    const progress = i / points;
                    const angle = spiralStartAngle + (progress * Math.PI * 2 * randomLoops);
                    const radius = progress * maxRadius * 0.95;

                    const x = centerX + Math.cos(angle) * radius;
                    const y = centerY + Math.sin(angle) * radius;

                    const thickness = (2 * scaleRate) * (1.2 - progress * 0.4);
                    const h = (hueShift + (progress * 30)) % 360;
                    const s = 10 + (progress * 50);
                    const l = 30 + (progress * 40) + lightnessShift;

                    ctx.fillStyle = `hsla(${h}, ${s}%, ${l}%, 0.06)`;
                    ctx.fillRect(x - thickness / 2, y - thickness / 2, thickness, thickness);
                }

                const coreSize = 20 * scaleRate;
                const innerGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreSize);
                innerGlow.addColorStop(0, 'black');
                innerGlow.addColorStop(0.5, `hsla(${hueShift}, 80%, 5%, 0.95)`);
                innerGlow.addColorStop(1, `hsla(${hueShift}, 80%, 20%, 0)`);

                ctx.fillStyle = innerGlow;
                ctx.beginPath();
                ctx.arc(centerX, centerY, coreSize, 0, Math.PI * 2);
                ctx.fill();
            });

            const shapePos = getAutoResizedShapeTextureVariablesRectangle(this.vertexes);
            this.textureX = shapePos.x;
            this.textureY = shapePos.y;
            this.textureWidth = shapePos.width;
            this.textureHeight = shapePos.height;
        },

        resolveCollisionCircle(x, y, radius) { },

        updateCenter() {
            [this.centerX, this.centerY] = getShapeCenter(this.vertexes);
        },

        updateFrame() {

        },
        updateStep(player, world, inventory, mouse) {
            const dx = this.centerX - player.x;
            const dy = this.centerY - player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (!player.isDead && distance < player.radius) {
                player.isDead = true;
            }

            if (!player.isDead && this.isCollidesCircle(player.x, player.y, player.radius) || this.isPointInside(player.x, player.y)) {
                if (distance > 0.1) {
                    const dirX = dx / distance;
                    const dirY = dy / distance;
                    const maxForce = 500;
                    const pullStrength = Math.min(maxForce, 1500 / distance);

                    player.x += dirX * pullStrength;
                    player.y += dirY * pullStrength;
                }
            }
        },
    };
    blackHole.generateTexture();
    blackHole.updateCenter();
    blackHole.updateEnclosingCircle();
    return blackHole;
}