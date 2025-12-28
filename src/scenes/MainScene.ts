import 'phaser';
import {
  WorldConstants,
  GroundConstants,
  LandingZoneConstants,
  AirplaneConstants,
  CollisionConstants,
  UIConstants,
} from '../constants';
import { Airplane } from '../game-objects/Airplane';
import { UIManager } from '../ui/UIManager';
import { Slingshot } from '../game-objects/Slingshot';
import { GameState } from '../state/GameState';

export class MainScene extends Phaser.Scene {
  private airplane!: Airplane;
  private uiManager!: UIManager;
  private slingshot!: Slingshot;
  private ground!: Phaser.GameObjects.Rectangle;
  private landingZone!: Phaser.GameObjects.Rectangle;
  private gameState: GameState = GameState.ReadyToLaunch;

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
    this.slingshot = new Slingshot(this, this.airplane, this.onLaunch.bind(this));
    this.setupPhysics();
  }

  private onLaunch(): void {
    this.gameState = GameState.InFlight;
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

  private setupPhysics(): void {
    this.cameras.main.startFollow(this.airplane);
    this.physics.add.collider(this.airplane, this.ground, this.handleCollision, undefined, this);
    this.physics.add.collider(this.airplane, this.landingZone, this.handleCollision, undefined, this);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleCollision(airplane: any, terrain: any): void {
    if (this.gameState === GameState.GameOver) {
      return;
    }

    this._endGame(terrain === this.landingZone);
  }

  private _endGame(isSuccess: boolean): void {
    this.gameState = GameState.GameOver;
    (this.airplane.body as Phaser.Physics.Arcade.Body).setAngularVelocity(CollisionConstants.TUMBLE_ANGULAR_VELOCITY);

    if (isSuccess) {
      this.uiManager.showSuccessMessage();
    } else {
      this.uiManager.showFailureMessage();
    }

    this.input.once('pointerdown', () => {
      this.scene.restart();
    });
  }

  update(): void {
    switch (this.gameState) {
      case GameState.InFlight:
        this.airplane.updateAirplane();
        break;
      case GameState.ReadyToLaunch:
      case GameState.GameOver:
        break;
    }
  }
}
