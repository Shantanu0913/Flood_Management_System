import Incident from '../models/Incident.js';
import SOSLog from '../models/SOSLog.js';
import ResourceUnit from '../models/ResourceUnit.js';

// @desc    Get all incidents
// @route   GET /api/data/incidents
export const getIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find().sort({ date: -1 });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch incidents' });
  }
};

// @desc    Get all SOS logs
// @route   GET /api/data/sos-logs
export const getSOSLogs = async (req, res) => {
  try {
    const logs = await SOSLog.find().sort({ createdAt: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch SOS logs' });
  }
};

// @desc    Get all resource units
// @route   GET /api/data/resources
export const getResources = async (req, res) => {
  try {
    const resources = await ResourceUnit.find().sort({ unitId: 1 });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch resources' });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/data/stats
export const getStats = async (req, res) => {
  try {
    const totalIncidents = await Incident.countDocuments();
    const activeIncidents = await Incident.countDocuments({ status: 'active' });
    const totalSOS = await SOSLog.countDocuments();
    const resolvedSOS = await SOSLog.countDocuments({ status: 'resolved' });
    const totalResources = await ResourceUnit.countDocuments();
    const idleResources = await ResourceUnit.countDocuments({ status: 'Idle' });
    const totalUsers = (await import('../models/User.js')).default;
    const userCount = await totalUsers.countDocuments();

    res.json({
      totalIncidents,
      activeIncidents,
      totalSOS,
      resolvedSOS,
      totalResources,
      idleResources,
      totalUsers: userCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
};
