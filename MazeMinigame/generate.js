export function generateMazeForMinigame(size) {
    const mapSize = size % 2 === 0 ? size + 1 : size;

    const grid = Array.from({ length: mapSize }, () => Array(mapSize).fill(1));

    function carve(x, y) {
        grid[y][x] = 0;

        const directions = [
            [0, -2], [0, 2], [-2, 0], [2, 0]
        ].sort(() => Math.random() - 0.5);

        for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;

            if (nx > 0 && nx < mapSize && ny > 0 && ny < mapSize && grid[ny][nx] === 1) {
                grid[y + dy / 2][x + dx / 2] = 0;
                carve(nx, ny);
            }
        }
    }

    carve(1, 1);

    return grid;
}