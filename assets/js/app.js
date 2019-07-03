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
  let counter = 0;

  // Get today
  const today = moment().format('YYYY-MM-DD');

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
  });//End Submit Train Butto Clicked

  // Function to calculate the arrival time and mins away
  function calcArrival(timeStart, freq, docID) {
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

      //new Arrival time after update (add the freq to now)
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

    //Return the array of Arrival and mins away
    return arrVals;
  }//End Calculate Arrival

  // Edit Link Click Function
  $(document).on("click", "a", function(e){
    // Prevent submit
    e.preventDefault();

    console.log("a clicked!");

    //Get the document id
    let docID = $(this).attr("data-docID");

    //Set the reference to the document
    var docRef = db.collection("trains").doc(docID);
    docRef.get().then(function(doc) {
        if (doc.exists) {
            console.log("Document data:", doc.data());

            //Fill in the form
            $("#txtName").val(doc.data().name);
            $("#txtDest").val(doc.data().destination);  
            //Format the time
            let txtTimeFormatted = moment(doc.data().time).format("HH:mm");
            $("#txtTime").val(txtTimeFormatted);
            $("#txtFreq").val(doc.data().frequency);
            $("#txtDocID").val(doc.id);

            // Make the Submit button hidden
            $("#btnSubmit").hide();

            //Make the Edit button visible
            $("#btnEdit").removeAttr("hidden");

            //Make the Delete button visible
            $("#btnDel").removeAttr("hidden");

        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
            $("#message").html("The Record Doesn't Exist!");
        }//End Check for document
    }).catch(function(error) {
        console.log("Error getting document:", error);
        $("#message").html("Can't Get the Record!");
    });// Get the record function
  });//End Click on Edit Link

  // Button Edit Click Function
  $("#btnEdit").on("click", function(e){
    // Prevent submit
    e.preventDefault();

    console.log("Edit Clicked");

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
    trainID = $('#txtDocID')
    .val()
    .trim();

    //Add today to the time
    trainArrival = today + ' ' + trainArrival;
    //Set the reference to the document
    var docRef = db.collection("trains").doc(trainID);
    //Update the train info
    docRef.update({
      name: trainName,
      destination: trainDest,
      frequency: trainFreq,
      time: trainArrival,
    })
    .then(() => {
      console.log('Document successfully updated!');

      //Display Updated
      $("#message").html("Record Updated!");

      //Refresh the page after new entry
      location.reload();
    });//End update record
  });//End Button Edit

  // Button Delete Click Function
  $("#btnDel").on("click", function(e){
    // Prevent submit
    e.preventDefault();

    console.log("Delete Clicked");

    //Get the train id
    trainID = $('#txtDocID')
    .val()
    .trim();

    //Set the reference to the document
    var docRef = db.collection("trains").doc(trainID);
    //Update the train info
    docRef.delete()
    .then(() => {
      console.log('Document successfully Deleted!');

      //Display Updated
      $("#message").html("Record Deleted!");

      //Refresh the page after new entry
      location.reload();
    }).catch(function(error) {
      console.error("Error removing document: ", error);
      //Display Updated
      $("#message").html("Error Deleting the Record!");
    });//End Delete record
  });//End Button Delete

  // Main Processes
  // *******************************************************
  
  //Get all the trains from the db
  db.collection('trains')
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, ' => ', doc.data());

        //Increment the counter
        counter++;

        // Create the tr
        const tr = $('<tr>');

        //Create the tds
        const tdNum = $('<td>');
        const tdName = $('<td>');
        const tdDest = $('<td>');
        const tdFreq = $('<td>');
        const tdArr = $('<td>');
        const tdMins = $('<td>');

        //Create the <a>
        let aNum = $("<a href='#'>"+counter+"</a>");
        //Add the docID to an attribute
        aNum.attr("data-docID", doc.id);

        // Set the data to display from Firebase
        tdNum.html(aNum);
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

        //Format the arrival time
        let arrivalTimeFormatted = moment(arrivalTime[0]).format('LT'); // 2:25 PM;
        console.log('Arrival Time to Display: ' + arrivalTimeFormatted);

        // Set the Next Arrival to display
        tdArr.html(arrivalTimeFormatted);
        
        // Set the Minutes Away
        tdMins.html(arrivalTime[1]);

        // Append the tds to the tr
        tr.append(tdNum, tdName, tdDest, tdFreq, tdArr, tdMins);

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