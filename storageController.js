const fs = require('fs');

// Where we store our questions.
const questionsList = (__dirname + '/.data/questions.json');

// Fetch the list of questions from the questionList JSON file.
exports.getQuestionList = function () {
  return new Promise((resolve, reject) => {
    let questions = [];
    fs.readFile(questionsList, (error, data) => {
      if (error && error.code === 'ENOENT') {      // File not found!
        console.error(error);
        // Create the file from the empty questions array object.
        fs.writeFile(questionsList, JSON.stringify(questions), () => {});
        resolve(questions);
      }
      else {
        // Parse the questionsList JSON file into the questions array object.
        questions = JSON.parse(data);
        resolve(questions);
      }
    });
  });
}

// Add a question to the questionList JSON file.
exports.addQuestion = async function (question) {
  fs.readFile(questionsList, (error, data) => {
    if (error) {
      console.error(error);
      return false;
    }
    // Parse the questionsList JSON file, push the new question into the end of the array,
    // and re-save the data to the JSON file.
    let json = JSON.parse(data);
    json.push({ question: question, selected: false });
    fs.writeFile(questionsList, JSON.stringify(json), (error) => {
      if (error) {
        console.error(error);
        return false;
      }
    });
  });
  return true;
}

// Toggle the `selected` property for a given question in the questionList JSON file.
exports.toggleSelection = async function (question) {
  fs.readFile(questionsList, (error, data) => {
    if (error) {
      console.error(error);
      return false;
    }
    let json = JSON.parse(data);
    const index = json.findIndex(item => item.question === question.question);
    json[index].selected = question.selected;
    fs.writeFile(questionsList, JSON.stringify(json), (error) => {
      if (error) {
        console.error(error);
        return false;
      }
    });
  });
  return true;  
}
