class LoaderScene extends Phaser.Scene {
  preload() {
      this.load.spritesheet('tileset', '/Common/assets/images/tileset.png', {
          frameWidth: 16,
          frameHeight: 16,
      });

      this.load.spritesheet('hero', '/Common/assets/images/hero.png', {
          frameWidth: 32,
          frameHeight: 32,
      });

      this.load.spritesheet('log', '/Common/assets/images/log.png', {
          frameWidth: 32,
          frameHeight: 32,
      });

      this.load.tilemapTiledJSON('tilemap', '/Common/assets/tilemaps/tilemap.json');
  }

  create() {
      this.scene.start("game");
  }
}