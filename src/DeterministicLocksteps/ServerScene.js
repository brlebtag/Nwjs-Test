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
        console.log(`ServerScene`);
        document.title = "Deterministic Locksteps - Server";
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
            if (this.commands.full())
            {
                console.log('commands is full');
                return;
            }
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
        console.log('ack received');
        const commands = this.commands;
        const size = commands.length;
        if (size <= 0) 
        {
            console.log('no commands to send');
            return;
        }
        const loopId = data.readInt32BE(0); // ACK Id
        const first = commands.front();
        const index = loopId - first.id;
        
        if (index < 0)
        {
            console.log('already acked!')
            return; // Already ACKED. It is from the past or repeated ACK.
        }

        if (index > size || commands.at(index).id != loopId) {
            this.tcpClient.end();
            this.udpClient.close();
            console.error('Out-of-sync state...');
            return;
        }

        commands.skipFront(index + 1);
        console.log('acked!');
    }

    sendCommads() {
        if (!this.tcpClient) return;
        const client = this.remoteAddress;
        let size = serializeCommands(this.commands, this.buffer);
        if (size <= 0) return;
        this.udpClient.send(this.buffer, 0, size, client.port, client.address);
        console.log('commands sent!');
    }

    startServer() {
        const udpClient = this.udpClient = dgram.createSocket('udp4');

        udpClient.on('connect', () => {
            console.log('udp client connect');
        });

        udpClient.on('error', (err) => {
            console.log('UDP error: ', err);
        });

        udpClient.on('close', () => {
            this.udpClient = undefined;
            console.log('UDP closed');
        });

        udpClient.bind(port);

        const tcpServer = this.tcpServer = net.createServer({ noDelay: true }, socket => {
            socket.setEncoding(null);
            console.log('Client connected');

            if (this.tcpClient) {
                socket.end();
                console.log('Already client connected');
                return;
            }

            this.remoteAddress = {address: socket.remoteAddress, port: socket.remotePort};
            this.loopId = 0;
            this.commands.reset();
            this.commands.clear();
            this.senderTimer.paused = false;
            this.tcpClient = socket;

            socket.on('ready', () => {
                console.log('tcp client socket ready!');
            });

            socket.on('close', () => {
                this.senderTimer.paused = true;
                this.tcpClient = undefined;
                this.remoteAddress = null;
                console.log('Client disconnected');
            });

            socket.on('data', data => {
                this.processData(data);
            });

            socket.on('error', err => {
                console.log('TCP error: ', err);
            });
        });

        tcpServer.on('ready', () => {
            console.log('tcp server socket ready!');
        });

        tcpServer.on('close', () => {
            console.log('Server TCP disconnected!');
        });

        tcpServer.listen(port, hostname);
    }
}