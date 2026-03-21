/**
 * Affanoi Ai - Core Application Logic
 * Architecture: Vanilla JS + LocalStorage + Mock Backend (Mongo/Firebase) + Real APIs
 */

// Initialize Icons
lucide.createIcons();

// --- 1. STATE & ROUTING ---
const navItems = document.querySelectorAll('.nav-links li, .m-nav-item');
const views = document.querySelectorAll('.view');

navItems.forEach(item => {
    item.addEventListener('click', () => {
        // Remove active class from all nav items and views
        navItems.forEach(nav => nav.classList.remove('active'));
        views.forEach(view => view.classList.add('hidden'));
        views.forEach(view => view.classList.remove('active'));

        // Add active to clicked nav and corresponding view
        const target = item.getAttribute('data-target');
        document.querySelectorAll(`[data-target="${target}"]`).forEach(el => el.classList.add('active'));
        
        const activeView = document.getElementById(target);
        activeView.classList.remove('hidden');
        activeView.classList.add('active');
    });
});


// --- 2. THE DAILY ORACLE LOGIC ---
function initializeOracle() {
    const hours = new Date().getHours();
    let greeting = 'Good Evening';
    if (hours < 12) greeting = 'Good Morning';
    else if (hours < 18) greeting = 'Good Afternoon';

    document.getElementById('oracle-greeting').innerText = `${greeting}, Boss.`;
    
    // Proactive AI Insight simulation
    const insights = [
        "Your book writing momentum is building. Let's hit 500 words today.",
        "Your recent physics scores are great. Time to focus on Electrostatics?",
        "Don't forget to review your Duolingo mistakes from yesterday.",
        "A 10-minute meditation right now would optimize your focus by 20%."
    ];
    const randomInsight = insights[Math.floor(Math.random() * insights.length)];
    document.getElementById('oracle-insight').innerText = randomInsight;
}


// --- 3. LIFE TRACKER (COUNTDOWN LOGIC) ---
function initLifeTracker() {
    // Calculate days until 'The Observation Hell' target completion
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + 3); // Defaulting to 3 months from now
    
    const today = new Date();
    const diffTime = Math.abs(targetDate - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    document.getElementById('book-countdown').innerText = `${diffDays} Days Left`;
}


// --- 4. SAMBANOVA API INTEGRATION (Text Gen) ---
// Note: Put your actual SambaNova API key here.
const SAMBANOVA_API_KEY = "YOUR_SAMBANOVA_API_KEY_HERE"; 

async function fetchSambaNova(prompt) {
    // If API key is missing, mock the response so the UI still works.
    if (!SAMBANOVA_API_KEY || SAMBANOVA_API_KEY === "YOUR_SAMBANOVA_API_KEY_HERE") {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(`**Simulated SambaNova Response:**\n\nBased on my analysis, here is the answer regarding: *${prompt}*.\n\n1. Point A: It operates on principles of quantum mechanics.\n2. Point B: Keep focusing on your Class 12 syllabus to master this.\n\n*(Add your API key to app.js for real responses)*`);
            }, 1500);
        });
    }

    // Real fetch logic for SambaNova
    try {
        const response = await fetch('https://api.sambanova.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SAMBANOVA_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'Meta-Llama-3-8B-Instruct', // Replace with designated model
                messages: [
                    { role: "system", content: "You are Affanoi Ai, an expert Life OS and JKBOSE Class 12 tutor." },
                    { role: "user", content: prompt }
                ]
            })
        });
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error("SambaNova Error:", error);
        return "Error connecting to Affanoi Ai core. Please try again later.";
    }
}


// --- 5. JKBOSE HUB LOGIC ---
async function generateConcept(subject) {
    const resultDiv = document.getElementById('concept-result');
    resultDiv.classList.remove('hidden');
    resultDiv.innerHTML = `<span class="sticker pulse">⏳</span> Generating ${subject} breakdown via SambaNova...`;
    
    const response = await fetchSambaNova(`Give me a quick, highly effective 3-bullet point study breakdown for JKBOSE Class 12 ${subject}.`);
    
    resultDiv.innerHTML = `<h4>${subject} Strategy</h4><p class="mt-2" style="white-space: pre-wrap;">${response}</p>`;
}


// --- 6. DATABASES: Firebase & MongoDB (Simulated) ---
// Firebase Feature Toggle Initialization (Mock)
const firebaseConfig = {
    apiKey: "MOCK_KEY",
    authDomain: "affanoi-ai.firebaseapp.com",
    databaseURL: "https://affanoi-ai.firebaseio.com",
    projectId: "affanoi-ai"
};
if(firebaseConfig.apiKey !== "MOCK_KEY") {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase connected.");
}

// MongoDB Simulation
function saveJournal() {
    const missed = document.getElementById('journal-missed').value;
    const achieved = document.getElementById('journal-achieved').value;
    const plan = document.getElementById('journal-plan').value;
    
    const entry = { date: new Date().toISOString(), missed, achieved, plan };
    
    // Simulate saving to MongoDB via localStorage
    let memory = JSON.parse(localStorage.getItem('affanoi_memory') || '[]');
    memory.push(entry);
    localStorage.setItem('affanoi_memory', JSON.stringify(memory));
    
    alert("Journal securely saved to Affanoi Ai Long-Term Memory (MongoDB simulation).");
    
    // Clear inputs
    document.getElementById('journal-missed').value = '';
    document.getElementById('journal-achieved').value = '';
    document.getElementById('journal-plan').value = '';
}


// --- 7. GOAL POSTER STUDIO (Image API) ---
function generatePoster() {
    const promptInput = document.getElementById('poster-prompt').value || 'Futuristic successful student working hard';
    const gallery = document.getElementById('poster-gallery');
    
    // Create loading state
    const imgWrapper = document.createElement('div');
    imgWrapper.innerHTML = `<div class="card bg-offwhite text-center"><span class="pulse">🎨</span> Rendering...</div>`;
    gallery.prepend(imgWrapper);

    // Call Image API
    const imageURL = `https://r-gengpt-api.vercel.app/api/image?prompt=${encodeURIComponent(promptInput)}&style=cinematic&ar=16:9`;
    
    const img = new Image();
    img.onload = () => {
        imgWrapper.innerHTML = '';
        img.className = 'poster-img';
        imgWrapper.appendChild(img);
    };
    img.onerror = () => {
        imgWrapper.innerHTML = `<p class="text-muted">Failed to load poster.</p>`;
    };
    img.src = imageURL;
}


// --- 8. Q&A TO PDF LOGIC (Watermarked) ---
async function handleQnA() {
    const input = document.getElementById('qna-input').value;
    if(!input) return alert("Please ask a question first.");

    const resBox = document.getElementById('qna-result-box');
    const resText = document.getElementById('qna-response-text');
    
    resBox.classList.remove('hidden');
    resText.innerHTML = `<span class="pulse">🧠</span> Affanoi Core is thinking...`;

    // Fetch Answer
    const answer = await fetchSambaNova(input);
    
    // Display in UI
    resText.innerHTML = `<div style="white-space: pre-wrap;">${answer}</div>`;
    
    // Populate Hidden PDF Template
    document.getElementById('pdf-export-body').innerHTML = `
        <h3>Question:</h3>
        <p><em>${input}</em></p>
        <br>
        <h3>Affanoi Response:</h3>
        <div style="white-space: pre-wrap;">${answer}</div>
    `;
}

function downloadPDF() {
    // 1. Target the hidden wrapper
    const element = document.getElementById('pdf-export-template');
    
    // 2. Temporarily show it for html2pdf to capture it accurately
    element.style.display = 'block';

    // 3. Configure html2pdf
    const opt = {
        margin:       0,
        filename:     'Affanoi_Checkes_Solution.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    // 4. Generate and save
    html2pdf().set(opt).from(element).save().then(() => {
        // 5. Hide it again after generation
        element.style.display = 'none';
    });
}


// --- 9. BOOTSTRAP APP ---
window.onload = () => {
    initializeOracle();
    initLifeTracker();
    
    // Pre-load a business insight
    setTimeout(() => {
        document.getElementById('business-insight').innerText = "Market Analysis: AI integration in EdTech is up 45% this quarter. High potential for your projects.";
    }, 2000);
};
