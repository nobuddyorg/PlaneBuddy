import { Slingshot } from './Slingshot';
import { PaperPlane } from './PaperPlane';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Phaser from 'phaser';
import { SlingshotConstants } from '../constants';

// Mock PaperPlane to isolate Slingshot's behavior
vi.mock('./PaperPlane', () => {
    const MockPaperPlane = vi.fn();
    MockPaperPlane.prototype.launch = vi.fn();
    return { PaperPlane: MockPaperPlane };
});

describe('Slingshot', () => {
    // @ts-expect-error: Suppressing because 'scene' is a mock object for testing purposes.
    let scene: Phaser.Scene;
    let paperPlane: PaperPlane;
    let onLaunch: () => void;
    let slingshot: Slingshot;
    // @ts-expect-error: Suppressing because 'pointer' is a mock object for testing purposes.
    let pointerDownCallback: (pointer: Phaser.Input.Pointer) => void;
    // @ts-expect-error: Suppressing because 'pointer' is a mock object for testing purposes.
    let pointerUpCallback: (pointer: Phaser.Input.Pointer) => void;

    beforeEach(() => {
        vi.clearAllMocks();

        // Capture the event callbacks to trigger them manually
        // @ts-expect-error: Suppressing because 'pointer' is a mock object for testing purposes.
        const eventHandlers = new Map<string, (pointer: Phaser.Input.Pointer) => void>();
        scene = {
            input: {
                on: vi.fn((event, callback) => {
                    eventHandlers.set(event, callback);
                }),
            },
        } as unknown as Phaser.Scene;

        paperPlane = new (vi.mocked(PaperPlane))(scene, 0, 0);
        onLaunch = vi.fn();

        slingshot = new Slingshot(scene, paperPlane, onLaunch);

        // Extract the registered callbacks
        pointerDownCallback = eventHandlers.get('pointerdown')!;
        pointerUpCallback = eventHandlers.get('pointerup')!;
    });

    it('should register pointerdown and pointerup event listeners', () => {
        expect(scene.input.on).toHaveBeenCalledWith('pointerdown', expect.any(Function), slingshot);
        expect(scene.input.on).toHaveBeenCalledWith('pointerup', expect.any(Function), slingshot);
    });

    it('should store the drag start position on pointerdown', () => {
        const pointer = { position: new Phaser.Math.Vector2(100, 150) };
        // @ts-expect-error: Suppressing because 'pointer' is a mock object for testing purposes.
        pointerDownCallback.call(slingshot, pointer);

        expect(slingshot['dragStart']).toEqual(pointer.position);
    });

    it('should not launch if pointerup is fired without a pointerdown', () => {
        const pointer = { position: new Phaser.Math.Vector2(200, 250) };
        // @ts-expect-error: Suppressing because 'pointer' is a mock object for testing purposes.
        pointerUpCallback.call(slingshot, pointer);

        expect(paperPlane.launch).not.toHaveBeenCalled();
        expect(onLaunch).not.toHaveBeenCalled();
    });

    it('should calculate launch velocity and launch the paperPlane on pointerup', () => {
        const startPos = new Phaser.Math.Vector2(100, 150);
        const endPos = new Phaser.Math.Vector2(120, 170);

        // @ts-expect-error: Suppressing because 'pointer' is a mock object for testing purposes.
        pointerDownCallback.call(slingshot, { position: startPos });
        // @ts-expect-error: Suppressing because 'pointer' is a mock object for testing purposes.
        pointerUpCallback.call(slingshot, { position: endPos });

        const dragVector = endPos.clone().subtract(startPos);
        const expectedVelocity = dragVector.clone().scale(SlingshotConstants.VELOCITY_MULTIPLIER);

        expect(paperPlane.launch).toHaveBeenCalledWith(expectedVelocity);
        expect(onLaunch).toHaveBeenCalled();
        expect(slingshot['dragStart']).toBeUndefined();
    });

    it('should cap the launch velocity if the drag distance exceeds the maximum', () => {
        const startPos = new Phaser.Math.Vector2(100, 100);
        const endPos = new Phaser.Math.Vector2(100, 100 + SlingshotConstants.MAX_DRAG_DISTANCE + 50);

        // @ts-expect-error: Suppressing because 'pointer' is a mock object for testing purposes.
        pointerDownCallback.call(slingshot, { position: startPos });
        // @ts-expect-error: Suppressing because 'pointer' is a mock object for testing purposes.
        pointerUpCallback.call(slingshot, { position: endPos });

        const dragVector = endPos.clone().subtract(startPos);
        dragVector.normalize().scale(SlingshotConstants.MAX_DRAG_DISTANCE);
        const expectedVelocity = dragVector.clone().scale(SlingshotConstants.VELOCITY_MULTIPLIER);

        expect(paperPlane.launch).toHaveBeenCalledWith(expectedVelocity);
    });

    it('should reset the drag start position after launching', () => {
        // @ts-expect-error: Suppressing because 'pointer' is a mock object for testing purposes.
        pointerDownCallback.call(slingshot, { position: new Phaser.Math.Vector2(100, 150) });
        // @ts-expect-error: Suppressing because 'pointer' is a mock object for testing purposes.
        pointerUpCallback.call(slingshot, { position: new Phaser.Math.Vector2(120, 170) });

        expect(slingshot['dragStart']).toBeUndefined();

        // A second pointerup should not trigger another launch
        vi.clearAllMocks();
        // @ts-expect-error: Suppressing because 'pointer' is a mock object for testing purposes.
        pointerUpCallback.call(slingshot, { position: new Phaser.Math.Vector2(130, 180) });
        expect(paperPlane.launch).not.toHaveBeenCalled();
    });
});
