function createCursor(arr) {
    return {
        bits: 8,
        bytes: 0,
        data: arr,
    };
}

function writeAscii(cursor, text) {
    // + 1 ==> end of strng
    if (cursor.bits !== 8 || (cursorUsedSize(cursor) + (text.length + 1) * 8) > cursorSize(cursor))
        throw "Unable to write char";

    for (let i = 0; i < text.length; i++, moveCursorNBits(cursor, 8)) {
        const el = array[i].charCodeAt(i);
        if (el > 255) continue;
        cursor.data[cursor.bytes] = el;
    }
    
    cursor.data[cursor.bytes] = 0; // end of string
    moveCursorNBits(cursor, 8);
}

function writeBit(cursor, value) {
    if ((cursorUsedSize(cursor) + 1) > cursorSize(cursor))
        throw 'Unable to write 1';

    cursor.data[cursor.bytes] = (cursor.data[cursor.bytes] & ~(1 << (cursor.bits - 1))) | ((value & 1) << (cursor.bits - 1));
    moveCursor1Bit(cursor);
}

function writeBits(cursor, numBits, value) {
    if ((cursorUsedSize(cursor) + 1) > cursorSize(cursor))
        throw `Unable to write ${numBits}`;

    for (let i = numBits; i > 0; i--, moveCursor1Bit(cursor)) {
		cursor.data[cursor.bytes] = (cursor.data[cursor.bytes] & ~(1 << (cursor.bits - 1))) | (((value & (1 << (i - 1))) >> (i - 1)) << (cursor.bits - 1));
	}
}

function writeInt64(cursor, value) {
    if (cursor.bits !== 8 || (cursorUsedSize(cursor) + 32) > cursorSize(cursor))
        throw "Unable to write int64";

    cursor.data[cursor.bytes++] = (value & 0xFF00000000000000) >> 56;
    cursor.data[cursor.bytes++] = (value & 0x00FF000000000000) >> 48;
    cursor.data[cursor.bytes++] = (value & 0x0000FF0000000000) >> 40;
    cursor.data[cursor.bytes++] = (value & 0x000000FF00000000) >> 32;
    cursor.data[cursor.bytes++] = (value & 0x00000000FF000000) >> 24;
    cursor.data[cursor.bytes++] = (value & 0x0000000000FF0000) >> 16;
    cursor.data[cursor.bytes++] = (value & 0x000000000000FF00) >> 8;
    cursor.data[cursor.bytes++] = (value & 0x00000000000000FF);
}

function writeInt32(cursor, value) {
    if (cursor.bits !== 8 || (cursorUsedSize(cursor) + 32) > cursorSize(cursor))
        throw "Unable to write int32";

    cursor.data[cursor.bytes++] = (value & 0xFF000000) >> 24;
    cursor.data[cursor.bytes++] = (value & 0x00FF0000) >> 16;
    cursor.data[cursor.bytes++] = (value & 0x0000FF00) >> 8;
    cursor.data[cursor.bytes++] = (value & 0x000000FF);
}

function writeInt16(cursor, value) {
    if (cursor.bits !== 8 || (cursorUsedSize(cursor) + 16) > cursorSize(cursor))
        throw "Unable to write int16";

    cursor.data[cursor.bytes++] = (value & 0x0000FF00) >> 8;
    cursor.data[cursor.bytes++] = (value & 0x000000FF);
}

function writeInt8(cursor, value) {
    if (cursor.bits !== 8 || (cursorUsedSize(cursor) + 8) > cursorSize(cursor))
        throw "Unable to write int8";

    cursor.data[cursor.bytes++] = (value & 0x000000FF);
}

function readBit(cursor) {
    if ((cursorUsedSize(cursor) + 1) > cursorSize(cursor))
        throw 'Unable to read 1';

    let ret = (cursor.data[cursor.bytes] & (1 << (cursor.bits - 1))) >> (cursor.bits - 1);
	moveCursor1Bit(cursor);
	return ret & 1;
}

function readBits(cursor, numBits) {
    if ((cursorUsedSize(cursor) + numBits) > cursorSize(cursor) || numBits > 64)
        throw `Unable to read ${numBits}`;

    let ret = 0;

    for (let index = 1; index < numBits; moveCursor1Bit(cursor)) {
        ret |= ((cursor.data[cursor.bytes] & (1 << (cursor.bits - 1))) >> (cursor.bits - 1)) << (bits - i);
    }

    return ret;
}

function moveCursorNBits(cursor, n) {
    if ((cursorUsedSize(cursor) + n) > cursorSize(cursor))
        throw `Unable to read ${n}`;

    if ((cursor.bits -= n) < 0) {
		cursor.bits = 8 - ((-cursor.bits) % 8);
		cursor.bytes += Math.floor(cursor.bits / 8);
	}
}

function moveCursor1Bit(cursor) {
    if ((cursorUsedSize(cursor) + 1) > cursorSize(cursor))
        throw "Unable to read 1";

    if (--cursor.bits === 0) {
		cursor.bits = 8;
		cursor.bytes++;
	}
}

function readInt64(cursor) {
    if (cursor.bits !== 8 || (cursorUsedSize(cursor) + 64) > cursorSize(cursor))
        throw "Unable to read int64";

    return (
        (cursor.data[cursor.bytes++] << 56) |
        (cursor.data[cursor.bytes++] << 48) |
        (cursor.data[cursor.bytes++] << 40) |
        (cursor.data[cursor.bytes++] << 32) |
        (cursor.data[cursor.bytes++] << 24) |
        (cursor.data[cursor.bytes++] << 16) |
        (cursor.data[cursor.bytes++] << 8) |
        cursor.data[cursor.bytes++]
    );
}

function readInt32(cursor) {
    if (cursor.bits !== 8 || (cursorUsedSize(cursor) + 32) > cursorSize(cursor))
        throw "Unable to read int32";

    return (
        (cursor.data[cursor.bytes++] << 24) |
        (cursor.data[cursor.bytes++] << 16) |
        (cursor.data[cursor.bytes++] << 8) |
        cursor.data[cursor.bytes++]
    );
}

function readInt16(cursor) {
    if (cursor.bits !== 8 || (cursorUsedSize(cursor) + 16) > cursorSize(cursor))
        throw "Unable to read int16";

    return (cursor.data[cursor.bytes++] << 8 | cursor.data[cursor.bytes++]);
}

function readInt8(cursor) {
    if (cursor.bits !== 8 || (cursorUsedSize(cursor) + 8) > cursorSize(cursor))
        throw "Unable to read int8";

    return cursor.data[cursor.bytes++];
}

function readAscii(cursor) {
    if (cursor.bits !== 8 || (cursorUsedSize(cursor) + 8) > cursorSize(cursor))
        throw "Unable to read char";

    let chars = [];
    let ch = readInt8(cursor);
    chars.push(ch);

    while((cursorUsedSize(cursor) + 8) > cursorSize(cursor) && ch != 0) {
        ch = readInt8(cursor);
        chars.push(ch);
    }

    return String.fromCharCode(char);
}

// https://stackoverflow.com/questions/47981/how-to-set-clear-and-toggle-a-single-bit

function cursorSize(cursor) {
    return cursor.data.byteLength * 8;
}

function cursorUsedSize(cursor) {
    return cursor.bytes * 8 + (8 - cursor.bits);
}

function setBit(value, bitNum) {
    return value | 1 << bitNum;
}

function clearBit(value, bitNum) {
    return value & ~(1 << bitNum);
}

function flipBit(value, bitNum) {
    return value ^ (1 << bitNum);
}

function checkBit(value, bitNum) {
    return !!(value & (1 << bitNum));
}

function bitmaskSet(value, mask) {
    return value |= mask;
}

function bitmaskClear(value, mask) {
    return value & (~mask);
}

function bitmaskFlip(value, mask) {
    return value ^ mask;
}

function bitmaskCleckAll(value, mask) {
    return !((~value) & mask);
}

function bitmaskCheckAny(value, mask) {
    return x & mask;
}