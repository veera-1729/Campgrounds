const Campground = require('../models/campground')
const mongoose = require('mongoose')
const cities = require('./cities')
const { descriptors, places } = require('./seedHelper')

mongoose.connect('mongodb://localhost:27017/yelp-camp', { useNewUrlParser: true })
    .then(() => {
        console.log("MONGO CONNECTION OPEN")
    })
    .catch(err => {
        console.log("OH NO ERROR WHILE CONNECTION TO MONGOOSE")
        console.log(err)
    })

const sample = array => array[Math.floor(Math.random() * 10)]

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10
        const camp = new Campground({
            location: `${cities[random1000].state} ${cities[random1000].city}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Rerum eum porro quasi id fugit veniam quidem quod sequi doloribus facilis quo repellendus sed vel, laborum aperiam similique asperiores nostrum expedita.',
            price: price
        })
        await camp.save();
    }

}
seedDB().then(() => {
    mongoose.connection.close();
})