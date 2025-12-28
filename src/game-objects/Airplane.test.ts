import { Airplane } from './Airplane';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Phaser from 'phaser';
import { FlightConstants } from '../constants';

// Helper to create a game instance for testing
const createTestGame = (scene: Phaser.Scene) => {
    return new Phaser.Game({
        type: Phaser.HEADLESS,
        width: 800,
        height: 600,
        scene: scene,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 300 },
            },
        },
    });
};

class TestScene extends Phaser.Scene {
    public airplane!: Airplane;

    create() {
        this.airplane = new Airplane(this, 100, 200);
    }
}

describe('Airplane', () => {
    let game: Phaser.Game;
    let scene: TestScene;

    beforeEach(() => {
        const testScene = new TestScene();
        game = createTestGame(testScene);
        scene = testScene;
    });

    afterEach(() => {
        game.destroy(true);
    });

    it('should be initialized and configured with correct physics properties', (done) => {
        game.events.on('create', () => {
            expect(scene.airplane).toBeInstanceOf(Airplane);
            expect(scene.airplane.body).toBeDefined();
            done();
        });
    });

    it('should launch with the specified velocity', (done) => {
        game.events.on('create', () => {
            const airplane = scene.airplane;
            const launchVelocity = new Phaser.Math.Vector2(300, -200);

            airplane.launch(launchVelocity);

            expect(airplane.body.velocity.x).toBe(launchVelocity.x);
            expect(airplane.body.velocity.y).toBe(launchVelocity.y);
            done();
        });
    });

    describe('updateAirplane', () => {
        it('should not change velocity if the pointer is not down', (done) => {
            game.events.on('create', () => {
                const airplane = scene.airplane;
                const initialVelocityY = airplane.body.velocity.y;
                scene.input.activePointer.isDown = false;

                airplane.updateAirplane();

                expect(airplane.body.velocity.y).toBe(initialVelocityY);
                done();
            });
        });

        it('should apply lift when pointer is down and above the airplane', (done) => {
            game.events.on('create', () => {
                const airplane = scene.airplane;
                (airplane.body as Phaser.Physics.Arcade.Body).velocity.x = 200;
                const initialVelocityY = 50;
                (airplane.body as Phaser.Physics.Arcade.Body).velocity.y = initialVelocityY;

                scene.input.activePointer.isDown = true;
                airplane.y = 300;
                scene.input.activePointer.y = airplane.y - 50;

                airplane.updateAirplane();

                const expectedLift = (200 / FlightConstants.LIFT_VELOCITY_DIVISOR) * FlightConstants.LIFT_COEFFICIENT;
                expect(airplane.body.velocity.y).toBeCloseTo(initialVelocityY - expectedLift);
                done();
            });
        });

        it('should apply sink force when pointer is down and below the airplane', (done) => {
            game.events.on('create', () => {
                const airplane = scene.airplane;
                const initialVelocityY = 50;
                (airplane.body as Phaser.Physics.Arcade.Body).velocity.y = initialVelocityY;

                scene.input.activePointer.isDown = true;
                airplane.y = 300;
                scene.input.activePointer.y = airplane.y + 50;

                airplane.updateAirplane();

                expect(airplane.body.velocity.y).toBe(initialVelocityY + FlightConstants.SINK_FORCE);
                done();
            });
        });

        it('should tumble when velocity is below stall speed', (done) => {
            game.events.on('create', () => {
                const airplane = scene.airplane;
                (airplane.body as Phaser.Physics.Arcade.Body).velocity.x = FlightConstants.STALL_SPEED - 10;

                airplane.updateAirplane();

                expect((airplane.body as Phaser.Physics.Arcade.Body).angularVelocity).toBe(FlightConstants.TUMBLE_ANGULAR_VELOCITY);
                done();
            });
        });

        it('should fly normally and set angle based on velocity when above stall speed', (done) => {
            game.events.on('create', () => {
                const airplane = scene.airplane;
                (airplane.body as Phaser.Physics.Arcade.Body).velocity.x = FlightConstants.STALL_SPEED + 10;
                (airplane.body as Phaser.Physics.Arcade.Body).velocity.y = 50;

                airplane.updateAirplane();

                expect((airplane.body as Phaser.Physics.Arcade.Body).angularVelocity).toBe(0);
                expect(airplane.angle).toBe(50 / FlightConstants.ANGLE_COEFFICIENT);
                done();
            });
        });
    });
});
