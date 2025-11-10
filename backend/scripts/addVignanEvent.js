const mongoose = require('mongoose');
require('dotenv').config();

const Event = require('../models/Event');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-companion';

async function addVignanEvent() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected');

    // Delete the incorrectly formatted event if it exists
    await Event.deleteOne({ venue: 'Vignan University', description: /Annual cultural and technical fest/ });
    console.log('🗑️ Removed old event if existed');

    // Create the event with correct schema
    const vignanEvent = new Event({
      title: 'Vignan Mahotsav',
      description: 'Annual cultural and technical fest of Vignan University with various competitions, performances, workshops, and exhibitions. Join us for an exciting celebration of talent and innovation!',
      type: 'fest',
      organizer: 'Vignan University',
      startDate: new Date('2025-02-15T09:00:00'),
      endDate: new Date('2025-02-17T18:00:00'),
      location: 'Vignan University Campus',
      venue: 'Main Auditorium and Various Blocks',
      registrationRequired: true,
      registrationLink: 'https://vignan.ac.in/mahotsav',
      maxParticipants: 1000,
      participants: [],
      tags: ['cultural', 'technical', 'fest', 'annual', 'competitions', 'performances'],
      contactEmail: 'mahotsav@vignan.ac.in',
      contactPhone: '+91-1234567890',
      status: 'upcoming'
    });

    await vignanEvent.save();
    console.log('✅ Vignan Mahotsav event added successfully!');
    console.log('\nEvent Details:');
    console.log('Title:', vignanEvent.title);
    console.log('Type:', vignanEvent.type);
    console.log('Start Date:', vignanEvent.startDate);
    console.log('End Date:', vignanEvent.endDate);
    console.log('ID:', vignanEvent._id);

    mongoose.connection.close();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addVignanEvent();
