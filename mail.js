// mail.js
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyChjJ9pR88NhwtE5PEgOtwv6SH1K-hs8b0",
    authDomain: "neighbournet-60ef7.firebaseapp.com",
    databaseURL: "https://neighbournet-60ef7-default-rtdb.firebaseio.com",
    projectId: "neighbournet-60ef7",
    storageBucket: "neighbournet-60ef7.appspot.com",
    messagingSenderId: "996168822739",
    appId: "1:996168822739:web:245c41a1a677d192b64926",
    measurementId: "G-QL3MHMHKHL"
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  
  // Reference the database
  var userDataDB = firebase.database().ref("userData");
  
  // Initialize page-specific logic
  function initializePageSpecificLogic() {
      const page = document.body.getAttribute("data-page");
      
      switch (page) {
          case 'owner-signup':
              const signupForm = document.getElementById("signup-form");
              if (signupForm) {
                  signupForm.addEventListener("submit", submitOwnerSignUpForm);
              }
              break;
          case 'owner-login':
              const loginForm = document.getElementById("owner-login-form");
              if (loginForm) {
                  loginForm.addEventListener("submit", submitOwnerLoginForm);
              }
              break;
          // Add other page initializations as needed
      }
  }
  
  document.addEventListener("DOMContentLoaded", initializePageSpecificLogic);
  
  document.addEventListener("DOMContentLoaded", function() {
      const inputs = document.querySelectorAll("input");
  
      inputs.forEach(input => {
          input.addEventListener("input", () => {
              clearFieldError(input);
          });
      });
  });
  
  // Function to handle owner sign-up form submission
function submitOwnerSignUpForm(e) {
    // Prevent the default form submission behavior
    e.preventDefault();

    // Get form field values
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const property = document.getElementById("property").value;
    const address = document.getElementById("address").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const userType = "owner";

    clearErrors();

    // Check if passwords match
    if (password !== confirmPassword) {
        showCustomAlert("Passwords do not match.", 'error');
        return;
    }

    // Create user with email and password
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed up successfully
            const user = userCredential.user;
            console.log("User signed up successfully:", user);

            // Save additional user data to Firebase Realtime Database
            saveOwnerData(user.uid, firstName, lastName, email, phone, property, address, userType); // Pass owner's ID as userId

            // Redirect the user to owner login page upon successful signup
            window.location.href = "owner-login.html";
        })
        .catch((error) => {
            // Handle sign-up errors
            const errorCode = error.code;
            const errorMessage = error.message;
            displayError(document.getElementById("email"), 'Email already in use.'); // Correctly call displayError
            showCustomAlert(errorMessage, 'error'); // Show error message using showCustomAlert
        });
}

  
  // Function to save additional user data to Firebase Realtime Database
  function saveOwnerData(userId, firstName, lastName, email, phone, property, address, userType) {
      // Save owner data under "ownerData" with userId as the key
      return firebase.database().ref("ownerData").child(userId).set({
          firstName: firstName,
          lastName: lastName,
          email: email,
          phone: phone,
          property: property,
          address: address,
          user_type: userType // Set user_type dynamically
      })
      .then(() => {
          console.log("Owner data saved successfully.");
      })
      .catch((error) => {
          console.error("Error saving owner data:", error);
          showCustomAlert('Failed to save owner data.', 'error');
      });
  }
  
  // Function to handle login form submission
  function submitOwnerLoginForm(e) {
      // Prevent the default form submission behavior
      e.preventDefault();
    
      // Get login form field values
      const loginEmail = document.getElementById("owner-login-email").value;
      const loginPassword = document.getElementById("owner-login-password").value;
    
      // Sign in user with email and password
      firebase.auth().signInWithEmailAndPassword(loginEmail, loginPassword)
          .then((userCredential) => {
              // Signed in successfully
              const user = userCredential.user;
    
              // Fetch user data from the database
              return firebase.database().ref("ownerData").child(user.uid).once('value')
                .then((snapshot) => {
                  const userData = snapshot.val();
    
                  // Check if user data is available and user_type is 'owner'
                  if (userData && userData.user_type === 'owner') {
                      // Store owner's ID in local storage
                      localStorage.setItem("ownerId", user.uid);
    
                      // Redirect the user to owner dashboard
                      window.location.href = 'owner-dashboard.html';
                  } else {
                      // Handle invalid user or unauthorized access
                      showCustomAlert("Invalid user or unauthorized access.", 'error');
                      firebase.auth().signOut();
                  }
                });
          })
          .catch((error) => {
              // Handle sign-in errors
              const errorMessage = error.message;
              console.error("Owner sign in error:", errorMessage);
              showCustomAlert("Owner sign in error.", 'error');
          });
  }
    
// Function to display an error message
function displayError(inputElement, message) {
    var errorMessage = inputElement.parentElement.querySelector('.error-message');
    if (!errorMessage) {
        const errorContainer = document.createElement('div');
        errorContainer.classList.add('error-container');

        errorMessage = document.createElement('div');
        errorMessage.classList.add('error-message');
        errorMessage.textContent = message;

        errorContainer.appendChild(errorMessage);
        inputElement.parentElement.appendChild(errorContainer);
    } else {
        errorMessage.textContent = message;
    }

    inputElement.classList.add('error');
}

  
  // Function to clear previous errors
  function clearErrors() {
      const errorMessages = document.querySelectorAll('.error-message');
      errorMessages.forEach(message => message.remove());
  
      const errorInputs = document.querySelectorAll('.error');
      errorInputs.forEach(input => input.classList.remove('error'));
  }
  
  // Function to clear error on input change
  function clearFieldError(inputElement) {
      const errorMessage = inputElement.parentElement.querySelector('.error-message');
      if (errorMessage) {
          errorMessage.remove();
      }
      inputElement.classList.remove('error');
  }
  
  // Function to show custom alert
  function showCustomAlert(message, type) {
      const alertBox = document.getElementById('custom-alert');
      const alertMessage = document.getElementById('custom-alert-message');
  
      alertMessage.textContent = message;
      alertBox.classList.remove('hidden');
  
      if (type === 'success') {
          alertBox.style.backgroundColor = '#4CAF50'; // Green for success
      } else if (type === 'error') {
          alertBox.style.backgroundColor = '#f44336'; // Red for error
      }
  }
  
  // Function to close custom alert
  function closeCustomAlert() {
      const alertBox = document.getElementById('custom-alert');
      alertBox.classList.add('hidden');
  }
  
  document.addEventListener("DOMContentLoaded", function() {
    // Get the footer element
    const footer = document.querySelector("footer");
    
    // Add a click event listener to the footer
    footer.addEventListener("click", function() {
        // Redirect to the home page
        window.location.href = "index.html";
    });
});
