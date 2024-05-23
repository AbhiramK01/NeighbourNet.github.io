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

// Function to initialize the chat
async function initializeChat() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const serviceProviderId = urlParams.get('serviceProviderId');
        const ownerId = urlParams.get('ownerID');
        if (ownerId) {
            await fetchServiceProviderData(ownerId, serviceProviderId);
            displayMessages(ownerId, serviceProviderId);
            // Set up event listener for sending message
            document.getElementById('send-button').addEventListener('click', () => {
                const messageInput = document.getElementById('message-input');
                const message = messageInput.value.trim();
                if (message !== '') {
                    sendMessage(message, ownerId, serviceProviderId);
                    messageInput.value = '';
                }
            });
        } else {
            console.error("Owner ID not found for the given service-provider ID.");
        }
    } catch (error) {
        console.error("Error occurred while initializing chat:", error);
    }
}

// Function to display service-provider name at the top of the chat
function displayServiceProviderName(serviceProviderName) {
    const serviceProviderNameElement = document.getElementById('service-provider-name');
    serviceProviderNameElement.innerText = `Chatting with: ${serviceProviderName}`;
}

// Function to fetch service-provider data from the database
async function fetchServiceProviderData(ownerId, serviceProviderId) {
    try {
        const snapshot = await database.ref(`ownerCreatedIDs/${ownerId}`).once('value');
        const ownerData = snapshot.val();
        if (ownerData && ownerData[serviceProviderId]) {
            const serviceProviderData = ownerData[serviceProviderId];
            displayServiceProviderName(serviceProviderData.username);
        } else {
            console.error("Service provider data not found for the given owner and service-provider ID.");
        }
    } catch (error) {
        console.error("Error occurred while fetching service-provider data:", error);
    }
}

// Function to send a message to the service-provider
function sendMessage(message, ownerId, serviceProviderId) {
    const messagesRef = database.ref(`owner_service_provider_messages/${ownerId}_${serviceProviderId}`);
    messagesRef.push({
        sender: 'Owner',
        message: message
    });
}

// Function to display messages in the chat window
function displayMessages(ownerId, serviceProviderId) {
    const chatMessagesElement = document.getElementById('chat-messages');
    chatMessagesElement.innerHTML = ''; // Clear previous messages
    const messagesRef = database.ref(`owner_service_provider_messages/${ownerId}_${serviceProviderId}`);
    messagesRef.on('child_added', (snapshot) => {
        const messageData = snapshot.val();
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.classList.add(messageData.sender === 'Owner' ? 'sender' : 'receiver');
        messageElement.innerText = messageData.message;
        chatMessagesElement.appendChild(messageElement);
        chatMessagesElement.scrollTop = chatMessagesElement.scrollHeight; // Scroll to the bottom
    });
}

// Event listener for closing the chat
document.getElementById('close-chat').addEventListener('click', () => {
    // Redirect back to the owner dashboard or any other desired page
    window.location.href = 'owner-dashboard.html';
});

// Initialize the chat
initializeChat();
