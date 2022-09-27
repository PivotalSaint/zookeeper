const fs = require('fs');
const path = require('path');
const express = require('express');
const { animals } = require('./data/animals.json');
const { json } = require('express');
const { type } = require('os');


//to instantiate server
const PORT = process.env.PORT || 3001;
const app = express();


//parse incoming string or array data
app.use(express.urlencoded({ extended: true }));
//parse incoming JSON data
app.use(express.json());


function filterByQuery(query, animalsArray) {
  let personalityTraitsArray = [];
  //we save the animals aaray as filtered results here
  let filteredResults = animalsArray;
  if (query.personalityTraits) {

    // Save personalityTraits as a dedicated array.
    // If personalityTraits is a string, place it into a new array and save.
    if (typeof query.personalityTraits === 'string') {
      personalityTraitsArray = [query.personalityTraits];
    } else {
      personalityTraitsArray = query.personalityTraits;
    }

    // Loop through each trait in the personalityTraits array:
    personalityTraitsArray.forEach(trait => {
      // Check the trait against each animal in the filteredResults array.
      // Remember, it is initially a copy of the animalsArray,
      // but here we're updating it for each trait in the .forEach() loop.
      // For each trait being targeted by the filter, the filteredResults
      // array will then contain only the entries that contain the trait,
      // so at the end we'll have an array of animals that have every one 
      // of the traits when the .forEach() loop is finished.
      filteredResults = filteredResults.filter(
        animal => animal.personalityTraits.indexOf(trait) !== -1
      );
    });
  }

  if (query.diet) {
    filteredResults = filteredResults.filter(animal => animal.diet === query.diet);
  }
  if (query.species) {
    filteredResults = filteredResults.filter(animal => animal.species === query.species);
  }
  if (query.name) {
    filteredResults = filteredResults.filter(animal => animal.name === query.name);
  }
  return filteredResults;
}


function findById(id, animalsArray) {
  const result = animalsArray.filter(animal => animal.id === id)[0];
  return result;
}
//get method require two arguments, so here get() and send()
app.get('/api/animals', (req, res) => {
  let results = animals;
  if (req.query) {
    results = filterByQuery(req.query, results);
  }
  res.json(results);
});


//this function accepts POST route's req.body value and the array we want to add data to
function createNewAnimal(body, animalsArray) {
  console.log(body);

  //our function's main code will go beneath
  const animal = body;
  animalsArray.push(animal);

  //Here, we're using the fs.writeFileSync() method, 
  // which is the synchronous version of fs.writeFile() 
  //and doesn't require a callback function.
  fs.writeFileSync(
    path.join(__dirname, './data/animals.json'),
    JSON.stringify({ animals: animalsArray }, null, 2)
  );


  //return finished code to post route for respons
  return animal;
}


//add our own validation function to server.js
function validateAnimal(animal) {
  if (!animal.name || typeof animal.name !== 'string') {
    return false;
  }
  if (!animal.species || typeof animal.species !== 'string') {
    return false;
  }
  if (!animal.diet || typeof animal.diet !== 'string') {
    return false;
  }
  if (!animal.personalityTraits || typeof animal.personalityTraits !== 'string') {
    return false;
  }
  return true;
};


//param route must come after the initial get route for your app
app.get('/api/animals/:id', (req, res) => {
  const result = findById(req.params.id, animals);
  if (result) {
    res.json(result);
  } else {
    res.send(404);
  }
});

//added post routes
app.post('/api/animals', (req, res) => {
  //req.body is where our incoming content will be
  req.body.id = animals.length.toString();

  //add animal to json file and aniamls array in this fuction
  // updated callback 11.2.6
  if (!validateAnimal(req.body)) {
    res.status(400).send('The animal is not properly formatted.');
  } else {
    const aniaml = createNewAnimal(req.body, animals)
    res.json(aniaml);
  }

});

//added a listen on the port
app.listen(PORT, () => {
  console.log(`API server now on port ${PORT}!`);
});