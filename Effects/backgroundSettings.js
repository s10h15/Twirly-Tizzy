export function drawBackgroundSettings(ctx, width, height, bootTime, scaleRate) {
    const elapsed = (performance.now() - bootTime) / 1000;
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.fillStyle = "#303030ff";
    ctx.fillRect(0, 0, width, height);

    const numArms = 30;
    const zoomSpeed = 0.1;
    const rotateSpeed = 0.8;
    const layers = 15;

    ctx.save();
    ctx.translate(centerX, centerY);

    for (let i = layers; i > 0; i--) {
        const progress = (i / layers + (elapsed * zoomSpeed)) % 1;
        const radius = Math.pow(progress, 3) * Math.max(width, height) * 1.5;
        const alpha = 1 - progress;

        ctx.beginPath();
        for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
            const spiralOffset = Math.log(radius + 1) * 2;
            const rotation = elapsed * rotateSpeed + spiralOffset;

            const dist = radius * (1 + 0.2 * Math.sin(angle * numArms + rotation));
            const x = Math.cos(angle) * dist;
            const y = Math.sin(angle) * dist;

            if (angle === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.closePath();

        ctx.strokeStyle = `rgba(0, 0, 0, ${alpha})`;
        ctx.lineWidth = 2 + (progress * 10) * scaleRate;
        ctx.stroke();
    }

    ctx.restore();
}
