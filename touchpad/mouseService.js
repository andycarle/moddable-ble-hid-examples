import BLEServer from "bleserver";
import { SM } from "sm";
import { uuid } from "btutils";

const LEFT_CLICK = 0b00000001;

export default class KeyboardService extends BLEServer {
    onReady() {
        this.report = [0, 0, 0];
        this.code = 0;
        this.deviceName = "Moddable Mouse";
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
        if ("mouse_input_report" == characteristic.name) {
            trace("mouse bound\n");
            this.reportCharacteristic = characteristic;
        }
    }
    onCharacteristicRead(characteristic){
        switch (characteristic.name){
            case "mouse_input_report":
                return this.report;
                break;
            default:
                trace(`read of characteristic: ${characteristic.name}\n`);
                break;
        }
    }

    doClick(){
        this.report[0] = LEFT_CLICK;
        this.report[1] = 0;
        this.report[2] = 0;
        this.notifyValue(this.reportCharacteristic, this.report);
        trace("click\n");
        this.report[0] = 0;
        this.notifyValue(this.reportCharacteristic, this.report);
    }

    onMouseMoved(x, y) {
        this.report[0] = 0;
        this.report[1] = x;
        this.report[2] = y;

        if (this.reportCharacteristic) {
            this.notifyValue(this.reportCharacteristic, this.report);
        } else {
            trace(`not connected: ${JSON.stringify(this.report)}\n`);
        }

    }
}