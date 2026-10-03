function formatAIText(text) {

    let safeText = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    safeText = safeText.replace(
        /\*\*(.*?)\*\*/g,
        "<strong>$1</strong>"
    );

    safeText = safeText.replace(
        /^\s*\*\s+(.*)$/gm,
        "• $1"
    );

    safeText = safeText.replace(
        /\n/g,
        "<br>"
    );

    return safeText;
}
const uploadBtn = document.getElementById("uploadBtn");
const imageInput = document.getElementById("imageInput");
const imagePreview = document.getElementById("imagePreview");

const analyzeBtn = document.getElementById("analyzeBtn");
const resultBox = document.getElementById("resultBox");
const resultContent = document.getElementById("resultContent");

let selectedFile = null;


// ===============================
// IMAGE UPLOAD
// ===============================

uploadBtn.addEventListener("click", function () {
    imageInput.click();
});


imageInput.addEventListener("change", function () {

    const file = imageInput.files[0];

    if (!file) {
        return;
    }

    selectedFile = file;

    const imageURL = URL.createObjectURL(file);

    imagePreview.src = imageURL;

    imagePreview.style.display = "block";

    uploadBtn.textContent = "Change Image";

    resultBox.style.display = "none";
});


// ===============================
// AI ANALYSIS
// ===============================

analyzeBtn.addEventListener("click", async function () {

    if (!selectedFile) {
        alert("Please upload an image first.");
        return;
    }

    analyzeBtn.textContent = "⏳ Analyzing...";
    analyzeBtn.disabled = true;

    resultBox.style.display = "block";

    resultContent.textContent =
        "CampusLens AI is analyzing your image...";


    try {

        const formData = new FormData();

        formData.append("image", selectedFile);


        const response = await fetch(
            "http://localhost:5000/analyze",
            {
                method: "POST",
                body: formData
            }
        );


        const data = await response.json();


        if (!response.ok) {
            throw new Error(data.error || "Analysis failed");
        }


        resultContent.innerHTML = formatAIText(data.analysis);

        analyzeBtn.textContent = "✅ Analysis Complete";


    } catch (error) {

        console.error(error);

        resultContent.textContent =
            "❌ Unable to analyze the image. Please check that the backend server is running.";

        analyzeBtn.textContent = "🔍 Try Again";


    } finally {

        analyzeBtn.disabled = false;
    }

});
// ===============================
// ASK AI CHAT
// ===============================

const askBtn = document.getElementById("askBtn");
const questionInput = document.getElementById("questionInput");
const chatAnswer = document.getElementById("chatAnswer");

askBtn.addEventListener("click", async function () {

    if (!selectedFile) {
        alert("Please upload an image first.");
        return;
    }

    const question = questionInput.value.trim();

    if (!question) {
        alert("Please enter a question.");
        return;
    }

    askBtn.textContent = "⏳ Thinking...";
    askBtn.disabled = true;

    chatAnswer.textContent = "CampusLens AI is thinking...";

    try {

        const formData = new FormData();

        formData.append("image", selectedFile);
        formData.append("question", question);

        const response = await fetch(
            "http://localhost:5000/ask",
            {
                method: "POST",
                body: formData
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Chat failed");
        }

        chatAnswer.innerHTML = formatAIText(data.answer);

        askBtn.textContent = "Ask AI →";

    } catch (error) {

        console.error(error);

        chatAnswer.textContent =
            "❌ Unable to get an answer. Please try again.";

        askBtn.textContent = "Try Again";

    } finally {

        askBtn.disabled = false;
    }

});
// ===============================
// RESET IMAGE
// ===============================

const resetBtn = document.getElementById("resetBtn");

resetBtn.addEventListener("click", function () {

    imageInput.value = "";

    selectedFile = null;

    imagePreview.src = "";

    imagePreview.style.display = "none";

    uploadBtn.textContent = "Upload Image";

    analyzeBtn.textContent = "🔍 Analyze Image";

    resultBox.style.display = "none";

    questionInput.value = "";

    chatAnswer.innerHTML =
        '<div class="ai-message">🤖 Your AI answer will appear here.</div>';

});
// ===============================
// START ANALYSIS BUTTON
// ===============================

const startBtn = document.querySelector(".start-btn");
const workspace = document.getElementById("workspace");

startBtn.addEventListener("click", function () {

    workspace.scrollIntoView({
        behavior: "smooth"
    });

    setTimeout(function () {
        imageInput.click();
    }, 500);

});
// ===============================
// LAUNCH AI BUTTON
// ===============================

const launchAI = document.querySelector(".nav-start");

launchAI.addEventListener("click", function () {

    workspace.scrollIntoView({
        behavior: "smooth"
    });

});
// ===============================
// DRAG AND DROP UPLOAD
// ===============================

const uploadCard = document.getElementById("uploadCard");

uploadCard.addEventListener("dragover", function (event) {
    event.preventDefault();
    uploadCard.classList.add("dragging");
});

uploadCard.addEventListener("dragleave", function () {
    uploadCard.classList.remove("dragging");
});

uploadCard.addEventListener("drop", function (event) {

    event.preventDefault();

    uploadCard.classList.remove("dragging");

    const file = event.dataTransfer.files[0];

    if (!file) {
        return;
    }

    if (!file.type.startsWith("image/")) {
        alert("Please drop an image file.");
        return;
    }

    selectedFile = file;

    const imageURL = URL.createObjectURL(file);

    imagePreview.src = imageURL;
    imagePreview.style.display = "block";

    uploadBtn.textContent = "Change Image";
});
// ===============================
// QUICK AI QUESTION BUTTONS
// ===============================

const quickButtons = document.querySelectorAll(".quick-btn");

quickButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        const question = button.dataset.question;

        if (!selectedFile) {
            alert("Please upload an image first.");
            return;
        }

        questionInput.value = question;

        askBtn.click();

    });

});