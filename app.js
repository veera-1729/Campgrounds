const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
//const methodOverride = require('method-override');
const Campground = require('./models/campground');
const ejsMate = require('ejs-mate')
const methodOverride = require('method-override')
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
const joi = require('joi')
const { campgroundSchema } = require('./schemas.js')


mongoose.connect('mongodb://localhost:27017/yelp-camp', { useNewUrlParser: true })
    .then(() => {
        console.log("MONGO CONNECTION OPEN")
    })
    .catch(err => {
        console.log("OH NO ERROR WHILE CONNECTION TO MONGOOSE")
        console.log(err)
    })
const app = express()

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))


//middleware function to validate

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
app.get('/', (req, res) => { // Home page
    res.render('home')
})

//displaying all campgrounds
app.get('/campground', catchAsync(async (req, res) => {

    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
}))

//adding new campground
app.get('/campground/new', (req, res) => {
    //console.log("HIIIIIIIIIIIIIII")
    res.render('campgrounds/new')

})

//saving the newly added camp 
app.post('/campground', validateCampground, catchAsync(async (req, res, next) => {
    //if (!req.body.campground) throw new ExpressError('Ivalid Campground data', 400)
    //catchAsync function will catch this error and handles it app.use in last of this page

    //validateCampground function validates the data using joi.

    //below step executes only if exception is not raised in above validation.
    const campground = new Campground(req.body.campground)
    await campground.save()
    res.redirect(`/campground/${campground._id}`)


}))
//displaying specific camp
app.get('/campground/:id', catchAsync(async (req, res) => {

    const campground = await Campground.findById(req.params.id);
    //console.log(campground.title)
    res.render('campgrounds/show', { campground })

}))
//editing the deails
app.get('/campground/:id/edit', catchAsync(async (req, res) => {
    const camp = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { camp })
}))

//saving the edited details
app.put('/campground/:id', validateCampground, catchAsync(async (req, res) => {
    const camp = await Campground.findByIdAndUpdate(req.params.id, { ...req.body.campground })
    res.redirect(`/campground/${camp._id}`)
}))

//deleting the campground
app.delete('/campground/:id', catchAsync(async (req, res) => {
    const { id } = req.params;

    await Campground.findByIdAndDelete(id)
    res.redirect('/campground')
}))

//this block executes only if none of the routes are matched
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})
//handles error and displays same messge for every error
//like generic error handler 
app.use((err, req, res, next) => {

    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh no something went wrong!!'
    res.status(statusCode).render('error', { err })
})
app.listen(3000, () => {
    console.log("Serving on port 3000")
})


