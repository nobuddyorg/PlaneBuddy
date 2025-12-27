import 'phaser';

export class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
  }

  preload(): void {
    // No assets to load yet
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#242526');

    // Set up the camera for side-scrolling
    this.cameras.main.setBounds(0, 0, 3840, 1080);
    this.physics.world.setBounds(0, 0, 3840, 1080);

    // Wire up pointer input
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      console.log('Pointer down:', pointer.x, pointer.y);
    });
  }

  update(): void {
    // No game logic yet
  }
}
