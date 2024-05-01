# Cards - Flashcard Creation and Management System w/ AI Card Generation
## Overview
This Flashcard Management System is a comprehensive solution for creating, managing, and practicing with flashcards. It is designed to help users organize information into folders and sets, and to facilitate learning through various modes like editing, previewing, and practicing with flashcards.

## Features
* Flashcard Management:
  Users can add, edit, and delete flashcards within sets. Flashcards can include terms, definitions, and images for both the term and definition (side eye to Quizlet).
* AI Auto-Flashcard Generation:
  Users can upload PDFs to generate flashcards, which will populate new cards with pre-filled based on the content and optional prompt.
* AutoSave Feature:
  Changes to flashcards and sets are automatically saved to prevent data loss.
* Search Functionality:
  Users can search for terms or definitions within flashcards.
* Live Preview:
  Flashcard updates will be updated in real-time in the Flashcard view by letter, as well as 'Next' and 'Back' if cards are created or deleted.
* Folder Management:
  Users can create, delete, and view folders that organize flashcard sets.
* Set Management:
  Inside folders, users can create, delete, and manage sets of flashcards.
* Practice Mode:
  This mode allows users to practice flashcards in a sequential order. 


## Installation and Setup
1. Clone the repository to your local machine.
2. Ensure you have a modern web browser installed (e.g., Chrome, Firefox).
3. Open the index.html file in your browser to start using the application.


## Usage
1. Creating a Folder
2. Enter the folder name in the provided input field.
3. Click the 'Create Folder' button to create the folder.

## Managing Flashcard Sets
1. To create a set, select a folder and enter the set name. Add flashcards by entering terms and definitions.
2. To delete a set, use the delete button next to the set name.

## Editing and Viewing Flashcards
Flashcards can be edited directly within a set.
Each flashcard can have text and image for both term and definition.
Changes are autosaved, or you can manually save the set.

## Practicing Flashcards
Enter practice mode to view flashcards one at a time.
Navigate through flashcards using the 'Previous' and 'Next' buttons.

## Using PDFs to Create Flashcards
Open the PDF file, upload a PDF, and input your OpenAI API key to generate flashcards based on the document content.

## Development
This application is built using HTML, CSS, and JavaScript.
Data is stored in localStorage for persistence across sessions.

License
This project is open-sourced under the MIT license.
