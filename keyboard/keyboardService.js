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

import BLEServer from "bleserver";
import { uuid } from "btutils";

const HID_A = 0x04;
const ASCII_a = 0x61;
const ASCII_1 = 0x31;
const HID_1 = 0x1e;
const HID_0 = 0x27;

const HID_CTRL = 0x01;
const HID_SHIFT = 0x02;
const HID_ALT = 0x04;
const HID_META = 0x08;

const HID_ENTER = 0x28;
const HID_DOT = 0x37;
const HID_SEMICOLON = 0x33;
const HID_FORWARD_SLASH = 0x38;
const HID_AT = 0x1f;

export default class KeyboardService extends BLEServer {
    onReady() {
        this.report = [0, 0, 0, 0, 0, 0, 0, 0];
        this.code = 0;
        this.deviceName = "Moddable Keyboard";
        this.reportCharacteristic = undefined;
        this.securityParameters = { mitm: true, bonding: true };
        this.onDisconnected();
    }
    onConnected() {
        this.stopAdvertising();
    }
    onDisconnected() {
        this.reportCharacteristic = undefined;
        this.startAdvertising({
            advertisingData: { flags: 6, completeName: this.deviceName, incompleteUUID16List: [uuid`1812`] }
        });
    }
    onCharacteristicNotifyEnabled(characteristic) {
        if ("keyboard_input_report" == characteristic.name) {
            trace("keyboard bound\n");
            this.reportCharacteristic = characteristic;
        }
    }
    onCharacteristicRead(characteristic){
        switch (characteristic.name){
            case "keyboard_input_report":
                return this.report;
                break;
            default:
                trace(`read of characteristic: ${characteristic.name}\n`);
                break;
        }
    }

    sendKey(keycode, modifiers = 0){
        this.report[0] = modifiers;
        this.report[2] = keycode;
        this.notifyValue(this.reportCharacteristic, this.report); // key down
        this.report[0] = 0;
        this.report[2] = 0;
        this.notifyValue(this.reportCharacteristic, this.report); // key up
    }

    onKeyPressed(key) {
        let shift = false;

        let value = key.charCodeAt(0);

        if (value <= 90 && value >= 65) {
            shift = true;
            value += 32;
        }

        if (value <= 122 && value >= 97) {
            value -= ASCII_a;
            value += HID_A;
        } else if (value == 32) {
            value = 0x2c;
        } else if (value <= 57 && value >= 49){
            value -= ASCII_1;
            value += HID_1;
        } else if (value == 48){
            value = HID_0;
        } else if (value == 64){
            shift = true;
            value = HID_AT;
        } else if (value == 58){
            shift = true;
            value = HID_SEMICOLON;
        } else if (value == 46){
            value = HID_DOT;
        } else if (value == 47){
            value = HID_FORWARD_SLASH;
        }

        if (this.reportCharacteristic) {
            if (shift) {
                this.report[0] = 0x02;
            }
            this.report[2] = value;
            this.notifyValue(this.reportCharacteristic, this.report);
            this.report[0] = 0;
            this.report[2] = 0;
            this.notifyValue(this.reportCharacteristic, this.report);
            trace(`sending: ${value}\n`);
        } else {
            trace(`not connected: ${value}\n`);
        }

    }
}