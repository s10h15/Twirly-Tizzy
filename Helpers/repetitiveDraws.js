export function drawEquipableObject(ctx, offsetX, offsetY, zoomInRate, texture, textureX, textureY, textureWidth, textureHeight, numToGive, isSelected) {
    let textureOffsetY = 0;
    if (isSelected) {
        textureOffsetY = -5;
    }
    if (texture == null) {
        return;
    }

    const drawW = textureWidth * zoomInRate;
    const drawH = textureHeight * zoomInRate;
    const x = (textureX - offsetX) * zoomInRate;
    const y = (textureY - offsetY) * zoomInRate + textureOffsetY;

    ctx.drawImage(texture, x, y, drawW, drawH);

    if (numToGive > 1) {
        ctx.font = `bold ${40 * zoomInRate}px Arial`;
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2 * zoomInRate;

        ctx.textAlign = "start";
        ctx.textBaseline = "alphabetic";

        const padding = 2 * zoomInRate;
        const textX = x + drawW - padding;
        const textY = y + drawH - padding;

        ctx.strokeText(numToGive, textX, textY);
        ctx.fillText(numToGive, textX, textY);
    }
}