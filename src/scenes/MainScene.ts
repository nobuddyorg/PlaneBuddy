import 'phaser';

export class MainScene extends Phaser.Scene {
  private airplane!: Phaser.GameObjects.Triangle;
  private ground!: Phaser.GameObjects.Rectangle;
  private landingZone!: Phaser.GameObjects.Rectangle;
  private isLaunched: boolean = false;
  private isGameOver: boolean = false;
  private dragStart!: Phaser.Math.Vector2;

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

    // Create the ground
    this.ground = this.add.rectangle(0, this.cameras.main.height - 50, this.physics.world.bounds.width, 50, 0x8B4513) as unknown as Phaser.GameObjects.Rectangle;
    this.physics.add.existing(this.ground, true);
    (this.ground.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    (this.ground.body as Phaser.Physics.Arcade.Body).setImmovable(true);

    // Create the landing zone
    this.landingZone = this.add.rectangle(3000, this.cameras.main.height - 50, 400, 50, 0x00FF00) as unknown as Phaser.GameObjects.Rectangle;
    this.physics.add.existing(this.landingZone, true);
    (this.landingZone.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    (this.landingZone.body as Phaser.Physics.Arcade.Body).setImmovable(true);

    // Create the airplane
    this.airplane = this.add.triangle(100, this.cameras.main.height - 150, 0, 0, 100, 25, 0, 50, 0xffffff);
    this.physics.add.existing(this.airplane);
    const airplaneBody = this.airplane.body as Phaser.Physics.Arcade.Body;
    airplaneBody.setBounce(0.5);
    airplaneBody.setCollideWorldBounds(true);
    airplaneBody.setDrag(100, 100);

    // Set the camera to follow the airplane
    this.cameras.main.startFollow(this.airplane);

    // Wire up pointer input
    this.input.on('pointerdown', this.handlePointerDown, this);
    this.input.on('pointermove', this.handlePointerMove, this);
    this.input.on('pointerup', this.handlePointerUp, this);

    // Add collision detection
    this.physics.add.collider(this.airplane, this.ground, this.handleCollision, undefined, this);
    this.physics.add.collider(this.airplane, this.landingZone, this.handleCollision, undefined, this);
  }

  /**
   * Handles the collision between the airplane and the ground/landing zone.
   * @param airplane The airplane game object.
   * @param terrain The terrain game object (ground or landing zone).
   */
  handleCollision(airplane: Phaser.Types.Physics.Arcade.GameObjectWithBody, terrain: Phaser.Types.Physics.Arcade.GameObjectWithBody): void {
    if (this.isGameOver) {
      return;
    }

    this.isGameOver = true;
    (this.airplane.body as Phaser.Physics.Arcade.Body).setAngularVelocity(300);

    if (terrain === this.landingZone) {
      this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'Success!', { fontSize: '64px', color: '#00ff00' }).setOrigin(0.5);
    } else {
      this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'Failure!', { fontSize: '64px', color: '#ff0000' }).setOrigin(0.5);
    }

    this.input.once('pointerdown', () => {
      this.scene.restart();
    });
  }

  handlePointerDown(pointer: Phaser.Input.Pointer): void {
    if (!this.isLaunched) {
      this.dragStart = pointer.position.clone();
    }
  }

  handlePointerMove(pointer: Phaser.Input.Pointer): void {
    if (!this.isLaunched && this.dragStart) {
      // Visualize the slingshot power/angle
    }
  }

  handlePointerUp(pointer: Phaser.Input.Pointer): void {
    if (!this.isLaunched && this.dragStart) {
      const dragEnd = pointer.position.clone();
      const dragVector = dragEnd.subtract(this.dragStart);

      // Design Decision: Cap the launch power to prevent excessive force.
      if (dragVector.length() > 200) {
        dragVector.normalize().scale(200);
      }

      // Design Decision: The launch velocity is proportional to the drag distance, creating an intuitive slingshot feel.
      const launchVelocity = dragVector.scale(-10);
      (this.airplane.body as Phaser.Physics.Arcade.Body).setVelocity(launchVelocity.x, launchVelocity.y);
      this.isLaunched = true;
    }
  }

  update(): void {
    if (this.isLaunched && !this.isGameOver) {
      const pointer = this.input.activePointer;
      const airplaneBody = this.airplane.body as Phaser.Physics.Arcade.Body;

      if (pointer.isDown) {
        if (pointer.y < this.airplane.y) {
          // Design Decision: Lift is proportional to the plane's horizontal velocity, simulating aerodynamic lift.
          const liftAmount = Math.max(0, airplaneBody.velocity.x / 2);
          airplaneBody.velocity.y -= liftAmount * 0.1;
        } else {
          // Design Decision: A constant downward force for sinking provides a simple and predictable control.
          airplaneBody.velocity.y += 10;
        }
      }

      // Design Decision: A stall occurs at low speeds, causing the plane to tumble. This adds a layer of skill to the flight.
      if (airplaneBody.velocity.x < 100) {
        airplaneBody.setAngularVelocity(200);
      } else {
        airplaneBody.setAngularVelocity(0);
        // Design Decision: The plane's angle is tied to its vertical velocity, providing visual feedback on its ascent or descent.
        this.airplane.angle = airplaneBody.velocity.y / 10;
      }
    }
  }
}
