export const WorldConstants = {
  WIDTH: 3840,
  HEIGHT: 1080,
};

export const GroundConstants = {
  HEIGHT: 50,
  COLOR: 0x8b4513,
};

export const LandingZoneConstants = {
  X: 3000,
  WIDTH: 400,
  HEIGHT: 50,
  COLOR: 0x00ff00,
};

export const PaperPlaneConstants = {
  START_X: 100,
  START_Y_OFFSET: 150,
  BOUNCE: 0.5,
  DRAG: 100,
  TEXTURE: "paper-plane",
};

export const SlingshotConstants = {
  MAX_DRAG_DISTANCE: 100,
  VELOCITY_MULTIPLIER: -15,
};

export const FlightConstants = {
  LIFT_COEFFICIENT: 0.05,
  LIFT_VELOCITY_DIVISOR: 10,
  SINK_FORCE: 2,
  STALL_SPEED: 200,
  TUMBLE_ANGULAR_VELOCITY: 300,
  ANGLE_COEFFICIENT: 20,
};

export const CollisionConstants = {
  TUMBLE_ANGULAR_VELOCITY: 300,
};

export const UIConstants = {
  BackgroundColor: "#242526",
  SuccessMessage: "Success!",
  FailureMessage: "Failure!",
  SuccessColor: "#00ff00",
  FailureColor: "#ff0000",
  FontSize: "64px",
};
