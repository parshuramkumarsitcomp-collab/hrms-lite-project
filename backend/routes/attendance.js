const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

router.post('/', async (req, res) => {
  const { employeeId, date, status } = req.body;

  if (!employeeId || !date || !status) {
    return res.status(400).json({ error: 'employeeId, date, and status are required' });
  }

  if (!['Present', 'Absent'].includes(status)) {
    return res.status(400).json({ error: 'Status must be Present or Absent' });
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Date must be in YYYY-MM-DD format' });
  }

  try {
    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });

    const record = await Attendance.create({ employeeId, date, status });
    res.status(201).json(record);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Attendance already marked for this employee on this date' });
    }
    if (err.name === 'CastError') return res.status(400).json({ error: 'Invalid employee ID' });
    res.status(500).json({ error: 'Failed to mark attendance' });
  }
});

module.exports = router;
