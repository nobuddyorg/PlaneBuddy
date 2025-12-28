import { Slingshot } from './Slingshot';
import { Airplane } from './Airplane';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Phaser from 'phaser';
import { SlingshotConstants } from '../constants';

// Mock Airplane to isolate Slingshot's behavior
vi.mock('./Airplane', () => {
    const MockAirplane = vi.fn();
    MockAirplane.prototype.launch = vi.fn();
    return { Airplane: MockAirplane };
});

describe('Slingshot', () => {
    let scene: any;
    let airplane: any;
    let onLaunch: any;
    let slingshot: Slingshot;
    let pointerDownCallback: (pointer: any) => void;
    let pointerUpCallback: (pointer: any) => void;

    beforeEach(() => {
        vi.clearAllMocks();

        // Capture the event callbacks to trigger them manually
        const eventHandlers = new Map<string, (pointer: any) => void>();
        scene = {
            input: {
                on: vi.fn((event, callback) => {
                    eventHandlers.set(event, callback);
                }),
            },
        };

        airplane = new (vi.mocked(Airplane))(scene, 0, 0);
        onLaunch = vi.fn();

        slingshot = new Slingshot(scene, airplane, onLaunch);

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
        pointerDownCallback.call(slingshot, pointer);

        // Internal state is not directly testable, but we can verify its effect in pointerup
        expect((slingshot as any).dragStart).toEqual(pointer.position);
    });

    it('should not launch if pointerup is fired without a pointerdown', () => {
        const pointer = { position: new Phaser.Math.Vector2(200, 250) };
        pointerUpCallback.call(slingshot, pointer);

        expect(airplane.launch).not.toHaveBeenCalled();
        expect(onLaunch).not.toHaveBeenCalled();
    });

    it('should calculate launch velocity and launch the airplane on pointerup', () => {
        const startPos = new Phaser.Math.Vector2(100, 150);
        const endPos = new Phaser.Math.Vector2(120, 170);

        pointerDownCallback.call(slingshot, { position: startPos });
        pointerUpCallback.call(slingshot, { position: endPos });

        const dragVector = endPos.clone().subtract(startPos);
        const expectedVelocity = dragVector.clone().scale(SlingshotConstants.VELOCITY_MULTIPLIER);

        expect(airplane.launch).toHaveBeenCalledWith(expectedVelocity);
        expect(onLaunch).toHaveBeenCalled();
        expect((slingshot as any).dragStart).toBeUndefined();
    });

    it('should cap the launch velocity if the drag distance exceeds the maximum', () => {
        const startPos = new Phaser.Math.Vector2(100, 100);
        const endPos = new Phaser.Math.Vector2(100, 100 + SlingshotConstants.MAX_DRAG_DISTANCE + 50);

        pointerDownCallback.call(slingshot, { position: startPos });
        pointerUpCallback.call(slingshot, { position: endPos });

        const dragVector = endPos.clone().subtract(startPos);
        dragVector.normalize().scale(SlingshotConstants.MAX_DRAG_DISTANCE);
        const expectedVelocity = dragVector.clone().scale(SlingshotConstants.VELOCITY_MULTIPLIER);

        expect(airplane.launch).toHaveBeenCalledWith(expectedVelocity);
    });

    it('should reset the drag start position after launching', () => {
        pointerDownCallback.call(slingshot, { position: new Phaser.Math.Vector2(100, 150) });
        pointerUpCallback.call(slingshot, { position: new Phaser.Math.Vector2(120, 170) });

        expect((slingshot as any).dragStart).toBeUndefined();

        // A second pointerup should not trigger another launch
        vi.clearAllMocks();
        pointerUpCallback.call(slingshot, { position: new Phaser.Math.Vector2(130, 180) });
        expect(airplane.launch).not.toHaveBeenCalled();
    });
});
