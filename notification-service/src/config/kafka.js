const { Kafka } = require('kafkajs');
const Notification = require('../models/Notification');

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || 'notification-service',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(',')
});

const consumer = kafka.consumer({ groupId: process.env.KAFKA_GROUP_ID || 'notification-group' });

const startConsumer = async () => {
  try {
    await consumer.connect();
    console.log('Kafka consumer connected');

    await consumer.subscribe({ 
      topic: 'registration-events',
      fromBeginning: false 
    });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const event = JSON.parse(message.value.toString());
          console.log('Received message from topic:', topic, event);

          // Handle USER_REGISTERED event
          if (event.type === 'USER_REGISTERED') {
            await handleUserRegistration(event);
          }
          // Handle REGISTRATION_CANCELLED event
          else if (event.type === 'REGISTRATION_CANCELLED') {
            await handleRegistrationCancellation(event);
          }
        } catch (error) {
          console.error('Error processing Kafka message:', error);
        }
      }
    });

    console.log('Notification consumer started and listening to registration-events topic');
  } catch (error) {
    console.error('Error starting Kafka consumer:', error);
    process.exit(1);
  }
};

const handleUserRegistration = async (event) => {
  try {
    const notification = new Notification({
      userId: event.userId,
      type: 'registration',
      title: 'Registration Successful',
      message: `You have successfully registered for the event: ${event.eventId}`,
      eventId: event.eventId,
      channel: 'in-app',
      status: 'sent',
      metadata: {
        registrationId: event.registrationId,
        correlationId: event.correlationId,
        userEmail: event.userEmail,
        userName: event.userName
      },
      sentAt: new Date()
    });

    await notification.save();
    console.log(`Notification saved for user ${event.userId} - Registration event`);

    // Simulate email notification
    console.log(`[EMAIL] Sending confirmation email to ${event.userEmail}`);
  } catch (error) {
    console.error('Error handling user registration event:', error);
  }
};

const handleRegistrationCancellation = async (event) => {
  try {
    const notification = new Notification({
      userId: event.userId,
      type: 'cancellation',
      title: 'Registration Cancelled',
      message: `Your registration for event ${event.eventId} has been cancelled`,
      eventId: event.eventId,
      channel: 'in-app',
      status: 'sent',
      metadata: {
        registrationId: event.registrationId,
        correlationId: event.correlationId,
        userEmail: event.userEmail,
        userName: event.userName
      },
      sentAt: new Date()
    });

    await notification.save();
    console.log(`Notification saved for user ${event.userId} - Cancellation event`);

    // Simulate email notification
    console.log(`[EMAIL] Sending cancellation email to ${event.userEmail}`);
  } catch (error) {
    console.error('Error handling cancellation event:', error);
  }
};

const disconnectConsumer = async () => {
  await consumer.disconnect();
  console.log('Kafka consumer disconnected');
};

module.exports = {
  startConsumer,
  disconnectConsumer,
  consumer
};
