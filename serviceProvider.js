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
const database = firebase.database();

async function displayContactDirectory() {
    const ownerCreatedIdsRef = database.ref("ownerCreatedIDs");
    const serviceProviderId = localStorage.getItem("serviceProviderId"); 
    const ownerIdOfServiceProvider = await getOwnerIdFromDatabase(serviceProviderId);
    console.log('OWNER ID IS ',ownerIdOfServiceProvider);
    console.log("Service Provider ID:", serviceProviderId);

    ownerCreatedIdsRef.once("value", (snapshot) => {
        const createdIds = snapshot.val();
        const contactDirectory = document.getElementById("contact-directory");
        contactDirectory.innerHTML = "";

        const closeButton = document.createElement("button");
        closeButton.innerHTML = "&times;";
        closeButton.classList.add("close-button");
        closeButton.onclick = closeContactDirectory;
        contactDirectory.appendChild(closeButton);

        console.log("Owner ID of Service Provider:", ownerIdOfServiceProvider);

        if (ownerIdOfServiceProvider) {
            const ownerData = createdIds[ownerIdOfServiceProvider];
            Object.keys(ownerData).forEach((userId) => {
                const userData = ownerData[userId];
                if (userData.user_type === "tenant") {
                    const contactItem = document.createElement("div");
                    console.log('TENANT ID REAL IS',userData.userid);
                    console.log('OWNER ID REAL IS',ownerIdOfServiceProvider);
                    contactItem.innerHTML = `
                        <strong>Name:</strong> ${userData.username}<br>
                        <strong>Email:</strong> ${userData.useremail}<br>
                        <strong>House Number:</strong> ${userData.house_number}<br>
                        <strong>Mobile Number:</strong> ${userData.mobile_number}<br>
                        <button onclick="initiateChat('${userData.userid}','${ownerIdOfServiceProvider}')">Initiate Chat</button>
                    `;
                    contactDirectory.appendChild(contactItem);
                }
            });
        }

        contactDirectory.classList.add("visible");
    });
}

function closeContactDirectory() {
    const contactDirectory = document.getElementById("contact-directory");
    contactDirectory.classList.remove("visible");
    contactDirectory.innerHTML = ""; // Optionally clear the content
}

function ownerChat() {
const ownerChatButton = document.getElementById('owner-chat');
const serviceProviderId = localStorage.getItem("serviceProviderId"); 
if (ownerChatButton) {
    ownerChatButton.addEventListener('click', () => {
        window.location.href = `service-provider-owner-chat.html?uid=${serviceProviderId}`;
    });
}
}

function initiateChat(tenantId, OId) {
    const serviceProviderId = localStorage.getItem("serviceProviderId");
    console.log('OWNER ID IS ',OId);
    console.log('TENANT ID IS ',tenantId);
    console.log('SERVICE PROVIDER ID IS ',serviceProviderId);
    window.location.href = `service-provider-chat.html?tenantId=${tenantId}&serviceProviderId=${serviceProviderId}&ownerId=${OId}`;
}

function logoutServiceProvider() {
    firebase.auth().signOut().then(() => {
        // Sign-out successful.
        window.location.href = 'service-provider-login.html'; // Redirect to the login page
    }).catch((error) => {
        // An error happened.
        console.error("Error occurred while logging out:", error);
    });
}

//availability

// JavaScript to handle the availability toggle and update Firebase
document.getElementById('availabilitySwitch').addEventListener('change', async function() {
    const status = this.checked ? 'Available' : 'Not Available';
    document.getElementById('statusText').innerText = status;

    const serviceProviderId = localStorage.getItem("serviceProviderId"); 
    const ownerid = await getOwnerIdFromDatabase(serviceProviderId); // Replace with the actual owner ID

    // Update Firebase
    firebase.database().ref(`ownerCreatedIDs/${ownerid}/${serviceProviderId}`).update({
        availability: status
    });
});

async function getOwnerIdFromDatabase(SPID) {
    try {
        const snapshot = await database.ref('ownerCreatedIDs').once('value');
        let ownerId = null;
        snapshot.forEach((ownerSnapshot) => {
            const ownerData = ownerSnapshot.val();
            if (ownerData.hasOwnProperty(SPID)) {
                const SPData = ownerData[SPID];
                ownerId = SPData.ownerid;
            }
        });
        return ownerId;
    } catch (error) {
        console.error("Error occurred while retrieving owner ID:", error);
        return null;
    }
}

/*const firebaseConfig = {
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
const database = firebase.database();




function displayContactDirectory() {
    const ownerCreatedIdsRef = database.ref("ownerCreatedIDs");
    const serviceProviderId = localStorage.getItem("serviceProviderId"); 
    console.log("Service Provider ID:", serviceProviderId);

    ownerCreatedIdsRef.once("value", (snapshot) => {
        const createdIds = snapshot.val();
        const contactDirectory = document.getElementById("contact-directory");
        contactDirectory.innerHTML = "";

        let ownerIdOfServiceProvider = null;
        Object.keys(createdIds).forEach((ownerId) => {
            const ownerData = createdIds[ownerId];
            Object.keys(ownerData).forEach((userId) => {
                const userData = ownerData[userId];
                if (userData.userid === serviceProviderId) {
                    ownerIdOfServiceProvider = ownerId;
                }
            });
        });

        console.log("Owner ID of Service Provider:", ownerIdOfServiceProvider);

        if (ownerIdOfServiceProvider) {
            const ownerData = createdIds[ownerIdOfServiceProvider];
            Object.keys(ownerData).forEach((userId) => {
                const userData = ownerData[userId];
                if (userData.user_type === "tenant") {
                    const contactItem = document.createElement("div");
                    contactItem.innerHTML = `
                        <strong>Name:</strong> ${userData.username}<br>
                        <strong>Email:</strong> ${userData.useremail}<br>
                        <strong>House Number:</strong> ${userData.house_number}<br>
                        <strong>Mobile Number:</strong> ${userData.mobile_number}<br>
                        <button onclick="initiateChat('${userId}')">Initiate Chat</button>
                    `;
                    contactDirectory.appendChild(contactItem);
                }
            });
        }

        contactDirectory.classList.add("visible");
    });
}

function ownerChat() {
const ownerChatButton = document.getElementById('owner-chat');
const serviceProviderId = localStorage.getItem("serviceProviderId"); 
if (ownerChatButton) {
    ownerChatButton.addEventListener('click', () => {
        window.location.href = `service-provider-owner-chat.html?uid=${serviceProviderId}`;
    });
}
}

function initiateChat(tenantId) {
    const serviceProviderId = localStorage.getItem("serviceProviderId");
    window.location.href = `service-provider-chat.html?tenantId=${tenantId}&serviceProviderId=${serviceProviderId}`;
}

function logoutServiceProvider() {
    firebase.auth().signOut().then(() => {
        // Sign-out successful.
        window.location.href = 'service-provider-login.html'; // Redirect to the login page
    }).catch((error) => {
        // An error happened.
        console.error("Error occurred while logging out:", error);
    });
}*/