const noteText = document.getElementById("note-text");
const charCount = document.getElementById("char-count");
const wordCount = document.getElementById("word-count");
const clearBtn = document.getElementById("clear-btn");
const themeToggle = document.getElementById("theme-toggle");

const MAX_CHARACTERS = 200;
const WARNING_LIMIT = 180;

const DRAFT_KEY = "quicknotes-draft";
const THEME_KEY = "quicknotes-theme";

function updateCounts() {
const text = noteText.value;
const characters = text.length;

const trimmedText = text.trim();
const words = trimmedText === ""
    ? 0
    : trimmedText.split(/\s+/).length;

charCount.textContent = `${characters} / ${MAX_CHARACTERS} characters`;
wordCount.textContent = `${words} words`;

charCount.classList.remove("warning", "over");

if (characters > MAX_CHARACTERS) {
    charCount.classList.add("over");
} else if (characters > WARNING_LIMIT) {
    charCount.classList.add("warning");
}

}

function saveDraft() {
localStorage.setItem(DRAFT_KEY, noteText.value);
}

function clearNote() {
noteText.value = "";
localStorage.removeItem(DRAFT_KEY);
updateCounts();
}

noteText.addEventListener("input", function () {
updateCounts();
saveDraft();
});

clearBtn.addEventListener("click", clearNote);

noteText.addEventListener("keydown", function (event) {
if (event.key === "Escape") {
clearNote();
}
});

function applyTheme(isDark) {
document.body.classList.toggle("dark", isDark);

themeToggle.textContent = isDark ? "Light mode" : "Dark mode";

}

themeToggle.addEventListener("click", function () {
const isDark = !document.body.classList.contains("dark");

applyTheme(isDark);

localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");

});

function initialiseApp() {
const savedDraft = localStorage.getItem(DRAFT_KEY);
const savedTheme = localStorage.getItem(THEME_KEY);

if (savedDraft !== null) {
    noteText.value = savedDraft;
}

applyTheme(savedTheme === "dark");

updateCounts();

}

initialiseApp();
