const express = require('express')
const router = express.Router()
const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')
const Campground = require('../models/campground');
const { campgroundSchema } = require('../schemas.js');


//console.log("in camps")
//middleware function to validate campground
const validateCampground = (req, res, next) => {

    const { error } = campgroundSchema.validate(req.body)

    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    else {
        next()//if no error then go and execute the route matched
    }
}

//displaying all campgrounds
router.get('/', catchAsync(async (req, res) => {

    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
}))

//adding new campground
router.get('/new', (req, res) => {
    //console.log("HIIIIIIIIIIIIIII")
    res.render('campgrounds/new')

})

//saving the newly added camp 
router.post('/', validateCampground, catchAsync(async (req, res, next) => {
    //if (!req.body.campground) throw new ExpressError('Ivalid Campground data', 400)
    //catchAsync function will catch this error and handles it router.use in last of this page

    //validateCampground function validates the data using joi.

    //below step executes only if exception is not raised in above validation.
    const campground = new Campground(req.body.campground)
    await campground.save()
    req.flash('success', 'Successfully created a new Campground')
    res.redirect(`/campground/${campground._id}`)


}))
//displaying specific camp
router.get('/:id', catchAsync(async (req, res) => {

    const campground = await Campground.findById(req.params.id).populate('reviews')
    if(!campground)
    {
        req.flash('error' ,'Cannot find required campground')
        return res.redirect('/campground')
    }
    res.render('campgrounds/show', { campground })

}))
//editing the deails
router.get('/:id/edit', catchAsync(async (req, res) => {
    const camp = await Campground.findById(req.params.id)
    if(!camp)
    {
        req.flash('error' ,'Cannot find required campground')
        return res.redirect('/campground')
    }
    res.render('campgrounds/edit', { camp })
}))

//saving the edited details
router.put('/:id', validateCampground, catchAsync(async (req, res) => {
    const camp = await Campground.findByIdAndUpdate(req.params.id, { ...req.body.campground })
    req.flash('success', 'Successfully updated campground')
    res.redirect(`/campground/${camp._id}`)
}))

//deleting the campground
router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;

    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campground')
}))


module.exports = router