let folders = [];
let currentFolder = null;
let currentSet = null;
let currentFlashcard = null;
let autoSaveTimer = null;

function createFolder() {
  const folderName = document.getElementById('newFolderName').value;
  if (folderName) {
    const folder = {
      id: Date.now().toString(),
      name: folderName,
      sets: [],
    };
    folders.push(folder);
    saveData();
    renderFolders();
    document.getElementById('newFolderName').value = '';
  }
}

function deleteFolder(folderId) {
  folders = folders.filter((folder) => folder.id !== folderId);
  saveData();
  renderFolders();
}

function createSet() {
  const setName = document.getElementById('newSetName').value;
  if (setName && currentFolder) {
    const set = {
      id: Date.now().toString(),
      name: setName,
      title: '',
      description: '',
      tags: [],
      flashcards: [],
    };
    currentFolder.sets.push(set);
    currentSet = set;
    saveData();
    renderSets();
    updateSetDetails();
    document.getElementById('newSetName').value = '';
  }
}

function deleteSet(setId) {
  if (currentFolder) {
    currentFolder.sets = currentFolder.sets.filter((set) => set.id !== setId);
    saveData();
    renderSets();
  }
}



function deleteFlashcard(flashcardElement) {
  flashcardElement.parentNode.removeChild(flashcardElement);
  startAutoSave();
  updateFlashcardPreview();
}

function saveSet() {
  if (currentSet) {
    currentSet.title = document.getElementById('set-title').value;
    currentSet.description = document.getElementById('set-description').value;
    currentSet.tags = document.getElementById('set-tags').value.split(',').map((tag) => tag.trim());
    const flashcards = document.querySelectorAll('.flashcard');
    const flashcardPromises = Array.from(flashcards).map((flashcardElement) => {
      const term = flashcardElement.querySelector('input[type="text"]').value;
      const definition = flashcardElement.querySelector('textarea').value;
      const termImageInput = flashcardElement.querySelectorAll('input[type="file"]')[0];
      const definitionImageInput = flashcardElement.querySelectorAll('input[type="file"]')[1];
      const termImage = termImageInput.files[0];
      const definitionImage = definitionImageInput.files[0];
      const flashcard = {
        id: flashcardElement.dataset.id,
        term,
        definition,
        termImage: termImageInput.dataset.image || null,
        definitionImage: definitionImageInput.dataset.image || null,
      };
      return new Promise((resolve) => {
        if (termImage) {
          const termReader = new FileReader();
          termReader.onload = function (e) {
            flashcard.termImage = e.target.result;
            resolve(flashcard);
          };
          termReader.readAsDataURL(termImage);
        } else if (definitionImage) {
          const definitionReader = new FileReader();
          definitionReader.onload = function (e) {
            flashcard.definitionImage = e.target.result;
            resolve(flashcard);
          };
          definitionReader.readAsDataURL(definitionImage);
        } else {
          resolve(flashcard);
        }
      });
    });
    Promise.all(flashcardPromises)
      .then((flashcards) => {
        currentSet.flashcards = flashcards;
        saveData();
        showNotification('Set saved successfully!');
        renderPreviewFlashcards();
        setViewMode('preview');
        updateFlashcardPreview();
      })
      .catch((error) => {
        console.error('Error saving flashcards:', error);
      });
  }
}

function saveFlashcardToSet(flashcard) {
  flashcard.id = Date.now().toString();
  currentSet.flashcards.push(flashcard);
  updateFlashcardPreview();
}

function enterPreviewMode(setId) {
  currentSet = findSetById(setId);
  if (currentSet) {
    document.getElementById('set-title-preview').textContent = 'Title: ' + currentSet.title;
    document.getElementById('set-description-preview').textContent = 'Description: ' + currentSet.description;
    document.getElementById('set-tags-preview').textContent = 'Tags: ' + currentSet.tags.join(', ');
    renderPreviewFlashcards();
    updateFlashcardPreview();
    setViewMode('preview');
  }
}

function enterEditMode() {
  if (currentSet) {
    document.getElementById('set-title').value = currentSet.title;
    document.getElementById('set-description').value = currentSet.description;
    document.getElementById('set-tags').value = currentSet.tags.join(', ');
    renderEditFlashcards();
    updateFlashcardPreview();
    setViewMode('edit');
  }
}

function enterPracticeMode() {
  if (currentSet) {
    currentFlashcard = 0;
    showFlashcard();
    setViewMode('practice');
  }
}

function findSetById(setId) {
  for (const folder of folders) {
    const set = folder.sets.find(set => set.id === setId);
    if (set) {
      return set;
    }
  }
  return null;
}

function renderPreviewFlashcards() {
  const flashcardsPreview = document.getElementById('flashcards-preview');
  flashcardsPreview.innerHTML = '';
  if (currentSet) {
    currentSet.flashcards.forEach((flashcard) => {
      const flashcardElement = document.createElement('div');
      flashcardElement.classList.add('flashcard-preview');
      flashcardElement.dataset.id = flashcard.id;
      flashcardElement.innerHTML = `
        <h3>${flashcard.term}</h3>
        <p>${flashcard.definition}</p>
      `;
      flashcardsPreview.appendChild(flashcardElement);
    });
  }
}

function renderEditFlashcards() {
  const flashcardsContainer = document.getElementById('flashcards-container');
  flashcardsContainer.innerHTML = '';
  if (currentSet) {
    currentSet.flashcards.forEach((flashcard) => {
      const flashcardElement = document.createElement('div');
      flashcardElement.classList.add('flashcard');
      flashcardElement.dataset.id = flashcard.id;
      flashcardElement.innerHTML = `
        <input type="text" value="${flashcard.term}">
        <textarea>${flashcard.definition}</textarea>
        <input type="file" accept="image/*" ${flashcard.termImage ? 'data-image="' + flashcard.termImage + '"' : ''}>
        <img src="${flashcard.termImage || ''}" alt="" style="display: ${flashcard.termImage ? 'block' : 'none'};">
        <input type="file" accept="image/*" ${flashcard.definitionImage ? 'data-image="' + flashcard.definitionImage + '"' : ''}>
        <img src="${flashcard.definitionImage || ''}" alt="" style="display: ${flashcard.definitionImage ? 'block' : 'none'};">
        <button id="deleteFlashcardButton">Delete</button>
      `;
      flashcardsContainer.appendChild(flashcardElement);

      const deleteButton = flashcardElement.querySelector('#deleteFlashcardButton');
      deleteButton.addEventListener('click', function() {
        deleteFlashcard(flashcardElement);
      });
    });
  }
}

function setViewMode(mode) {
  const editModeElements = document.querySelectorAll('.edit-mode');
  const previewModeElements = document.querySelectorAll('.preview-mode');
  const practiceModeElements = document.querySelectorAll('.practice-mode');
  if (mode === 'edit') {
    startAutoSave();
    editModeElements.forEach(element => element.style.display = 'block');
    previewModeElements.forEach(element => element.style.display = 'none');
    practiceModeElements.forEach(element => element.style.display = 'none');
  } else if (mode === 'preview') {
    stopAutoSave();
    editModeElements.forEach(element => element.style.display = 'none');
    previewModeElements.forEach(element => element.style.display = 'block');
    practiceModeElements.forEach(element => element.style.display = 'none');
  } else if (mode === 'practice') {
    stopAutoSave();
    editModeElements.forEach(element => element.style.display = 'none');
    previewModeElements.forEach(element => element.style.display = 'none');
    practiceModeElements.forEach(element => element.style.display = 'block');
  }
}

function renderFolders() {
  const folderList = document.getElementById('folderList');
  folderList.innerHTML = '';
  folders.forEach((folder) => {
    const li = document.createElement('li');
    li.textContent = folder.name;
    li.onclick = function () {
      currentFolder = folder;
      renderSets();
      setActiveFolder(folder.id);
    };
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = function (event) {
      event.stopPropagation();
      deleteFolder(folder.id);
    };
    li.appendChild(deleteButton);
    folderList.appendChild(li);
  });
}

function setActiveFolder(folderId) {
  const folderItems = document.querySelectorAll('#folderList li');
  folderItems.forEach((item) => {
    item.classList.remove('active');
    if (item.textContent.includes(folderId)) {
      item.classList.add('active');
    }
  });
}

function renderSets() {
  const setList = document.getElementById('setList');
  setList.innerHTML = '';
  if (currentFolder) {
    currentFolder.sets.forEach((set) => {
      const li = document.createElement('li');
      li.textContent = set.name;
      li.onclick = function () {
        enterPreviewMode(set.id);
      };
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.onclick = function (event) {
        event.stopPropagation();
        deleteSet(set.id);
      };
      li.appendChild(deleteButton);
      setList.appendChild(li);
    });
  }
}

function renderFlashcards() {
  const flashcardList = document.getElementById('flashcardList');
  flashcardList.innerHTML = '';
  if (currentSet && currentSet.flashcards.length > 0) {
    currentFlashcard = 0;
    showFlashcard();
  }
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
  } else {
    clearFlashcardPreview();
  }
}

function showFlashcard() {
  if (currentSet && currentFlashcard !== null) {
    const flashcard = currentSet.flashcards[currentFlashcard];
    document.getElementById('questionText').textContent = flashcard.term;
    document.getElementById('answerText').textContent = flashcard.definition;
    const questionImage = document.getElementById('questionImage');
    const answerImage = document.getElementById('answerImage');
    if (flashcard.termImage) {
      questionImage.src = flashcard.termImage;
      questionImage.style.display = 'block';
    } else {
      questionImage.src = '';
      questionImage.style.display = 'none';
    }
    if (flashcard.definitionImage) {
      answerImage.src = flashcard.definitionImage;
      answerImage.style.display = 'block';
    } else {
      answerImage.src = '';
      answerImage.style.display = 'none';
    }
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

function clearFlashcardPreview() {
  document.getElementById('questionText').textContent = '';
  document.getElementById('answerText').textContent = '';
  document.getElementById('questionImage').src = '';
  document.getElementById('answerImage').src = '';
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
    updateFlashcardPreview();
  }
}

function showNotification(message) {
  const notificationsContainer = document.getElementById('notifications');
  const notification = document.createElement('div');
  notification.textContent = message;
  notificationsContainer.appendChild(notification);
  setTimeout(() => {
    notificationsContainer.removeChild(notification);
  }, 3000);
}

function autoSaveSet() {
  if (currentSet) {
    currentSet.title = document.getElementById('set-title').value;
    currentSet.description = document.getElementById('set-description').value;
    currentSet.tags = document.getElementById('set-tags').value.split(',').map((tag) => tag.trim());
    const flashcards = document.querySelectorAll('.flashcard');
    const flashcardPromises = Array.from(flashcards).map((flashcardElement) => {
      const term = flashcardElement.querySelector('input[type="text"]').value;
      const definition = flashcardElement.querySelector('textarea').value;
      const termImageInput = flashcardElement.querySelectorAll('input[type="file"]')[0];
      const definitionImageInput = flashcardElement.querySelectorAll('input[type="file"]')[1];
      const termImage = termImageInput.files[0];
      const definitionImage = definitionImageInput.files[0];
      const flashcard = {
        id: flashcardElement.dataset.id,
        term,
        definition,
        termImage: termImageInput.dataset.image || null,
        definitionImage: definitionImageInput.dataset.image || null,
      };
      return new Promise((resolve) => {
        if (termImage) {
          const termReader = new FileReader();
          termReader.onload = function (e) {
            flashcard.termImage = e.target.result;
            resolve(flashcard);
          };
          termReader.readAsDataURL(termImage);
        } else if (definitionImage) {
          const definitionReader = new FileReader();
          definitionReader.onload = function (e) {
            flashcard.definitionImage = e.target.result;
            resolve(flashcard);
          };
          definitionReader.readAsDataURL(definitionImage);
        } else {
          resolve(flashcard);
        }
      });
    });
    Promise.all(flashcardPromises)
      .then((flashcards) => {
        currentSet.flashcards = flashcards;
        saveData();
        showNotification('Autosave: Set saved successfully!');
        updateFlashcardPreview();
      })
      .catch((error) => {
        console.error('Error autosaving flashcards:', error);
      });
  }
}

function startAutoSave() {
  const titleInput = document.getElementById('set-title');
  const descriptionInput = document.getElementById('set-description');
  const tagsInput = document.getElementById('set-tags');

  titleInput.addEventListener('input', autoSaveSet);
  descriptionInput.addEventListener('input', autoSaveSet);
  tagsInput.addEventListener('input', autoSaveSet);

  flashcardsContainer.addEventListener('input', function (event) {
    if (event.target.matches('.flashcard input, .flashcard textarea')) {
      autoSaveSet();
    }
  });

  flashcardsContainer.addEventListener('click', function (event) {
    if (event.target.matches('.flashcard button')) {
      autoSaveSet();
    }
  });
}

function stopAutoSave() {
  const titleInput = document.getElementById('set-title');
  const descriptionInput = document.getElementById('set-description');
  const tagsInput = document.getElementById('set-tags');

  titleInput.removeEventListener('input', autoSaveSet);
  descriptionInput.removeEventListener('input', autoSaveSet);
  tagsInput.removeEventListener('input', autoSaveSet);

  flashcardsContainer.removeEventListener('input', function (event) {
    if (event.target.matches('.flashcard input, .flashcard textarea')) {
      autoSaveSet();
    }
  });

  flashcardsContainer.removeEventListener('click', function (event) {
    if (event.target.matches('.flashcard button')) {
      autoSaveSet();
    }
  });
}

function loadSetFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const setId = urlParams.get('id');
  if (setId) {
    const data = localStorage.getItem('flashcardData');
    if (data) {
      const folders = JSON.parse(data);
      for (const folder of folders) {
        const set = folder.sets.find(set => set.id === setId);
        if (set) {
          currentSet = set;
          break;
        }
      }
    }
  }
}

function populateSetForm() {
  if (currentSet) {
    document.getElementById('set-title').value = currentSet.title;
    document.getElementById('set-description').value = currentSet.description;
    document.getElementById('set-tags').value = currentSet.tags.join(', ');
    const flashcardsContainer = document.getElementById('flashcards-container');
    flashcardsContainer.innerHTML = '';
    const deleteButton = flashcardElement.querySelector('button');
    deleteButton.addEventListener('click', function() {
      deleteFlashcard(flashcardElement);
    });
    currentSet.flashcards.forEach((flashcard) => {
      const flashcardElement = document.createElement('div');
      flashcardElement.classList.add('flashcard');
      flashcardElement.dataset.id = flashcard.id;
      flashcardElement.innerHTML = `
        <input type="text" value="${flashcard.term || ''}">
        <textarea>${flashcard.definition || ''}</textarea>
        <input type="file" accept="image/*" ${flashcard.termImage ? 'data-image="' + flashcard.termImage + '"' : ''}>
        <img src="${flashcard.termImage || ''}" alt="" style="display: ${flashcard.termImage ? 'block' : 'none'};">
        <input type="file" accept="image/*" ${flashcard.definitionImage ? 'data-image="' + flashcard.definitionImage + '"' : ''}>
        <img src="${flashcard.definitionImage || ''}" alt="" style="display: ${flashcard.definitionImage ? 'block' : 'none'};">

      `;
      flashcardsContainer.appendChild(flashcardElement);
    });
    startAutoSave();
  }
}

function populateFlashcardForm() {
  const flashcardsContainer = document.getElementById('flashcards-container');
  flashcardsContainer.innerHTML = '';

  if (currentSet && currentSet.flashcards) {
    currentSet.flashcards.forEach((flashcard) => {
      const flashcardElement = document.createElement('div');
      flashcardElement.classList.add('flashcard');
      flashcardElement.dataset.id = flashcard.id;
      flashcardElement.innerHTML = `
        <input type="text" value="${flashcard.term || ''}">
        <textarea>${flashcard.definition || ''}</textarea>
        <input type="file" accept="image/*">
        <img src="${flashcard.termImage || ''}" alt="" style="display: ${flashcard.termImage ? 'block' : 'none'};">
        <input type="file" accept="image/*">
        <img src="${flashcard.definitionImage || ''}" alt="" style="display: ${flashcard.definitionImage ? 'block' : 'none'};">
        <button onclick="deleteFlashcard(this)">Delete</button>
      `;
      flashcardsContainer.appendChild(flashcardElement);
    });
  }
}

function getViewMode() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('mode');
}

function openPDFModal() {
  const modal = document.getElementById('pdf-modal');
  modal.style.display = 'block';
}

function closePDFModal() {
  const modal = document.getElementById('pdf-modal');
  modal.style.display = 'none';
}

async function generateFlashcardsFromPDF() {
  const pdfFile = document.getElementById('pdf-upload').files[0];
  const apiKey = document.getElementById('openai-api-key').value;
  const customInstructions = document.getElementById('custom-instructions').value;

  if (!pdfFile || !apiKey) {
    alert('Please select a PDF file and provide an OpenAI API key.');
    return;
  }

  const pdfText = await extractTextFromPDF(pdfFile);
  const flashcards = await generateFlashcardsFromText(pdfText, apiKey, customInstructions);

  flashcards.forEach((flashcard) => {
    createFlashcard(flashcard.term, flashcard.definition);
  });

  closePDFModal();
}

async function extractTextFromPDF(pdfFile) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async function (e) {
      const typedarray = new Uint8Array(e.target.result);
      const pdf = await pdfjsLib.getDocument(typedarray).promise;
      let extractedText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        extractedText += pageText + '\n';
      }

      resolve(extractedText);
    };
    reader.onerror = function (e) {
      reject(e);
    };
    reader.readAsArrayBuffer(pdfFile);
  });
}

async function generateFlashcardsFromText(text, apiKey, customInstructions) {
  const prompt = `Generate flashcards from the following text. Please respond strictly and only with flashcard term-definition pairs in the format "Term :: Definition", with different Term :: Definition pairs separated by a new line. Make sure to provide both the term and the definition for each flashcard.\n\n${customInstructions}\n\nText: ${text}\n\nFlashcards:\n`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo-0125',
      messages: [
        { role: 'user', content: prompt }
      ]
    }),
  });

  const data = await response.json();
  console.log(data);

  const generatedText = data.choices[0].message.content.trim();
  console.log('Generated Text:', generatedText);

  const flashcards = parseFlashcardsFromText(generatedText);

  return flashcards;
}

function parseFlashcardsFromText(text) {
  console.log("Input text: ", text);

  const lines = text.split('\n');
  const flashcards = [];

  for (const line of lines) {

    console.log("Processing line: ", line);

    const parts = line.split('::').map(part => part.trim());

    if (parts.length === 2) {
      let [term, definition] = parts;

      console.log("Term: ", term);
      console.log("Definition: ", definition);


      if (!term && definition) {
        const firstColonIndex = definition.indexOf(':');
        if (firstColonIndex !== -1) {
          term = definition.slice(0, firstColonIndex).trim();
          definition = definition.slice(firstColonIndex + 1).trim();
        }
      }

      if (term && definition) {
        flashcards.push({ term, definition });
      }
    }
  }

  console.log("Generated flashcards: ", flashcards); // Debug Line

  return flashcards;
}

function createFlashcard(term = '', definition = '') {
  const flashcardElement = document.createElement('div');
  flashcardElement.classList.add('flashcard');
  flashcardElement.dataset.id = Date.now().toString();
  flashcardElement.innerHTML = `
    <input type="text" placeholder="Enter term" value="${escapeHtml(term)}">
    <textarea placeholder="Enter definition">${escapeHtml(definition)}</textarea>
    <input type="file" accept="image/*">
    <img src="" alt="" style="display: none;">
    <input type="file" accept="image/*">
    <img src="" alt="" style="display: none;">
    <button id="deleteFlashcardButton">Delete</button>
  `;
  flashcardsContainer.appendChild(flashcardElement);

  const deleteButton = flashcardElement.querySelector('#deleteFlashcardButton');
  deleteButton.addEventListener('click', function() {
    deleteFlashcard(flashcardElement);
  });

  updateFlashcardPreview();
}

function escapeHtml(text) {
  if (typeof text === 'string') {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
  }
  return '';
}

const addFlashcardButton = document.getElementById('add-flashcard');
const flashcardsContainer = document.getElementById('flashcards-container');
addFlashcardButton.addEventListener('click', createFlashcard);

const saveSetButton = document.getElementById('save-set');
saveSetButton.addEventListener('click', saveSet);

const searchInput = document.getElementById('search-terms');
searchInput.addEventListener('input', searchFlashcards);

const editSetButton = document.getElementById('edit-set');
editSetButton.addEventListener('click', enterEditMode);

const practiceSetButton = document.getElementById('practice-set');
practiceSetButton.addEventListener('click', enterPracticeMode);

const openPDFModalButton = document.getElementById('open-pdf-modal');
openPDFModalButton.addEventListener('click', openPDFModal);

const closePDFModalButton = document.querySelector('.close');
closePDFModalButton.addEventListener('click', closePDFModal);

const generateFlashcardsButton = document.getElementById('generate-flashcards');
generateFlashcardsButton.addEventListener('click', generateFlashcardsFromPDF);

//FML
document.addEventListener('DOMContentLoaded', function() {
  const createFolderButton = document.getElementById('createFolderButton');
  createFolderButton.addEventListener('click', createFolder);

  const createSetButton = document.getElementById('createSetButton');
  createSetButton.addEventListener('click', createSet);

  const previousButton = document.getElementById('previousButton');
  previousButton.addEventListener('click', previousFlashcard);

  const nextButton = document.getElementById('nextButton');
  nextButton.addEventListener('click', nextFlashcard);

  const flashcard = document.getElementById('flashcard');
  flashcard.addEventListener('click', function() {
    flipCard(this);
  });

  const saveSetButton = document.getElementById('save-set');
  saveSetButton.addEventListener('click', saveSet);

  const searchInput = document.getElementById('search-terms');
  searchInput.addEventListener('input', searchFlashcards);

  const editSetButton = document.getElementById('edit-set');
  editSetButton.addEventListener('click', enterEditMode);

  const practiceSetButton = document.getElementById('practice-set');
  practiceSetButton.addEventListener('click', enterPracticeMode);

  const openPDFModalButton = document.getElementById('open-pdf-modal');
  openPDFModalButton.addEventListener('click', openPDFModal);

  const closePDFModalButton = document.querySelector('.close');
  closePDFModalButton.addEventListener('click', closePDFModal);

  const generateFlashcardsButton = document.getElementById('generate-flashcards');
  generateFlashcardsButton.addEventListener('click', generateFlashcardsFromPDF);


});
loadData();
loadSetFromURL();
setViewMode();

if (getViewMode() === 'edit') {
  populateSetForm();
  startAutoSave();
}
