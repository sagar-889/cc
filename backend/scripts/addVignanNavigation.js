const mongoose = require('mongoose');
require('dotenv').config();
const Navigation = require('../models/Navigation');

const vignanLocations = [
  {
    name: 'A-Block',
    type: 'building',
    block: 'A',
    description: 'Main academic block with classrooms and laboratories',
    coordinates: {
      lat: 16.232956,
      lng: 80.5475303
    },
    googleMapsUrl: 'https://www.google.co.in/maps/place/A+Block+Vignan+University,+Vadlamudi/@16.2329611,80.5449554,17z/data=!3m1!4b1!4m6!3m5!1s0x3a4a095443465995:0xa343937ffa6565dd!8m2!3d16.232956!4d80.5475303!16s%2Fg%2F11c5rqnyr8?entry=ttu&g_ep=EgoyMDI1MTAwMS4wIKXMDSoASAFQAw%3D%3D',
    facilities: ['Classrooms', 'Laboratories', 'Faculty Offices'],
    isAccessible: true,
    tags: ['academic', 'main-block', 'classrooms']
  },
  {
    name: 'H-Block',
    type: 'building',
    block: 'H',
    description: 'Academic block with specialized laboratories and classrooms',
    coordinates: {
      lat: 16.232237,
      lng: 80.5486618
    },
    googleMapsUrl: 'https://www.google.co.in/maps/place/H+block+Vignan+University/@16.2329714,80.5449554,17z/data=!4m10!1m2!2m1!1sH+Block+Vignan+University,+Vadlamudi!3m6!1s0x3a4a095462b7c677:0x6890506ed4dff2bf!8m2!3d16.232237!4d80.5486618!15sCiRIIEJsb2NrIFZpZ25hbiBVbml2ZXJzaXR5LCBWYWRsYW11ZGlaJSIjaCBibG9jayB2aWduYW4gdW5pdmVyc2l0eSB2YWRsYW11ZGmSAQp1bml2ZXJzaXR5mgEjQ2haRFNVaE5NRzluUzBWSlEwRm5TVU5NZUhSaVNrOTNFQUWqAUwQATIfEAEiG-AiQRxgTGaMgHNesLClLlZhnq1teriTF3TouDInEAIiI2ggYmxvY2sgdmlnbmFuIHVuaXZlcnNpdHkgdmFkbGFtdWRp4AEA-gEECAAQPQ!16s%2Fg%2F11bwf7w20d?entry=ttu&g_ep=EgoyMDI1MTAwMS4wIKXMDSoASAFQAw%3D%3D',
    facilities: ['Classrooms', 'Laboratories', 'Seminar Halls'],
    isAccessible: true,
    tags: ['academic', 'laboratories', 'classrooms']
  },
  {
    name: 'N-Block',
    type: 'building',
    block: 'N',
    description: 'Academic and administrative block',
    coordinates: {
      lat: 16.2326178,
      lng: 80.5503603
    },
    googleMapsUrl: 'https://www.google.co.in/maps/place/N+Block/@16.2328959,80.5479316,18z/data=!4m10!1m2!2m1!1sN+Block+Vignan+University,+Vadlamudi!3m6!1s0x3a4a09539bf3217f:0x5f07ad6281b30b73!8m2!3d16.2326178!4d80.5503603!15sCiROIEJsb2NrIFZpZ25hbiBVbml2ZXJzaXR5LCBWYWRsYW11ZGmSAQp1bml2ZXJzaXR5qgFYCgovbS8wNXE5N3R3EAEyHxABIhuPi9tsSYy03JTD1gRs_1iPJN-Nlnz_JQMZQ24yJxACIiNuIGJsb2NrIHZpZ25hbiB1bml2ZXJzaXR5IHZhZGxhbXVkaeABAA!16s%2Fg%2F11c75r6b4f?entry=ttu&g_ep=EgoyMDI1MTAwMS4wIKXMDSoASAFQAw%3D%3D',
    facilities: ['Classrooms', 'Administrative Offices', 'Meeting Rooms'],
    isAccessible: true,
    tags: ['academic', 'administrative', 'offices']
  },
  {
    name: 'U-Block',
    type: 'building',
    block: 'U',
    description: 'University academic block with modern facilities',
    coordinates: {
      lat: 16.2335496,
      lng: 80.5507278
    },
    googleMapsUrl: 'https://www.google.co.in/maps/place/Vignan+U-+Block/@16.2334647,80.5495304,18z/data=!4m10!1m2!2m1!1sU+Block+Vignan+University,+Vadlamudi!3m6!1s0x3a4a095395719229:0x9e40e58c0ebfa30d!8m2!3d16.2335496!4d80.5507278!15sCiRVIEJsb2NrIFZpZ25hbiBVbml2ZXJzaXR5LCBWYWRsYW11ZGmSAQp1bml2ZXJzaXR5qgFYCgovbS8wNXE5N3R3EAEyHxABIhu_IFOP9NJPXXUNnJNFpBeaFNGwW1whiFjn3vMyJxACIiN1IGJsb2NrIHZpZ25hbiB1bml2ZXJzaXR5IHZhZGxhbXVkaeABAA!16s%2Fg%2F11d_b9w5v2?entry=ttu&g_ep=EgoyMDI1MTAwMS4wIKXMDSoASAFQAw%3D%3D',
    facilities: ['Classrooms', 'Computer Labs', 'Study Areas'],
    isAccessible: true,
    tags: ['academic', 'modern', 'technology']
  },
  {
    name: 'Pharmacy Block',
    type: 'building',
    block: 'Pharmacy',
    description: 'Vignan Pharmacy College building with specialized pharmaceutical laboratories',
    coordinates: {
      lat: 16.2306427,
      lng: 80.5505535
    },
    department: 'Pharmacy',
    googleMapsUrl: 'https://www.google.co.in/maps/place/Vignan+Pharmacy+College,/@16.2322497,80.5460581,17z/data=!4m10!1m2!2m1!1spharmacy+Block+Vignan+University,+Vadlamudi!3m6!1s0x3a4a0953410bc2ad:0xd280b14226b473d0!8m2!3d16.2306427!4d80.5505535!15sCitwaGFybWFjeSBCbG9jayBWaWduYW4gVW5pdmVyc2l0eSwgVmFkbGFtdWRpWiwiKnBoYXJtYWN5IGJsb2NrIHZpZ25hbiB1bml2ZXJzaXR5IHZhZGxhbXVkaZIBCnVuaXZlcnNpdHmaASNDaFpEU1VoTk1HOW5TMFZKUTBGblNVTnRiazF5UjFoUkVBRaoBeQoJL20vMDFyZnBzCgovbS8wNXE5N3R3EAEqDCIIcGhhcm1hY3koADIgEAEiHL8d8cfUwyp4CB9tkXM0n1-jZ5bsKVKr1jTMbbkyLhACIipwaGFybWFjeSBibG9jayB2aWduYW4gdW5pdmVyc2l0eSB2YWRsYW11ZGngAQD6AQQIABBI!16s%2Fg%2F1tw_lnsp?entry=ttu&g_ep=EgoyMDI1MTAwMS4wIKXMDSoASAFQAw%3D%3D',
    facilities: ['Pharmaceutical Labs', 'Research Facilities', 'Classrooms', 'Faculty Offices'],
    isAccessible: true,
    tags: ['pharmacy', 'laboratories', 'research', 'specialized']
  },
  {
    name: 'NTR-Vignan Library',
    type: 'facility',
    block: 'Library',
    description: 'Central university library with extensive collection of books, journals, and digital resources',
    coordinates: {
      lat: 16.2332029,
      lng: 80.5484299
    },
    googleMapsUrl: 'https://www.google.co.in/maps/place/NTR-Vignan+Library/@16.2322599,80.5460581,17z/data=!4m10!1m2!2m1!1slibrary+Vignan+University,+Vadlamudi!3m6!1s0x3a4a09546c8f9331:0xf412131c3a90bd41!8m2!3d16.2332029!4d80.5484299!15sCiRsaWJyYXJ5IFZpZ25hbiBVbml2ZXJzaXR5LCBWYWRsYW11ZGlaJSIjbGlicmFyeSB2aWduYW4gdW5pdmVyc2l0eSB2YWRsYW11ZGmSAQdsaWJyYXJ5mgEkQ2hkRFNVaE5NRzluUzBWSlEwRm5TVVI2YVRabE5WOTNSUkFCqgGCAQoIL20vMDRoOGgKCi9tLzA1cTk3dHcQASodIhlsaWJyYXJ5IHZpZ25hbiB1bml2ZXJzaXR5KAAyIBABIhy2IlVgHDy71oyh1nNzHwr19t9ujlws25WB8LF3MicQAiIjbGlicmFyeSB2aWduYW4gdW5pdmVyc2l0eSB2YWRsYW11ZGngAQD6AQUIkgIQRw!16s%2Fg%2F1tdhcfl5?entry=ttu&g_ep=EgoyMDI1MTAwMS4wIKXMDSoASAFQAw%3D%3D',
    facilities: ['Reading Rooms', 'Digital Library', 'Study Areas', 'Book Collection', 'Journals', 'Computer Access'],
    openingHours: {
      weekdays: '8:00 AM - 10:00 PM',
      weekends: '9:00 AM - 6:00 PM'
    },
    isAccessible: true,
    tags: ['library', 'study', 'books', 'research', 'quiet-zone']
  },
  {
    name: 'Convocation Hall',
    type: 'facility',
    block: 'Convocation',
    description: 'Main auditorium for convocations, seminars, and large events',
    coordinates: {
      lat: 16.2337901,
      lng: 80.5515656
    },
    googleMapsUrl: 'https://www.google.co.in/maps/place/Vignan+convocation+hall/@16.2337952,80.5489907,17z/data=!3m1!4b1!4m6!3m5!1s0x3a4a0953c81637f1:0xb55656f1f38e4bdd!8m2!3d16.2337901!4d80.5515656!16s%2Fg%2F11g6rl6kb2?entry=ttu&g_ep=EgoyMDI1MTAwMS4wIKXMDSoASAFQAw%3D%3D',
    facilities: ['Auditorium', 'Stage', 'Audio-Visual Equipment', 'Seating for 2000+', 'Air Conditioning'],
    isAccessible: true,
    tags: ['auditorium', 'events', 'convocation', 'seminars', 'large-venue']
  }
];

async function addVignanNavigation() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing navigation data (optional - comment out if you want to keep existing data)
    // await Navigation.deleteMany({});
    // console.log('🗑️  Cleared existing navigation data');

    // Check if locations already exist
    for (const location of vignanLocations) {
      const existing = await Navigation.findOne({ name: location.name });
      if (existing) {
        console.log(`⚠️  ${location.name} already exists, updating...`);
        await Navigation.findByIdAndUpdate(existing._id, location);
      } else {
        await Navigation.create(location);
        console.log(`✅ Added ${location.name}`);
      }
    }

    console.log('\n✅ Successfully added all Vignan University navigation locations!');
    console.log(`📍 Total locations: ${vignanLocations.length}`);
    
    // Display summary
    console.log('\n📋 Added Locations:');
    vignanLocations.forEach((loc, index) => {
      console.log(`${index + 1}. ${loc.name} (${loc.type})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding navigation data:', error);
    process.exit(1);
  }
}

// Run the script
addVignanNavigation();
