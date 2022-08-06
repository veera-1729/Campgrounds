const mongoose = require('mongoose')
const Review = require('./review')
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
})

//this function mongoose middleware function that executes when we delete an campground 
//mongoose passes the campground that has been deleted th this below function as an parameter
//here we access the review ids in the deleted campground and all those reviews from the database


//'findOneAndDelete' is the mongoose middleware for the function findByIdAndDelete function
//so this below function is executed after(post) whenever we try to delete a campground by using findByIdAndDelete function
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if(doc)
    {
        //for every review id in the campground that is deleted 
        //we remove that review from the review database 
        await Review.deleteMany({
            _id: {
                $in : doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);