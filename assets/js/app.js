/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */
/* eslint-disable prefer-template */
/* eslint-disable no-undef */
/* eslint-disable no-template-curly-in-string */
console.log('Connected!');

// A $( document ).ready() block.
$(document).ready(() => {
  console.log('Document is Ready!');

  // Setup Variables
  // *********************************************

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

  // Get today
  const today = moment().format('YYYY-MM-DD');
  console.log('Today: ' + today);

  // Functions
  // ***********************************************

  // Function to add a train to the db
  function addTrain(name, destination, time, frequency) {
    // add today to the time entered on the form
    dateCombined = today + ' ' + time;

    db.collection('trains')
      .add({
        name,
        destination,
        dateCombined,
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

  // Main Processes
  // *******************************************************

  db.collection('trains')
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, ' => ', doc.data());

        // Create the tr
        const tr = $('<tr>');

        // Create the tds for each field
        const tdName = $('<td>');
        const tdDest = $('<td>');
        const tdFreq = $('<td>');
        const tdArr = $('<td>');
        const tdMins = $('<td>');

        // Display the data from Firebase
        tdName.html(doc.data().name);
        tdDest.html(doc.data().destination);
        tdFreq.html(doc.data().frequency);

        // Function to calculate the arrival time and mins away
        function calcArrival(timeStart) {
          // Add the time to the current date
          // today = today + ' ' + timeStart;
          console.log('Time passed into function: ' + timeStart);

          // console.log(today);
          // Make it a valid date
          const newStart = moment(timeStart).toISOString();
          console.log('To ISO: ' + newStart);

          // Add the frequency to get Arrival Time
          const freq = doc.data().frequency;
          console.log("Freq: " + freq);
          
          let arrivalTime = moment(newStart).add(freq, 'minutes');
          let arrivalTimeFormatted = moment(arrivalTime._d).format('LT'); // 2:25 PM;

          // arrTimeNew = moment(arrTimeNew).format('LT'); // 2:25 PM
          console.log('Arrival Time to Display: ' + arrivalTimeFormatted);

          // Get the time from the result and Format
          // let arrTimeNew = arrivalTime._d;
          //
          // console.log(arrTimeNew);

          // Display the Next Arrival
          tdArr.html(arrivalTimeFormatted);

          return arrivalTime ;
        }

        // Calculate the next arrival
        // Get the first arrival, it doesn't have the day, just the time
        const timeStart = doc.data().time;
        console.log('From the db: ' + timeStart);

        // Call the calcArrival function
        arrivalTime = calcArrival(timeStart);

        console.log("Returned from calc funct: " + arrivalTime);
        

        // Get mins away
        const away = moment(arrivalTime).fromNow();
        console.log("Mins Away: " + away);

        // Display the Minutes Away
        tdMins.html(away);

        // Difference in minutes between arrival time and now
        const a = moment(arrivalTime);
        //Now
        const b = moment();
        const timeDiff = a.diff(b, 'minutes');
        console.log("Min Diff: " + timeDiff);

        // Check if Train Arrival Time has passed
        if (timeDiff <= 0) {
          console.log('Arrival has Passed');
          // Need to increment the next arrival
          // Update the db with the new start time, now
          const trainsColl = db.collection('trains').doc(doc.id);
          updateTime = moment().format('YYYY-MM-DD HH:mm');
          console.log('Update Time: ' + updateTime);

          // Update the start time
          return trainsColl
            .update({
              time: updateTime,
            })
            .then(() => {
              console.log('Document successfully updated!');
            })
            .catch((error) => {
              // The document probably doesn't exist.
              console.error('Error updating document: ', error);
            });
        }else{
          console.log('Arrival is in Future'); // Can delete this???????
        }
        

        // Append the tds to the tr
        tr.append(tdName, tdDest, tdFreq, tdArr, tdMins);

        // Append the tr to the tbody
        $('tbody').append(tr);
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
// 7. If Minutes away is <=0, update the db with current time and then the new arrival time will be calculated
// 8. Refresh page every minute
