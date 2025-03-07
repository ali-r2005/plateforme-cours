const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
    {name: String, bio: String, cours: [{type: mongoose.Schema.Types.ObjectId, ref: 'Course'}]});

module.exports = mongoose.model('Teacher', teacherSchema);
