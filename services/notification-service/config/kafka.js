const { Kafka } = require('kafkajs');
const Notification = require('../models/Notification');
const UserCache = require('../models/UserCache');
const { 
  sendWelcomeEmail, 
  sendLoginAlertEmail, 
  sendEventRegistrationEmail, 
  sendEventCancellationEmail, 
  sendNewEventBroadcastEmail 
} = require('../services/emailService');

const kafka = new Kafka({ 
  clientId: 'notification-service', 
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'] 
});

const consumer = kafka.consumer({ groupId: 'notification-group' });

const handleUserRegistered = async (payload) => {
  const { userId, name, email, role, totalNonAdminUsers } = payload;
  
  // Cache the user
  await UserCache.findOneAndUpdate(
    { userId },
    { name, email, role: role || 'USER' },
    { upsert: true, new: true }
  );

  // User Notification & Email
  const notifMsg = `Welcome to EventSync, ${name}! Your account has been created successfully.`;
  await (new Notification({ userId, type: 'USER_AUTH', message: notifMsg })).save();
  try { await sendWelcomeEmail(email, name); } catch(e) { console.error('Email failed', e); }

  // Admin Notification (No Email)
  const userCount = totalNonAdminUsers || 0;
  const adminMsg = `New User Registered: ${name} (${email}). Total Non-Admin Users: ${userCount}`;
  await (new Notification({ userId: 'ADMIN', type: 'ADMIN_NEW_USER', message: adminMsg })).save();
};

const handleUserLoggedIn = async (payload) => {
  const { userId, name, email } = payload;
  
  const notifMsg = `New login detected for your EventSync account.`;
  await (new Notification({ userId, type: 'USER_AUTH', message: notifMsg })).save();
  try { await sendLoginAlertEmail(email, name); } catch(e) { console.error('Email failed', e); }
};

const handleEventRegistered = async (payload) => {
  const { userId, eventId, title } = payload;
  
  const user = await UserCache.findOne({ userId });
  if (!user) return console.log('User not found in cache for EventRegistered');

  const eventTitle = title || `Event ID: ${eventId}`;
  const notifMsg = `You successfully registered for: ${eventTitle}`;
  await (new Notification({ userId, type: 'USER_EVENT_REG', message: notifMsg })).save();
  try { await sendEventRegistrationEmail(user.email, user.name, eventTitle); } catch(e) { console.error('Email failed', e); }

  // Admin Notification (No Email)
  const adminMsg = `User ${user.name} (${userId}) registered for: ${eventTitle}`;
  await (new Notification({ userId: 'ADMIN', type: 'ADMIN_EVENT_REG', message: adminMsg })).save();
};

const handleEventCanceled = async (payload) => {
  const { userId, eventId, title } = payload;
  
  const user = await UserCache.findOne({ userId });
  if (!user) return console.log('User not found in cache for EventCanceled');

  const eventTitle = title || `Event ID: ${eventId}`;
  const notifMsg = `Your registration for: ${eventTitle} has been cancelled.`;
  await (new Notification({ userId, type: 'USER_EVENT_REG', message: notifMsg })).save();
  try { await sendEventCancellationEmail(user.email, user.name, eventTitle); } catch(e) { console.error('Email failed', e); }
};

const handleEventCreated = async (payload) => {
  const { title, date, location } = payload;
  
  const notifMsg = `New Event Announced: ${title} at ${location} on ${date}`;
  
  // Notify ALL users directly from user-service (bypassing partial cache)
  try {
    const userSvcUrl = process.env.USER_SERVICE_URL || 'http://user-service:3001';
    const res = await fetch(userSvcUrl, {
      headers: { 'x-user-id': 'SYSTEM', 'x-user-role': 'ADMIN' }
    });
    
    if (res.ok) {
      const users = await res.json();
      for (const user of users) {
        await (new Notification({ userId: user._id, type: 'USER_NEW_EVENT', message: notifMsg })).save();
        try { 
          await sendNewEventBroadcastEmail(user.email, user.name, title, date, location); 
        } catch(e) { console.error('Email failed for user', user.email); }
      }
    } else {
      console.error('Failed to fetch users for event broadcast:', await res.text());
    }
  } catch (err) {
    console.error('Error fetching users for broadcast:', err);
  }
};

const handleEventFull = async (payload) => {
  const { eventId, title } = payload;
  const eventTitle = title || `Event ID: ${eventId}`;
  
  // Admin Notification (No Email)
  const adminMsg = `Registration is FULL for event: ${eventTitle}`;
  await (new Notification({ userId: 'ADMIN', type: 'ADMIN_EVENT_FULL', message: adminMsg })).save();
};

const runKafka = async () => {
  try { 
    await consumer.connect();
    await consumer.subscribe({ topic: 'UserRegistered', fromBeginning: true });
    await consumer.subscribe({ topic: 'UserLoggedIn', fromBeginning: true });
    await consumer.subscribe({ topic: 'EventRegistered', fromBeginning: true });
    await consumer.subscribe({ topic: 'EventCanceled', fromBeginning: true });
    await consumer.subscribe({ topic: 'EventCreated', fromBeginning: true });
    await consumer.subscribe({ topic: 'EventFull', fromBeginning: true });
    
    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        const payload = JSON.parse(message.value.toString());
        console.log(`Notification Service Received ${topic} with payload:`, payload);
        
        switch (topic) {
          case 'UserRegistered': return await handleUserRegistered(payload);
          case 'UserLoggedIn': return await handleUserLoggedIn(payload);
          case 'EventRegistered': return await handleEventRegistered(payload);
          case 'EventCanceled': return await handleEventCanceled(payload);
          case 'EventCreated': return await handleEventCreated(payload);
          case 'EventFull': return await handleEventFull(payload);
        }
      }
    });
    console.log('Connected to Kafka Consumer');
  }
  catch (err) { 
    console.error('Kafka Connection Error:', err);
    setTimeout(runKafka, 5000); 
  }
};

module.exports = { runKafka };
