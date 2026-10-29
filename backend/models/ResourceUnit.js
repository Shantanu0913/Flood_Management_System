import mongoose from 'mongoose';

const resourceUnitSchema = new mongoose.Schema({
  unitId: { type: String, required: true, unique: true },
  type: { 
    type: String, 
    required: true, 
    enum: ['Ambulance', 'Fire Truck', 'Police Cruiser', 'Recon Drone', 'Supply Truck', 'Rescue Boat', 'Evac Helicopter'] 
  },
  baseLocation: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  status: { type: String, enum: ['Idle', 'Assigned', 'En Route', 'Arrived', 'Maintenance'], default: 'Idle' },
  totalDeployments: { type: Number, default: 0 },
  lastDeployed: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

const ResourceUnit = mongoose.model('ResourceUnit', resourceUnitSchema);
export default ResourceUnit;
