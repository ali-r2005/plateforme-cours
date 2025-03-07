const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({titre: String, professeur_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Professeur'}, 
    description: String, prix: Number}
    );

module.exports = mongoose.model('Course', courseSchema);
