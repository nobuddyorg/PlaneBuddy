import "phaser";
import { PaperPlaneConstants, FlightConstants } from "../constants";

export class PaperPlane extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, PaperPlaneConstants.TEXTURE);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setBounce(PaperPlaneConstants.BOUNCE)
      .setCollideWorldBounds(true)
      .setDrag(PaperPlaneConstants.DRAG, PaperPlaneConstants.DRAG);
  }

  public launch(launchVelocity: Phaser.Math.Vector2): void {
    (this.body as Phaser.Physics.Arcade.Body).setVelocity(
      launchVelocity.x,
      launchVelocity.y,
    );
  }

  public updatePaperPlane(): void {
    this._applyPlayerInput();
    this._applyFlightPhysics();
    this.smoothRotation();
  }

  private _applyPlayerInput(): void {
    const pointer = this.scene.input.activePointer;
    const body = this.body as Phaser.Physics.Arcade.Body;

    if (!pointer.isDown) {
      return;
    }

    if (pointer.y < this.y) {
      const liftAmount = Math.max(
        0,
        body.velocity.x / FlightConstants.LIFT_VELOCITY_DIVISOR,
      );
      body.velocity.y -= liftAmount * FlightConstants.LIFT_COEFFICIENT;
    } else {
      body.velocity.y += FlightConstants.SINK_FORCE;
    }
  }

  private _applyFlightPhysics(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;

    if (body.velocity.x < FlightConstants.STALL_SPEED) {
      body.setAngularVelocity(FlightConstants.TUMBLE_ANGULAR_VELOCITY);
    } else {
      body.setAngularVelocity(0);
    }
  }

  private smoothRotation(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const targetAngle = body.velocity.y / FlightConstants.ANGLE_COEFFICIENT;
    this.angle = Phaser.Math.Linear(this.angle, targetAngle, 0.1);
  }
}
