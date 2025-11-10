const Course = require('../models/Course');
const User = require('../models/User');
const Timetable = require('../models/Timetable');
const Faculty = require('../models/Faculty');

class AutomatedTimetableGenerator {
  constructor() {
    this.constraints = {
      // Time constraints for different years
      year1to3: {
        startTime: '08:15',
        endTime: '16:00',
        morningBreak: { start: '10:15', duration: 15 }, // 15 min break
        lunchBreak: { start: '12:30', duration: 60 },   // 1 hour lunch
        classDuration: 60, // 1 hour classes
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      },
      finalYear: {
        startTime: '10:00',
        endTime: '16:10',
        morningBreak: { start: '11:30', duration: 15 },
        lunchBreak: { start: '13:15', duration: 60 },
        classDuration: 60,
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      }
    };
  }

  async generateTimetableForAllSections(adminUserId) {
    try {
      console.log('🚀 Starting automated timetable generation...');

      // Get all courses and sections
      const courses = await Course.find().populate('faculty');
      const sections = await this.getAllSections();

      console.log(`📚 Found ${courses.length} courses and ${sections.length} sections`);

      const results = [];
      const errors = [];

      // Generate timetable for each section
      for (const section of sections) {
        try {
          console.log(`⏰ Generating timetable for ${section.name} (${section.year} year)`);

          const timetable = await this.generateSectionTimetable(section, courses);

          if (timetable) {
            results.push({
              section: section.name,
              year: section.year,
              entries: timetable.entries.length,
              success: true
            });
          } else {
            errors.push({
              section: section.name,
              error: 'Failed to generate timetable'
            });
          }
        } catch (error) {
          console.error(`❌ Error generating timetable for ${section.name}:`, error);
          errors.push({
            section: section.name,
            error: error.message
          });
        }
      }

      return {
        success: results.length > 0,
        totalSections: sections.length,
        successful: results.length,
        failed: errors.length,
        results,
        errors
      };

    } catch (error) {
      console.error('Timetable generation failed:', error);
      throw error;
    }
  }

  async generateSectionTimetable(section, courses) {
    try {
      // Get constraints for this section's year
      const constraints = section.year === 4 ? this.constraints.finalYear : this.constraints.year1to3;

      // Filter courses relevant to this section
      const relevantCourses = courses.filter(course =>
        course.year === section.year ||
        course.department === section.department ||
        course.universal // courses for all years/departments
      );

      console.log(`📝 Generating schedule for ${section.name} with ${relevantCourses.length} courses`);

      // Create schedule slots
      const scheduleSlots = this.createScheduleSlots(constraints);

      // Assign courses to slots
      const assignments = this.assignCoursesToSlots(relevantCourses, scheduleSlots, constraints);

      // Create timetable entries
      const timetableEntries = assignments.map(assignment => ({
        course: assignment.course._id,
        day: assignment.day,
        startTime: assignment.startTime,
        endTime: assignment.endTime,
        room: assignment.room,
        faculty: assignment.faculty._id,
        section: section._id,
        type: 'lecture'
      }));

      // Check for conflicts
      const conflicts = this.checkConflicts(timetableEntries);
      if (conflicts.length > 0) {
        console.warn(`⚠️ Found ${conflicts.length} conflicts for ${section.name}`);
        // Try to resolve conflicts
        await this.resolveConflicts(timetableEntries, conflicts);
      }

      // Create or update timetable
      let timetable = await Timetable.findOne({ section: section._id });

      if (!timetable) {
        timetable = new Timetable({
          section: section._id,
          year: section.year,
          semester: section.semester || 1,
          entries: timetableEntries,
          generatedBy: 'automated_system',
          isActive: true
        });
      } else {
        timetable.entries = timetableEntries;
        timetable.generatedBy = 'automated_system';
        timetable.lastGenerated = new Date();
      }

      await timetable.save();

      console.log(`✅ Generated timetable for ${section.name} with ${timetableEntries.length} entries`);
      return timetable;

    } catch (error) {
      console.error(`Failed to generate timetable for ${section.name}:`, error);
      throw error;
    }
  }

  createScheduleSlots(constraints) {
    const slots = [];
    const { days, startTime, endTime, morningBreak, lunchBreak, classDuration } = constraints;

    for (const day of days) {
      let currentTime = this.timeToMinutes(startTime);
      const endMinutes = this.timeToMinutes(endTime);

      while (currentTime + classDuration <= endMinutes) {
        // Skip break times
        const slotStart = this.minutesToTime(currentTime);

        // Check if this slot conflicts with breaks
        if (this.isBreakTime(slotStart, constraints)) {
          currentTime += classDuration;
          continue;
        }

        // Check if this slot is during lunch break
        if (this.timeToMinutes(slotStart) >= this.timeToMinutes(morningBreak.start) &&
            this.timeToMinutes(slotStart) < this.timeToMinutes(morningBreak.start) + morningBreak.duration) {
          currentTime += classDuration;
          continue;
        }

        if (this.timeToMinutes(slotStart) >= this.timeToMinutes(lunchBreak.start) &&
            this.timeToMinutes(slotStart) < this.timeToMinutes(lunchBreak.start) + lunchBreak.duration) {
          currentTime += classDuration;
          continue;
        }

        slots.push({
          day,
          startTime: slotStart,
          endTime: this.minutesToTime(currentTime + classDuration),
          available: true
        });

        currentTime += classDuration;
      }
    }

    return slots;
  }

  assignCoursesToSlots(courses, slots, constraints) {
    const assignments = [];
    const usedSlots = new Set();

    for (const course of courses) {
      if (!course.faculty || course.faculty.length === 0) {
        console.warn(`⚠️ Course ${course.code} has no assigned faculty`);
        continue;
      }

      // Find available slots for this course
      const availableSlots = slots.filter(slot =>
        !usedSlots.has(`${slot.day}-${slot.startTime}`) &&
        !this.isBreakTime(slot.startTime, constraints)
      );

      if (availableSlots.length === 0) {
        console.warn(`⚠️ No available slots for course ${course.code}`);
        continue;
      }

      // Select random available slot
      const selectedSlot = availableSlots[Math.floor(Math.random() * availableSlots.length)];
      const faculty = course.faculty[Math.floor(Math.random() * course.faculty.length)];

      assignments.push({
        course,
        day: selectedSlot.day,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        room: this.generateRoomNumber(course.department),
        faculty
      });

      usedSlots.add(`${selectedSlot.day}-${selectedSlot.startTime}`);
    }

    return assignments;
  }

  isBreakTime(timeString, constraints) {
    const timeMinutes = this.timeToMinutes(timeString);
    const morningBreakStart = this.timeToMinutes(constraints.morningBreak.start);
    const morningBreakEnd = morningBreakStart + constraints.morningBreak.duration;
    const lunchBreakStart = this.timeToMinutes(constraints.lunchBreak.start);
    const lunchBreakEnd = lunchBreakStart + constraints.lunchBreak.duration;

    return (timeMinutes >= morningBreakStart && timeMinutes < morningBreakEnd) ||
           (timeMinutes >= lunchBreakStart && timeMinutes < lunchBreakEnd);
  }

  checkConflicts(entries) {
    const conflicts = [];

    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const entry1 = entries[i];
        const entry2 = entries[j];

        if (entry1.day === entry2.day &&
            entry1.startTime === entry2.startTime &&
            entry1.faculty.toString() === entry2.faculty.toString()) {
          conflicts.push({
            entry1,
            entry2,
            type: 'faculty_conflict',
            message: `Faculty ${entry1.faculty.name} has conflicting classes`
          });
        }
      }
    }

    return conflicts;
  }

  async resolveConflicts(entries, conflicts) {
    console.log(`🔧 Resolving ${conflicts.length} conflicts...`);

    for (const conflict of conflicts) {
      // Try to reassign one of the conflicting entries
      const { entry1, entry2 } = conflict;

      // Find alternative slot for entry2
      const alternativeSlot = this.findAlternativeSlot(entries, entry2);
      if (alternativeSlot) {
        entry2.day = alternativeSlot.day;
        entry2.startTime = alternativeSlot.startTime;
        entry2.endTime = alternativeSlot.endTime;
      }
    }
  }

  findAlternativeSlot(entries, conflictingEntry) {
    // Simple algorithm to find next available slot
    const constraints = conflictingEntry.section?.year === 4 ?
      this.constraints.finalYear : this.constraints.year1to3;

    const slots = this.createScheduleSlots(constraints);
    const usedSlots = new Set();

    // Mark currently used slots
    entries.forEach(entry => {
      if (entry._id !== conflictingEntry._id) {
        usedSlots.add(`${entry.day}-${entry.startTime}`);
      }
    });

    // Find first available slot
    return slots.find(slot => !usedSlots.has(`${slot.day}-${slot.startTime}`));
  }

  generateRoomNumber(department) {
    const roomNumbers = {
      'CSE': 'C101',
      'ECE': 'E201',
      'MECH': 'M301',
      'CIVIL': 'V401',
      'EEE': 'EE501'
    };
    return roomNumbers[department] || 'G101'; // General room as fallback
  }

  async getAllSections() {
    // Get all unique sections from enrolled students
    const users = await User.find({ role: 'student' }).select('year department section semester');

    const sections = [];
    const sectionMap = new Map();

    users.forEach(user => {
      const key = `${user.year}-${user.department}-${user.section || 'A'}`;
      if (!sectionMap.has(key)) {
        sectionMap.set(key, {
          _id: key,
          name: `Section ${user.section || 'A'}`,
          year: user.year,
          department: user.department,
          semester: user.semester || 1
        });
      }
    });

    return Array.from(sectionMap.values());
  }

  timeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  async regenerateTimetableForSection(sectionId, adminUserId) {
    try {
      const section = await User.findById(sectionId); // This should be the section object
      if (!section) {
        throw new Error('Section not found');
      }

      const courses = await Course.find({ year: section.year });
      const timetable = await this.generateSectionTimetable(section, courses);

      return {
        success: true,
        message: `Timetable regenerated for ${section.name}`,
        timetable
      };

    } catch (error) {
      console.error('Timetable regeneration failed:', error);
      throw error;
    }
  }
}

module.exports = new AutomatedTimetableGenerator();
