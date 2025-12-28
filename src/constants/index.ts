export const WorldConstants = {
  WIDTH: 3840,
  HEIGHT: 1080,
};

export const GroundConstants = {
  HEIGHT: 50,
  COLOR: 0x8B4513,
};

export const LandingZoneConstants = {
  X: 3000,
  WIDTH: 400,
  HEIGHT: 50,
  COLOR: 0x00FF00,
};

export const AirplaneConstants = {
  START_X: 100,
  START_Y_OFFSET: 150,
  BOUNCE: 0.5,
  DRAG: 100,
  TEXTURE: 'airplane',
};

export const SlingshotConstants = {
  MAX_DRAG_DISTANCE: 200,
  VELOCITY_MULTIPLIER: -10,
};

export const FlightConstants = {
  LIFT_COEFFICIENT: 0.1,
  LIFT_VELOCITY_DIVISOR: 2,
  SINK_FORCE: 10,
  STALL_SPEED: 100,
  TUMBLE_ANGULAR_VELOCITY: 200,
  ANGLE_COEFFICIENT: 10,
};

export const CollisionConstants = {
  TUMBLE_ANGULAR_VELOCITY: 300,
};

export const UIConstants = {
  BackgroundColor: '#242526',
  SuccessMessage: 'Success!',
  FailureMessage: 'Failure!',
  SuccessColor: '#00ff00',
  FailureColor: '#ff0000',
  FontSize: '64px',
};
