var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var headlineSchema = new mongoose.Schema({
    headline: {
        type: String,
        required: true
       
    },
    summary: {
        type: String,
        required: true,
        default: 'Sorry no summary exist :('
    },
    link: {
        type: String,
        required: true
    },
    comment: [{
        type: Schema.Types.ObjectId,
        ref: "Comment"
    }]
});
const Headline = mongoose.model('Headline', headlineSchema);
module.exports = Headline;