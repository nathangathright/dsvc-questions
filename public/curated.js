const questionsList = document.getElementById('list-questions');

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
        if (question.selected) {
          appendNextQuestion(question);
        }
      });
    }
  );
}

// A helper function to append a question to the questionsList (an unordered
// list on the curated.html page.
function appendNextQuestion(question) {
  const newListItem = document.createElement('li');
  newListItem.innerHTML = question.question;
  newListItem.addEventListener('click', toggleStrikethrough);
  questionsList.appendChild(newListItem);
}

// A helper function to toggle the 'struckthrough' class on a question.
function toggleStrikethrough(event) {
  event.target.classList.toggle('struckthrough');
}

// Call the fetchQuestions method when the script loads!
fetchQuestions();