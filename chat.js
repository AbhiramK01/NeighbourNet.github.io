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
const database = firebase.database();

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

// Function to initialize the chat
async function initializeChat() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const tenantId = urlParams.get('tenantId');
        const ownerId = await getOwnerIdFromDatabase(tenantId);
        if (ownerId) {
            fetchTenantData(ownerId, tenantId);
            displayMessages(ownerId, tenantId);
            // Call function to display tenant name with owner ID
            displayTenantName(tenantId, ownerId);
            // Set up event listener for sending message
            document.getElementById('send-button').addEventListener('click', () => {
                const messageInput = document.getElementById('message-input');
                const message = messageInput.value.trim();
                if (message !== '') {
                    sendMessage(message, ownerId, tenantId);
                    messageInput.value = '';
                }
            });
        } else {
            console.error("Owner ID not found for the given tenant ID.");
        }
    } catch (error) {
        console.error("Error occurred while initializing chat:", error);
    }
}

// Function to display tenant name at the top of the chat
function displayTenantName(tenantId, ownerId) {
    const tenantNameElement = document.getElementById('tenant-name');
    tenantNameElement.innerText = `Chatting with: ${tenantId}`;
}

// Function to fetch tenant data from the database
async function fetchTenantData(ownerId, tenantId) {
    try {
        const snapshot = await database.ref(`ownerCreatedIDs/${ownerId}/${tenantId}`).once('value');
        const tenantData = snapshot.val();
        if (tenantData) {
            // Display tenant name
            displayTenantName(tenantData.username, ownerId);
        } else {
            console.error("Tenant data not found for the given owner and tenant ID.");
        }
    } catch (error) {
        console.error("Error occurred while fetching tenant data:", error);
    }
}

// Function to send a message to the tenant
function sendMessage(message, ownerId, tenantId) {
    const messagesRef = database.ref(`owner_tenant_messages/${ownerId}_${tenantId}`);
    messagesRef.push({
        sender: 'Owner',
        message: message
    });
}

// Function to display messages in the chat window
function displayMessages(ownerId, tenantId) {
    const chatMessagesElement = document.getElementById('chat-messages');
    chatMessagesElement.innerHTML = ''; // Clear previous messages
    const messagesRef = database.ref(`owner_tenant_messages/${ownerId}_${tenantId}`);
    messagesRef.on('child_added', (snapshot) => {
        const messageData = snapshot.val();
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        if (messageData.sender === 'Owner') {
            messageElement.classList.add('sender');
        } else {
            messageElement.classList.add('receiver');
        }
        messageElement.innerText = `${messageData.sender}: ${messageData.message}`;
        chatMessagesElement.appendChild(messageElement);
    });
}

// Event listener for closing the chat
document.getElementById('close-chat').addEventListener('click', () => {
    window.location.href = `owner-dashboard.html`;
});

// Initialize the chat
initializeChat();
