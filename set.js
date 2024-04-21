let currentSet = null;

function loadSetFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const setData = urlParams.get('id');
  if (setData) {
    currentSet = JSON.parse(decodeURIComponent(setData));
    showSetView();
  }
}

function showSetView() {
  document.getElementById('setViewTitle').textContent = currentSet.title;
  document.getElementById('setViewDescription').textContent = currentSet.description;
  document.getElementById('setViewTags').textContent = 'Tags: ' + currentSet.tags.join(', ');
  renderSetViewFlashcards();
}

function renderSetViewFlashcards() {
  const flashcardList = document.getElementById('setViewFlashcards');
  flashcardList.innerHTML = '';
  if (currentSet) {
    currentSet.flashcards.forEach((flashcard, index) => {
      const flashcardElement = document.createElement('div');
      flashcardElement.classList.add('flashcard-view');
      flashcardElement.innerHTML = `
        <h3>${flashcard.term}</h3>
        <p>${flashcard.definition}</p>
        ${flashcard.termImage ? `<img src="${flashcard.termImage}" alt="Term Image">` : ''}
        ${flashcard.definitionImage ? `<img src="${flashcard.definitionImage}" alt="Definition Image">` : ''}
      `;
      flashcardList.appendChild(flashcardElement);
    });
  }
}

function editSet() {
  window.location.href = 'index.html';
}

function practiceSet() {
  // Implement the logic for practicing the set
  console.log('Practicing the set:', currentSet.title);
}

const editSetButton = document.getElementById('edit-set');
editSetButton.addEventListener('click', editSet);

const practiceSetButton = document.getElementById('practice-set');
practiceSetButton.addEventListener('click', practiceSet);

loadSetFromURL();
