import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true, enum: ['Flood', 'Cyclone', 'Earthquake', 'Fire', 'Landslide', 'Tsunami', 'Industrial'] },
  location: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  severity: { type: String, enum: ['low', 'moderate', 'high', 'critical'], default: 'moderate' },
  affectedPopulation: { type: Number, default: 0 },
  casualties: { type: Number, default: 0 },
  rescued: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'contained', 'resolved'], default: 'active' },
  description: { type: String },
  date: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

const Incident = mongoose.model('Incident', incidentSchema);
export default Incident;
