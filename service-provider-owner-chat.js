// Function to retrieve the service provider ID from URL query parameters
function getServiceProviderIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const serviceProvider = urlParams.get('uid');
    return serviceProvider;
}

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

async function initializeChat() {
    try {
        const serviceProviderID = getServiceProviderIdFromURL();
        console.log("Service Provider ID from URL:", serviceProviderID); // Debugging statement
        if (serviceProviderID) {
            const ownerId = await getOwnerIdFromDatabase(serviceProviderID);
            if (ownerId) {
                console.log("Initializing chat with Owner ID:", ownerId, "and Service Provider ID:", serviceProviderID);
                await fetchOwnerMessages(ownerId, serviceProviderID);
                fetchOwnerData(ownerId);
                // Set up event listener for sending message
                document.getElementById('send-button').addEventListener('click', () => {
                    const messageInput = document.getElementById('message-input');
                    const message = messageInput.value.trim();
                    if (message !== '') {
                        sendMessageToOwner(message, ownerId, serviceProviderID);
                        messageInput.value = '';
                    }
                });
            } else {
                console.error("Owner ID not found for the given service provider ID.");
            }
        } else {
            console.error("Service Provider ID not found in URL query parameters.");
        }
    } catch (error) {
        console.error("Error occurred while initializing chat:", error);
    }
}

// Function to retrieve the owner ID based on the service provider ID
async function getOwnerIdFromDatabase(serviceProviderID) {
    try {
        const snapshot = await database.ref('ownerCreatedIDs').once('value');
        let ownerId = null;
        snapshot.forEach((ownerSnapshot) => {
            const ownerData = ownerSnapshot.val();
            if (ownerData.hasOwnProperty(serviceProviderID)) {
                const serviceProviderData = ownerData[serviceProviderID];
                ownerId = serviceProviderData.ownerid;
            }
        });
        return ownerId;
    } catch (error) {
        console.error("Error occurred while retrieving owner ID:", error);
        return null;
    }
}

// Function to fetch messages from the owner
async function fetchOwnerMessages(ownerId, serviceProviderID) {
    try {
        const messagesRef = database.ref(`owner_service_provider_messages/${ownerId}_${serviceProviderID}`);
        messagesRef.on('child_added', (snapshot) => {
            const messageData = snapshot.val();
            const messageClass = messageData.sender === 'Service Provider' ? 'sender' : 'receiver';
            displayMessage(messageData.message, messageClass);
        });
    } catch (error) {
        console.error("Error occurred while fetching messages:", error);
    }
}

function displayOwnerName(ownerUsername) {
    const ownerNameElement = document.getElementById('owner-name');
    if (ownerNameElement) {
        ownerNameElement.innerText = `Chatting with: ${ownerUsername}`;
    } else {
        console.error("Element with ID 'owner-name' not found.");
    }
}

function fetchOwnerData(ownerId) {
    const ownerDataRef = firebase.database().ref('ownerData/' + ownerId);
    ownerDataRef.once('value', (snapshot) => {
        const ownerData = snapshot.val();
        if (ownerData) {
            const ownerUsername = ownerData.lastName; // Extract owner's username
            displayOwnerName(ownerUsername);
        } else {
            console.error('Owner data not found in the database.');
        }
    });
}

// Function to display messages in the chat window
function displayMessage(message, messageClass) {
    const chatMessagesElement = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${messageClass}`;
    messageElement.innerText = message;
    chatMessagesElement.appendChild(messageElement);
}

// Function to send a message to the owner
async function sendMessageToOwner(message, ownerId, serviceProviderID) {
    try {
        const messagesRef = database.ref(`owner_service_provider_messages/${ownerId}_${serviceProviderID}`);
        await messagesRef.push({
            sender: 'Service Provider',
            message: message
        });
        console.log("Message sent successfully.");
    } catch (error) {
        console.error("Error occurred while sending message:", error);
    }
}

// Event listener for closing the chat
document.getElementById('close-chat').addEventListener('click', () => {
    const serviceProviderID = getServiceProviderIdFromURL();
    // Redirect back to the service dashboard or any other desired page
    window.location.href = `service-provider-dashboard.html?uid=${serviceProviderID}`;
});

// Initialize the chat
initializeChat();
