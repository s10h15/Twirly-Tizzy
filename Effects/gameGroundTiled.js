const SALT_X = 50.7;
const SALT_Y = 2.1;

function getStableRandom(col, row) {
    const hash = Math.sin((col + SALT_X) * 12.9898 + (row + SALT_Y) * 78.233) * 43758.5453123;
    return hash - Math.floor(hash);
}

export function drawGameGroundTiled(ctx, width, height, cameraX, cameraY, zoomInRate, images) {
    const tileSize = Math.floor(1000 * zoomInRate);
    const offsetX = Math.floor(-((cameraX * zoomInRate) % tileSize));
    const offsetY = Math.floor(-((cameraY * zoomInRate) % tileSize));

    const startX = offsetX <= 0 ? offsetX : offsetX - tileSize;
    const startY = offsetY <= 0 ? offsetY : offsetY - tileSize;

    ctx.globalAlpha = 1;

    for (let x = startX; x < width; x += tileSize) {
        for (let y = startY; y < height; y += tileSize) {
            const col = Math.round(((x / zoomInRate) + cameraX) / 1000);
            const row = Math.round(((y / zoomInRate) + cameraY) / 1000);

            const noise = getStableRandom(col, row);

            const isFlower = noise < 0.2;
            const img = isFlower ? images.grassTile : images.grassTileNoFlowers;

            ctx.drawImage(img, x, y, tileSize, tileSize);
        }
    }
}
