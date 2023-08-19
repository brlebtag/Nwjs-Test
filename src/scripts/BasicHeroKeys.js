class Hero extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, name = "") {
        const texture = "hero";
        super(scene, x, y, texture);
        Object.entries({
            "stop": {
                frameRate: 8, repeat: 0, frames: { start: 0, end: 0 },
            },
            "walking-down": {
                frameRate: 8, repeat: -1, frames: { start: 0, end: 3 },
            },
            "walking-right": {
                frameRate: 8, repeat: -1, frames: { start: 4, end: 7 },
            },
            "walking-up": {
                frameRate: 8, repeat: -1, frames: { start: 8, end: 11 },
            },
            "walking-left": {
                frameRate: 8, repeat: -1, frames: { start: 12, end: 15 },
            },
            "swinging-down": {
                frameRate: 10,repeat: 0, frames: { start: 16, end: 19 },
            },
            "swinging-up": {
                frameRate: 10, repeat: 0, frames: { start: 20, end: 23 },
            },
            "swinging-right": {
                frameRate: 10, repeat: 0, frames: { start: 24, end: 27 },
            },
            "swinging-left": {
                frameRate: 10, repeat: 0, frames: { start: 28, end: 31 },
            },
        })
        .forEach(([key, data]) => {
            const { frameRate, frames, repeat } = data;

            this.scene.anims.create({
                key,
                frameRate,
                repeat,
                frames: this.scene.anims.generateFrameNumbers(texture, frames),
            });
        });

        this.name = name;
        this.scene.add.existing(this);
        this.scene.physics.world.enable(this);
        this.setCollideWorldBounds(true).setState(STANDING);
        this.setSize(16, 16);
        this.tempVet = new Phaser.Math.Vector2(0, 0);
        this.createNameTag();
        this.NameTagPadding = 8;
        this.on('destroy', this.destroyed.bind(this));
    }

    createNameTag() {
        this.nameTag = this.scene.add.text(
            this.body.position.x,
            this.body.position.y,
            this.name,
            {
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontSize: `${this.body.width / 2}px`,
                color: '#000000',
                align: 'center',
            }
        );
    }

    changeName(name) {
        this.name = name;
        if (!this.nameTag) return;
        this.nameTag.setText(name);
    }

    destroyed() {
        this.nameTag.destroy();
    }

    update() {
        this.updateMovement();
        this.updateNameTag();
    }

    updateMovement() {
        const { body, tempVet } = this;
        const { left, right, down, up } = this.scene.inputs;

        tempVet.set(
            (left ? -1 : 0) + (right ? 1 : 0),
            (up ? -1 : 0) + (down ? 1 : 0)
        );

        tempVet.setLength(MaxSpeed);

        body.setVelocity(tempVet.x, tempVet.y);

        let velocity = body.velocity.length();
        if (velocity > 0) {
            this.anims.play(`walking-${Faces[Math.floor(map(body.velocity.angle(), 0, Phaser.Math.PI2, 0, 8))]}`, true);
        } else {
            this.anims.play('stop');
        }
    }

    updateNameTag() {
        const nameTag = this.nameTag;
        Phaser.Display.Align.In.Center(nameTag, this);
        nameTag.setY(this.body.position.y - nameTag.height - this.NameTagPadding);
    }
}
