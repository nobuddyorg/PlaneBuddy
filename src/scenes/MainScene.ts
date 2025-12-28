import 'phaser';

const GameConstants = {
  World: {
    WIDTH: 3840,
    HEIGHT: 1080,
  },
  Ground: {
    HEIGHT: 50,
    COLOR: 0x8B4513,
  },
  LandingZone: {
    X: 3000,
    WIDTH: 400,
    HEIGHT: 50,
    COLOR: 0x00FF00,
  },
  Airplane: {
    START_X: 100,
    START_Y_OFFSET: 150,
    BOUNCE: 0.5,
    DRAG: 100,
  },
  Slingshot: {
    MAX_DRAG_DISTANCE: 200,
    VELOCITY_MULTIPLIER: -10,
  },
  Flight: {
    LIFT_COEFFICIENT: 0.1,
    LIFT_VELOCITY_DIVISOR: 2,
    SINK_FORCE: 10,
    STALL_SPEED: 100,
    TUMBLE_ANGULAR_VELOCITY: 200,
    ANGLE_COEFFICIENT: 10,
  },
  Collision: {
    TUMBLE_ANGULAR_VELOCITY: 300,
  },
  UI: {
    BackgroundColor: '#242526',
    SuccessMessage: 'Success!',
    FailureMessage: 'Failure!',
    SuccessColor: '#00ff00',
    FailureColor: '#ff0000',
    FontSize: '64px',
  },
};

export class MainScene extends Phaser.Scene {
  private airplane!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private ground!: Phaser.GameObjects.Rectangle;
  private landingZone!: Phaser.GameObjects.Rectangle;
  private isLaunched: boolean = false;
  private isGameOver: boolean = false;
  private dragStart!: Phaser.Math.Vector2;

  constructor() {
    super({ key: 'MainScene' });
  }

  preload(): void {
    this.load.image('airplane', 'assets/airplane.svg');
  }

  create(): void {
    this.setupWorld();
    this.createGameObjects();
    this.setupInputHandling();
    this.setupPhysics();
  }

  private setupWorld(): void {
    this.cameras.main.setBackgroundColor(GameConstants.UI.BackgroundColor);
    this.cameras.main.setBounds(0, 0, GameConstants.World.WIDTH, GameConstants.World.HEIGHT);
    this.physics.world.setBounds(0, 0, GameConstants.World.WIDTH, GameConstants.World.HEIGHT);
  }

  private createGameObjects(): void {
    // Create the ground
    this.ground = this.add.rectangle(0, this.cameras.main.height - GameConstants.Ground.HEIGHT, this.physics.world.bounds.width, GameConstants.Ground.HEIGHT, GameConstants.Ground.COLOR) as unknown as Phaser.GameObjects.Rectangle;
    this.physics.add.existing(this.ground, true);
    const groundBody = this.ground.body as Phaser.Physics.Arcade.Body;
    groundBody.setAllowGravity(false);
    groundBody.setImmovable(true);

    // Create the landing zone
    this.landingZone = this.add.rectangle(GameConstants.LandingZone.X, this.cameras.main.height - GameConstants.LandingZone.HEIGHT, GameConstants.LandingZone.WIDTH, GameConstants.LandingZone.HEIGHT, GameConstants.LandingZone.COLOR) as unknown as Phaser.GameObjects.Rectangle;
    this.physics.add.existing(this.landingZone, true);
    const landingZoneBody = this.landingZone.body as Phaser.Physics.Arcade.Body;
    landingZoneBody.setAllowGravity(false);
    landingZoneBody.setImmovable(true);

    // Create the airplane
    this.airplane = this.physics.add.sprite(GameConstants.Airplane.START_X, this.cameras.main.height - GameConstants.Airplane.START_Y_OFFSET, 'airplane');
    this.airplane.setBounce(GameConstants.Airplane.BOUNCE);
    this.airplane.setCollideWorldBounds(true);
    this.airplane.setDrag(GameConstants.Airplane.DRAG, GameConstants.Airplane.DRAG);
  }

  private setupInputHandling(): void {
    this.input.on('pointerdown', this.handlePointerDown, this);
    this.input.on('pointermove', this.handlePointerMove, this);
    this.input.on('pointerup', this.handlePointerUp, this);
  }

  private setupPhysics(): void {
    this.cameras.main.startFollow(this.airplane);
    this.physics.add.collider(this.airplane, this.ground, this.handleCollision, undefined, this);
    this.physics.add.collider(this.airplane, this.landingZone, this.handleCollision, undefined, this);
  }

  /**
   * Handles the collision between the airplane and the ground/landing zone.
   * @param airplane The airplane game object.
   * @param terrain The terrain game object (ground or landing zone).
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleCollision(airplane: any, terrain: any): void {
    if (this.isGameOver) {
      return;
    }

    this.isGameOver = true;
    (this.airplane.body as Phaser.Physics.Arcade.Body).setAngularVelocity(GameConstants.Collision.TUMBLE_ANGULAR_VELOCITY);

    if (terrain === this.landingZone) {
      this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, GameConstants.UI.SuccessMessage, { fontSize: GameConstants.UI.FontSize, color: GameConstants.UI.SuccessColor }).setOrigin(0.5);
    } else {
      this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, GameConstants.UI.FailureMessage, { fontSize: GameConstants.UI.FontSize, color: GameConstants.UI.FailureColor }).setOrigin(0.5);
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

  handlePointerMove(): void {
    if (!this.isLaunched && this.dragStart) {
      // Visualize the slingshot power/angle
    }
  }

  handlePointerUp(pointer: Phaser.Input.Pointer): void {
    if (!this.isLaunched && this.dragStart) {
      const dragEnd = pointer.position.clone();
      const dragVector = dragEnd.subtract(this.dragStart);

      // Design Decision: Cap the launch power to prevent excessive force.
      if (dragVector.length() > GameConstants.Slingshot.MAX_DRAG_DISTANCE) {
        dragVector.normalize().scale(GameConstants.Slingshot.MAX_DRAG_DISTANCE);
      }

      // Design Decision: The launch velocity is proportional to the drag distance, creating an intuitive slingshot feel.
      const launchVelocity = dragVector.scale(GameConstants.Slingshot.VELOCITY_MULTIPLIER);
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
          const liftAmount = Math.max(0, airplaneBody.velocity.x / GameConstants.Flight.LIFT_VELOCITY_DIVISOR);
          airplaneBody.velocity.y -= liftAmount * GameConstants.Flight.LIFT_COEFFICIENT;
        } else {
          // Design Decision: A constant downward force for sinking provides a simple and predictable control.
          airplaneBody.velocity.y += GameConstants.Flight.SINK_FORCE;
        }
      }

      // Design Decision: A stall occurs at low speeds, causing the plane to tumble. This adds a layer of skill to the flight.
      if (airplaneBody.velocity.x < GameConstants.Flight.STALL_SPEED) {
        airplaneBody.setAngularVelocity(GameConstants.Flight.TUMBLE_ANGULAR_VELOCITY);
      } else {
        airplaneBody.setAngularVelocity(0);
        // Design Decision: The plane's angle is tied to its vertical velocity, providing visual feedback on its ascent or descent.
        this.airplane.angle = airplaneBody.velocity.y / GameConstants.Flight.ANGLE_COEFFICIENT;
      }
    }
  }
}
