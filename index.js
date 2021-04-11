const quizURL = "https://opentdb.com/api.php";
const settings = document.querySelector("#settings");
const quiz = document.querySelector("#quiz");
const final = document.querySelector("#final");
const timeout = document.querySelector("#timeout");
const alerteMsg = document.querySelector(".alert");
const questionElement = document.querySelector("#question");
const choicesElement = document.querySelector("#choices");
const scoreElement = document.querySelector("#score");
const nextButton = document.querySelector("div > button");
const timeSpan = document.querySelector("#timeSpan");

this.againButton = document.querySelector("#again");
this.againButton.addEventListener("click", location.reload.bind(location));

let totalQuestionsAsked = 0;
scoreElement.textContent = "0 of 0";

let totalSeconds = 30;
let timeRemining = totalSeconds;
let secondsElapsed = 0;
let discountSeconds = 0;

let time = setInterval(timer, 1000);
clearInterval(time);

final.classList.add("hide");

async function handleForm() {
  let gameOptions = encodeGameOptions();

  timeSpan.textContent = timeRemining;
  time = setInterval(timer, 1000);

  let { questions, error } = await loadQuestions(gameOptions);
  if (!!error) {
    await handleError(error);
    return;
  }

  clearSettingsForm();

  let questionIndex = 0;
  let question = questions[questionIndex];

  showQuestion(question);
  ListenForUserAnswer(question.correct_answer);

  nextButton.addEventListener("click", async () => {
    clearQuestion();
    questionIndex++;
    if (questionIndex < questions.length) {
      question = questions[questionIndex];
      showQuestion(question);
      ListenForUserAnswer(question.correct_answer);
    } else {
      endQuiz();
      clearInterval(time);
    }
  });
}

function timer() {
  timeRemining = totalSeconds - secondsElapsed - 1 - discountSeconds;
  timeSpan.textContent = timeRemining;
  secondsElapsed++;
  if (timeRemining <= 0) {
    clearInterval(time);
    endQuizTimeoute();
  }
}
function encodeGameOptions() {
  const config = {
    difficulty: document.myForm.difficulty.value,
  };
  let options = `?amount=5&type=multiple`;
  if (config.difficulty !== "any") {
    options += `&difficulty=${config.difficulty}`;
  }
  return options;
}

async function loadQuestions(gameOptions) {
  let questions, data;
  let error = null;
  try {
    const response = await fetch(`${quizURL}${gameOptions}`);

    data = await response.json();

    const response_code = data.response_code;
    questions = data.results;

    if (response_code > 0) {
      error = response_code;
    }
  } catch (ex) {
    error = ex.message;
  } finally {
    return { questions, error };
  }
}

function showQuestion({ question, correct_answer, incorrect_answers }) {
  quiz.classList.remove("spinner");
  questionElement.textContent = htmlDecode(question);
  const choices = [correct_answer, ...incorrect_answers];
  for (const choice of shuffle(choices)) {
    let listItem = document.createElement("li");
    listItem.textContent = htmlDecode(choice);
    let spanItem = document.createElement("span");
    spanItem.appendChild(listItem);
    choicesElement.appendChild(spanItem);
  }
}

function clearQuestion() {
  questionElement.textContent = "";
  var choicesEls = document.querySelectorAll("#choices > span");
  choicesEls.forEach((el) => choicesElement.removeChild(el));
  nextButton.classList.remove("hide");
  quiz.classList.add("spinner");
}

function ListenForUserAnswer(expected) {
  const choicesEl = document.querySelector("#choices");
  choicesEl.addEventListener("click", (e) => handleUserAnswer(e, expected), {
    once: true,
  });
}

function handleUserAnswer({ target }, expected) {
  const answer = target.textContent;
  const choices = document.querySelectorAll("#choices > span > li");
  const elem = [...choices].find((choice) => choice.textContent === answer);
  const rest = [...choices].filter((choice) => choice.textContent !== answer);

  totalQuestionsAsked++;

  if (answer === expected) {
    displayScore(1);
    elem.classList.add("correct");
  } else {
    displayScore();
    elem.classList.add("incorrect");
  }
  rest.forEach((elem) => elem.classList.add("ignore"));
  nextButton.classList.add("show");
}

function displayScore(points = 0) {
  let currentScore = Number(scoreElement.textContent.split(" ")[0]);
  currentScore += points;
  scoreElement.textContent = `${currentScore} of 5 `;
}

function endQuiz() {
  final.classList.remove("hide");
  timeout.classList.add("hide");
  quiz.classList.remove("show");
}

function endQuizTimeoute() {
  timeout.classList.remove("hide");
  final.classList.remove("hide");
  quiz.classList.remove("show");
}

async function handleError(error) {
  const red = "#f44336";
  const message = alerteMsg.querySelector(".message");

  const setElem = (text, red) => {
    alerteMsg.style.background = red;
    message.innerHTML = text;
  };
  setElem(`<strong>Error</strong>: Erreur serveur: ${error}`);
  alerteMsg.classList.add("show");
}

function showSettingsForm() {
  settings.classList.remove("hide");
  quiz.classList.remove("show");
  final.classList.remove("show");
}

function clearSettingsForm() {
  settings.classList.add("hide");
  quiz.classList.add("show");
  final.classList.add("hide");
}

// Utils

function shuffle(answers) {
  let newArray = [];

  while (answers.length > 0) {
    let randomIndex = Math.floor(Math.random() * answers.length);
    const entry = answers.splice(randomIndex, 1);
    newArray.push(entry);
  }
  return newArray;
}

function htmlDecode(input) {
  var doc = new DOMParser().parseFromString(input, "text/html");
  return doc.documentElement.textContent;
}
