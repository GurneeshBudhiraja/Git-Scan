const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");
const chatMessages = document.getElementById("chatMessages");
const ctaMessage = document.getElementById("ctaMessage");

// Enable/Disable send button based on input value
chatInput.addEventListener("input", function () {
  sendBtn.disabled = chatInput.value.trim() === "";
});

// Handle sending messages
sendBtn.addEventListener("click", function () {
  const userMessage = chatInput.value.trim();
  if (!userMessage) return;

  // Hide CTA if it's visible (first message)
  if (ctaMessage) {
    ctaMessage.style.display = "none";
  }

  // Append user's message bubble
  appendMessage(userMessage, "user-message");

  // Clear input & disable button
  chatInput.value = "";
  sendBtn.disabled = true;

  function appendMessage(text, className) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", className);
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
});

// Allow sending message by pressing Enter
chatInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && chatInput.value.trim() !== "") {
    e.preventDefault(); // Prevents a newline in the input
    sendBtn.click(); // Triggers the existing click logic
  }
});

// Handle sending messages
sendBtn.addEventListener("click", function () {
  const userMessage = chatInput.value.trim();
  if (!userMessage) return;

  // Hide CTA element if it's visible
  if (ctaMessage) {
    ctaMessage.style.display = "none";
  }

  // Append user's message bubble
  appendMessage(userMessage, "user-message");

  // Clear input field and disable send button
  chatInput.value = "";
  sendBtn.disabled = true;
});
