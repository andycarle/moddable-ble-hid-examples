/*
 * Copyright (c) 2016-2021 Moddable Tech, Inc.
 *
 *   This file is part of the Moddable SDK.
 * 
 *   This work is licensed under the
 *       Creative Commons Attribution 4.0 International License.
 *   To view a copy of this license, visit
 *       <http://creativecommons.org/licenses/by/4.0>.
 *   or send a letter to Creative Commons, PO Box 1866,
 *   Mountain View, CA 94042, USA. 
 *
 */

import { } from "piu/MC";

import MouseService from "mouseService";

const WhiteSkin = Skin.template({fill: "white"});

const GAIN = 5;
const CLICK = 4;

const TouchpadContainer = Container.template($ => ({
	left: 0, right: 0, top: 0, bottom: 0, active: true, Skin: WhiteSkin,
	Behavior: class extends Behavior {
		onCreate(column, data) {
			
		}
		onTouchBegan(column, id, x, y){
			this.firstX = x;
			this.firstY = y;
			this.lastX = x;
			this.lastY = y;
		}
		onTouchEnded(column, id, x, y) {
			const xDelta = Math.abs(this.firstX - x);
			const yDelta = Math.abs(this.firstY - y);
			if ((xDelta + yDelta) < CLICK){
				application.behavior.ble.doClick();
			}
		}
		onTouchMoved(content, id, x, y){
			const xDelta = this.lastX - x;
			const yDelta = this.lastY - y;
			this.lastX = x;
			this.lastY = y;
			if (xDelta != 0 || yDelta != 0){
				application.behavior.ble.onMouseMoved(xDelta * GAIN, yDelta * GAIN);
			}
		}
	}
}));

class MouseAppBehavior extends Behavior {
	onCreate(application, data) {
		this.ble = new MouseService();
	}
}
Object.freeze(MouseAppBehavior.prototype);

const MouseApp = Application.template($ => ({
	active: true, Skin: WhiteSkin,
	Behavior: MouseAppBehavior,
	contents: [
		TouchpadContainer($),
	],
}));

export default function () {
	new MouseApp({}, { commandListLength: 2448, displayListLength: 2600, touchCount: 1 });
}


