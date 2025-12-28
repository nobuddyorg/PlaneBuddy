import "phaser";
import paperPlaneImage from "../assets/paper-plane.svg";
import {
  WorldConstants,
  GroundConstants,
  LandingZoneConstants,
  PaperPlaneConstants,
  CollisionConstants,
  UIConstants,
} from "../constants";
import { PaperPlane } from "../game-objects/PaperPlane";
import { UIManager } from "../ui/UIManager";
import { Slingshot } from "../game-objects/Slingshot";
import { GameState } from "../state/GameState";

export class MainScene extends Phaser.Scene {
  private paperPlane!: PaperPlane;
  private uiManager!: UIManager;
  private slingshot!: Slingshot;
  private ground!: Phaser.GameObjects.Rectangle;
  private landingZone!: Phaser.GameObjects.Rectangle;
  private gameState: GameState = GameState.ReadyToLaunch;

  constructor() {
    super({ key: "MainScene" });
  }

  preload(): void {
    this.load.image("paper-plane", paperPlaneImage);
  }

  create(): void {
    this.uiManager = new UIManager(this);
    this.setupWorld();
    this.createGameObjects();
    this.slingshot = new Slingshot(
      this,
      this.paperPlane,
      this.onLaunch.bind(this),
    );
    this.setupPhysics();
  }

  private onLaunch(): void {
    this.gameState = GameState.InFlight;
  }

  private setupWorld(): void {
    this.cameras.main.setBackgroundColor(UIConstants.BackgroundColor);
    this.cameras.main.setBounds(
      0,
      0,
      WorldConstants.WIDTH,
      WorldConstants.HEIGHT,
    );
    this.physics.world.setBounds(
      0,
      0,
      WorldConstants.WIDTH,
      WorldConstants.HEIGHT,
    );
  }

  private createGameObjects(): void {
    this.createGround();
    this.createLandingZone();
    this.createPaperPlane();
  }

  private createGround(): void {
    this.ground = this.add.rectangle(
      0,
      this.cameras.main.height - GroundConstants.HEIGHT,
      this.physics.world.bounds.width,
      GroundConstants.HEIGHT,
      GroundConstants.COLOR,
    ) as unknown as Phaser.GameObjects.Rectangle;
    this.physics.add.existing(this.ground, true);
    const groundBody = this.ground.body as Phaser.Physics.Arcade.Body;
    groundBody.setAllowGravity(false);
    groundBody.setImmovable(true);
  }

  private createLandingZone(): void {
    this.landingZone = this.add.rectangle(
      LandingZoneConstants.X,
      this.cameras.main.height - LandingZoneConstants.HEIGHT,
      LandingZoneConstants.WIDTH,
      LandingZoneConstants.HEIGHT,
      LandingZoneConstants.COLOR,
    ) as unknown as Phaser.GameObjects.Rectangle;
    this.physics.add.existing(this.landingZone, true);
    const landingZoneBody = this.landingZone.body as Phaser.Physics.Arcade.Body;
    landingZoneBody.setAllowGravity(false);
    landingZoneBody.setImmovable(true);
  }

  private createPaperPlane(): void {
    this.paperPlane = new PaperPlane(
      this,
      PaperPlaneConstants.START_X,
      this.cameras.main.height - PaperPlaneConstants.START_Y_OFFSET,
    );
  }

  private setupPhysics(): void {
    this.cameras.main.startFollow(this.paperPlane);
    this.physics.add.collider(
      this.paperPlane,
      this.ground,
      this.handleCollision,
      undefined,
      this,
    );
    this.physics.add.collider(
      this.paperPlane,
      this.landingZone,
      this.handleCollision,
      undefined,
      this,
    );
  }

  handleCollision(
    paperPlane: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    terrain: Phaser.Types.Physics.Arcade.GameObjectWithBody,
  ): void {
    if (this.gameState === GameState.GameOver) {
      return;
    }

    this._endGame(terrain === this.landingZone);
  }

  private _endGame(isSuccess: boolean): void {
    this.gameState = GameState.GameOver;
    (this.paperPlane.body as Phaser.Physics.Arcade.Body).setAngularVelocity(
      CollisionConstants.TUMBLE_ANGULAR_VELOCITY,
    );

    if (isSuccess) {
      this.uiManager.showSuccessMessage();
    } else {
      this.uiManager.showFailureMessage();
    }

    this.input.once("pointerdown", () => {
      this.scene.restart();
    });
  }

  update(): void {
    switch (this.gameState) {
      case GameState.InFlight:
        this.paperPlane.updatePaperPlane();
        break;
      case GameState.ReadyToLaunch:
      case GameState.GameOver:
        break;
    }
  }
}
