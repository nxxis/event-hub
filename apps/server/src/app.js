const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth.routes');
const eventRoutes = require('./routes/event.routes');
const ticketRoutes = require('./routes/ticket.routes');
const orgRoutes = require('./routes/org.routes');
const checkinRoutes = require('./routes/checkin.routes');

const { notFound, handler } = require('./middleware/error');

const app = express();
app.use(cors({ origin: '*', credentials: false }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/orgs', orgRoutes);
app.use('/api/checkins', checkinRoutes);

app.use(helmet());
app.use(compression());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

app.use(notFound);
app.use(handler);

module.exports = app;
