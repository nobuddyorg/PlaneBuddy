import 'phaser';
import { AirplaneConstants, FlightConstants } from '../constants';

export class Airplane extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, AirplaneConstants.TEXTURE);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setBounce(AirplaneConstants.BOUNCE)
      .setCollideWorldBounds(true)
      .setDrag(AirplaneConstants.DRAG, AirplaneConstants.DRAG);
  }

  public updateAirplane(): void {
    this._handlePlayerInput();
    this._applyFlightPhysics();
  }

  private _handlePlayerInput(): void {
    const pointer = this.scene.input.activePointer;
    const body = this.body as Phaser.Physics.Arcade.Body;

    if (pointer.isDown) {
      if (pointer.y < this.y) {
        const liftAmount = Math.max(0, body.velocity.x / FlightConstants.LIFT_VELOCITY_DIVISOR);
        body.velocity.y -= liftAmount * FlightConstants.LIFT_COEFFICIENT;
      } else {
        body.velocity.y += FlightConstants.SINK_FORCE;
      }
    }
  }

  private _applyFlightPhysics(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;

    if (body.velocity.x < FlightConstants.STALL_SPEED) {
      body.setAngularVelocity(FlightConstants.TUMBLE_ANGULAR_VELOCITY);
    } else {
      body.setAngularVelocity(0);
      this.angle = body.velocity.y / FlightConstants.ANGLE_COEFFICIENT;
    }
  }
}
