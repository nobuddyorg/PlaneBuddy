import 'phaser';
import {
  WorldConstants,
  GroundConstants,
  LandingZoneConstants,
  AirplaneConstants,
  SlingshotConstants,
  FlightConstants,
  CollisionConstants,
  UIConstants,
} from '../constants';
import { Airplane } from '../game-objects/Airplane';
import { UIManager } from '../ui/UIManager';

export class MainScene extends Phaser.Scene {
  private airplane!: Airplane;
  private uiManager!: UIManager;
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
    this.uiManager = new UIManager(this);
    this.setupWorld();
    this.createGameObjects();
    this.setupInputHandling();
    this.setupPhysics();
  }

  private setupWorld(): void {
    this.cameras.main.setBackgroundColor(UIConstants.BackgroundColor);
    this.cameras.main.setBounds(0, 0, WorldConstants.WIDTH, WorldConstants.HEIGHT);
    this.physics.world.setBounds(0, 0, WorldConstants.WIDTH, WorldConstants.HEIGHT);
  }

  private createGameObjects(): void {
    this.createGround();
    this.createLandingZone();
    this.createAirplane();
  }

  private createGround(): void {
    this.ground = this.add.rectangle(0, this.cameras.main.height - GroundConstants.HEIGHT, this.physics.world.bounds.width, GroundConstants.HEIGHT, GroundConstants.COLOR) as unknown as Phaser.GameObjects.Rectangle;
    this.physics.add.existing(this.ground, true);
    const groundBody = this.ground.body as Phaser.Physics.Arcade.Body;
    groundBody.setAllowGravity(false);
    groundBody.setImmovable(true);
  }

  private createLandingZone(): void {
    this.landingZone = this.add.rectangle(LandingZoneConstants.X, this.cameras.main.height - LandingZoneConstants.HEIGHT, LandingZoneConstants.WIDTH, LandingZoneConstants.HEIGHT, LandingZoneConstants.COLOR) as unknown as Phaser.GameObjects.Rectangle;
    this.physics.add.existing(this.landingZone, true);
    const landingZoneBody = this.landingZone.body as Phaser.Physics.Arcade.Body;
    landingZoneBody.setAllowGravity(false);
    landingZoneBody.setImmovable(true);
  }

  private createAirplane(): void {
    this.airplane = new Airplane(this, AirplaneConstants.START_X, this.cameras.main.height - AirplaneConstants.START_Y_OFFSET);
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
    (this.airplane.body as Phaser.Physics.Arcade.Body).setAngularVelocity(CollisionConstants.TUMBLE_ANGULAR_VELOCITY);

    if (terrain === this.landingZone) {
      this.uiManager.showSuccessMessage();
    } else {
      this.uiManager.showFailureMessage();
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
      if (dragVector.length() > SlingshotConstants.MAX_DRAG_DISTANCE) {
        dragVector.normalize().scale(SlingshotConstants.MAX_DRAG_DISTANCE);
      }

      // Design Decision: The launch velocity is proportional to the drag distance, creating an intuitive slingshot feel.
      const launchVelocity = dragVector.scale(SlingshotConstants.VELOCITY_MULTIPLIER);
      (this.airplane.body as Phaser.Physics.Arcade.Body).setVelocity(launchVelocity.x, launchVelocity.y);
      this.isLaunched = true;
    }
  }

  update(): void {
    if (this.isLaunched && !this.isGameOver) {
      this.airplane.updateAirplane();
    }
  }
}
