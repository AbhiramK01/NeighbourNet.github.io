// Function to retrieve the tenant ID from URL query parameters
function getTenantIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const tenantId = urlParams.get('uid');
    return tenantId;
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
        const tenantId = getTenantIdFromURL();
        console.log("Tenant ID from URL:", tenantId); // Debugging statement
        if (tenantId) {
            const ownerId = await getOwnerIdFromDatabase(tenantId);
            if (ownerId) {
                console.log("Initializing chat with Owner ID:", ownerId, "and Tenant ID:", tenantId);
                await fetchOwnerMessages(ownerId, tenantId);
                fetchOwnerData(ownerId);
                // Set up event listener for sending message
                document.getElementById('send-button').addEventListener('click', () => {
                    const messageInput = document.getElementById('message-input');
                    const message = messageInput.value.trim();
                    if (message !== '') {
                        sendMessageToOwner(message, ownerId, tenantId);
                        messageInput.value = '';
                    }
                });
            } else {
                console.error("Owner ID not found for the given tenant ID.");
            }
        } else {
            console.error("Tenant ID not found in URL query parameters.");
        }
    } catch (error) {
        console.error("Error occurred while initializing chat:", error);
    }
}

// Function to retrieve the owner ID and tenant ID from the database
async function getIdsFromDatabase() {
    try {
        const snapshot = await database.ref('ownerCreatedIDs').once('value');
        let ownerId = null;
        let tenantId = null;
        snapshot.forEach((ownerSnapshot) => {
            const ownerData = ownerSnapshot.val();
            Object.keys(ownerData).forEach((userId) => {
                const userData = ownerData[userId];
                if (userData.user_type === "tenant") {
                    tenantId = userData.userid;
                    ownerId = userData.ownerid;
                }
            });
        });
        return { ownerId, tenantId };
    } catch (error) {
        console.error("Error occurred while retrieving IDs from the database:", error);
        return null;
    }
}

// Function to fetch messages from the owner
async function fetchOwnerMessages(ownerId, tenantId) {
    try {
        const messagesRef = database.ref(`owner_tenant_messages/${ownerId}_${tenantId}`);
        messagesRef.on('child_added', (snapshot) => {
            const messageData = snapshot.val();
            displayMessage(messageData);
        });
    } catch (error) {
        console.error("Error occurred while fetching messages:", error);
    }
}

// Function to display owner ID at the top
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
function displayMessage(messageData) {
    const chatMessagesElement = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(messageData.sender === 'Tenant' ? 'sender' : 'receiver');
    messageElement.innerText = messageData.message;
    chatMessagesElement.appendChild(messageElement);
    chatMessagesElement.scrollTop = chatMessagesElement.scrollHeight; // Scroll to the bottom
}

// Function to send a message to the owner
async function sendMessageToOwner(message, ownerId, tenantId) {
    try {
        const messagesRef = database.ref(`owner_tenant_messages/${ownerId}_${tenantId}`);
        await messagesRef.push({
            sender: 'Tenant',
            message: message
        });
        console.log("Message sent successfully.");
    } catch (error) {
        console.error("Error occurred while sending message:", error);
    }
}

// Function to retrieve the owner ID based on the tenant ID
async function getOwnerIdFromDatabase(tenantId) {
    try {
        const snapshot = await database.ref('ownerCreatedIDs').once('value');
        let ownerId = null;
        snapshot.forEach((ownerSnapshot) => {
            const ownerData = ownerSnapshot.val();
            if (ownerData.hasOwnProperty(tenantId)) {
                const tenantData = ownerData[tenantId];
                ownerId = tenantData.ownerid;
            }
        });
        return ownerId;
    } catch (error) {
        console.error("Error occurred while retrieving owner ID:", error);
        return null;
    }
}

// Event listener for closing the chat
document.getElementById('close-chat').addEventListener('click', () => {
    const tenantId = getTenantIdFromURL();
    // Redirect back to the tenant dashboard or any other desired page
    window.location.href = `tenant-dashboard.html?uid=${tenantId}`;
});

// Initialize the chat
initializeChat();
