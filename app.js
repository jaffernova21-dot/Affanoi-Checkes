/**
 * ==========================================================================
 * AFFANOI AI - CORE SYSTEM ENGINE (app.js)
 * ==========================================================================
 */

// --- Configuration & API Keys ---
// NOTE: Replace 'YOUR_SAMBANOVA_API_KEY' with your actual key from SambaNova
const SAMBANOVA_API_KEY = 'YOUR_SAMBANOVA_API_KEY';
const SAMBANOVA_ENDPOINT = 'https://api.sambanova.ai/v1/chat/completions'; // Update if different

// Firebase Configuration (Replace with your actual Firebase project details)
const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    databaseURL: "https://your-project-default-rtdb.firebaseio.com",
    projectId: "your-project",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// --- DOM Elements ---
const navBtns = document.querySelectorAll('.nav-btn');
const viewSections = document.querySelectorAll('.view-section');
const toastContainer = document.getElementById('toast-container');

// Q&A Elements
const qaInput = document.getElementById('qa-input');
const generateAnswerBtn = document.getElementById('generate-answer-btn');
const qaResultContent = document.getElementById('qa-result-content');
const pdfExportArea = document.getElementById('pdf-export-area');
const downloadPdfBtn = document.getElementById('download-pdf-btn');

// Poster Elements
const posterPrompt = document.getElementById('poster-prompt');
const posterStyle = document.getElementById('poster-style');
const posterAr = document.getElementById('poster-ar');
const generatePosterBtn = document.getElementById('generate-poster-btn');
const posterImg = document.getElementById('poster-img');
const posterLoading = document.getElementById('poster-loading');

// Journal Elements
const journalAchieved = document.getElementById('journal-achieved');
const journalMissed = document.getElementById('journal-missed');
const journalPlan = document.getElementById('journal-plan');
const saveJournalBtn = document.getElementById('save-journal-btn');

/**
 * ==========================================================================
 * UI ROUTING & NAVIGATION
 * ==========================================================================
 */
function switchTab(targetId) {
    // Update active states for buttons
    navBtns.forEach(btn => {
        if (btn.dataset.target === targetId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update active states for sections
    viewSections.forEach(section => {
        if (section.id === targetId) {
            section.classList.remove('hidden');
            section.classList.add('active');
        } else {
            section.classList.add('hidden');
            section.classList.remove('active');
        }
    });
}

// Attach event listeners to all nav buttons
navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.dataset.target;
        if (target) switchTab(target);
    });
});

/**
 * ==========================================================================
 * TOAST NOTIFICATION SYSTEM
 * ==========================================================================
 */
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.style.padding = '16px';
    toast.style.marginTop = '10px';
    toast.style.borderRadius = '8px';
    toast.style.background = type === 'error' ? '#fee2e2' : '#e0e7ff';
    toast.style.color = type === 'error' ? '#991b1b' : '#3730a3';
    toast.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    toast.style.fontWeight = '600';
    toast.textContent = message;

    toastContainer.appendChild(toast);

    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s ease';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

/**
 * ==========================================================================
 * SAMBANOVA API INTEGRATION (Q&A SOLVER)
 * ==========================================================================
 */
async function callSambaNova(promptText) {
    // If you don't have the key yet, we simulate the AI response for UI testing
    if (SAMBANOVA_API_KEY === 'YOUR_SAMBANOVA_API_KEY') {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(`<h3>AI Analysis Complete</h3>
                <p>This is a simulated response for: <strong>"${promptText}"</strong></p>
                <p>Once you insert your SambaNova API key into app.js, this section will return the high-speed AI output. Keep pushing through your Class 12 syllabus!</p>`);
            }, 1500);
        });
    }

    try {
        const response = await fetch(SAMBANOVA_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SAMBANOVA_API_KEY}`
            },
            body: JSON.stringify({
                model: "Meta-Llama-3-8B-Instruct", // Update to desired SambaNova model
                messages: [
                    { role: "system", content: "You are Affanoi Ai, a brilliant tutor for Class 12 JKBOSE students and a strategic life coach." },
                    { role: "user", content: promptText }
                ],
                temperature: 0.7
            })
        });

        if (!response.ok) throw new Error('API request failed');
        const data = await response.json();
        
        // Format the output basic markdown to HTML (simplified)
        let text = data.choices[0].message.content;
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/\n/g, '<br>');
        return text;

    } catch (error) {
        console.error("SambaNova Error:", error);
        throw error;
    }
}

// Handle Q&A Button Click
generateAnswerBtn.addEventListener('click', async () => {
    const question = qaInput.value.trim();
    if (!question) {
        showToast("Please enter a question first.", "error");
        return;
    }

    generateAnswerBtn.innerHTML = '<i data-lucide="loader"></i> Solving...';
    generateAnswerBtn.disabled = true;

    try {
        const answerHtml = await callSambaNova(question);
        
        qaResultContent.innerHTML = answerHtml;
        pdfExportArea.classList.remove('hidden');
        downloadPdfBtn.classList.remove('hidden');
        showToast("Solution generated successfully!");

    } catch (error) {
        showToast("Error generating solution.", "error");
    } finally {
        generateAnswerBtn.innerHTML = '<i data-lucide="cpu"></i> Solve via SambaNova';
        generateAnswerBtn.disabled = false;
        lucide.createIcons();
    }
});

/**
 * ==========================================================================
 * PDF GENERATION WITH WATERMARK (html2pdf.js)
 * ==========================================================================
 */
downloadPdfBtn.addEventListener('click', () => {
    // The watermark is already inside the pdfExportArea in the HTML
    const element = document.getElementById('pdf-export-area');
    
    // PDF Configuration Options
    const opt = {
        margin:       0.5,
        filename:     'Affanoi_Checkes_Solution.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    showToast("Generating your PDF...");
    
    // Generate and save
    html2pdf().set(opt).from(element).save().then(() => {
        showToast("PDF Downloaded!");
    });
});

/**
 * ==========================================================================
 * GOAL POSTER STUDIO (Image API)
 * ==========================================================================
 */
generatePosterBtn.addEventListener('click', () => {
    const prompt = posterPrompt.value.trim();
    const style = posterStyle.value;
    const ar = posterAr.value;

    if (!prompt) {
        showToast("Please enter a prompt for your poster.", "error");
        return;
    }

    posterImg.style.display = 'none';
    posterLoading.classList.remove('hidden');
    generatePosterBtn.disabled = true;
    generatePosterBtn.textContent = "Generating...";

    // Construct the API URL
    const encodedPrompt = encodeURIComponent(prompt);
    const apiUrl = `https://r-gengpt-api.vercel.app/api/image?prompt=${encodedPrompt}&style=${style}&ar=${ar}`;

    // Create a new image object to load the URL
    const imgLoad = new Image();
    imgLoad.onload = function() {
        posterImg.src = apiUrl;
        posterImg.style.display = 'block';
        posterLoading.classList.add('hidden');
        generatePosterBtn.disabled = false;
        generatePosterBtn.textContent = "Generate";
        showToast("Goal Poster generated!");
    };
    imgLoad.onerror = function() {
        posterLoading.classList.add('hidden');
        generatePosterBtn.disabled = false;
        generatePosterBtn.textContent = "Generate";
        showToast("Failed to generate image. Try again.", "error");
    };
    
    // Trigger the load
    imgLoad.src = apiUrl;
});

/**
 * ==========================================================================
 * LOCAL STORAGE (Journaling & Goals)
 * ==========================================================================
 */
// Save Journal
saveJournalBtn.addEventListener('click', () => {
    const journalData = {
        achieved: journalAchieved.value,
        missed: journalMissed.value,
        plan: journalPlan.value,
        date: new Date().toISOString()
    };

    // Store locally (You can swap this with a fetch call to your MongoDB backend later)
    localStorage.setItem('affanoi_daily_journal', JSON.stringify(journalData));
    
    showToast("Journal saved successfully!");
    
    // Clear fields
    journalAchieved.value = '';
    journalMissed.value = '';
    journalPlan.value = '';
});

// Interactive Stickers for Goal Tracking
window.addSticker = function(buttonElement) {
    const sticker = buttonElement.textContent;
    const statContainer = buttonElement.parentElement;
    
    // Create a visual pop effect
    const pop = document.createElement('span');
    pop.textContent = sticker;
    pop.style.position = 'absolute';
    pop.style.animation = 'floatUp 1s ease-out forwards';
    pop.style.fontSize = '1.5rem';
    
    buttonElement.appendChild(pop);
    
    setTimeout(() => pop.remove(), 1000);
    showToast(`Progress logged! Keep it up.`);
};

// Add a quick keyframe for the sticker float effect dynamically
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes floatUp {
    0% { transform: translateY(0) scale(1); opacity: 1; }
    100% { transform: translateY(-40px) scale(1.5); opacity: 0; }
}
`;
document.head.appendChild(styleSheet);

/**
 * ==========================================================================
 * DAILY ORACLE INITIALIZATION
 * ==========================================================================
 */
function initOracle() {
    const hours = new Date().getHours();
    let greeting = "Good Evening";
    if (hours < 12) greeting = "Good Morning";
    else if (hours < 17) greeting = "Good Afternoon";

    document.getElementById('oracle-greeting').textContent = `${greeting}, Jaffer.`;
    
    const messages = [
        "Focus on wrapping up your Physics syllabus today.",
        "Your streak for Spanish is looking great. Don't break it!",
        "Take 30 minutes to write a new chapter for 'The Observation Hell'."
    ];
    
    document.getElementById('oracle-message').textContent = messages[Math.floor(Math.random() * messages.length)];
}

// Run on load
document.addEventListener('DOMContentLoaded', () => {
    initOracle();
});
