// This runs on the admin page (admin.html) for curating submitted questions.

const questionsList = document.getElementById('list-questions');
let questions;

// Get the list of questions from the server.
function fetchQuestions() {
  let questions = [];
  
  fetch('/questions', {
    method: 'GET'
  }).then(
    response => response.json()
  ).then(
    data => {
      data.forEach((question) => {
        appendNextQuestion(question);
      });
    }
  );
  
  // setTimeout(fetchQuestions, 10000);
}

// A helper function to append a question to the questionsList (an unordered
// list on the admin.html page.
function appendNextQuestion(question) {
  const newListItem = document.createElement('li');
  newListItem.classList.add('question');
  if (question.selected) {
    newListItem.classList.add('selected');
  }
  newListItem.innerHTML = question.question;
  newListItem.addEventListener('click', toggleSelected);
  questionsList.appendChild(newListItem);
}

// A helper function to toggle the 'selected' property on a question 
function toggleSelected(event) {
  // Toggle the 'selected' class on the question.
  event.target.classList.toggle('selected');
  
  // Determine if it's actually selected in the UI...
  const selected = event.target.classList.contains('selected');
  
  // ...and propagate that back to the server.
  const body = {
      question: event.target.innerHTML,
      selected: selected
    }
  
  fetch('/toggleSelection', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body)
  }).then(
    response => console.log(response)
  );
}

// Call the fetchQuestions method when the script loads!
fetchQuestions();