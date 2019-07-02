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
  
  //Set the clock
  function update() {
    $('#clock').html(' - '+ moment().format('MMMM D, YYYY H:mm:ss'));
  }
  setInterval(update, 1000);

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
        
        //Refresh the page after new entry
        location.reload();
      })
      .catch((error) => {
        console.error('Error adding document: ', error);
        //Display Error
        $("#message").html("There was an Error adding a train!");
      });
  } // End add train function

  // Click Submit Button to Enter a Train 
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
    //Add today to the time
    trainArrival = today + ' ' + trainArrival;
    console.log(typeof trainArrival);
    console.log(trainFreq);

    // Call the addTrain function
    addTrain(trainName, trainDest, trainArrival, trainFreq);
  });

  // Function to calculate the arrival time and mins away
  function calcArrival(timeStart, freq, docID) {
    // Add the time to the current date
    // today = today + ' ' + timeStart;
    console.log('Time passed into function: ' + timeStart + ' and the Frequency: ' + freq);

    //Create the array to hold the Arrival and Mins away values
    let arrVals = [];

    // Make it a valid date
    const newStart = moment(timeStart).toISOString();
    console.log('To ISO: ' + newStart);

    // Add the frequency to get Arrival Time and then Format  
    let arrivalTime = moment(newStart).add(freq, 'minutes');
    console.log("Result after adding frequency to first arrival: " + arrivalTime);

    // Get the Difference in minutes between arrival time and now
    const a = moment(arrivalTime);
    console.log("A !!!!: "+ a);
    //Now
    const b = moment();
    console.log("B !!!!: "+ b);
    const timeDiff = a.diff(b, 'minutes');
    console.log("Minute Diff: " + timeDiff);

    //Check if arrival has passed
    if (timeDiff <= 0) {
      console.log('Arrival has Passed');
      // Update the db with the new start time, now
      const trainsColl = db.collection('trains').doc(docID);
      updateTime = moment().format('YYYY-MM-DD HH:mm');
      console.log('Update Time: ' + updateTime);

      //new Arrival time after update
      arrivalTime = moment().add(freq, 'minutes');
      console.log("New Arrival after Update: " + arrivalTime);
      
      // Update the start time
      trainsColl
        .update({
          time: updateTime,
        })
        .then(() => {
          console.log('Document successfully updated!');
        });

    }else{
      console.log('Arrival Time is in the Future');
    }//End check if arrival has passed


    //Push Arrival Time to the array
    arrVals.push(arrivalTime);

    //Now calculate the minutes away
    const away = moment(arrivalTime).fromNow();
    console.log("Mins Away: " + away);

    //Push Mins Away to the array
    arrVals.push(away);

    console.log(arrVals);
    

    //Return the array of Arrival and mins away
    return arrVals;
  }

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

        //Create the tds
        const tdName = $('<td>');
        const tdDest = $('<td>');
        const tdFreq = $('<td>');
        const tdArr = $('<td>');
        const tdMins = $('<td>');

        // Display the data from Firebase
        tdName.html(doc.data().name);
        tdDest.html(doc.data().destination);
        let freq = doc.data().frequency;
        tdFreq.html(freq);
        
        // Calculate the next arrival
        // Get the first arrival and freq
        const timeStart = doc.data().time;
        console.log('From the db - First Arrival: ' + timeStart + ' Frequency: ' + freq);

        // Call the calcArrival function
        arrivalTime = calcArrival(timeStart, freq, doc.id);
        
        //Response from calcArrival, has an array of arrival time and mins away
        console.log(arrivalTime);

        let arrivalTimeFormatted = moment(arrivalTime[0]).format('LT'); // 2:25 PM;
        console.log('Arrival Time to Display: ' + arrivalTimeFormatted);

        // Set the Next Arrival
        tdArr.html(arrivalTimeFormatted);
        
        // Set the Minutes Away
        tdMins.html(arrivalTime[1]);

        // Append the tds to the tr
        tr.append(tdName, tdDest, tdFreq, tdArr, tdMins);

        // Append the tr to the tbody
        $('tbody').append(tr);
      });//End forEach loop over trains
    });//End .get from db
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



    // // Get the Difference in minutes between arrival time and now
    // const a = moment(arrivalTime);
    // console.log("A !!!!: "+ a);

    // //Now
    // const b = moment();
    // console.log("B !!!!: "+ b);

    // const timeDiff = a.diff(b, 'minutes');
    // console.log("Minute Diff: " + timeDiff);

    // // Check if Train Arrival Time has passed
    // if (timeDiff <= 0) {
    //   console.log('Arrival has Passed');
    //   // Need to increment the next arrival
    //   // Update the db with the new start time, now
    //   const trainsColl = db.collection('trains').doc(doc.id);
    //   updateTime = moment().format('YYYY-MM-DD HH:mm');
    //   console.log('Update Time: ' + updateTime);

    //   // Update the start time
    //   return trainsColl
    //     .update({
    //       time: updateTime,
    //     })
    //     .then(() => {
    //       console.log('Document successfully updated!');
          
    //       //Recalculate Arrival Time
    //       // Call the calcArrival function
    //       arrivalTime = calcArrival(updateTime, freq);
    //       console.log("Returned from calc funct: " + arrivalTime);
          
    //       let arrivalTimeFormatted = moment(arrivalTime._d).format('LT'); // 2:25 PM;

    //       // arrTimeNew = moment(arrTimeNew).format('LT'); // 2:25 PM
    //       console.log('Arrival Time to Display: ' + arrivalTimeFormatted);
    //       console.log("New Arrival time after Update");
    //     })
    //     .catch((error) => {
    //       // The document probably doesn't exist.
    //       console.error('Error updating document: ', error);
    //     });
    // }else{
    //   console.log('Arrival is in Future'); // Can delete this???????
    // }//End Check if Arrival Time has passed