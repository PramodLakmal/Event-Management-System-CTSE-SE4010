const Notification = require('../models/Notification');

const getNotifications = async (req, res) => {
  try {
    let notifs;
    if (req.userRole === 'ADMIN') {
      notifs = await Notification.find({ userId: 'ADMIN' }).sort({ createdAt: -1 });
    } else {
      notifs = await Notification.find({ userId: req.userId }).sort({ createdAt: -1 });
    }
    res.json(notifs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const deleteNotifications = async (req, res) => {
  try {
    if (req.userRole === 'ADMIN') {
      await Notification.deleteMany({ userId: 'ADMIN' });
    } else {
      await Notification.deleteMany({ userId: req.userId });
    }
    res.json({ message: 'Notifications cleared' });
  } catch(e) { 
    res.status(500).json({ error: e.message }); 
  }
};

const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ error: 'Not found' });
    
    if (req.userRole === 'ADMIN') {
      if (notification.userId !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    } else {
      if (notification.userId !== req.userId) return res.status(403).json({ error: 'Forbidden' });
    }
    
    notification.read = true;
    await notification.save();
    res.json(notification);
  } catch(e) { 
    res.status(500).json({ error: e.message }); 
  }
};

const deleteSingleNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ error: 'Not found' });
    
    if (req.userRole === 'ADMIN') {
      if (notification.userId !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    } else {
      if (notification.userId !== req.userId) return res.status(403).json({ error: 'Forbidden' });
    }
    
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notification deleted' });
  } catch(e) { 
    res.status(500).json({ error: e.message }); 
  }
};

module.exports = {
  getNotifications,
  deleteNotifications,
  markAsRead,
  deleteSingleNotification
};
