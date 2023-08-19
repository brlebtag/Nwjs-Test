function constrain(value, minimum, maximum) {
    return Math.max(Math.min(value, maximum), minimum);
}

function map(value, begin1, end1, begin2, end2, constrained = true) {
    const newValue = (value - begin1) / (end1 - begin1) * (end2 - begin2) + begin2;

    if (!constrained) return newValue;

    return begin2 < end2
        ? constrain(newValue, begin2, end2)
        : constrain(newValue, end2, begin2);
}


const STANDING = 0;
const WALKING_LEFT = 1;
const WALKING_RIGHT = 2;
const WALKING_UP = 3;
const WALKING_DOWN = 4;
const WALKING_DOWN_LEFT = 5;
const WALKING_DOWN_RIGHT = 6;
const WALKING_UP_LEFT = 7;
const WALKING_UP_RIGHT = 8;

const Faces = [
    'right',
    'down',
    'down',
    'left',
    'left',
    'up',
    'up',
    'right',
    'right', 
];

const MaxSpeed = 100;

class LoaderScene extends Phaser.Scene {
    preload() {
        this.load.spritesheet('tileset', '../assets/images/tileset.png', {
            frameWidth: 16,
            frameHeight: 16,
        });

        this.load.spritesheet('hero', '../assets/images/hero.png', {
            frameWidth: 32,
            frameHeight: 32,
        });

        this.load.spritesheet('log', '../assets/images/log.png', {
            frameWidth: 32,
            frameHeight: 32,
        });

        this.load.tilemapTiledJSON('tilemap', '../assets/tilemaps/tilemap.json');
    }

    create() {
        this.scene.start("game");
    }
}

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
            top: this.top,
            down: this.down,
            shift: this.shift,
            space: this.space,
            jump: this.jump,
        }
    }
}

class CommandInputs {
    constructor(scene) {
        this._scene = scene;
        this._command = {
            left: false,
            right: false,
            up: false,
            down: false,
            jump: false,
            padA: false,
            padB: false,
            padAxisH: false,
            padAxisV: false,
            padButtons: [],
            pad: false,
            shift: false,
            space: false,
        };
    }

    setCommand(command) {
        this._command = command;
    }

    get keys() {
        return null;
    }

    get left() {
        return this._command.left;
    }

    get right() {
        return this._command.right;
    }

    get up() {
        return this._command.up;
    }

    get down() {
        return this._command.down;
    }

    get jump() {
        return this._command.jump;
    }

    get padA() {
        return this._command.padA;
    }

    get padB() {
        return this._command.padB;
    }

    get padAxisH() {
        return this._command.padAxisH;
    }

    get padAxisV() {
        return this._command.padAxisV;
    }

    get padButtons() {
        return this._command.padButtons;
    }

    get pad() {
        return this._command.pad;
    }

    get shift() {
        return this._command.shift;
    }

    get space() {
        return this._command.space;
    }

    command() {
        return this._command;
    }
}
