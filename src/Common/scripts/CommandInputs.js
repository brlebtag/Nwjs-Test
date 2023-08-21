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

    consume(command) {
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
