import 'phaser';
import { Airplane } from './Airplane';
import { SlingshotConstants } from '../constants';

export class Slingshot {
  private scene: Phaser.Scene;
  private airplane: Airplane;
  private dragStart?: Phaser.Math.Vector2;
  private onLaunch: () => void;

  constructor(scene: Phaser.Scene, airplane: Airplane, onLaunch: () => void) {
    this.scene = scene;
    this.airplane = airplane;
    this.onLaunch = onLaunch;

    this.scene.input.on('pointerdown', this.handlePointerDown, this);
    this.scene.input.on('pointermove', this.handlePointerMove, this);
    this.scene.input.on('pointerup', this.handlePointerUp, this);
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    this.dragStart = pointer.position.clone();
  }

  private handlePointerMove(pointer: Phaser.Input.Pointer): void {
    if (this.dragStart) {
      // Visualize the slingshot power/angle
    }
  }

  private handlePointerUp(pointer: Phaser.Input.Pointer): void {
    if (this.dragStart) {
      const dragEnd = pointer.position.clone();
      const dragVector = dragEnd.subtract(this.dragStart);
      const launchVelocity = this._calculateLaunchVelocity(dragVector);

      this.airplane.launch(launchVelocity);
      this.dragStart = undefined;
      this.onLaunch();
    }
  }

  private _calculateLaunchVelocity(dragVector: Phaser.Math.Vector2): Phaser.Math.Vector2 {
    if (dragVector.length() > SlingshotConstants.MAX_DRAG_DISTANCE) {
      dragVector.normalize().scale(SlingshotConstants.MAX_DRAG_DISTANCE);
    }

    return dragVector.scale(SlingshotConstants.VELOCITY_MULTIPLIER);
  }
}
