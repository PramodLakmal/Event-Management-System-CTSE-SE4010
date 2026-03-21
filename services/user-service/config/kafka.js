const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'user-service',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
});

const producer = kafka.producer();

const connectProducer = async () => {
  try {
    await producer.connect();
    console.log('Connected to Kafka Producer in User Service');
  } catch (err) {
    console.error('Failed to connect to Kafka', err);
    setTimeout(connectProducer, 5000);
  }
};

const publishEvent = async (topic, message) => {
  try {
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
    console.log(`Successfully published to ${topic}`);
  } catch (err) {
    console.error(`Failed to publish to topic ${topic}`, err);
  }
};

module.exports = { connectProducer, publishEvent };
