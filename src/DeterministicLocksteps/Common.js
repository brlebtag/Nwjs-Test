const MaxUdpPacketSize = 1200;
const SenderFps = 10;

function serializeCommands(commands, buffer, maxSize = MaxUdpPacketSize) {
    const len = commands.length;

    if (len <= 0) return 0;

    buffer.writeInt32BE(len, 0); // length

    let first = commands.at(0);

    console.log(first);

    buffer.writeInt32BE(first.id, 4); // first ID

    buffer.writeUInt8(cmdToByte(first), 8); // command

    let totalBytes = 9; // len(32-bits = 4 bytes) + first's Id (32-bits = 4 bytes) + first's command (1 byte)

    for (let i = 1; (i < len) && (totalBytes < maxSize); i++, totalBytes++) {
        buffer.writeUInt8(cmdToByte(commands.at(i)), totalBytes); // more commands
    }

    return totalBytes;
}

function deserializeCommands(buffer) {
    const size = buffer.readInt32BE(0); // size
    let commands = [];

    if (size > 0) {
        const firstID = buffer.readInt32BE(4); // first ID
        let firstCmd = byteToCmd(buffer.readUInt8(8)); // first command
        firstCmd.id = firstID;
        let totalBytes = 9;
        commands.push(firstCmd);
    
        for (let i = 1; i < size; i++, totalBytes++) {
            const cmd = byteToCmd(buffer.readUInt8(totalBytes)); // more commands
            cmd.id = firstID + i;
            commands.push(cmd);
        }
    }

    return commands;
}

function cmdToByte(cmd) {
    let value = 0;

    if (cmd.left) {
        value = setBit(value, 0);
    }

    if (cmd.right) {
        value = setBit(value, 1);
    }

    if (cmd.up) {
        value = setBit(value, 2);
    }

    if (cmd.down) {
        value = setBit(value, 3);
    }

    if (cmd.shift) {
        value = setBit(value, 4);
    }

    if (cmd.space) {
        value = setBit(value, 5);
    }

    if (cmd.jump) {
        value = setBit(value, 6);
    }

    return value;
}

function byteToCmd(value) {
    return {
        left: checkBit(value, 0),
        right: checkBit(value, 1),
        up: checkBit(value, 2),
        down: checkBit(value, 3),
        shift: checkBit(value, 4),
        space: checkBit(value, 5),
        jump: checkBit(value, 6),
    };
}