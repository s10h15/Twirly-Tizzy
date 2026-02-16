const LIGHT_COLOR = { r: 255, g: 255, b: 255 };
const LIGHT_RADIUS = 150;
const LIGHT_FLOW = 0.2;
const FADE_SPEED = 1;
const RESOLUTION_SCALE = 0.6;

let lightBuffer = null;
let lightCtx = null;

export function drawMouseLightEffect(ctx, width, height, mouseX, mouseY, isMousePressed) {
    const bufferW = Math.floor(width * RESOLUTION_SCALE);
    const bufferH = Math.floor(height * RESOLUTION_SCALE);

    if (!lightBuffer || lightBuffer.width !== bufferW || lightBuffer.height !== bufferH) {
        lightBuffer = document.createElement('canvas');
        lightBuffer.width = bufferW;
        lightBuffer.height = bufferH;
        lightCtx = lightBuffer.getContext('2d', { willReadFrequently: true });
    }

    const imgData = lightCtx.getImageData(0, 0, bufferW, bufferH);
    const data = imgData.data;

    if (isMousePressed) {
        const sMouseX = mouseX * RESOLUTION_SCALE;
        const sMouseY = mouseY * RESOLUTION_SCALE;
        const sRadius = LIGHT_RADIUS * RESOLUTION_SCALE;

        for (let i = 0; i < data.length; i += 4) {
            const px = (i / 4) % bufferW;
            const py = Math.floor((i / 4) / bufferW);
            const dx = px - sMouseX;
            const dy = py - sMouseY;
            const distSq = dx * dx + dy * dy;

            if (distSq <= sRadius * sRadius) {
                const dist = Math.sqrt(distSq);
                const falloff = Math.pow(1 - (dist / sRadius), 2);

                if (Math.random() < (falloff * LIGHT_FLOW)) {
                    data[i] = LIGHT_COLOR.r;
                    data[i + 1] = LIGHT_COLOR.g;
                    data[i + 2] = LIGHT_COLOR.b;
                    data[i + 3] = Math.min(255, data[i + 3] + 50);
                }
            }
        }
    } else {
        for (let i = 3; i < data.length; i += 4) {
            if (data[i] > 0) {
                data[i] = Math.max(0, data[i] - FADE_SPEED);
            }
        }
    }

    lightCtx.putImageData(imgData, 0, 0);

    ctx.save();
    ctx.drawImage(lightBuffer, 0, 0, bufferW, bufferH, 0, 0, width, height);
    ctx.restore();
}
