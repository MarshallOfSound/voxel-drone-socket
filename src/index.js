const drone = window.drone;

const NEUTRAL_PITCH = -25
const NEUTRAL_ROLL = -90;

const GRACE_ANGLE = 20;
const AFFECT_ANGLE = 40;
const SPEED_RATIO = 12;

let socket;

const connect = () => {
  socket = new WebSocket('ws://192.168.1.14:1338');
  socket.onopen = () => {
    drone.takeoff();
  };

  socket.onmessage = (payload) => {
    const data = JSON.parse(payload.data);
    let pitch = data.pitch;

    // DEV: Forward / Backward motion
    let FBdelta = 0;

    if (pitch <= NEUTRAL_PITCH - (GRACE_ANGLE / 2)) {
      FBdelta = Math.abs((NEUTRAL_PITCH - (GRACE_ANGLE / 2)) - Math.max(NEUTRAL_PITCH - AFFECT_ANGLE, pitch));
    } else if (pitch >= NEUTRAL_PITCH + (GRACE_ANGLE / 2)) {
      FBdelta = -1 * Math.abs((NEUTRAL_PITCH + (GRACE_ANGLE / 2)) - Math.min(NEUTRAL_PITCH + AFFECT_ANGLE, pitch));
    }
    drone.front(FBdelta / SPEED_RATIO);

    const roll = data.roll;
    // DEV: Rotating delta
    let Tdelta = 0;
    if (roll <= NEUTRAL_ROLL - (GRACE_ANGLE / 2)) {
      Tdelta = Math.abs((NEUTRAL_ROLL - (GRACE_ANGLE / 2)) - Math.max(NEUTRAL_ROLL - AFFECT_ANGLE, roll));
    } else if (roll >= NEUTRAL_ROLL + (GRACE_ANGLE / 2)) {
      Tdelta = -1 * Math.abs((NEUTRAL_ROLL + (GRACE_ANGLE / 2)) - Math.min(NEUTRAL_ROLL + AFFECT_ANGLE, roll));
    }
    drone.clockwise(-1 * Tdelta / (AFFECT_ANGLE - GRACE_ANGLE / (2 * Math.max(1.2, FBdelta))));
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

// DEV: Need to get these from the app somehow
window.addEventListener('keydown', (e) => {
  if (e.which === 38) {
    drone.up(1);
  } else if (e.which === 40) {
    drone.down(1);
  }
});

window.addEventListener('keyup', (e) => {
  if (e.which === 38) {
    drone.up(0);
  } else if (e.which === 40) {
    drone.down(0);
  }
});

// Send the PNG back to the app
drone._pngStream._emitPng = true;
drone._pngStream.on('data', (pngString) => {
  if (socket && socket.readyState === 1) {
    socket.send(pngString);
  }
});
