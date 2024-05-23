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

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();

var usersRef = firebase.database().ref("userids");

const ownerId = localStorage.getItem("ownerId");

// Owner Dashboard functions
function initializeOwnerDashboard() {
 // Get the currently logged-in owner's user ID
    fetchOwnerData(ownerId);
    const form = document.getElementById("create-id-form");
if (form) {
    form.addEventListener("submit", submitCreateIdForm);
}


    const userTypeSelect = document.getElementById('user-type');
    if (userTypeSelect) {
        userTypeSelect.addEventListener('change', toggleHouseNumber);
    }

    const contactDirectoryBtn = document.getElementById("contact-directory-btn");
    if (contactDirectoryBtn) {
        contactDirectoryBtn.addEventListener("click", displayContactDirectory);
    }

    // Initially display the house number input field
    toggleHouseNumber();
}


function fetchOwnerData(ownerId) {
    const ownerDataRef = firebase.database().ref('ownerData/' + ownerId);
    ownerDataRef.once('value', (snapshot) => {
        const ownerData = snapshot.val();
        if (ownerData) {
            const ownerUsername = ownerData.lastName; // Extract owner's username
            updateHeader(ownerUsername); // Update the header with owner's username
        } else {
            console.error('Owner data not found in the database.');
        }
    });
}

// Function to update the header with owner's username
function updateHeader(ownerUsername) {
    const headerTitle = document.querySelector('header h1');
    headerTitle.textContent = `${ownerUsername}'s Dashboard`; // Update header text
}

document.addEventListener("DOMContentLoaded", function() {
    const inputs = document.querySelectorAll("input");

    inputs.forEach(input => {
        input.addEventListener("input", () => {
            clearFieldError(input);
        });
    });
});

function submitCreateIdForm(e) {
    e.preventDefault();
    console.log("Form submitted!");

    const form = e.target; // Get the form element
    console.log('Owner ID', ownerId);

    const username = document.getElementById("username");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const userType = document.getElementById("user-type");
    const houseNumber = document.getElementById("house-number");
    const mobileNumber = document.getElementById("mobile-number");

    // Clear previous errors
    clearErrors();

    firebase.auth().createUserWithEmailAndPassword(email.value, password.value)
    .then((userCredential) => {
        const user = userCredential.user;
        saveUserData(ownerId, user.uid, username.value, email.value, password.value, userType.value, houseNumber.value, mobileNumber.value)
        .then(() => {
            alert('User created successfully!');
            form.reset(); // Reset the form here
        });
    })
    .catch((error) => {
        console.error('Error creating user:', error);
        displayError(email, 'Email already in use.');
    });
}

function saveUserData(ownerId, userId, username, email, password, userType, houseNumber, mobileNumber) { // Add password parameter
    const userData = {
        userid: userId,
        username: username,
        useremail: email,
        password: password, // Store the password
        user_type: userType,
        mobile_number: mobileNumber,
        ownerid: ownerId
    };

    if (userType === 'tenant') {
        userData.house_number = houseNumber;
    }

    return db.ref("ownerCreatedIDs").child(ownerId).child(userId).set(userData)
    .then(() => {
        console.log('User data added to Firebase Realtime Database');
    })
    .catch((error) => {
        console.error('Error adding user data to Firebase Realtime Database:', error);
        throw error;
    });
}

// Function to display an error message
function displayError(inputElement, message) {
    const errorMessage = document.createElement('div');
    errorMessage.classList.add('error-message');
    errorMessage.textContent = message;
    inputElement.classList.add('error');
    inputElement.parentElement.appendChild(errorMessage);
    errorMessage.style.display = 'block'; // Show error message
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




function toggleHouseNumber() {
    const userTypeSelect = document.getElementById('user-type');
    if (userTypeSelect) {
        const houseNumberInput = document.getElementById('house-number');
        if (houseNumberInput) {
            if (userTypeSelect.value === 'service-provider') {
                houseNumberInput.value = '';
                houseNumberInput.style.display = 'none';
                houseNumberInput.removeAttribute('required');
            } else {
                houseNumberInput.style.display = 'block';
                houseNumberInput.setAttribute('required', 'required');
            }
        } else {
            console.error('House number input element not found.');
        }
    } else {
        console.error('User type select element not found.');
    }
}

function createContactItem(userData, createdId) {
    return `<strong>Name:</strong> ${userData.username}<br>
            <strong>Email:</strong> ${userData.useremail}<br>
            <strong>User Type:</strong> ${userData.user_type}<br>
            <strong>House Number:</strong> ${userData.house_number}<br>
            <strong>Mobile Number:</strong> ${userData.mobile_number}<br>
            <button onclick="initiateChat('${createdId}', '${userData.user_type}')">Initiate Chat</button>
            <button onclick="deleteContact('${createdId}')">Delete</button>`;
}

function displayContactDirectory() {
    const ownerCreatedIdsRef = firebase.database().ref("ownerCreatedIDs");
    const ownerId = localStorage.getItem("ownerId");

    ownerCreatedIdsRef.child(ownerId).once("value", (snapshot) => {
        if (!snapshot.exists()) {
            console.log("No created IDs found for the logged-in owner.");
            return;
        }

        const createdIds = snapshot.val();
        const contactDirectory = document.getElementById("contact-directory");
        contactDirectory.innerHTML = "";
        
        const closeButton = document.createElement("button");
        closeButton.innerHTML = "&times;";
        closeButton.classList.add("close-button");
        closeButton.onclick = closeContactDirectory;
        contactDirectory.appendChild(closeButton);
        
        Object.keys(createdIds).forEach((createdId) => {
            const userData = createdIds[createdId];
            const contactItem = document.createElement("div");
            contactItem.innerHTML = createContactItem(userData, createdId);
            contactDirectory.appendChild(contactItem);
        });

        contactDirectory.classList.add("visible");
    });
}

function closeContactDirectory() {
    const contactDirectory = document.getElementById("contact-directory");
    contactDirectory.classList.remove("visible");
    contactDirectory.innerHTML = ""; // Optionally clear the content
}


function deleteContact(createdId) {
    if (confirm("Are you sure you want to delete this contact?")) {
        // Reference to the contact to be deleted
        console.log(ownerId);
        console.log(createdId);
        const contactRef = firebase.database().ref("ownerCreatedIDs").child(ownerId).child(createdId);

        // References for different types of messages
        const ownerTenantMessagesRef = firebase.database().ref("owner_tenant_messages");
        const ownerServiceProviderMessagesRef = firebase.database().ref("owner_service_provider_messages");
        const serviceProviderTenantMessagesRef = firebase.database().ref("service_provider_tenant_messages");
        const tenantTenantMessagesRef = firebase.database().ref("tenant_tenant_messages");

        // Retrieve stored credentials from the database
        contactRef.once('value')
            .then(snapshot => {
                const userData = snapshot.val();
                if (userData) {
                    const { useremail: email, password } = userData;

                    // Sign in as the user to be deleted
                    return firebase.auth().signInWithEmailAndPassword(email, password);
                } else {
                    throw new Error('No credentials found for the user.');
                }
            })
            .then(userCredential => {
                const user = userCredential.user;

                // Remove contact information
                return contactRef.remove()
                    .then(() => {
                        console.log('Contact deleted successfully');

                        // Remove owner-tenant messages (normal and inverted)
                        return Promise.all([
                            ownerTenantMessagesRef.child(`${ownerId}_${createdId}`).remove(),
                            ownerTenantMessagesRef.child(`${createdId}_${ownerId}`).remove(),
                            ownerServiceProviderMessagesRef.child(`${ownerId}_${createdId}`).remove(),
                            ownerServiceProviderMessagesRef.child(`${createdId}_${ownerId}`).remove(),
                            serviceProviderTenantMessagesRef.once('value').then(snapshot => {
                                const promises = [];
                                snapshot.forEach(childSnapshot => {
                                    if (childSnapshot.key.includes(createdId)) {
                                        promises.push(serviceProviderTenantMessagesRef.child(childSnapshot.key).remove());
                                    }
                                });
                                return Promise.all(promises);
                            }),
                            serviceProviderTenantMessagesRef.once('value').then(snapshot => {
                                const promises = [];
                                snapshot.forEach(childSnapshot => {
                                    if (childSnapshot.key.includes(`_${createdId}`)) {
                                        promises.push(serviceProviderTenantMessagesRef.child(childSnapshot.key).remove());
                                    }
                                });
                                return Promise.all(promises);
                            }),
                            tenantTenantMessagesRef.once('value').then(snapshot => {
                                const promises = [];
                                snapshot.forEach(childSnapshot => {
                                    if (childSnapshot.key.includes(createdId)) {
                                        promises.push(tenantTenantMessagesRef.child(childSnapshot.key).remove());
                                    }
                                });
                                return Promise.all(promises);
                            }),
                            tenantTenantMessagesRef.once('value').then(snapshot => {
                                const promises = [];
                                snapshot.forEach(childSnapshot => {
                                    if (childSnapshot.key.includes(`_${createdId}`)) {
                                        promises.push(tenantTenantMessagesRef.child(childSnapshot.key).remove());
                                    }
                                });
                                return Promise.all(promises);
                            })
                        ]);
                    })
                    .then(() => {
                        console.log('Messages deleted successfully');

                        // Delete the user account
                        return user.delete();
                    });
            })
            .then(() => {
                console.log('User deleted successfully');

                // Refresh the contact directory to reflect the deletion
                displayContactDirectory();
            })
            .catch(error => {
                console.error('Error deleting contact or messages:', error);
                showCustomAlert('Failed to delete contact. Please try again.');
            });
    }
}




// Service Provider Dashboard functions
function initializeServiceProviderDashboard() {
    // Add specific logic for service provider dashboard here
}

// Service Provider Chat functions
function initializeServiceProviderChat() {
    // Add specific logic for service provider chat here
}

// Tenant Dashboard functions
function initializeTenantDashboard() {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            const tenantUsername = user.displayName;
            document.getElementById('tenant-username').innerText = tenantUsername;

            const tenantId = getTenantIdFromURL();
            if (tenantId) {
                fetchTenantData(tenantId);
                fetchAndDisplayUsername(tenantId);

                const ownerChatButton = document.getElementById('owner-chat');
                if (ownerChatButton) {
                    ownerChatButton.addEventListener('click', () => {
                        window.location.href = `tenant-chat.html?uid=${tenantId}`;
                    });
                }
                const serviceProviderChatButton = document.getElementById('service-provider-chat');
                if (serviceProviderChatButton) {
                    serviceProviderChatButton.addEventListener('click', displayServiceProviderList);
                }

                const tenantChatButton = document.getElementById('tenant-chat');
                if (tenantChatButton) {
                    tenantChatButton.addEventListener('click', displayTenantList);
                }

               // Fetch and display available service providers on dashboard initialization
               fetchAndDisplayAvailableServiceProviders();

            } else {
                console.error('Tenant ID not found in URL query parameters.');
            }
        } else {
            window.location.href = 'tenant-login.html';
        }
    });
}

// Function to close the floating box and display the button
function closeAvailableProvidersBox() {
    console.log('Closing available providers box...');
    const floatingBox = document.getElementById('availableProvidersBox');
    if (floatingBox) {
        floatingBox.style.display = 'none';
        displayShowAvailableProvidersButton(); // Display the button
    }
}

// Function to display the 'Show Available Service Providers' button
function displayShowAvailableProvidersButton() {
    console.log('Displaying "Show Available Service Providers" button...');
    const buttonContainer = document.getElementById('showAvailableProvidersButtonContainer');
    if (buttonContainer) {
        buttonContainer.innerHTML = ''; // Clear previous content

        const showButton = document.createElement('button');
        showButton.innerText = 'Show Available Service Providers';
        showButton.classList.add('chat-button', 'show-available-service-providers');

        showButton.addEventListener('click', () => {
            console.log('Show Available Service Providers button clicked');
            fetchAndDisplayAvailableServiceProviders();
            const floatingBox = document.getElementById('availableProvidersBox');
            if (floatingBox) {
                floatingBox.style.display = 'block'; // Show the floating box again
            }
        }); // Reference to the function
        buttonContainer.appendChild(showButton);
    } else {
        console.error('Button container not found.');
    }
}

// Function to fetch and display available service providers
function fetchAndDisplayAvailableServiceProviders() {
    console.log('Fetching available service providers...');
    const tenantId = getTenantIdFromURL();

    firebase.database().ref('ownerCreatedIDs').once('value').then(snapshot => {
        const createdIds = snapshot.val();
        if (createdIds) {
            let ownerId;
            for (const key in createdIds) {
                if (createdIds.hasOwnProperty(key)) {
                    const userData = createdIds[key][tenantId];
                    if (userData && userData.ownerid) {
                        ownerId = userData.ownerid;
                        break; // Exit loop once ownerId is found
                    }
                }
            }

            if (ownerId) {
                firebase.database().ref(`ownerCreatedIDs/${ownerId}`).orderByChild('availability').equalTo('Available').on('value', function(snapshot) {
                    const availableProvidersList = document.getElementById('availableProvidersList');
                    availableProvidersList.innerHTML = ''; // Clear the list

                    if (snapshot.exists()) {
                        snapshot.forEach(function(childSnapshot) {
                            const provider = childSnapshot.val();
                            if (provider.user_type === 'service-provider') {
                                const listItem = document.createElement('div');
                                listItem.innerText = provider.username; // Display the provider's name or any other info
                                availableProvidersList.appendChild(listItem);
                            }
                        });
                    } else {
                        const noProvidersItem = document.createElement('div');
                        noProvidersItem.innerText = 'No one is available';
                        availableProvidersList.appendChild(noProvidersItem);
                    }
                });
            } else {
                console.log('Owner ID not found for the tenant.');
            }
        } else {
            console.log("No data found for owner created IDs.");
        }
    }).catch(error => {
        console.error('Error fetching available service providers:', error);
    });
}




function displayServiceProviderModal() {
    const modal = document.getElementById("service-provider-modal");
    modal.style.display = "block"; // Display the modal
    displayServiceProviderList(); // Display the service provider list
}


function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "none"; // Hide the modal
    } else {
        console.error(`Modal with ID ${modalId} not found.`);
    }
}



function displayServiceProviderList() {
    const ownerCreatedIdsRef = firebase.database().ref('ownerCreatedIDs');
    const tenantId = getTenantIdFromURL();

    ownerCreatedIdsRef.once("value", (snapshot) => {
        const createdIds = snapshot.val();
        const serviceProviderList = document.getElementById("service-provider-list");
        serviceProviderList.innerHTML = ""; // Clear previous content

        if (createdIds) {
            let ownerId;
            for (const key in createdIds) {
                if (createdIds.hasOwnProperty(key)) {
                    const userData = createdIds[key][tenantId];
                    if (userData && userData.ownerid) {
                        ownerId = userData.ownerid;
                        break; // Exit loop once ownerId is found
                    }
                }
            }

            if (ownerId) {
                const ownerData = createdIds[ownerId];
                if (ownerData) {
                    Object.keys(ownerData).forEach((userId) => {
                        const userData = ownerData[userId];
                        if (userData.user_type === "service-provider") {
                            const serviceProviderItem = document.createElement("div");
                            serviceProviderItem.innerHTML = `
                                <strong>Name:</strong> ${userData.username}<br>
                                <strong>Email:</strong> ${userData.useremail}<br>
                                <strong>Mobile Number:</strong> ${userData.mobile_number}<br>
                                <button onclick="initiateChatSP('${tenantId}', '${userId}', '${ownerId}')">Initiate Chat</button>
                            `;
                            serviceProviderList.appendChild(serviceProviderItem);
                        }
                    });
                }
            } else {
                console.log("Owner ID not found for the tenant.");
            }
        } else {
            console.log("No data found for owner created IDs.");
        }

        serviceProviderList.classList.add("visible"); // Show the service provider list
    });
}

function initiateChatSP(tenantId, userId, ownerId) {
    const chatRoomId = `${userId}_${tenantId}`;
    window.location.href = `tenant-serviceprovider-chat.html?chatRoomId=${chatRoomId}&userId=${userId}&ownerId=${ownerId}&tenantId=${tenantId}`;
}

//tenant-tenant chat logic
function displayTenantModal() {
    const modal = document.getElementById("tenant-modal");
    modal.style.display = "block"; // Display the modal
    displayTenantList(); // Display the service provider list
}

function displayTenantList() {
    const ownerCreatedIdsRef = firebase.database().ref('ownerCreatedIDs');
    const tenantId = getTenantIdFromURL();

    ownerCreatedIdsRef.once("value", (snapshot) => {
        const createdIds = snapshot.val();
        const tenantList = document.getElementById("tenant-list");
        tenantList.innerHTML = ""; // Clear previous content

        if (createdIds) {
            let ownerId;
            for (const key in createdIds) {
                if (createdIds.hasOwnProperty(key)) {
                    const userData = createdIds[key][tenantId];
                    if (userData && userData.ownerid) {
                        ownerId = userData.ownerid;
                        break; // Exit loop once ownerId is found
                    }
                }
            }

            if (ownerId) {
                const ownerData = createdIds[ownerId];
                if (ownerData) {
                    let hasOtherTenants = false;
                    Object.keys(ownerData).forEach((userId) => {
                        const userData = ownerData[userId];
                        if (userData.user_type === "tenant" && userId !== tenantId) {
                            hasOtherTenants = true;
                            const tenantItem = document.createElement("div");
                            tenantItem.innerHTML = `
                                <strong>Name:</strong> ${userData.username}<br>
                                <strong>Email:</strong> ${userData.useremail}<br>
                                <strong>Mobile Number:</strong> ${userData.mobile_number}<br>
                                <strong>House Number:</strong> ${userData.house_number}<br>
                                <button onclick="initiateChatT('${tenantId}', '${userId}', '${ownerId}')">Initiate Chat</button>
                            `;
                            tenantList.appendChild(tenantItem);
                        }
                    });

                    if (!hasOtherTenants) {
                        const noTenantsMessage = document.createElement("div");
                        noTenantsMessage.innerHTML = "No tenants available.";
                        tenantList.appendChild(noTenantsMessage);
                    }
                }
            } else {
                console.log("Owner ID not found for the tenant.");
            }
        } else {
            console.log("No data found for owner created IDs.");
        }

        tenantList.classList.add("visible"); // Show the service provider list
    });
}


function initiateChatT(tenantId, userId, ownerId) {
    const chatRoomId = generateChatRoomId(tenantId, userId);
    window.location.href = `tenant-tenant-chat.html?chatRoomId=${chatRoomId}&userId=${userId}&ownerId=${ownerId}&tenantId=${tenantId}`;
}

function generateChatRoomId(tenantId, userId) {
    const ids = [tenantId, userId].sort();
    return `${ids[0]}_${ids[1]}`;
}


function getTenantIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('uid'); // Change 'tenantId' to 'uid'
}


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


// Tenant Login form submission
function submitTenantLoginForm(e) {
    e.preventDefault();

    const form = e.target; // Get the form element

    const loginEmail = document.getElementById("tenant-login-email").value;
    const loginPassword = document.getElementById("tenant-login-password").value;

    firebase.auth().signInWithEmailAndPassword(loginEmail, loginPassword)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log("Tenant signed in successfully:", user);
            // Assume ownerId is known or can be retrieved somehow
            getUserData(user.uid).then((userData) => {
                if (userData.user_type === 'tenant') {
                    form.reset(); // Reset the form here
                    window.location.href = `tenant-dashboard.html?uid=${user.uid}`;
                } else {
                    showCustomAlert("You are not authorized to log in as a tenant.");
                    firebase.auth().signOut();
                }
            }).catch((error) => {
                console.error("Error retrieving user data:", error);
                showCustomAlert("Failed to verify user type. Please try again.");
            });
        })
        .catch((error) => {
            const errorMessage = error.message;
            console.error("Tenant sign in error:", errorMessage);
            showCustomAlert('Failed to sign in Teannt');
        });
}


// Service Provider Login form submission
function submitServiceProviderLoginForm(e) {
    e.preventDefault();

    const form = e.target; // Get the form element

    const loginEmail = document.getElementById("service-provider-login-email").value;
    const loginPassword = document.getElementById("service-provider-login-password").value;

    firebase.auth().signInWithEmailAndPassword(loginEmail, loginPassword)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log("Service provider signed in successfully:", user);

            getUserData(user.uid).then((userData) => {
                if (userData.user_type === 'service-provider') {
                    // Save serviceProviderId to localStorage
                    localStorage.setItem("serviceProviderId", user.uid);
                    
                    form.reset(); // Reset the form here
                    window.location.href = `service-provider-dashboard.html?uid=${user.uid}`;
                } else {
                    showCustomAlert("You are not authorized to log in as a service provider.");
                    firebase.auth().signOut();
                }
            }).catch((error) => {
                console.error("Error retrieving user data:", error);
                showCustomAlert("Failed to verify user type. Please try again.");
            });
        })
        .catch((error) => {
            const errorMessage = error.message;
            console.error("Service provider sign in error:", errorMessage);
            showCustomAlert('Service provider sign in error.');
        });
}



function initiateChat(userId, user_type) {
    console.log("ownerID:", ownerId);
    // Get the reference to the selected user
    const selectedUserRef = firebase.database().ref("ownerCreatedIDs").child(ownerId).child(userId);
    
    // Retrieve the data of the selected user
    selectedUserRef.once("value", (snapshot) => {
        const selectedUserData = snapshot.val();
        console.log("selectedUserData: ",selectedUserData);
        if (selectedUserData) {
            // Check if the username property exists in the selected user's data
            if (selectedUserData.username) {
                console.log(`Initiating chat with ${selectedUserData.username}`);
                if (user_type === 'tenant') {
                    window.location.href = `chat.html?tenantId=${userId}&ownerID=${ownerId}`;
                } else if (user_type === 'service-provider') {
                    window.location.href = `chat-o-sp.html?serviceProviderId=${userId}&ownerID=${ownerId}`;
                } else {
                    console.error("Unknown user type provided.");
                }
            } else {
                console.error("Username property not found in the selected user's data.");
            }
        } else {
            console.log("Selected user data not found.");
        }
    });
}

// Function to logout the user
function logoutOwner() {
    firebase.auth().signOut().then(() => {
        // Sign-out successful.
        window.location.href = 'owner-login.html'; // Redirect to the login page
    }).catch((error) => {
        // An error happened.
        console.error("Error occurred while logging out:", error);
    });
}

function logoutTenant() {
    firebase.auth().signOut().then(() => {
        // Sign-out successful.
        window.location.href = 'tenant-login.html'; // Redirect to the login page
    }).catch((error) => {
        // An error happened.
        console.error("Error occurred while logging out:", error);
    });
}

function getUserData(userId) {
    return firebase.database().ref('ownerCreatedIDs').once('value')
        .then(snapshot => {
            const ownerCreatedIDs = snapshot.val();

            let userData = null;
            let foundOwnerId = null;

            for (const ownerId in ownerCreatedIDs) {
                if (ownerCreatedIDs.hasOwnProperty(ownerId)) {
                    const users = ownerCreatedIDs[ownerId];

                    if (users.hasOwnProperty(userId)) {
                        userData = users[userId];
                        foundOwnerId = ownerId;
                        break;
                    }
                }
            }

            if (userData) {
                console.log('Returning found ownerId and userData:', { ownerId: foundOwnerId, userData }); // Log the data being returned
                return userData;
            } else {
                console.error('No user data found!'); // Log an error if no user data is found
                throw new Error('No user data found!');
            }
        })
        .catch(error => {
            console.error('Error fetching user data:', error); // Log any errors encountered during the fetch
            throw error;
        });
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


// Initialize page-specific logic
function initializePageSpecificLogic() {
    const page = document.body.getAttribute("data-page");
    
    switch (page) {
        case 'owner-dashboard':
            initializeOwnerDashboard();
            break;
        case 'service-provider-dashboard':
            initializeServiceProviderDashboard();
            break;
        case 'service-provider-chat':
            initializeServiceProviderChat();
            break;
        case 'tenant-dashboard':
            initializeTenantDashboard();
            break;
        case 'tenant-login':
            const tenantLoginForm = document.getElementById("tenant-login-form");
            if (tenantLoginForm) {
                tenantLoginForm.addEventListener("submit", submitTenantLoginForm);
            }
            break;
        case 'service-provider-login':
            const serviceProviderLoginForm = document.getElementById("service-provider-login-form");
            if (serviceProviderLoginForm) {
                serviceProviderLoginForm.addEventListener("submit", submitServiceProviderLoginForm);
            }
            break;
        // Add other page initializations as needed
    }
}

document.addEventListener("DOMContentLoaded", initializePageSpecificLogic);

