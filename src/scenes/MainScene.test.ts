import { MainScene } from './MainScene';
import { GameState } from '../state/GameState';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('MainScene', () => {
  let scene: MainScene;

  beforeEach(() => {
    scene = new MainScene();
    scene.sys = {
      game: {
        config: {
          width: 800,
          height: 600,
        },
      },
      events: {
        once: vi.fn(),
        on: vi.fn(),
        emit: vi.fn(),
      },
    } as any;
    scene.cameras = {
      main: {
        setBackgroundColor: vi.fn(),
        setBounds: vi.fn(),
        startFollow: vi.fn(),
        width: 800,
        height: 600,
      },
    } as any;
    scene.physics = {
      world: {
        setBounds: vi.fn(),
        bounds: {
          width: 800,
          height: 600,
        },
      },
      add: {
        existing: vi.fn(),
        collider: vi.fn(),
      },
    } as any;
    scene.add = {
      rectangle: vi.fn().mockReturnValue({
        body: {
          setAllowGravity: vi.fn(),
          setImmovable: vi.fn(),
        },
      }),
    } as any;
    scene.input = {
      once: vi.fn(),
    } as any;
  });

  it('should create', () => {
    expect(scene).toBeInstanceOf(MainScene);
  });

  it('should end the game with success', () => {
    scene.uiManager = {
      showSuccessMessage: vi.fn(),
      showFailureMessage: vi.fn(),
    } as any;
    scene.airplane = {
      body: {
        setAngularVelocity: vi.fn(),
      } as unknown as Phaser.Physics.Arcade.Body,
    } as any;
    scene.landingZone = {} as any;

    scene['_endGame'](true);

    expect(scene.gameState).toBe(GameState.GameOver);
    expect(scene.airplane.body.setAngularVelocity).toHaveBeenCalled();
    expect(scene.uiManager.showSuccessMessage).toHaveBeenCalled();
    expect(scene.uiManager.showFailureMessage).not.toHaveBeenCalled();
    expect(scene.input.once).toHaveBeenCalledWith('pointerdown', expect.any(Function));
  });

  it('should end the game with failure', () => {
    scene.uiManager = {
      showSuccessMessage: vi.fn(),
      showFailureMessage: vi.fn(),
    } as any;
    scene.airplane = {
      body: {
        setAngularVelocity: vi.fn(),
      } as unknown as Phaser.Physics.Arcade.Body,
    } as any;

    scene['_endGame'](false);

    expect(scene.gameState).toBe(GameState.GameOver);
    expect(scene.airplane.body.setAngularVelocity).toHaveBeenCalled();
    expect(scene.uiManager.showSuccessMessage).not.toHaveBeenCalled();
    expect(scene.uiManager.showFailureMessage).toHaveBeenCalled();
    expect(scene.input.once).toHaveBeenCalledWith('pointerdown', expect.any(Function));
  });

  it('should handle collision correctly when terrain is the landing zone', () => {
    scene.landingZone = {} as any;
    scene['_endGame'] = vi.fn();
    scene.gameState = GameState.InFlight;
    scene.handleCollision({} as any, scene.landingZone);
    expect(scene['_endGame']).toHaveBeenCalledWith(true);
  });

  it('should handle collision correctly when terrain is not the landing zone', () => {
    scene.landingZone = {} as any;
    scene['_endGame'] = vi.fn();
    scene.gameState = GameState.InFlight;
    scene.handleCollision({} as any, {} as any);
    expect(scene['_endGame']).toHaveBeenCalledWith(false);
  });

  it('should not handle collision if game is already over', () => {
    scene['_endGame'] = vi.fn();
    scene.gameState = GameState.GameOver;
    scene.handleCollision({} as any, {} as any);
    expect(scene['_endGame']).not.toHaveBeenCalled();
  });
});
