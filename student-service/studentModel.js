const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({ nom: String, email: String, cours: [{type: mongoose.Schema.Types.ObjectId, ref: 'Course'}]});
module.exports = mongoose.model('Student', studentSchema);
