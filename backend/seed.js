import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Incident from './models/Incident.js';
import SOSLog from './models/SOSLog.js';
import ResourceUnit from './models/ResourceUnit.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Incident.deleteMany();
    await SOSLog.deleteMany();
    await ResourceUnit.deleteMany();
    console.log('🗑️  Cleared existing data.');

    // ═══════════════════════════════════════════
    // SEED USERS
    // ═══════════════════════════════════════════
    const users = await User.create([
      { name: 'Admin Officer', email: 'admin@aegisai.com', password: 'admin123', role: 'ADMIN' },
      { name: 'Inspector Sharma', email: 'police@aegisai.com', password: 'police123', role: 'POLICE' },
      { name: 'Dr. Patel', email: 'medic@aegisai.com', password: 'medic123', role: 'PARAMEDIC' },
      { name: 'Fire Chief Reddy', email: 'fire@aegisai.com', password: 'fire123', role: 'FIRE' },
      { name: 'Logistics Head', email: 'logistics@aegisai.com', password: 'logistics123', role: 'LOGISTICS' },
      { name: 'Citizen User', email: 'citizen@aegisai.com', password: 'citizen123', role: 'CITIZEN' },
    ]);
    console.log(`👤 Seeded ${users.length} users.`);

    // ═══════════════════════════════════════════
    // SEED INCIDENTS — Historical disaster events
    // ═══════════════════════════════════════════
    const incidents = await Incident.create([
      {
        name: 'Mumbai Flood – Kurla Sector',
        type: 'Flood',
        location: 'Kurla West, Mumbai',
        lat: 19.0700, lng: 72.8800,
        severity: 'critical',
        affectedPopulation: 847,
        casualties: 3,
        rescued: 156,
        status: 'active',
        description: 'Severe flooding due to Mithi River overflow after 84mm/hr rainfall. Multiple sectors submerged.',
        date: new Date('2026-04-12')
      },
      {
        name: 'Chennai Cyclone Aftermath',
        type: 'Cyclone',
        location: 'Ennore, Chennai',
        lat: 13.2152, lng: 80.3209,
        severity: 'high',
        affectedPopulation: 523,
        casualties: 1,
        rescued: 312,
        status: 'contained',
        description: 'Category 3 cyclone caused severe damage to coastal areas. Power infrastructure destroyed.',
        date: new Date('2026-03-15')
      },
      {
        name: 'Uttarakhand Landslide',
        type: 'Landslide',
        location: 'Joshimath, Uttarakhand',
        lat: 30.5584, lng: 79.5659,
        severity: 'critical',
        affectedPopulation: 245,
        casualties: 8,
        rescued: 189,
        status: 'resolved',
        description: 'Major landslide blocked NH-7. Multiple villages isolated. Helicopter evacuation conducted.',
        date: new Date('2026-02-20')
      },
      {
        name: 'Gujarat Industrial Fire',
        type: 'Fire',
        location: 'Vapi GIDC, Gujarat',
        lat: 20.3713, lng: 72.9047,
        severity: 'moderate',
        affectedPopulation: 120,
        casualties: 0,
        rescued: 45,
        status: 'resolved',
        description: 'Chemical plant fire in industrial zone. Toxic fumes evacuation within 2km radius.',
        date: new Date('2026-01-08')
      },
      {
        name: 'Assam River Flood',
        type: 'Flood',
        location: 'Guwahati, Assam',
        lat: 26.1445, lng: 91.7362,
        severity: 'high',
        affectedPopulation: 680,
        casualties: 5,
        rescued: 420,
        status: 'resolved',
        description: 'Annual Brahmaputra river flood affecting low-lying settlements. Boat rescue operations deployed.',
        date: new Date('2025-08-14')
      }
    ]);
    console.log(`🔥 Seeded ${incidents.length} incidents.`);

    // ═══════════════════════════════════════════
    // SEED SOS LOGS
    // ═══════════════════════════════════════════
    const sosLogs = await SOSLog.create([
      { requestId: 'REQ-1001', citizenName: 'Citizen 342', message: 'Trapped on rooftop! Water level rising fast.', location: 'Kurla West Sector', lat: 19.0720, lng: 72.8780, priority: 'critical', status: 'resolved', assignedResource: 'ACV-901', incidentRef: 'Mumbai Flood', resolvedAt: new Date() },
      { requestId: 'REQ-1002', citizenName: 'Citizen 518', message: 'Elderly person unable to move. Water at waist level.', location: 'Kurla West Sector', lat: 19.0690, lng: 72.8820, priority: 'critical', status: 'resolved', assignedResource: 'AMB-101', incidentRef: 'Mumbai Flood', resolvedAt: new Date() },
      { requestId: 'REQ-1003', citizenName: 'Citizen 127', message: 'Family of 4 stranded. Children cold and scared.', location: 'Kurla West Sector', lat: 19.0750, lng: 72.8760, priority: 'critical', status: 'dispatched', assignedResource: 'MTB-801', incidentRef: 'Mumbai Flood' },
      { requestId: 'REQ-1004', citizenName: 'Citizen 891', message: 'Street waterlogged, cannot walk out.', location: 'Kurla West Sector', lat: 19.0680, lng: 72.8850, priority: 'moderate', status: 'dispatched', assignedResource: 'POL-501', incidentRef: 'Mumbai Flood' },
      { requestId: 'REQ-1005', citizenName: 'Citizen 445', message: 'Basement flooding in apartment complex.', location: 'Kurla West Sector', lat: 19.0730, lng: 72.8730, priority: 'moderate', status: 'pending', incidentRef: 'Mumbai Flood' },
      { requestId: 'REQ-1006', citizenName: 'Citizen 203', message: 'Diabetic patient needs insulin urgently.', location: 'Kurla West Sector', lat: 19.0700, lng: 72.8800, priority: 'critical', status: 'pending', incidentRef: 'Mumbai Flood' },
      { requestId: 'REQ-1007', citizenName: 'Citizen 667', message: 'Heavy rain, tree fallen on car. Need rescue.', location: 'Kurla West Sector', lat: 19.0760, lng: 72.8870, priority: 'low', status: 'resolved', assignedResource: 'FTR-201', incidentRef: 'Mumbai Flood', resolvedAt: new Date() },
      { requestId: 'REQ-1008', citizenName: 'Citizen 104', message: 'Road blocked by debris. Need police assistance.', location: 'Kurla West Sector', lat: 19.0640, lng: 72.8790, priority: 'low', status: 'resolved', assignedResource: 'POL-502', incidentRef: 'Mumbai Flood', resolvedAt: new Date() },
      { requestId: 'REQ-1009', citizenName: 'Citizen 756', message: 'Building foundation cracking. Evacuate NOW.', location: 'Kurla West Sector', lat: 19.0710, lng: 72.8750, priority: 'critical', status: 'dispatched', assignedResource: 'FTR-202', incidentRef: 'Mumbai Flood' },
      { requestId: 'REQ-1010', citizenName: 'Citizen 582', message: 'Gas leak in apartment after flood damage.', location: 'Kurla West Sector', lat: 19.0690, lng: 72.8870, priority: 'critical', status: 'pending', incidentRef: 'Mumbai Flood' },
    ]);
    console.log(`🆘 Seeded ${sosLogs.length} SOS logs.`);

    // ═══════════════════════════════════════════
    // SEED RESOURCE UNITS — Matches frontend fleet
    // ═══════════════════════════════════════════
    const resourceUnits = await ResourceUnit.create([
      { unitId: 'AMB-101', type: 'Ambulance', baseLocation: 'Sion Hospital', lat: 19.0363, lng: 72.8604, status: 'Idle', totalDeployments: 14 },
      { unitId: 'AMB-102', type: 'Ambulance', baseLocation: 'KEM Hospital Parel', lat: 19.0012, lng: 72.8416, status: 'Idle', totalDeployments: 9 },
      { unitId: 'FTR-201', type: 'Fire Truck', baseLocation: 'Dharavi Fire Station', lat: 19.0402, lng: 72.8553, status: 'Idle', totalDeployments: 22 },
      { unitId: 'FTR-202', type: 'Fire Truck', baseLocation: 'Kurla Fire Brigade', lat: 19.0730, lng: 72.8795, status: 'Idle', totalDeployments: 18 },
      { unitId: 'POL-501', type: 'Police Cruiser', baseLocation: 'Chembur Police Station', lat: 19.0531, lng: 72.9000, status: 'Idle', totalDeployments: 31 },
      { unitId: 'POL-502', type: 'Police Cruiser', baseLocation: 'Kurla West PS', lat: 19.0680, lng: 72.8720, status: 'Idle', totalDeployments: 27 },
      { unitId: 'ACV-901', type: 'Evac Helicopter', baseLocation: 'Juhu Aerodrome', lat: 19.0968, lng: 72.8340, status: 'Idle', totalDeployments: 7 },
      { unitId: 'ACV-902', type: 'Evac Helicopter', baseLocation: 'Bandra Heli-hub', lat: 19.0596, lng: 72.8295, status: 'Idle', totalDeployments: 5 },
      { unitId: 'DRN-301', type: 'Recon Drone', baseLocation: 'Vikhroli Air Base', lat: 19.1030, lng: 72.9268, status: 'Idle', totalDeployments: 12 },
      { unitId: 'MTB-801', type: 'Rescue Boat', baseLocation: 'Mithi River – Vakola Stretch', lat: 19.0780, lng: 72.8560, status: 'Idle', totalDeployments: 16 },
      { unitId: 'MTB-802', type: 'Rescue Boat', baseLocation: 'Mithi River – BKC Bridge', lat: 19.0665, lng: 72.8620, status: 'Idle', totalDeployments: 11 },
      { unitId: 'MTB-803', type: 'Rescue Boat', baseLocation: 'Mahim Creek Outpost', lat: 19.0430, lng: 72.8450, status: 'Idle', totalDeployments: 8 },
    ]);
    console.log(`🚑 Seeded ${resourceUnits.length} resource units.`);

    console.log('\n✅ Database seeding complete!');
    console.log('═══════════════════════════════════════');
    console.log('Default login credentials:');
    console.log('  Admin:     admin@aegisai.com / admin123');
    console.log('  Police:    police@aegisai.com / police123');
    console.log('  Medic:     medic@aegisai.com / medic123');
    console.log('  Fire:      fire@aegisai.com / fire123');
    console.log('  Logistics: logistics@aegisai.com / logistics123');
    console.log('  Citizen:   citizen@aegisai.com / citizen123');
    console.log('═══════════════════════════════════════');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedData();
