import { ScaledClientRect } from '../interfaces';

export function getScaledClientRect(clientRect: ClientRect, displayScale: { x: number; y: number }): ScaledClientRect {
	return {
		left: clientRect.left / displayScale.x,
		top: clientRect.top / displayScale.y,
		bottom: clientRect.bottom / displayScale.y,
		right: clientRect.right / displayScale.x,
		width: clientRect.width / displayScale.x,
		height: clientRect.height / displayScale.y,
		displayScale,
	};
}
