import { describe, it, expect, beforeAll, afterAll } from "vitest";
import "phaser";
import { MainScene } from "./MainScene";
import { JSDOM } from "jsdom";
import { Canvas, Image } from "canvas";
import { PaperPlane } from "../game-objects/PaperPlane";

// Stubs for browser-specific objects
const dom = new JSDOM(
  '<!DOCTYPE html><html><head></head><body><div id="game-container"></div></body></html>',
);
global.window = dom.window as unknown as Window & typeof globalThis;
global.document = dom.window.document;
global.Image = Image as unknown as typeof global.Image;
global.HTMLCanvasElement =
  dom.window.HTMLCanvasElement ||
  (Canvas as unknown as typeof global.HTMLCanvasElement);
(global.window as unknown as { Image: unknown }).Image = global.Image;

// Polyfill for requestAnimationFrame
global.window.requestAnimationFrame = (callback) => {
  return setTimeout(callback, 0);
};
global.window.cancelAnimationFrame = (id) => {
  clearTimeout(id as unknown as number);
};

describe("MainScene View", () => {
  let game: Phaser.Game;
  let scene: MainScene;
  let sceneCreatedPromise: Promise<void>;

  class TestScene extends MainScene {
    private sceneCreatedResolver!: () => void;

    constructor() {
      super();
      sceneCreatedPromise = new Promise((resolve) => {
        this.sceneCreatedResolver = resolve;
      });
    }

    preload() {
      this.load.image(
        "paper-plane",
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
      );
      this.textures.generate("pixel", { data: ["1"], pixelWidth: 1 });
    }

    create() {
      super.create();
      this.sceneCreatedResolver();
    }
  }

  beforeAll(async () => {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.HEADLESS,
      width: 800,
      height: 600,
      scene: TestScene,
      parent: "game-container",
      physics: {
        default: "arcade",
        arcade: { gravity: { y: 300 } },
      },
    };

    game = new Phaser.Game(config);

    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Scene creation timed out")), 10000),
    );

    await Promise.race([sceneCreatedPromise, timeout]);
    scene = game.scene.getScene("MainScene") as MainScene;
  }, 15000);

  afterAll(() => {
    if (game) {
      game.loop.stop();
      game.destroy(true);
    }
  });

  it("should have a visible paper plane", () => {
    const paperPlane = scene.children.list.find(
      (obj) => obj instanceof PaperPlane,
    ) as PaperPlane;
    expect(paperPlane).toBeDefined();
    expect(paperPlane.visible).toBe(true);
    expect(paperPlane.x).toBeGreaterThan(0);
    expect(paperPlane.y).toBeGreaterThan(0);
  });

  it("should have a visible ground", () => {
    const ground = scene.children.getByName("ground");
    expect(ground).toBeDefined();
    expect(ground?.visible).toBe(true);
  });

  it("should have a visible landing zone", () => {
    const landingZone = scene.children.getByName("landingZone");
    expect(landingZone).toBeDefined();
    expect(landingZone?.visible).toBe(true);
  });
});
