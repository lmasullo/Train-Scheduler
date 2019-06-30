console.log("Connected!");

// A $( document ).ready() block.
$( document ).ready(function() {
  console.log( "Document is Ready!" );


  //Setup Variables
  //*********************************************

  // Initialize Cloud Firestore through Firebase
  firebase.initializeApp({
    apiKey: 'AIzaSyBmsAwOoGTe21Njgv6tfQkgIe1H1al4soI',
    authDomain: 'train-maz.firebaseapp.com',
    projectId: 'train-maz'
  });

  //Initialize the database
  let db = firebase.firestore();

  //Variables from the form
  let trainName = "";
  let trainDest = "";
  let trainArrival = "";
  let trainFreq = 0;


  //Functions
  //***********************************************

  //Function to add a train to the db
  function addTrain(name, destination, time, frequency){
    db.collection("trains").add({
      name: name,
      destination: destination,
      time: time,
      frequency: frequency,
    })
      .then(function(docRef) {
        console.log("Document written with ID: ", docRef.id + " - " + docRef.name);
    })
      .catch(function(error) {
        console.error("Error adding document: ", error);
    });
  }//End add train function


  //Click Submit Button
  $("#btnSubmit").on("click", function(e){
    console.log("Submit Clicked!");
    
    //Prevent submit
    e.preventDefault();

    //Get the values from the form
    trainName = $("#txtName").val().trim();
    trainDest = $("#txtDest").val().trim();
    trainArrival = $("#txtTime").val().trim();
    //Convert Time into the correct format

    
    trainFreq = $("#txtFreq").val().trim();

    console.log(trainName);
    console.log(trainDest);
    console.log(trainArrival);
    console.log(trainFreq);

    

    
  
  });

  //Main Processes
  //*******************************************************

  db.collection("trains").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        console.log(`${doc.id} => ${doc.data()}`);
    });
  });

  





});//End Document Ready



//Pseudocode
// 1. Intialize the db
// 2. Get the values from the form
// 3. Send those values to the db
// 4. Get all the trains from the db
// 5. Calculate next arrival time, by getting the 'time' from the db and add frequency mins to that time using moment.js
// 6. Calculate Minutes away look at Arrival Time calculated and current time and get difference using moment.js 
// 7. If Minutes away is <= 0, alert with train arrived and delete 1 min after arrival time

