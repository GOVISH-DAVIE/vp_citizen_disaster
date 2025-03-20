import * as mqtt from "mqtt";

// Connection settings for a remote MQTT broker
const protocol = 'tcp';
const host = 'i-surveil-be.virtualpolicestation.com'; //'197.231.176.209';  // Remote broker's host IP or domain
const port = '1883';  // Replace with the correct port of the remote broker (default is 1883 for MQTT)
const clientId = `i-surveil-${Math.random().toString(16).slice(3)}`;

// Create the connection URL for the remote broker
const url = `${protocol}://${host}:${port}`;

// Create MQTT client
const client: mqtt.MqttClient = mqtt.connect(url, {
  clientId,
  clean: true,
  connectTimeout: 10000,
  reconnectPeriod: 1000,
});

// Handle connection success
client.on('connect', () => {
  console.log('Connected to remote MQTT broker');
});

// Handle connection error
client.on('error', (err) => {
  console.error('MQTT connection error: ', err);
});

export default client;
