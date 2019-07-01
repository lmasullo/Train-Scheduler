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
  //let counter = 0;

  

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
        //console.log(doc.id, ' => ', doc.data());
        
        // Create the tr
        let tr = $('<tr>');

        // Create the tds for each field
        let tdName = $('<td>');
        let tdDest = $('<td>');
        let tdFreq = $('<td>');
        let tdArr = $('<td>');
        let tdMins = $('<td>');

        //Display the data from Firebase
        tdName.html(doc.data().name);
        tdDest.html(doc.data().destination);
        tdFreq.html(doc.data().frequency);

        //Calculate the next arrival
        //Get the first arrival
        let timeStart = doc.data().time;
        //console.log(timeStart);

         // Get today
         let today = moment().format('YYYY-MM-DD');
         //Add the time to the current date
         today = today + " " + timeStart;
         //console.log(today);
         //Make it a valid date
         let newDate = moment(today).toISOString();
         //console.log(newDate);

        //Add the frequency to get Arrival Time
        let freq = doc.data().frequency;
        let arrivalTime = moment(newDate).add(freq, 'min');       
        //console.log(arrivalTime._d);
        //Get the time from the result and Format
        let arrTimeNew = arrivalTime._d;
        arrTimeNew = moment(arrTimeNew).format('LT');//2:25 PM
        console.log(arrTimeNew);
        
        //Display the Next Arrival 
        tdArr.html(arrTimeNew);

        //Get mins away
        let away = moment(arrivalTime._d).fromNow(); 
        console.log(away);

        //Difference between arrival time and now
        var a = moment(arrivalTime._d);
        var b = moment();
        let timeDiff = a.diff(b, 'minutes');
        console.log(timeDiff);
        
        //Check if Train Arrival Time has passed
        if (timeDiff <= 0){
           console.log("Arrival has Passed");
           //Need to increment the next arrival
           //Add freq to now
           let newArrivalTime = moment().add(freq, 'min');
           //Format and Display
           newArrivalTime = moment(newArrivalTime).format('LT');//2:25 PM
           console.log("New Arrival Time: " + newArrivalTime);
           tdArr.html(newArrivalTime);
           //Recalculate minutes away!!!!!!!!!!Need a function, don't repeat code
           //Get mins away
           //let awayNew = moment(newArrivalTime).fromNow(); 
           //console.log(awayNew);
           
           //Display the Minutes Away
           //tdMins.html(away);


         }else{
           console.log("Arrival is in Future"); //Can delete this???????    
         }
        
        //Display the Minutes Away
        tdMins.html(away);
        
        // Append the tds to the tr
        tr.append(tdName, tdDest, tdFreq, tdArr, tdMins);

        // Append the tr to the tbody
        $('tbody').append(tr);


        // increment the counter
        //counter++;
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
// 7. If Minutes away is <=0, update with next arrival time
// 8. Refresh page every minute
