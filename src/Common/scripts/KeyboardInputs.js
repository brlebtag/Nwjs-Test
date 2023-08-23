class KeyboardInputs {
    constructor(scene) {
        this._scene = scene;
        this._keys = this._scene.input.keyboard.addKeys(
        "W,A,S,D,Z,X,C,up,left,down,right,space,enter,comma,period,shift"
        );
    }

    get keys() {
        return this._keys;
    }

    get left() {
        return this.keys.left.isDown || this.keys.A.isDown || this.padAxisH === -1;
    }

    get right() {
        return this.keys.right.isDown || this.keys.D.isDown || this.padAxisH === 1;
    }

    get up() {
        return this.keys.up.isDown || this.keys.W.isDown || this.padAxisV === -1;
    }

    get down() {
        return this.keys.down.isDown || this.keys.S.isDown || this.padAxisV === 1;
    }

    get jump() {
        return (
            this.up ||
            this.keys.Z.isDown ||
            this.keys.X.isDown ||
            this.keys.C.isDown ||
            this.keys.space.isDown ||
            this.padA ||
            this.padB
        );
    }

    get padA() {
        return this.padButtons.some(
            (button) => button.index % 2 === 1 && button.value === 1
        );
    }

    get padB() {
        return this.padButtons.some(
            (button) => button.index % 2 === 0 && button.value === 1
        );
    }

    get padAxisH() {
        if (this.pad) {
            const [x] = this.pad.axes;
            return x.getValue();
        }
        return 0;
    }

    get padAxisV() {
        if (this.pad) {
            const [_, y] = this.pad.axes;
            return y.getValue();
        }
        return 0;
    }

    get padButtons() {
        return this.pad?.buttons || [];
    }

    get pad() {
        const pad = this._scene.input.gamepad;
        if (pad.gamepads.length > this._padIndex) {
            return pad.gamepads[this._padIndex];
        }
        return;
    }

    get shift() {
        return this.keys.shift.isDown;
    }

    get space() {
        return this.keys.space.isDown;
    }

    command() {
        return {
            left: this.left,
            right: this.right,
            up: this.up,
            down: this.down,
            shift: this.shift,
            space: this.space,
            jump: this.jump,
        }
    }
}