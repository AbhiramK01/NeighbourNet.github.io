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

firebase.initializeApp(firebaseConfig);

var usersRef = firebase.database().ref("userids");

const ownerId = localStorage.getItem("ownerId");

function submitTenantLoginForm(e) {
    e.preventDefault();
    
    // Get login form field values
    const loginEmail = document.getElementById("tenant-login-email").value;
    const loginPassword = document.getElementById("tenant-login-password").value;
    
    // Sign in user with email and password
    firebase.auth().signInWithEmailAndPassword(loginEmail, loginPassword)
        .then((userCredential) => {
            // Signed in successfully
            const user = userCredential.user;
            console.log("Tenant signed in successfully:", user);
            
            // Redirect the user to tenant dashboard with uid in URL
            window.location.href = `tenant-dashboard.html?uid=${user.uid}`;
        })
        .catch((error) => {
            // Handle sign-in errors
            const errorMessage = error.message;
            console.error("Tenant sign in error:", errorMessage);
            alert(errorMessage);
        });
}

function initiateChat(userId) {
    // Retrieve tenant ID from their login credentials
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            const tenantId = user.uid;
            console.log("Tenant ID:", tenantId);

            // Redirect to chat page with owner and tenant IDs as parameters
            window.location.href = `chat.html?ownerId=${userId}&tenantId=${tenantId}`;
        } else {
            // User is not logged in, handle accordingly
            console.log("User not logged in.");
        }
    });
}

//tenant-dashboard

function getTenantIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('uid'); // Change 'tenantId' to 'uid'
}

// Check if the user is logged in
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        // Get the tenant ID from the URL
        const tenantId = getTenantIdFromURL();
        if (tenantId) {
            fetchTenantData(tenantId);
            fetchAndDisplayUsername(tenantId); // Display tenant username
            // Set up event listener for the owner chat button
            const ownerChatButton = document.getElementById('owner-chat');
            ownerChatButton.addEventListener('click', () => {
                // Redirect to tenant chat page
                window.location.href = `tenant-chat.html?uid=${tenantId}`;
            });
        } else {
            console.error('Tenant ID not found in URL query parameters.');
        }
    } else {
        // If the user is not logged in, redirect to login page
        window.location.href = 'tenant-login.html';
    }
});

// Function to fetch tenant data from the database
function fetchTenantData(tenantId) {
    const ownerCreatedIDsRef = firebase.database().ref('ownerCreatedIDs');
    ownerCreatedIDsRef.once('value', (snapshot) => {
        snapshot.forEach((ownerSnapshot) => {
            const ownerData = ownerSnapshot.val();
            if (ownerData.hasOwnProperty(tenantId)) {
                const tenantData = ownerData[tenantId];
                displayTenantData(tenantData);
            }
        });
    });
}

// Function to fetch and display the tenant's username
function fetchAndDisplayUsername(tenantId) {
    const ownerCreatedIDsRef = firebase.database().ref('ownerCreatedIDs');
    ownerCreatedIDsRef.once('value', (snapshot) => {
        let found = false;
        snapshot.forEach((ownerSnapshot) => {
            const ownerData = ownerSnapshot.val();
            const ownerKey = ownerSnapshot.key;
            if (ownerData.hasOwnProperty(tenantId)) {
                const tenantData = ownerData[tenantId];
                displayUsername(tenantData.username);
                found = true;
                return true; // Break the loop
            }
        });
        if (!found) {
            console.error('Tenant username not found in the database.');
        }
    });
}

// Function to display tenant data
function displayTenantData(tenantData) {
    const tenantDataElement = document.getElementById('tenant-data');
    tenantDataElement.innerHTML = `<h2>Tenant Data</h2>`;
    if (tenantData) {
        const tenantInfo = `
            <div>
                <p><strong>Name:</strong> ${tenantData.username}</p>
                <p><strong>Email:</strong> ${tenantData.useremail}</p>
                <p><strong>House Number:</strong> ${tenantData.house_number}</p>
                <p><strong>Mobile Number:</strong> ${tenantData.mobile_number}</p>
            </div>
        `;
        tenantDataElement.innerHTML += tenantInfo;
    } else {
        tenantDataElement.innerHTML += `<p>No tenant data found.</p>`;
    }
}

// Function to display the tenant's username
function displayUsername(username) {
    const usernameElement = document.getElementById('tenant-username');
    usernameElement.textContent = username;
}

