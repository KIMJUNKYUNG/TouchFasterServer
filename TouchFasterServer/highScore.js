const { Schema, model, Types } = require("mongoose")

const HighScoreSchema = new Schema({
    gameDoneTime: { type: String, required: true },
}, { timestamps: true })

const HighScore = model('highScore', HighScoreSchema)
module.exports = { HighScore }