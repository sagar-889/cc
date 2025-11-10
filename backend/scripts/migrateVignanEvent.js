const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-companion';

async function migrateEvent() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected');

    const db = mongoose.connection.db;
    const eventsCollection = db.collection('events');

    // Find the old event with wrong field names
    const oldEvent = await eventsCollection.findOne({ 
      event_name: 'Vignan Mahotsav' 
    });

    if (!oldEvent) {
      console.log('❌ Event not found with event_name field');
      mongoose.connection.close();
      return;
    }

    console.log('📄 Found old event:', oldEvent);

    // Create the corrected event document
    const correctedEvent = {
      title: oldEvent.event_name,
      description: oldEvent.description,
      type: 'fest',
      organizer: 'Vignan University',
      startDate: new Date(`${oldEvent.year}-${getMonthNumber(oldEvent.month)}-01T09:00:00`),
      endDate: new Date(`${oldEvent.year}-${getMonthNumber(oldEvent.month)}-03T18:00:00`),
      location: oldEvent.venue,
      venue: oldEvent.venue,
      registrationRequired: true,
      maxParticipants: 1000,
      participants: [],
      tags: ['cultural', 'technical', 'fest', 'annual'],
      status: 'upcoming',
      createdAt: oldEvent.createdAt || new Date(),
      updatedAt: new Date()
    };

    // Update the document by replacing all fields
    const result = await eventsCollection.updateOne(
      { _id: oldEvent._id },
      { $set: correctedEvent, $unset: { event_name: '', month: '', year: '' } }
    );

    console.log('✅ Event migrated successfully!');
    console.log('Updated fields:', result.modifiedCount);
    
    // Verify the update
    const updatedEvent = await eventsCollection.findOne({ _id: oldEvent._id });
    console.log('\n📄 Updated event:');
    console.log('Title:', updatedEvent.title);
    console.log('Type:', updatedEvent.type);
    console.log('Start Date:', updatedEvent.startDate);
    console.log('End Date:', updatedEvent.endDate);

    mongoose.connection.close();
    console.log('\n✅ Migration complete!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

function getMonthNumber(monthName) {
  const months = {
    'January': '01', 'February': '02', 'March': '03', 'April': '04',
    'May': '05', 'June': '06', 'July': '07', 'August': '08',
    'September': '09', 'October': '10', 'November': '11', 'December': '12'
  };
  return months[monthName] || '01';
}

migrateEvent();
