/* globals FlipDown */

// This runs on the landing page (index.html).


const infoMessage = document.getElementById('info-message');
const questionForm = document.forms[0];
const questionInput = questionForm.elements['question'];

// Listen for the form to be submitted and send the question off!
questionForm.onsubmit = function(event) {
  // Stop our form submission from refreshing the page
  event.preventDefault();

  // Set the Body property that we'll send to the server.
  const data = {
    Body: questionInput.value
  };

  // Send the POST request!
  fetch('/form',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }
  ).then(response => {
    response.text().then(text => {
      // Once we get the response, we want to show it to the user.
      setInfoMessage(text);
    });
  }
  ).catch(error => console.error(error));

  // Reset the form and give the input field keyboard focus.
  questionInput.value = '';
  questionInput.focus();
};

// A helper function to display the server response message.
const setInfoMessage = function(message) {
  infoMessage.innerText = parseResponse(message);
}

// A helper function to parse the server's response.
function parseResponse(message) {
  const parser = new DOMParser();
  const xmlObject = parser.parseFromString(message, 'text/xml');
  return xmlObject.getElementsByTagName('Message')[0].textContent;
}

// Replace the flipclock with some event details once the countdown ends.
function replaceFlipclock() {
  const questionsDiv = document.querySelector('.questions');
  document.querySelector('.flipdown').remove();
  let glitchURL = document.createElement('h1');
  glitchURL.classList.add('center');
  let other = document.createElement('h2');
  glitchURL.innerHTML = 'or visit <span class="url">2019signal-qsformindy.glitch.me</span>';
  other.innerHTML = 'See the session description for links.';
  glitchURL = questionsDiv.insertBefore(glitchURL, questionForm);
  other = questionsDiv.insertBefore(other, questionForm);
}