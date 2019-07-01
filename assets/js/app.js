/* eslint-disable prefer-template */
/* eslint-disable no-undef */
/* eslint-disable no-template-curly-in-string */
console.log('Connected!');

// A $( document ).ready() block.
$(document).ready(() => {
  console.log('Document is Ready!');

  // Setup Variables
  //* ********************************************

  // Initialize Cloud Firestore through Firebase
  firebase.initializeApp({
    apiKey: 'AIzaSyBmsAwOoGTe21Njgv6tfQkgIe1H1al4soI',
    authDomain: 'train-maz.firebaseapp.com',
    projectId: 'train-maz',
  });

  // Initialize the database
  const db = firebase.firestore();

  // Variables from the form
  let trainName = '';
  let trainDest = '';
  let trainArrival = '';
  let trainFreq = 0;

  // Counter for firebase return querySnapShot
  let counter = 0;

  // Functions
  //* **********************************************

  // Function to add a train to the db
  function addTrain(name, destination, time, frequency) {
    db.collection('trains')
      .add({
        name,
        destination,
        time,
        frequency,
      })
      .then((docRef) => {
        // console.log(docRef);

        console.log(`Document written with ID: ${docRef.id}`);
      })
      .catch((error) => {
        console.error('Error adding document: ', error);
      });
  } // End add train function

  // Click Submit Button
  $('#btnSubmit').on('click', (e) => {
    console.log('Submit Clicked!');

    // Prevent submit
    e.preventDefault();

    // Get the values from the form
    trainName = $('#txtName')
      .val()
      .trim();
    trainDest = $('#txtDest')
      .val()
      .trim();
    trainArrival = $('#txtTime')
      .val()
      .trim();
    // Convert Time into the correct format
    // Get today
    const today = moment().format('L');
    // console.log(today);
    trainArrival = `${today} ${trainArrival}`;
    console.log(trainArrival);

    trainFreq = $('#txtFreq')
      .val()
      .trim();

    console.log(trainName);
    console.log(trainDest);
    console.log(trainArrival);
    console.log(trainFreq);

    // Call the addTrain function
    addTrain(trainName, trainDest, trainArrival, trainFreq);
  });

  function render() {
    // <tr>
    //   <th scope="row">1</th>
    //   <td>Mark</td>
    //   <td>Otto</td>
    //   <td>@mdo</td>
    //   <td>5</td>
    // </tr>;
  }

  // Main Processes
  //* ******************************************************

  // db.collection('trains')
  //   .get()
  //   .then((querySnapshot) => {
  //     querySnapshot.forEach((doc) => {
  //       // console.log(`${doc.id} => ${doc.data()}`);
  //       console.log(doc);
  //     });
  //   });

  db.collection('trains')
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, ' => ', doc.data());
        // <tr>
        //   <th scope="row">1</th>
        //   <td>Mark</td>
        //   <td>Otto</td>
        //   <td>@mdo</td>
        //   <td>5</td>
        // </tr>;
        // Create the tr
        const tr = $('<tr>');

        // Create the tds for each field
        const td = $('<td>');

        // Add the id attribute
        td.attr('id', 'name-' + counter);

        // Add the name to this td
        // td.html(doc.data().name);

        $('#name-1').html('test');

        // td = $('<td>');
        // Add the destination to this td
        // td.html(doc.data().destination);

        // Append the td to the tr
        tr.append(td);

        // Append the tr to the tbody
        $('tbody').append(tr);

        // increment the counter
        counter++;
      });
    });
}); // End Document Ready

// Pseudocode
// 1. Intialize the db
// 2. Get the values from the form
// 3. Send those values to the db
// 4. Get all the trains from the db
// 5. Calculate next arrival time, by getting the 'time' from the db and add frequency mins to that time using moment.js
// 6. Calculate Minutes away look at Arrival Time calculated and current time and get difference using moment.js
// 7. If Minutes away is <= 0, alert with train arrived and delete 1 min after arrival time
