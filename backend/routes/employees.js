const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');

router.get('/', async (_req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json(employees);
  } catch (err) {
    console.error('GET /employees error:', err.message);
    res.status(500).json({ error: 'Failed to fetch employees', details: err.message });
  }
});

router.post('/', async (req, res) => {
  const { employeeId, fullName, email, department } = req.body;

  if (!employeeId || !fullName || !email || !department) {
    return res.status(400).json({ error: 'All fields are required (employeeId, fullName, email, department)' });
  }

  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }

  try {
    const employee = new Employee({ employeeId, fullName, email, department });
    await employee.save();
    res.status(201).json(employee);
  } catch (err) {
    console.error('POST /employees error:', err.message);
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0];
      if (field === 'employeeId') return res.status(409).json({ error: 'Employee ID already exists' });
      if (field === 'email') return res.status(409).json({ error: 'Email address already exists' });
      return res.status(409).json({ error: 'Duplicate entry detected' });
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message).join(', ');
      return res.status(400).json({ error: messages });
    }
    res.status(500).json({ error: 'Failed to create employee', details: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    await Attendance.deleteMany({ employeeId: req.params.id });
    res.status(204).send();
  } catch (err) {
    console.error('DELETE /employees/:id error:', err.message);
    if (err.name === 'CastError') return res.status(400).json({ error: 'Invalid employee ID format' });
    res.status(500).json({ error: 'Failed to delete employee', details: err.message });
  }
});

router.get('/:id/attendance', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });

    const filter = { employeeId: req.params.id };
    if (req.query.startDate) filter.date = { $gte: req.query.startDate };
    if (req.query.endDate) {
      filter.date = { ...(filter.date || {}), $lte: req.query.endDate };
    }

    const records = await Attendance.find(filter).sort({ date: -1 });
    const totalPresent = records.filter((r) => r.status === 'Present').length;
    const totalAbsent = records.filter((r) => r.status === 'Absent').length;

    res.json({ records, totalPresent, totalAbsent });
  } catch (err) {
    console.error('GET /employees/:id/attendance error:', err.message);
    if (err.name === 'CastError') return res.status(400).json({ error: 'Invalid employee ID format' });
    res.status(500).json({ error: 'Failed to fetch attendance', details: err.message });
  }
});

module.exports = router;
