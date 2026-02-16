// const twoPI = Math.PI * 2;

// export function getTextMetrics(buttonWidth, buttonHeight, text, rate, fontName) {
// 	const canvas = document.createElement("canvas");
// 	const context = canvas.getContext("2d");
// 	let fontSize = 0;
// 	let textWidth;
// 	let textHeight;

// 	do {
// 		context.font = fontSize + "px " + fontName;
// 		textWidth = context.measureText(text).width;
// 		const metrics = context.measureText(text);
// 		textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
// 		fontSize++;
// 	} while (textWidth < (buttonWidth * rate));

// 	fontSize--;
// 	context.font = fontSize + "px " + fontName;
// 	const textMetrics = context.measureText(text);
// 	textWidth = textMetrics.width;
// 	textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
// 	const textX = (buttonWidth - textWidth) * 0.5;
// 	const textY = (buttonHeight + textHeight) * 0.5 - textMetrics.actualBoundingBoxDescent;

// 	fontSize *= 0.5;

// 	return { fontSize, textX, textY };
// }

// export function getButton(config) {
// 	const button = {
// 		posX: config.x * config.scaleRate,
// 		posY: config.y * config.scaleRate,
// 		sizeX: config.width * config.scaleRate,
// 		sizeY: config.height * config.scaleRate,
// 		endX: config.x * config.scaleRate + config.width * config.scaleRate,
// 		endY: config.y * config.scaleRate + config.height * config.scaleRate,
// 		originalWidth: config.width,
// 		originalHeight: config.height,
// 		key: config.key,
// 		isInvisible: config.isInvisible || true,
// 		isInvisibleOnPC: config.isInvisibleOnPC || false,
// 		isInvisible: config.isInvisible,
// 		isInvisibleOnPC: config.isInvisibleOnPC,
// 		iconTextureImage: config.textureImage || null,

// 		color: "rgba(68, 68, 68, 1)",
// 		textColor: "white",
// 		fontName: config.fontName || "Monospace",
// 		text: config.text,
// 		subText: config.subText,
// 		subTextColorNormal: config.subTextColorNormal || "#424242ff",
// 		subTextColorHovered: config.subTextColorHovered || "#8e8e8eb7",
// 		getNewTextFn: config.getNewTextFn,
// 		isExtraOutlineActive: config.isExtraOutlineActive || false,

// 		buttonToAlignWith: config.buttonToAlignWith,
// 		alignmentDirectionIndex: config.alignmentDirectionIndex,
// 		alignmentSpacing: config.alignmentSpacing,

// 		onClick: config.onClickFn,
// 		isClickable: true,
// 		isClickedWhileHovering: false,
// 		nextFrameIsClick: false,
// 		isHovering: false,
// 		isHeld: false,
// 		canBeHeldViaKeyboard: config.canBeHeldViaKeyboard ?? false,

// 		scaleRate: config.scaleRate,

// 		updateText() {
// 			let newText;
// 			if (this.getNewTextFn == undefined) {
// 				newText = this.text;
// 			} else {
// 				newText = this.getNewTextFn();
// 			}
// 			this.text = newText;
// 			const { fontSize, textX, textY } = getTextMetrics(this.sizeX, this.sizeY, this.text, 0.8, this.fontName);
// 			this.fontSize = fontSize;
// 			this.textX = textX;
// 			this.textY = textY;
// 		},

// 		alignToButton() {
// 			this.sizeX = this.originalWidth == undefined ? this.buttonToAlignWith.sizeX : this.originalWidth * this.scaleRate;
// 			this.sizeY = this.originalHeight == undefined ? this.buttonToAlignWith.sizeY : this.originalHeight * this.scaleRate;

// 			switch (this.alignmentDirectionIndex) {
// 				case 0:
// 				case 1:
// 					break;
// 				case 2:
// 					this.posX = this.buttonToAlignWith.posX + this.buttonToAlignWith.sizeX + this.alignmentSpacing * this.scaleRate;
// 					this.posY = this.buttonToAlignWith.posY;
// 					break;
// 				case 3:
// 					this.posY = this.buttonToAlignWith.posY + this.buttonToAlignWith.sizeY + this.alignmentSpacing * this.scaleRate;
// 					this.posX = this.buttonToAlignWith.posX;
// 					break;
// 				default:
// 					break;
// 			}

// 			this.updateText();

// 			this.endX = this.posX + this.sizeX;
// 			this.endY = this.posY + this.sizeY;
// 		},

// 		mouseInteract(mousePosX, mousePosY, mousePressStartX, mousePressStartY, isMousePressed) {
// 			if (this.isInvisible) {
// 				return;
// 			}

// 			this.isHovering = (
// 				mousePosX >= this.posX &&
// 				mousePosY >= this.posY &&
// 				mousePosX <= this.endX &&
// 				mousePosY <= this.endY
// 			);

// 			this.isHeld = (
// 				mousePressStartX >= this.posX &&
// 				mousePressStartY >= this.posY &&
// 				mousePressStartX <= this.endX &&
// 				mousePressStartY <= this.endY &&
// 				isMousePressed
// 			);

// 			if (this.isHovering) {
// 				if (this.isClickedWhileHovering && !isMousePressed) {
// 					this.nextFrameIsClick = true;
// 				}
// 				if (this.isHeld) {
// 					if (this.isClickable || this.nextFrameIsClick) {
// 						this.onClick();
// 						this.isClickable = false;
// 						this.isClickedWhileHovering = true;
// 						this.nextFrameIsClick = false;
// 					}
// 					this.updateText();
// 				}
// 			} else {
// 				if (!isMousePressed) this.isClickable = true;
// 				this.isClickedWhileHovering = false;
// 			}
// 			return this.isHeld;
// 		},

// 		draw(ctx, bootTime) {
// 			if (this.isInvisible) {
// 				return;
// 			}
// 			if (!isFinite(this.posX) || !isFinite(this.posY)) {
// 				return;
// 			}

// 			const cornerRadius = 35 * this.scaleRate;
// 			const borderWidth = 3;

// 			ctx.save();

// 			if (this.isHeld) {
// 				ctx.globalAlpha = 0.5;
// 			} else if (this.isHovering) {
// 				const elapsed = (performance.now() - bootTime) / 1000;
// 				const flickerSpeed = 10;
// 				const alpha = 0.8 + Math.sin(elapsed * flickerSpeed) * 0.2;
// 				ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
// 			}

// 			ctx.shadowColor = 'rgba(0, 0, 0, 1)';
// 			ctx.shadowBlur = 12;
// 			ctx.shadowOffsetY = 6;

// 			ctx.beginPath();
// 			ctx.roundRect(this.posX, this.posY, this.sizeX, this.sizeY, cornerRadius);

// 			let topColor = this.isHovering ? "#777777ff' : "#515151ff';
// 			let bottomColor = this.isHovering ? "#515151ff' : "#777777ff';
// 			const bgGradient = ctx.createLinearGradient(this.posX, this.posY, this.posX, this.posY + this.sizeY);
// 			bgGradient.addColorStop(0, topColor);
// 			bgGradient.addColorStop(1, bottomColor);

// 			ctx.fillStyle = bgGradient;
// 			ctx.fill();

// 			if (this.text) {
// 				ctx.font = "bold " + this.fontSize + "px " + this.fontName;
// 				ctx.textAlign = "center";
// 				ctx.textBaseline = "middle";
// 				ctx.fillStyle = this.isHovering ? "#ffffffb7' : "#ffffffff';
// 				ctx.fillText(this.text, this.posX + this.sizeX / 2, this.posY + this.sizeY / 2);
// 			}

// 			ctx.restore();
// 			ctx.beginPath();
// 			ctx.roundRect(this.posX, this.posY, this.sizeX, this.sizeY, cornerRadius);
// 			if (this.isExtraOutlineActive) {
// 				ctx.strokeStyle = "rgba(153, 255, 89, 1)";
// 			} else {
// 				ctx.strokeStyle = this.isHeld ? "#ffffffff" : "#b3b3b3ff";
// 			}
// 			ctx.lineWidth = borderWidth * this.scaleRate;
// 			ctx.stroke();

// 			if (this.iconTextureImage) {
// 				const iconScale = 0.7;
// 				const iconW = this.sizeX * iconScale;
// 				const iconH = this.sizeY * iconScale;
// 				const iconX = this.posX + (this.sizeX - iconW) / 2;
// 				const iconY = this.posY + (this.sizeY - iconH) / 2;
// 				ctx.drawImage(this.iconTextureImage, iconX, iconY, iconW, iconH);
// 			}

// 			if (this.subText) {
// 				const fontSize = 50 * this.scaleRate;
// 				ctx.font = "bold " + fontSize + "px " + this.fontName;
// 				ctx.textAlign = "center";
// 				ctx.textBaseline = "middle";
// 				ctx.fillStyle = this.isHovering ? this.subTextColorHovered : this.subTextColorNormal;
// 				const shiftFromCorner = 25 * this.scaleRate;
// 				ctx.fillText(this.subText, this.posX + this.sizeX - shiftFromCorner, this.posY + this.sizeY - shiftFromCorner);
// 			}
// 		},

// 		keyInteract(heldKeys) {
// 			if (heldKeys[this.key]) {
// 				this.onClick();
// 				this.updateText();
// 				this.isHeld = true;
// 				this.isHovering = true;
// 				if (!this.canBeHeldViaKeyboard) {
// 					delete heldKeys[this.key];
// 				}
// 			}
// 		},

// 		updateMisc(isPC) {
// 			if (!this.isInvisible) {
// 				this.isInvisible = this.isInvisibleOnPC && isPC;
// 			}

// 		}
// 	};

// 	button.updateText();
// 	if (button.buttonToAlignWith != undefined) {
// 		button.alignToButton();
// 	}

// 	return button;
// }

const twoPI = Math.PI * 2;

export function getTextMetrics(buttonWidth, buttonHeight, text, rate, fontName) {
	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d");
	let fontSize = 0;
	let textWidth;
	let textHeight;

	do {
		context.font = fontSize + "px " + fontName;
		textWidth = context.measureText(text).width;
		const metrics = context.measureText(text);
		textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
		fontSize++;
	} while (textWidth < (buttonWidth * rate));

	fontSize--;
	context.font = fontSize + "px " + fontName;
	const textMetrics = context.measureText(text);
	textWidth = textMetrics.width;
	textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
	const textX = (buttonWidth - textWidth) * 0.5;
	const textY = (buttonHeight + textHeight) * 0.5 - textMetrics.actualBoundingBoxDescent;

	fontSize *= 0.5;

	return { fontSize, textX, textY };
}

export function getButton(config) {
	const button = {
		posX: config.x * config.scaleRate,
		posY: config.y * config.scaleRate,
		sizeX: config.width * config.scaleRate,
		sizeY: config.height * config.scaleRate,
		endX: config.x * config.scaleRate + config.width * config.scaleRate,
		endY: config.y * config.scaleRate + config.height * config.scaleRate,
		originalWidth: config.width,
		originalHeight: config.height,
		key: config.key,

		// Restored exact original initialization logic to prevent invisibility bugs
		isInvisible: config.isInvisible || true,
		isInvisibleOnPC: config.isInvisibleOnPC || false,
		isInvisible: config.isInvisible,
		isInvisibleOnPC: config.isInvisibleOnPC,
		iconTextureImage: config.textureImage || null,

		// Customizable Colors for draw()
		color: "rgba(68, 68, 68, 1)",
		shadowColor: config.shadowColor || "rgba(0, 0, 0, 1)",
		bgTopHover: config.bgTopHover || "#777777ff",
		bgTopNormal: config.bgTopNormal || "#515151ff",
		bgBottomHover: config.bgBottomHover || "#515151ff",
		bgBottomNormal: config.bgBottomNormal || "#777777ff",
		textHoverColor: config.textHoverColor || "#ffffffb7",
		textNormalColor: config.textNormalColor || "#ffffffff",
		outlineExtraColor: config.outlineExtraColor || "rgba(153, 255, 89, 1)",
		outlineHeldColor: config.outlineHeldColor || "#ffffffff",
		outlineNormalColor: config.outlineNormalColor || "#b3b3b3ff",

		heldAlpha: config.heldAlpha ?? 0.5,
		hoverBaseAlpha: config.hoverBaseAlpha ?? 0.8,
		hoverFlickerRange: config.hoverFlickerRange ?? 0.2,
		flickerSpeed: config.flickerSpeed ?? 10,

		textColor: "white",
		fontName: config.fontName || "Monospace",
		englishText: config.englishText || " ",
		russianText: config.russianText || " ",
		text: config.text || config.englishText,
		subText: config.subText,
		subTextColorNormal: config.subTextColorNormal || "#424242ff",
		subTextColorHovered: config.subTextColorHovered || "#8e8e8eb7",
		getNewTextFn: config.getNewTextFn,
		isExtraOutlineActive: config.isExtraOutlineActive || false,
		isLastLanguageEnglish: true,

		buttonToAlignWith: config.buttonToAlignWith,
		alignmentDirectionIndex: config.alignmentDirectionIndex,
		alignmentSpacing: config.alignmentSpacing,

		onClick: config.onClickFn,
		isClickable: true,
		isClickedWhileHovering: false,
		nextFrameIsClick: false,
		isHovering: false,
		isHeld: false,
		canBeHeldViaKeyboard: config.canBeHeldViaKeyboard ?? false,

		scaleRate: config.scaleRate,

		updateText() {
			let newText;
			if (this.getNewTextFn == undefined) {
				newText = this.text;
			} else {
				newText = this.getNewTextFn();
			}
			this.text = newText;
			const { fontSize, textX, textY } = getTextMetrics(this.sizeX, this.sizeY, this.text, 0.8, this.fontName);
			this.fontSize = fontSize;
			this.textX = textX;
			this.textY = textY;
		},

		alignToButton() {
			this.sizeX = this.originalWidth == undefined ? this.buttonToAlignWith.sizeX : this.originalWidth * this.scaleRate;
			this.sizeY = this.originalHeight == undefined ? this.buttonToAlignWith.sizeY : this.originalHeight * this.scaleRate;

			switch (this.alignmentDirectionIndex) {
				case 0:
				case 1:
					break;
				case 2:
					this.posX = this.buttonToAlignWith.posX + this.buttonToAlignWith.sizeX + this.alignmentSpacing * this.scaleRate;
					this.posY = this.buttonToAlignWith.posY;
					break;
				case 3:
					this.posY = this.buttonToAlignWith.posY + this.buttonToAlignWith.sizeY + this.alignmentSpacing * this.scaleRate;
					this.posX = this.buttonToAlignWith.posX;
					break;
				default:
					break;
			}

			this.updateText();

			this.endX = this.posX + this.sizeX;
			this.endY = this.posY + this.sizeY;
		},

		mouseInteract(mousePosX, mousePosY, mousePressStartX, mousePressStartY, isMousePressed) {
			if (this.isInvisible) {
				return;
			}

			this.isHovering = (
				mousePosX >= this.posX &&
				mousePosY >= this.posY &&
				mousePosX <= this.endX &&
				mousePosY <= this.endY
			);

			this.isHeld = (
				mousePressStartX >= this.posX &&
				mousePressStartY >= this.posY &&
				mousePressStartX <= this.endX &&
				mousePressStartY <= this.endY &&
				isMousePressed
			);

			if (this.isHovering) {
				if (this.isClickedWhileHovering && !isMousePressed) {
					this.nextFrameIsClick = true;
				}
				if (this.isHeld) {
					if (this.isClickable || this.nextFrameIsClick) {
						this.onClick();
						this.isClickable = false;
						this.isClickedWhileHovering = true;
						this.nextFrameIsClick = false;
					}
					this.updateText();
				}
			} else {
				if (!isMousePressed) this.isClickable = true;
				this.isClickedWhileHovering = false;
			}
			return this.isHeld;
		},

		draw(ctx, bootTime) {
			if (this.isInvisible) {
				return;
			}
			if (!isFinite(this.posX) || !isFinite(this.posY)) {
				return;
			}

			const cornerRadius = 35 * this.scaleRate;
			const borderWidth = 3;

			ctx.save();

			if (this.isHeld) {
				ctx.globalAlpha = this.heldAlpha;
			} else if (this.isHovering) {
				const elapsed = (performance.now() - bootTime) / 1000;
				const alpha = this.hoverBaseAlpha + Math.sin(elapsed * this.flickerSpeed) * this.hoverFlickerRange;
				ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
			}

			ctx.shadowColor = this.shadowColor;
			ctx.shadowBlur = 12;
			ctx.shadowOffsetY = 6;

			ctx.beginPath();
			ctx.roundRect(this.posX, this.posY, this.sizeX, this.sizeY, cornerRadius);

			let topColor = this.isHovering ? this.bgTopHover : this.bgTopNormal;
			let bottomColor = this.isHovering ? this.bgBottomHover : this.bgBottomNormal;
			const bgGradient = ctx.createLinearGradient(this.posX, this.posY, this.posX, this.posY + this.sizeY);
			bgGradient.addColorStop(0, topColor);
			bgGradient.addColorStop(1, bottomColor);

			ctx.fillStyle = bgGradient;
			ctx.fill();

			if (this.text) {
				ctx.font = "bold " + this.fontSize + "px " + this.fontName;
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";
				ctx.fillStyle = this.isHovering ? this.textHoverColor : this.textNormalColor;
				ctx.fillText(this.text, this.posX + this.sizeX / 2, this.posY + this.sizeY / 2);
			}

			ctx.restore();
			ctx.beginPath();
			ctx.roundRect(this.posX, this.posY, this.sizeX, this.sizeY, cornerRadius);
			if (this.isExtraOutlineActive) {
				ctx.strokeStyle = this.outlineExtraColor;
			} else {
				ctx.strokeStyle = this.isHeld ? this.outlineHeldColor : this.outlineNormalColor;
			}
			ctx.lineWidth = borderWidth * this.scaleRate;
			ctx.stroke();

			if (this.iconTextureImage) {
				const iconScale = 0.7;
				const iconW = this.sizeX * iconScale;
				const iconH = this.sizeY * iconScale;
				const iconX = this.posX + (this.sizeX - iconW) / 2;
				const iconY = this.posY + (this.sizeY - iconH) / 2;
				ctx.drawImage(this.iconTextureImage, iconX, iconY, iconW, iconH);
			}

			if (this.subText) {
				const fontSize = 50 * this.scaleRate;
				ctx.font = "bold " + fontSize + "px " + this.fontName;
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";
				ctx.fillStyle = this.isHovering ? this.subTextColorHovered : this.subTextColorNormal;
				const shiftFromCorner = 25 * this.scaleRate;
				ctx.fillText(this.subText, this.posX + this.sizeX - shiftFromCorner, this.posY + this.sizeY - shiftFromCorner);
			}
		},

		keyInteract(heldKeys) {
			if (heldKeys[this.key]) {
				this.onClick();
				this.updateText();
				this.isHeld = true;
				this.isHovering = true;
				if (!this.canBeHeldViaKeyboard) {
					delete heldKeys[this.key];
				}
			}
		},

		updateMisc(isPC, isEnglish) {
			if (!this.isInvisible) {
				this.isInvisible = this.isInvisibleOnPC && isPC;
			}

			if (!!this.isLastLanguageEnglish !== !!isEnglish) {
				if (config.englishText && config.russianText) {
					this.isLastLanguageEnglish = isEnglish;
					this.text = isEnglish ? this.englishText : this.russianText;
					this.updateText();
				} else {
					this.isLastLanguageEnglish = isEnglish;
				}
			}
		}
	};

	button.updateText();
	if (button.buttonToAlignWith != undefined) {
		button.alignToButton();
	}

	return button;
}