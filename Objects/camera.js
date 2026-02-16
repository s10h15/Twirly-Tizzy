export function getCamera(scaleRate) {
	return {
		x: 0,
		y: 0,
		zoomInRate: 1 * scaleRate,
		zoomOutRate: 1 - 0.25,
		zoomInSpeed: 0.25,
		defaultZoomInRate: 1 * scaleRate,
		maxZoomInRate: 0.6 * scaleRate,
		minZoomInRate: 1 * scaleRate,

		originalZoom: 0,
		stepChangedZoom: 0,
		isChangingZoom: false,

		_zoomTarget: 0,
		_smoothDuration: 0,
		_stayDuration: 0,

		zoomForTime(absoluteTarget, smoothDuration, stayDuration, gameStepsCount) {
			this.isChangingZoom = true;
			this.originalZoom = this.zoomInRate;
			this.stepChangedZoom = gameStepsCount;

			this._zoomTarget = absoluteTarget;
			this._smoothDuration = smoothDuration;
			this._stayDuration = stayDuration;
		},

		updateStep(gameStepsCount) {
			if (!this.isChangingZoom) return;

			const elapsed = gameStepsCount - this.stepChangedZoom;
			const totalDuration = (this._smoothDuration * 2) + this._stayDuration;

			if (elapsed < this._smoothDuration) {
				let progress = elapsed / this._smoothDuration;
				let ease = 1 - Math.cos((progress * Math.PI) / 2);
				this.zoomInRate = this.originalZoom + (this._zoomTarget - this.originalZoom) * ease;
			}
			else if (elapsed < this._smoothDuration + this._stayDuration) {
				this.zoomInRate = this._zoomTarget;
			}
			else if (elapsed < totalDuration) {
				let outElapsed = elapsed - this._smoothDuration - this._stayDuration;
				let progress = outElapsed / this._smoothDuration;
				let ease = Math.cos((progress * Math.PI) / 2);
				this.zoomInRate = this.originalZoom + (this._zoomTarget - this.originalZoom) * ease;
			}
			else {
				this.zoomInRate = this.originalZoom;
				this.isChangingZoom = false;
			}
		},

		restart() {
			this._zoomTarget = 0;
			this._smoothDuration = 0;
			this._stayDuration = 0;
			this.originalZoom = 0;
			this.stepChangedZoom = 0;
			this.isChangingZoom = false;
			this.zoomInRate = this.maxZoomInRate;
		}
	};
}
