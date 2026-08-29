const Settings = require('../models/Settings');

const checkMaintenance = async (req, res, next) => {
  try {
    // 1. ALWAYS let Admin routes and Auth routes (login/logout) pass through! 
    // If we block auth, you wouldn't be able to log in to turn maintenance mode off!
    if (req.originalUrl.includes('/api/admin') || req.originalUrl.includes('/api/auth')) {
      return next();
    }

    // 2. Check the database for the global settings
    const settings = await Settings.findOne();
    
    // 3. If maintenance is ON, block the request with a 503 Service Unavailable status
    if (settings && settings.maintenanceMode) {
      return res.status(503).json({ 
        success: false, 
        message: '🚧 WorkMitra is currently down for maintenance and upgrades. We will be back shortly!' 
      });
    }

    // 4. If maintenance is OFF, let the user proceed normally
    next();
  } catch (error) {
    // If there's a DB error fetching settings, just let them through to be safe
    next();
  }
};

module.exports = checkMaintenance;