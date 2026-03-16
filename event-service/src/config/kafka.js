const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || 'event-service',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
  retry: {
    initialRetryTime: 300,
    retries: 8,
    multiplier: 2,
    maxRetryTime: 30000,
    randomizationFactor: 0.2
  }
});

module.exports = kafka;
