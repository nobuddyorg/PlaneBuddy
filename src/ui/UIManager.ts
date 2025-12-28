import 'phaser';
import { UIConstants } from '../constants';

export class UIManager {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public showSuccessMessage(): void {
    this.showMessage(UIConstants.SuccessMessage, UIConstants.SuccessColor);
  }

  public showFailureMessage(): void {
    this.showMessage(UIConstants.FailureMessage, UIConstants.FailureColor);
  }

  private showMessage(message: string, color: string): void {
    const text = this.scene.add.text(
      this.scene.cameras.main.width / 2,
      this.scene.cameras.main.height / 2,
      message,
      { fontSize: UIConstants.FontSize, color: color }
    );
    text.setOrigin(0.5);
  }
}
