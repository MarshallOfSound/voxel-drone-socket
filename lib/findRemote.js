'use strict';

const _ = require('lodash');
const ip = require('ip');
const net = require('net');

const isOpen = (port, host, callback) => {
  let isPortOpen = false;
  let executed = false;
  let timeoutId;
  let conn;

  const onClose = () => {
    if (executed) {
      return;
    }
    executed = true;
    clearTimeout(timeoutId);

    callback(isPortOpen, port, host);
  };

  const onOpen = () => {
    isPortOpen = true;
    conn.end();
  };

  timeoutId = setTimeout(() => {
    conn.destroy();
  }, 400);

  conn = net.createConnection(port, host, onOpen);
  conn.on('close', () => {
    if (!executed) {
      onClose();
    }
  });
  conn.on('error', () => { conn.end(); });
  conn.on('connect', onOpen);
};

const findRemote = () => {
  let FOUND_IP;

  return new Promise((resolveMain) => {
    const networkInterfaces = require('os').networkInterfaces();
    const promises = [];

    Object.keys(networkInterfaces).forEach((ifaceName) => {
      const ifaces = networkInterfaces[ifaceName];
      ifaces.forEach((ipObj) => {
        if (ipObj.family === 'IPv4' && ipObj.address !== '127.0.0.1') {
          let maskedIP = ip.mask(ipObj.address, ipObj.netmask);
          maskedIP = maskedIP.substr(0, maskedIP.length - 1);
          _.forEach(_.range(256), (i) => {
            const tmpIP = maskedIP + i;
            promises.push(new Promise((resolve) => {
              isOpen('1338', tmpIP, (open) => {
                if (open) {
                  FOUND_IP = tmpIP;
                }
                resolve(FOUND_IP);
              });
            }));
          });
        }
      });
    });

    Promise.all(promises)
      .then((values) => {
        resolveMain(_.find(values, (value) => {
          return value !== undefined;
        }));
      });
  });
};

module.exports = findRemote;
