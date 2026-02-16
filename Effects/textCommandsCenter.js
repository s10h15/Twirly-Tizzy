const LINE_HEIGHT = 18;
const IMAGE_RESERVE_HEIGHT = 240;
const X_OFFSET = 20;

let formattedCredits = [];

function setupText(rawText) {
    const lines = rawText.split('\n');
    let currentY = 0;
    formattedCredits = [];

    lines.forEach((line) => {
        const trimmed = line.trim();
        const imgMatch = trimmed.match(/<([^>|]+)(?:\|([^>]+))?>/);

        if (imgMatch) {
            const imgName = imgMatch[1];
            const customScale = imgMatch[2] ? parseFloat(imgMatch[2]) : 1.0;

            const parts = trimmed.split(imgMatch[0]);

            if (parts[0].trim().length > 0) {
                formattedCredits.push({ type: "text", content: parts[0].trim(), y: currentY, height: LINE_HEIGHT });
                currentY += LINE_HEIGHT;
            }

            formattedCredits.push({
                type: "image",
                imageName: imgName,
                scale: customScale,
                y: currentY,
                height: IMAGE_RESERVE_HEIGHT
            });
            currentY += IMAGE_RESERVE_HEIGHT;

            if (parts[1].trim().length > 0) {
                formattedCredits.push({ type: "text", content: parts[1].trim(), y: currentY, height: LINE_HEIGHT });
                currentY += LINE_HEIGHT;
            }
        } else {
            formattedCredits.push({ type: "text", content: trimmed, y: currentY, height: LINE_HEIGHT });
            currentY += LINE_HEIGHT;
        }
    });
}

export function drawTextCommandsCenter(ctx, width, height, images, scaleRate) {
    const scrollOffset = 1000 * scaleRate;
    const centerX = (width / 2) + X_OFFSET;

    ctx.save();
    ctx.font = "bold 15px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.shadowColor = "rgba(0, 0, 96, 0.63)";
    ctx.shadowBlur = 10;
    ctx.fillStyle = "#ffd500ff";

    formattedCredits.forEach(item => {
        const screenYTop = height - (scrollOffset - item.y);

        if (screenYTop < -item.height || screenYTop > height) return;

        if (item.type === 'text') {
            ctx.fillText(item.content, centerX, screenYTop + (item.height / 2));
        }
        else if (item.type === 'image') {
            const img = images[item.imageName];
            if (img) {
                const maxH = item.height * 0.9;
                const aspect = img.width / img.height;

                const baseH = Math.min(maxH, img.height);
                const baseW = baseH * aspect;

                const drawW = baseW * item.scale;
                const drawH = baseH * item.scale;

                const centerY = screenYTop + (item.height / 2);

                ctx.drawImage(
                    img,
                    centerX - (drawW / 2),
                    centerY - (drawH / 2),
                    drawW,
                    drawH
                );
            }
        }
    });

    ctx.restore();
}

setupText(`'menu' - вернуться в меню / скипнуть миниигру
'ai' - включить / выключить режим ИИ (Иотрицательный Интеллект)
'seed on' - сделать сид НЕ случайным
'seed off' - сделать сид случайным
'seed your-seed-goes-here' - поставить сид и сделать его НЕ случайным
'record on' - начать запись
'record off' - сохранить запись
<stupidArrowUp|0.5>
и чо ты большего да ожидал
я ебал твою мать`);