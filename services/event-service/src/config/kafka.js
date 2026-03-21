const { Kafka } = require('kafkajs');

const kafka = new Kafka({ 
  clientId: 'event-service', 
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'] 
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'event-registration-sync-group' });

module.exports = { kafka, producer, consumer };
