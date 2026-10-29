import mongoose from 'mongoose';

const sosLogSchema = new mongoose.Schema({
  requestId: { type: String, required: true, unique: true },
  citizenName: { type: String, required: true },
  message: { type: String, required: true },
  location: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  priority: { type: String, enum: ['low', 'moderate', 'critical'], default: 'moderate' },
  status: { type: String, enum: ['pending', 'dispatched', 'resolved'], default: 'pending' },
  assignedResource: { type: String, default: null },
  incidentRef: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date, default: null }
});

const SOSLog = mongoose.model('SOSLog', sosLogSchema);
export default SOSLog;
