let folders = [];
let currentFolder = null;
let currentSet = null;
let currentFlashcard = null;
let autoSaveTimer = null;

function createFolder() {
  const folderName = document.getElementById('newFolderName').value;
  if (folderName) {
    const folder = { name: folderName, sets: [] };
    folders.push(folder);
    saveData();
    renderFolders();
    document.getElementById('newFolderName').value = '';
  }
}

function createSet() {
  const setName = document.getElementById('newSetName').value;
  if (setName && currentFolder) {
    const set = { name: setName, title: '', description: '', tags: [], flashcards: [] };
    currentFolder.sets.push(set);
    saveData();
    renderSets();
    document.getElementById('newSetName').value = '';
  }
}

function createFlashcard() {
  const flashcardElement = document.createElement('div');
  flashcardElement.classList.add('flashcard');
  flashcardElement.innerHTML = `
    <input type="text" placeholder="Enter term">
    <textarea placeholder="Enter definition"></textarea>
    <input type="file" accept="image/*">
    <img src="" alt="Term Image">
    <input type="file" accept="image/*">
    <img src="" alt="Definition Image">
  `;
  flashcardsContainer.appendChild(flashcardElement);
  updateFlashcardPreview();
}

function saveFlashcard() {
  const flashcards = document.querySelectorAll('.flashcard');
  currentSet.flashcards = [];
  flashcards.forEach((flashcardElement) => {
    const term = flashcardElement.querySelector('input[type="text"]').value;
    const definition = flashcardElement.querySelector('textarea').value;
    const termImage = flashcardElement.querySelector('input[type="file"]').files[0];
    const definitionImage = flashcardElement.querySelectorAll('input[type="file"]')[1].files[0];
    const flashcard = { term, definition, termImage: null, definitionImage: null };
    if (termImage) {
      const termReader = new FileReader();
      termReader.onload = function (e) {
        flashcard.termImage = e.target.result;
        saveFlashcardToSet(flashcard);
      };
      termReader.readAsDataURL(termImage);
    }
    if (definitionImage) {
      const definitionReader = new FileReader();
      definitionReader.onload = function (e) {
        flashcard.definitionImage = e.target.result;
        saveFlashcardToSet(flashcard);
      };
      definitionReader.readAsDataURL(definitionImage);
    }
    if (!termImage && !definitionImage) {
      saveFlashcardToSet(flashcard);
    }
  });
  saveData();
  updateFlashcardPreview();
}

function saveFlashcardToSet(flashcard) {
  currentSet.flashcards.push(flashcard);
}

function saveSet() {
  if (currentSet) {
    currentSet.title = document.getElementById('set-title').value;
    currentSet.description = document.getElementById('set-description').value;
    currentSet.tags = document.getElementById('set-tags').value.split(',').map(tag => tag.trim());
    saveData();
    window.location.href = 'set.html?id=' + encodeURIComponent(JSON.stringify(currentSet));
  }
}

function renderFolders() {
  const folderList = document.getElementById('folderList');
  folderList.innerHTML = '';
  folders.forEach((folder, index) => {
    const li = document.createElement('li');
    li.textContent = folder.name;
    li.onclick = function () {
      currentFolder = folder;
      renderSets();
    };
    folderList.appendChild(li);
  });
}

function renderSets() {
  const setList = document.getElementById('setList');
  setList.innerHTML = '';
  if (currentFolder) {
    currentFolder.sets.forEach((set, index) => {
      const li = document.createElement('li');
      li.textContent = set.name;
      li.onclick = function () {
        currentSet = set;
        renderFlashcards();
        updateSetDetails();
      };
      setList.appendChild(li);
    });
  }
}

function renderFlashcards() {
  const flashcardList = document.getElementById('flashcardList');
  flashcardList.innerHTML = '';
  if (currentSet) {
    currentSet.flashcards.forEach((flashcard, index) => {
      const li = document.createElement('li');
      li.textContent = flashcard.term;
      li.onclick = function () {
        currentFlashcard = index;
        showFlashcard();
      };
      flashcardList.appendChild(li);
    });
  }
}

function updateSetDetails() {
  if (currentSet) {
    document.getElementById('set-title').value = currentSet.title;
    document.getElementById('set-description').value = currentSet.description;
    document.getElementById('set-tags').value = currentSet.tags.join(', ');
  }
}

function updateFlashcardPreview() {
  if (currentSet && currentSet.flashcards.length > 0) {
    currentFlashcard = 0;
    showFlashcard();
  }
}

function showFlashcard() {
  if (currentSet && currentFlashcard !== null) {
    const flashcard = currentSet.flashcards[currentFlashcard];
    document.getElementById('questionText').textContent = flashcard.term;
    document.getElementById('answerText').textContent = flashcard.definition;
    document.getElementById('questionImage').src = flashcard.termImage;
    document.getElementById('answerImage').src = flashcard.definitionImage;
  }
}

function previousFlashcard() {
  if (currentFlashcard !== null && currentFlashcard > 0) {
    currentFlashcard--;
    showFlashcard();
  }
}

function nextFlashcard() {
  if (currentSet && currentFlashcard !== null && currentFlashcard < currentSet.flashcards.length - 1) {
    currentFlashcard++;
    showFlashcard();
  }
}

function flipCard(card) {
  card.classList.toggle('is-flipped');
}

function searchFlashcards() {
  const searchTerm = document.getElementById('search-terms').value.toLowerCase();
  const flashcards = document.querySelectorAll('.flashcard');
  flashcards.forEach((flashcardElement) => {
    const term = flashcardElement.querySelector('input[type="text"]').value.toLowerCase();
    const definition = flashcardElement.querySelector('textarea').value.toLowerCase();
    if (term.includes(searchTerm) || definition.includes(searchTerm)) {
      flashcardElement.style.display = 'block';
    } else {
      flashcardElement.style.display = 'none';
    }
  });
}

function saveData() {
  localStorage.setItem('flashcardData', JSON.stringify(folders));
}

function loadData() {
  const data = localStorage.getItem('flashcardData');
  if (data) {
    folders = JSON.parse(data);
    renderFolders();
  }
}

function startAutoSave() {
  autoSaveTimer = setInterval(saveData, 5000);
}

function stopAutoSave() {
  clearInterval(autoSaveTimer);
}

const addFlashcardButton = document.getElementById('add-flashcard');
const flashcardsContainer = document.getElementById('flashcards-container');
addFlashcardButton.addEventListener('click', createFlashcard);

const saveFlashcardButton = document.getElementById('save-flashcards');
saveFlashcardButton.addEventListener('click', saveFlashcard);

const saveSetButton = document.getElementById('save-set');
saveSetButton.addEventListener('click', saveSet);

const searchInput = document.getElementById('search-terms');
searchInput.addEventListener('input', searchFlashcards);

loadData();
startAutoSave();
