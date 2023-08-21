const net = require('node:net');
const dgram = require('node:dgram');
const { Buffer } = require('node:buffer');

/**
 * ClientScene plays the simulation
 */
class ClientScene extends Phaser.Scene {
    constructor() {
        const config = {
            key: "game",
            active: false,
            visible: false,
        };

        super(config);
        this.commands = new CircularArray(900);
        this.loopId = 0;
        this.isConnected = false;
        this.lastConfirmed = -1;
        this.buffer = Buffer.alloc(MaxUdpPacketSize);
        this.connectToServer();
    }

    create() {
        this._inputs = new CommandInputs(this);
        this.map = this.make.tilemap({ key: "tilemap" });
        const tileset = this.map.addTilesetImage("tileset");
        this.map.createLayer('Floor', tileset);
        let obstaclesLayer = this.map.createLayer('Obstacles', tileset);

        obstaclesLayer.forEachTile(tile => {
            if (tile?.properties?.Obstacle) {
                tile.setCollision(true);
            }
        });

        const { widthInPixels, heightInPixels } = this.map;
        this.physics.world.setBounds(0, 0, widthInPixels, heightInPixels);
        this.cameras.main.setBounds(0, 0, widthInPixels, heightInPixels);
        this.obstaclesLayer = obstaclesLayer;
        this.hero = new Hero(this, 50, 50, 'Bruno');
        this.cameras.main.startFollow(this.hero, true);
        this.physics.add.collider(this.hero, obstaclesLayer);
        this.senderTimer = this.time.addEvent({
            delay: 1000 / SenderFps,
            callback: this.ackCommands,
            loop: true,
            paused: true,
            callbackScope: this,
        });
    }

    update(time, delta) {
        if (this.isConnected) {
            if (this.commands.empty()) return;
            this.loopId++;
            const cmd = this.commands.shift(); // remove from front
            if (this.loopId != cmd.id) {
                console.error('Out-of-sync state...');
                this.forceDisconnect();
                return;
            }
            this.inputs.consume(cmd);
            this.hero.update(time, delta);
        }
        
    }

    get inputs() {
        return this._inputs;
    }

    processData(data) {
        let commands = deserializeCommands(data);

        if (commands.length <= 0) return;

        for (const cmd of commands) {
            this.commands.push(cmd);
        }

        const last = commands[commands.length - 1];
        this.lastConfirmed = last.id;
    }

    ackCommands() {
        if (this.lastConfirmed == -1) return;

        this.buffer.writeInt32BE(this.lastConfirmed, 0);
        /* 32-bits = 4 bytes */
        this.udpClient.send(this.buffer, 0, 4);
    }

    initialState() {
        this.loopId = 0;
        this.lastConfirmed = -1;
        this.commands.reset();
        this.commands.clear();
        this.senderTimer.paused = false;
        this.isConnected = true;
    }

    forceDisconnect() {
        if (this.udpClient) {
            this.udpClient.close();
        }

        if (this.tcpClient) {
            this.tcpClient.end(); // close
        }

        this.senderTimer.paused = true;
    }

    endState() {
        this.isConnected = false;
        this.senderTimer.paused = true;
    }

    connectToServer() {
        const hostname = localStorage['ip'];
        const tcpPort = localStorage['tcpPort'];
        const udpPort = localStorage['udpPort'];

        const udpClient = this.udpClient = dgram.createSocket('udp4');

        udpClient.on('message', (msg, rinfo) => {
            this.processData(msg);
        });

        udpClient.on('error', (err) => {
            console.log('UDP error: ', err);
        });

        udpClient.on('close', () => {
            this.udpClient = undefined;
            console.log('UDP closed');
        });

        udpClient.bind(udpPort);

        const tcpClient = this.tcpClient = net.Socket();

        tcpClient.connect({ port: tcpPort, host: hostname, noDelay: false });

        tcpClient.on('close', () => {
            this.tcpClient = undefined;
            this.endState();
            console.log('Server TCP disconnected!');
        });

        tcpClient.on('connect', () => {
            this.initialState();
        })
    }
}