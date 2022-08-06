const express = require('express')
const router = express.Router({ mergeParams: true })

const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')

const Review = require('../models/review')
const Campground = require('../models/campground')

const { reviewSchema } = require('../schemas.js');

//middleware function to validate review
const validateReview = (req, res, next) => {
    //console.log("Hiiiiiiiiiiiiiiiii")
    const { error } = reviewSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    else {
        next()
    }
}

//Reviews 
router.post('/', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    console.log(req.body.review)
    console.log("Hii")
    const review = new Review(req.body.review)
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    req.flash('success', 'Created new Review')
    res.redirect(`/campground/${campground._id}`)
}))

//deleting the paricular review
router.delete('/:reviewId', catchAsync(async (req, res) => {
    //res.send("delete me")
    const { id, reviewId } = req.params
    console.log("welcome")
    //this below step deletes reference of the review stored in the campground reviews array
    //pull operator pulls something out from the array
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })

    //this below step deletes the particular review from the reviews collections
    await Review.findByIdAndDelete(reviewId)

    req.flash('success', "Succesfully deleted a review")
    res.redirect(`/campground/${id}`)
}))

module.exports = router
