const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || 'registration-service',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
  retry: {
    initialRetryTime: 300,
    retries: 8,
    multiplier: 2,
    maxRetryTime: 30000,
    randomizationFactor: 0.2
  }
});

let producer = null;

const getProducer = async () => {
  if (!producer) {
    producer = kafka.producer();
    await producer.connect();
    console.log('Kafka Producer connected');
  }
  return producer;
};

const publishMessage = async (topic, message) => {
  try {
    const prod = await getProducer();
    await prod.send({
      topic,
      messages: [
        {
          key: message.userId || message.eventId,
          value: JSON.stringify(message),
          headers: {
            'correlation-id': message.correlationId || Date.now().toString()
          }
        }
      ]
    });
    console.log(`Message published to topic: ${topic}`);
  } catch (error) {
    console.error(`Error publishing message to Kafka: ${error.message}`);
    throw error;
  }
};

const disconnectProducer = async () => {
  if (producer) {
    await producer.disconnect();
    producer = null;
  }
};

module.exports = {
  kafka,
  getProducer,
  publishMessage,
  disconnectProducer
};
