const axios = require('axios');

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';
const EVENT_SERVICE_URL = process.env.EVENT_SERVICE_URL || 'http://localhost:3002';

/**
 * Verify user exists
 */
const verifyUser = async (userId, token) => {
  try {
    const response = await axios.get(`${USER_SERVICE_URL}/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });
    return response.data.data?.user;
  } catch (error) {
    console.error(`Error verifying user: ${error.message}`);
    return null;
  }
};

/**
 * Verify event exists and get availability
 */
const verifyEvent = async (eventId) => {
  try {
    const response = await axios.get(`${EVENT_SERVICE_URL}/events/${eventId}`, {
      timeout: 5000
    });
    return response.data.data?.event;
  } catch (error) {
    console.error(`Error verifying event: ${error.message}`);
    return null;
  }
};

/**
 * Get event availability
 */
const getEventAvailability = async (eventId) => {
  try {
    const response = await axios.get(
      `${EVENT_SERVICE_URL}/events/${eventId}/availability`,
      { timeout: 5000 }
    );
    return response.data.data;
  } catch (error) {
    console.error(`Error getting event availability: ${error.message}`);
    return null;
  }
};

/**
 * Register user for event in Event Service
 */
const registerUserForEvent = async (eventId) => {
  try {
    const response = await axios.post(
      `${EVENT_SERVICE_URL}/events/${eventId}/register`,
      {},
      { timeout: 5000 }
    );
    return response.data.data;
  } catch (error) {
    console.error(`Error registering for event: ${error.message}`);
    return null;
  }
};

module.exports = {
  verifyUser,
  verifyEvent,
  getEventAvailability,
  registerUserForEvent
};
