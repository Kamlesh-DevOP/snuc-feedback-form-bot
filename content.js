const courseMap = {
    "design and analysis of algorithms": "CS2004",
    "data mining": "CS2010",
    "machine learning techniques": "CS2012",
    "dbms lab": "CS2801T",
    "machine learning lab": "CS2806",
    "environmental sustainability assessment": "BS1502",
    "statistical inference": "MA2002",
    "database management systems": "CS2001T"
};

const facultyMap = {
    "AI-DS": {
        "A": {
            "design and analysis of algorithms": "Dr. Nimisha Ghosh",
            "data mining": "Dr. Surya K",
            "machine learning techniques": "Dr. Chandrakala",
            "dbms lab": "Dr. Veeramani",
            "machine learning lab": "Dr. Chandrakala",
            "environmental sustainability assessment": "Dr. Angel",
            "statistical inference": "Dr. Sujatha",
            "database management systems": "Dr. Veeramani"
        },
        "B": {
            "design and analysis of algorithms": "Dr. Nimisha Ghosh",
            "data mining": "Dr. Surya K",
            "machine learning techniques": "Dr. Rudarshis Majumder",
            "dbms lab": "Dr. Avisha Das",
            "machine learning lab": "Dr. Priya",
            "environmental sustainability assessment": "Dr. Angel",
            "statistical inference": "Dr. Mansur Alam",
            "database management systems": "Dr. Veeramani"
        }
    }
};

function detectCourseName() {
    const breadcrumbLinks = document.querySelectorAll(".breadcrumb a");

    if (breadcrumbLinks.length >= 2) {
        return breadcrumbLinks[1].innerText.trim();
    }

    // fallback
    const header = document.querySelector("h1");
    if (header) return header.innerText.trim();

    return "Course";
}

function fillTextInputs(program, section) {
    const inputs = document.querySelectorAll("input[type='text']");
    function getCourseFullName() {
        const name = detectCourseName().toLowerCase().trim();
        const code = courseMap[name];
        if (code) {
            return `${code} - ${detectCourseName()}`;
        }
        // fallback if not found
        return detectCourseName();
    }

    function getFacultyName(program, section) {
        const detected = detectCourseName().toLowerCase().trim();
        const programData = facultyMap[program];
        if (!programData) return "";
        const sectionData = programData[section];
        if (!sectionData) return "";
        for (let key in sectionData) {
            if (detected.includes(key)) {
                return sectionData[key];
            }
        }
        return ""; // fallback if not found
    }

    inputs.forEach((input) => {
        if (!input.value) {
            const label = input.labels?.[0]?.innerText.toLowerCase() || "";
            
            if (label.includes("school")) input.value = "Engineering";
            else if (label.includes("department")) input.value = "Computer Science";
            else if (label.includes("program")) {
                if (program === "AI-DS") input.value = "BTech AI-DS";
                else if (program === "IoT") input.value = "BTech IoT";
                else input.value = "BTech Cybersecurity";
            }
            else if (label.includes("section")) input.value = section;
            else if (label.includes("faculty")) {
                const faculty = getFacultyName(program, section);
                if (faculty) input.value = faculty;
            }
            else if (label.includes("course")) input.value = getCourseFullName();
            else input.value = "N/A";
        }
    });
}

function fillRadios() {
    const groups = {};

    document.querySelectorAll("input[type='radio']").forEach((radio) => {
        if (!groups[radio.name]) groups[radio.name] = [];
        groups[radio.name].push(radio);
    });

    Object.values(groups).forEach((group) => {
        let best = group.find(r => r.value === "1") || group[1];
        if (best) best.checked = true;
    });
}

function fillTextareas() {
    const answers = [
        "Nil",
        "Nil",
        "Nil"
    ];

    document.querySelectorAll("textarea").forEach((ta, i) => {
        if (!ta.value) {
            ta.value = answers[i % answers.length];
        }
    });
}

function showToast(message = "Filled ✓") {
    // Remove existing toast if any
    const existing = document.getElementById("moodle-toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.id = "moodle-toast";
    toast.innerText = message;

    // Styling
    toast.style.position = "fixed";
    toast.style.top = "20px";
    toast.style.right = "20px";
    toast.style.background = "#2ecc71";
    toast.style.color = "white";
    toast.style.padding = "10px 16px";
    toast.style.borderRadius = "8px";
    toast.style.fontSize = "14px";
    toast.style.boxShadow = "0 4px 10px rgba(0,0,0,0.2)";
    toast.style.zIndex = "9999";
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s ease";

    document.body.appendChild(toast);

    // Fade in
    setTimeout(() => {
        toast.style.opacity = "1";
    }, 50);

    // Fade out and remove
    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

function runAutoFill(program, section) {
    fillTextInputs(program, section);
    fillRadios();
    fillTextareas();
    showToast();
}

// Listen for popup trigger
chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === "RUN_AUTOFILL") {
        runAutoFill(msg.program, msg.section);
    }
});

// 🟦 Floating Button
function createFloatingButton() {
    if (document.getElementById("moodle-auto-fill-btn")) return;

    const btn = document.createElement("button");
    btn.id = "moodle-auto-fill-btn";
    btn.innerText = "Auto Fill";

    btn.style.position = "fixed";
    btn.style.bottom = "20px";
    btn.style.right = "20px";
    btn.style.padding = "10px 14px";
    btn.style.background = "#2b7cff";
    btn.style.color = "white";
    btn.style.border = "none";
    btn.style.borderRadius = "8px";
    btn.style.cursor = "pointer";
    btn.style.zIndex = "9999";
    btn.style.boxShadow = "0 4px 10px rgba(0,0,0,0.2)";
    btn.style.fontSize = "13px";
    btn.title = "Auto Fill (Ctrl + Shift + F)";

    btn.onclick = () => {
        chrome.storage.local.get(["program", "section"], (data) => {
            const program = data.program || "AI-DS";
            const section = data.section || "A";

            runAutoFill(program, section);
        });
    };

    document.body.appendChild(btn);
}

document.addEventListener("keydown", (e) => {
    // Ctrl + Shift + F
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "f") {

        // Prevent triggering inside text inputs
        const active = document.activeElement;
        if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA")) {
            return;
        }

        chrome.storage.local.get(["program", "section"], (data) => {
            const program = data.program || "AI-DS";
            const section = data.section || "A";

            runAutoFill(program, section);
        });
    }
});

// Add button after load
window.addEventListener("load", () => {
    setTimeout(createFloatingButton, 1500);
});