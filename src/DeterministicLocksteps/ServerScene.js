const net = require('node:net');
const dgram = require('node:dgram');
const { Buffer } = require('node:buffer');

/**
 * Server Scene streams the simulation
 */
class ServerScene extends Phaser.Scene {
    constructor() {
        const config = {
            key: "game",
            active: false,
            visible: false,
        };

        super(config);
        this.commands = new CircularArray(900);
        this.loopId = 0;
        this.buffer = Buffer.alloc(MaxUdpPacketSize);
        this.startServer();
    }

    create() {
        this._inputs = new KeyboardInputs(this);
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
            callback: this.sendCommads,
            loop: true,
            paused: true,
            callbackScope: this,
        });
    }

    update(time, delta) {
        if (this.tcpClient) {
            if (this.commands.full()) return;
            this.loopId++;
            let command = this.inputs.command();
            command.id = this.loopId;
            this.commands.push(command);
        }
        
        this.hero.update(time, delta);
    }

    get inputs() {
        return this._inputs;
    }

    processData(data) {
        const commands = this.commands;
        const size = commands.length;
        if (size <= 0) return;
        const loopId = data.readInt32BE(0); // ACK Id
        const first = commands.front();
        const index = loopId - first.id;
        
        if (index < 0) return; // Already ACKED. It is from the past or repeated ACK.

        if (index > size || commands.at(index).id != loopId) {
            this.tcpClient.end();
            this.udpClient.close();
            console.error('Out-of-sync state...');
            return;
        }

        commands.skipFront(index + 1);
    }

    sendCommads() {
        let size = serializeCommands(this.commands, this.buffer);
        if (size <= 0) return;
        this.udpClient.send(this.buffer, 0 , size);
    }

    startServer() {
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
        })

        udpClient.bind(udpPort);

        const tcpServer = this.tcpServer = net.createServer({ noDelay: true }, socket => {
            console.log('Client connected');

            if (this.tcpClient) {
                socket.end();
                console.log('Already client connected');
                return;
            }

            this.loopId = 0;
            this.commands.reset();
            this.commands.clear();
            this.senderTimer.paused = false;
            this.tcpClient = socket;

            socket.on('close', () => {
                this.tcpClient = undefined;
                this.senderTimer.paused = true;
                console.log('Client disconnected');
            });

            socket.on('error', err => {
                console.log('TCP error: ', err);
            });
        });

        tcpServer.on('close', () => {
            console.log('Server TCP disconnected!');
        });

        tcpServer.listen(tcpPort, hostname);
    }
}