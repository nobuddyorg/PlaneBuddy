import { MainScene } from "./MainScene";
import { GameState } from "../state/GameState";
import { describe, it, expect, beforeEach, vi } from "vitest";

describe("MainScene", () => {
  let scene: MainScene;

  beforeEach(() => {
    scene = new MainScene();
    // @ts-expect-error: Suppressing because 'sys' is a mock object for testing purposes.
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
    };
    // @ts-expect-error: Suppressing because 'cameras' is a mock object for testing purposes.
    scene.cameras = {
      main: {
        setBackgroundColor: vi.fn(),
        setBounds: vi.fn(),
        startFollow: vi.fn(),
        width: 800,
        height: 600,
      },
    };
    // @ts-expect-error: Suppressing because 'physics' is a mock object for testing purposes.
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
    };
    // @ts-expect-error: Suppressing because 'add' is a mock object for testing purposes.
    scene.add = {
      rectangle: vi.fn().mockReturnValue({
        body: {
          setAllowGravity: vi.fn(),
          setImmovable: vi.fn(),
        },
      }),
    };
    // @ts-expect-error: Suppressing because 'input' is a mock object for testing purposes.
    scene.input = {
      once: vi.fn(),
    };
  });

  it("should create", () => {
    expect(scene).toBeInstanceOf(MainScene);
  });

  it("should end the game with success", () => {
    // @ts-expect-error: Suppressing because 'uiManager' is a mock object for testing purposes.
    scene.uiManager = {
      showSuccessMessage: vi.fn(),
      showFailureMessage: vi.fn(),
    };
    // @ts-expect-error: Suppressing because 'paperPlane' is a mock object for testing purposes.
    scene.paperPlane = {
      body: {
        setAngularVelocity: vi.fn(),
      } as unknown as Phaser.Physics.Arcade.Body,
    };
    // @ts-expect-error: Suppressing because 'landingZone' is a mock object for testing purposes.
    scene.landingZone = {};

    scene["_endGame"](true);

    expect(scene.gameState).toBe(GameState.GameOver);
    expect(scene.paperPlane.body.setAngularVelocity).toHaveBeenCalled();
    expect(scene.uiManager.showSuccessMessage).toHaveBeenCalled();
    expect(scene.uiManager.showFailureMessage).not.toHaveBeenCalled();
    expect(scene.input.once).toHaveBeenCalledWith(
      "pointerdown",
      expect.any(Function),
    );
  });

  it("should end the game with failure", () => {
    // @ts-expect-error: Suppressing because 'uiManager' is a mock object for testing purposes.
    scene.uiManager = {
      showSuccessMessage: vi.fn(),
      showFailureMessage: vi.fn(),
    };
    // @ts-expect-error: Suppressing because 'paperPlane' is a mock object for testing purposes.
    scene.paperPlane = {
      body: {
        setAngularVelocity: vi.fn(),
      } as unknown as Phaser.Physics.Arcade.Body,
    };

    scene["_endGame"](false);

    expect(scene.gameState).toBe(GameState.GameOver);
    expect(scene.paperPlane.body.setAngularVelocity).toHaveBeenCalled();
    expect(scene.uiManager.showSuccessMessage).not.toHaveBeenCalled();
    expect(scene.uiManager.showFailureMessage).toHaveBeenCalled();
    expect(scene.input.once).toHaveBeenCalledWith(
      "pointerdown",
      expect.any(Function),
    );
  });

  it("should handle collision correctly when terrain is the landing zone", () => {
    // @ts-expect-error: Suppressing because 'landingZone' is a mock object for testing purposes.
    scene.landingZone = { name: "landingZone" };
    scene["_endGame"] = vi.fn();
    scene.gameState = GameState.InFlight;
    const mockPaperPlane = {
      body: {
        velocity: {
          x: 0,
        },
      },
    };
    // @ts-expect-error: Suppressing because this is a mock object for testing purposes.
    scene.handleCollision(mockPaperPlane, scene.landingZone);
    expect(scene["_endGame"]).toHaveBeenCalledWith(true);
  });

  it("should handle collision correctly when terrain is not the landing zone", () => {
    // @ts-expect-error: Suppressing because 'landingZone' is a mock object for testing purposes.
    scene.landingZone = {};
    scene["_endGame"] = vi.fn();
    scene.gameState = GameState.InFlight;
    // @ts-expect-error: Suppressing because this is a mock object for testing purposes.
    scene.handleCollision({}, {});
    expect(scene["_endGame"]).toHaveBeenCalledWith(false);
  });

  it("should not handle collision if game is already over", () => {
    scene["_endGame"] = vi.fn();
    scene.gameState = GameState.GameOver;
    // @ts-expect-error: Suppressing because this is a mock object for testing purposes.
    scene.handleCollision({}, {});
    expect(scene["_endGame"]).not.toHaveBeenCalled();
  });
});
