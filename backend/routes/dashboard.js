const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');

router.get('/', async (_req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const totalEmployees = await Employee.countDocuments();

    const todayAttendance = await Attendance.find({ date: today });
    const totalPresentToday = todayAttendance.filter(r => r.status === 'Present').length;
    const totalAbsentToday = todayAttendance.filter(r => r.status === 'Absent').length;

    const deptAgg = await Employee.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $project: { department: '$_id', count: 1, _id: 0 } },
    ]);

    const recentAttendance = await Attendance.find()
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      totalEmployees,
      totalPresentToday,
      totalAbsentToday,
      departmentCounts: deptAgg,
      recentAttendance,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

module.exports = router;
