const programSelect = document.getElementById("program");
const sectionSelect = document.getElementById("section");

// Load saved values
chrome.storage.local.get(["program", "section"], (data) => {
    if (data.program) programSelect.value = data.program;

    updateSections();

    if (data.section) sectionSelect.value = data.section;
});

// Update section options
function updateSections() {
    const program = programSelect.value;

    if (program === "Cyber") {
        sectionSelect.innerHTML = `<option value="A">Section A</option>`;
    } else {
        sectionSelect.innerHTML = `
            <option value="A">Section A</option>
            <option value="B">Section B</option>
        `;
    }
}

programSelect.addEventListener("change", updateSections);

// Run autofill
document.getElementById("run").addEventListener("click", async () => {
    const program = programSelect.value;
    const section = sectionSelect.value;

    // Save preferences
    chrome.storage.local.set({ program, section });

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.tabs.sendMessage(tab.id, {
        action: "RUN_AUTOFILL",
        program,
        section
    });
});