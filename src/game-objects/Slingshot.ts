import 'phaser';
import { Airplane } from './Airplane';
import { SlingshotConstants } from '../constants';

export class Slingshot {
  private scene: Phaser.Scene;
  private airplane: Airplane;
  private dragStart?: Phaser.Math.Vector2;
  public isLaunched: boolean = false;

  constructor(scene: Phaser.Scene, airplane: Airplane) {
    this.scene = scene;
    this.airplane = airplane;

    this.scene.input.on('pointerdown', this.handlePointerDown, this);
    this.scene.input.on('pointermove', this.handlePointerMove, this);
    this.scene.input.on('pointerup', this.handlePointerUp, this);
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    if (!this.isLaunched) {
      this.dragStart = pointer.position.clone();
    }
  }

  private handlePointerMove(pointer: Phaser.Input.Pointer): void {
    if (!this.isLaunched && this.dragStart) {
      // Visualize the slingshot power/angle
    }
  }

  private handlePointerUp(pointer: Phaser.Input.Pointer): void {
    if (!this.isLaunched && this.dragStart) {
      const dragEnd = pointer.position.clone();
      const dragVector = dragEnd.subtract(this.dragStart);

      if (dragVector.length() > SlingshotConstants.MAX_DRAG_DISTANCE) {
        dragVector.normalize().scale(SlingshotConstants.MAX_DRAG_DISTANCE);
      }

      const launchVelocity = dragVector.scale(SlingshotConstants.VELOCITY_MULTIPLIER);
      (this.airplane.body as Phaser.Physics.Arcade.Body).setVelocity(launchVelocity.x, launchVelocity.y);
      this.isLaunched = true;
    }
  }
}
