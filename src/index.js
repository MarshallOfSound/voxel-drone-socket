const drone = window.drone;

const GRACE_ANGLE = 20;
const AFFECT_ANGLE = 40;
const SPEED_RATIO = 12;

const connect = () => {
  const socket = new WebSocket('ws://192.168.1.10:1338');
  socket.onopen = () => {
    drone.takeoff();
  };

  socket.onmessage = (payload) => {
    const data = JSON.parse(payload.data);
    let roll = data.orientation.roll;
    const azi = data.orientation.azimuth;
    if (azi < 180) {
      roll = 90 + (90 - roll);
    }

    // DEV: Forward / Backward motion
    let FBdelta = 0;

    if (roll <= 60 - (GRACE_ANGLE / 2)) {
      FBdelta = Math.abs((60 - (GRACE_ANGLE / 2)) - Math.max(60 - AFFECT_ANGLE, roll));
    } else if (roll >= 60 + (GRACE_ANGLE / 2)) {
      FBdelta = -1 * Math.abs((60 + (GRACE_ANGLE / 2)) - Math.min(60 + AFFECT_ANGLE, roll));
    }
    drone.front(FBdelta / SPEED_RATIO);

    const pitch = data.orientation.pitch;
    // DEV: Rotating delta
    let Tdelta = 0;
    if (pitch <= -1 * (GRACE_ANGLE / 2)) {
      Tdelta = Math.max(-1 * AFFECT_ANGLE, pitch) + (GRACE_ANGLE / 2);
    } else if (pitch >= (GRACE_ANGLE / 2)) {
      Tdelta = Math.min(AFFECT_ANGLE, pitch) - (GRACE_ANGLE / 2);
    }
    if (Tdelta <= 0) {
      drone.counterClockwise(Tdelta / (AFFECT_ANGLE - GRACE_ANGLE / 2));
    } else {
      drone.clockwise(-1 * Tdelta / (AFFECT_ANGLE - GRACE_ANGLE / 2));
    }
  };

  socket.onerror = () => {
    socket.close();
  }

  socket.onclose = () => {
    drone.land();
    setTimeout(connect, 2000);
  };
};
connect();
