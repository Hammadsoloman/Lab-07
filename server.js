'use strict';

/*to get the library, and express function has alots of methods and 
properties can we use it in the server*/
const express=require('express');

//to get promision who can touch my server
// Load Environment Variables from the .env file
const cors =require('cors');

const superagent = require('superagent');

//read our invironment variable
require('dotenv').config();
const PORT = process.env.PORT ;

const app=express();

app.use(cors(/*in this lab its open for every one*/));

//now we should handle the route to the port, and that by using get
app.get('/',(request,response)=>{
    response.status(200).send('Welcome');//done successfully 
});

app.get('/location',locationHandler);
app.get('/weather', weatherHandler);
app.get('/trails', trailHandler);
app.use('*', notFoundHandler);
app.use(errorHandler);


/****************************************location************************************************/

//we send the request to the express server, and our case have it in JSON file, not from APi 

function locationHandler(request,response){

  const city = request.query.city;
  
  superagent(
     `https://eu1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${city}&format=json`   
  )

  .then((responseLocation)=>{
    //console.log(responseLocation);    
    const geoDate=responseLocation.body;
    // console.log('zzzzzzzzz: ', geoDate)
    const locationDate = new Location(city,geoDate);
    response.status(200).json(locationDate);
  })
  .catch((err)=>errorHandler(err,request,response))
};


function Location(city,geoData){
  this.search_query=city;
  this.formatted_query = geoData[0].display_name;
  this.latitude = geoData[0].lat;
  this.longitude = geoData[0].lon;
};

/***************************************weather******************************************** */

function weatherHandler(request, response) {
  superagent(
   `https://api.weatherbit.io/v2.0/forecast/daily?city=${request.query.search_query}&key=${process.env.WEATHER_API_KEY}`

  )
  .then((res)=>{
    // console.log('response',res.body.data);
    // console.log(request.query.search_query)

    const weatherSummaries = res.body.data.map((day) => {
      // console.log(weatherSummaries);
      console.log('outside',day)
      return new Weather(day);
    });
    // console.log("weatherdata",weatherSummaries)

  
  response.status(200).json(weatherSummaries);
})
.catch((err) => errorHandler(err, request, response));
}



function Weather(day){
  // console.log('insideconstructor',day)
    this.forecast = day.weather.description;
    this.time = new Date(day.valid_date).toDateString();
};

/****************************************************Trail************************************************/

function trailHandler(request, response) {

  const lat = request.query.latitude;
  const lon = request.query.longitude;

  superagent(
    `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&maxDistance=100&sort=Distance&key=${process.env.TRAIL_API_KEY}` 
   )
   .then((allData)=>{
       const trailData = allData.body.trails.map(select=>{
         return new Trails(select);
       });
       response.status(200).json(trailData);
   })
   .catch((err) => errorHandler(err, request, response));

   }

   function Trails(select) {
    this.name = select.name;
    this.location = select.location;
    this.length = select.length;
    this.stars = select.stars;
    this.summary= select.summary;
    this.trail_url= select.url;
    this.conditions= select.conditionDetails;
    this.condition_date= select.conditionDate.slice(0,10);
    this.condition_time=select.conditionDate.slice(12,19);
  }  
   
/************************************helper function**********************************************************/

function notFoundHandler(request, response) {
response.status(404).send('NOT FOUND!!');
  };


//to handle with the error that happend with uncorrect input or value
function errorHandler(error, request, response) {
    response.status(500).send(error);
    //({'Status': 500,responseText:'sorry something went wrong'});

  };
 
// listening for requests
app.listen (PORT,()=>{
    console.log(`the server is up and running on ${PORT}`);
});