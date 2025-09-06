const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/user.model');
const Org = require('./models/organisation.model');
const Event = require('./models/event.model');

(async () => {
  try {
    await connectDB();
    console.log('Seeding...');

    await Promise.all([
      User.deleteMany({}),
      Org.deleteMany({}),
      Event.deleteMany({}),
    ]);

    const admin = await User.create({
      name: 'Admin',
      email: 'admin@demo.com',
      passwordHash: await bcrypt.hash('Admin123!', 10),
      role: 'admin',
    });

    const organiserUser = await User.create({
      name: 'Tech Club Owner',
      email: 'organiser@demo.com',
      passwordHash: await bcrypt.hash('Organiser123!', 10),
      role: 'organiser',
    });

    const student = await User.create({
      name: 'Student One',
      email: 'student@demo.com',
      passwordHash: await bcrypt.hash('Student123!', 10),
      role: 'student',
    });

    const org = await Org.create({
      name: 'Tech Club',
      description: 'Student tech society',
      approved: true,
      owner: organiserUser._id,
    });

    organiserUser.organisation = org._id;
    await organiserUser.save();

    const now = new Date();
    await Event.create([
      {
        organisation: org._id,
        title: 'AI Bootcamp',
        description: 'Intro to ML',
        venue: 'Auditorium A',
        startAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        endAt: new Date(
          now.getTime() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000
        ),
        capacity: 2,
        status: 'published',
        visibility: 'public',
        tags: ['ai', 'tech'],
      },
      {
        organisation: org._id,
        title: 'Web Dev 101',
        description: 'React basics',
        venue: 'Room 204',
        startAt: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        endAt: new Date(
          now.getTime() + 10 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000
        ),
        capacity: 3,
        status: 'published',
        visibility: 'public',
        tags: ['web', 'react'],
      },
    ]);

    console.log('Seed complete');
    console.log('Users:', {
      admin: admin.email,
      organiser: organiserUser.email,
      student: student.email,
    });
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
