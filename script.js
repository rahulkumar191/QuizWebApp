
let start_btn = document.querySelector('.start-quiz');
let previous_btn = document.querySelector('.previous');
let next_btn = document.querySelector('.next');
let alldone_submit_btn = document.querySelector('.alldone-submit');
let goBack_btn = document.querySelector('.go-back');
let clearHighscore_btn = document.querySelector('.clear-scores');
let viewHighscore = document.querySelector('.view-score span');

let marking_box = document.querySelector('.marking-box');
let numerator = document.querySelector('.marking-box .nu');
let denominator = document.querySelector('.marking-box .de');
let minutes_box = document.querySelector('.minutes');
let seconds_box = document.querySelector('.seconds');
let quiz_category_box = document.querySelector('.quiz-category-box');
let category_box = document.querySelector('.category-box');
let difficulty_box = document.querySelector('.difficulty-box');
let start_box = document.querySelector('.start-quiz-box');
let ques_box = document.querySelector('.ques-box');
let question_box = document.querySelector('.question-box');
let options_box = document.querySelectorAll('.option-box');
let alldone_box = document.querySelector('.alldone-box'); 
let highScores_box = document.querySelector('.high-scores');
let toppers_box = document.querySelector('.toppers-box');


let questions =[];

let time =20;
let timer_flag = true;
let userAllAnswers = []; //stores user clicked option index 
let correctAnswer; // stores correct answer of current answer
let questionIndex = 0;
let attemptedQuestion = 0;
let totalQuestion = questions.length;
let rightAnswer = 0;
let category = '' , difficulty = '';
let url;


// for storing top 3 players 
let toppers =[
    {
        name: 'Player',
        score: 0
    },
    {
        name: 'Player',
        score: 0
    },
    {
        name: 'Player',
        score: 0
    }
];

// ###### :- logic start here 


// ##### all buttons click handling #####

category_box.addEventListener('change', (event) => {
    category = event.target.value;
});
difficulty_box.addEventListener('change', (event) => {
    difficulty = event.target.value;
});

viewHighscore.addEventListener('click', function(){
    timer_flag = false;
    showHighscores();
});

//start button quize event handling
start_btn.addEventListener('click', async function(){
    resetQuesBox();
    resetOptionsBackground();
    start_box.style.display = 'none';
    quiz_category_box.style.display = 'none';
    ques_box.style.display = 'flex';
    url = `https://opentdb.com/api.php?amount=10&category=${category}&difficulty=${difficulty}&type=multiple`;
    let data = await fetchQuestions(url);
    formateFetchedData(data);
    reset();
    loadQuestion();
    timer();
    setNumDen();
});

// for all option click event handling 
for (let i=0; i<options_box.length; i++){
    options_box[i].addEventListener('click', function(){
        // if this question is not answered then go for process 
        if(userAllAnswers[questionIndex] == undefined){
            attemptedQuestion++;
            userAllAnswers[questionIndex] = i; //storing user clicked option index on the index of question number in userAllAnswers array 
            countScore(i);
            setNumDen();
            answerAnimation(i);
        }
    });
}

// loading previous question 
previous_btn.addEventListener('click', function(){
    if(questionIndex > 0){
        questionIndex--;
        resetOptionsBackground();
        loadQuestion();
        // storing previous state of options 
        if(userAllAnswers[questionIndex] != undefined)
            answerAnimation(userAllAnswers[questionIndex]);
    }
});

// loading next quesionn 
next_btn.addEventListener('click', function(){
    questionIndex++;
    // handling when question end 
    if(questionIndex == totalQuestion){
        endQuiz();
        return;
    }
    if(questionIndex == totalQuestion - 1){
        next_btn.innerHTML = 'Submit';
    }
    loadQuestion();
    // checking this question is answered or not if answered then restore option state 
    let answerIndex = userAllAnswers[questionIndex];
    if(answerIndex != undefined)
        answerAnimation(answerIndex);
});

// showing toopers and updating current player to the end of quiz 
alldone_submit_btn.addEventListener('click', function(){
    showHighscores();
});

// return home page 
goBack_btn.addEventListener('click', function(){
    highScores_box.style.display = 'none';
    marking_box.style.display = 'none';
    start_box.style.display = 'flex';
    quiz_category_box.style.display = 'flex';
    minutes_box.innerHTML = '00';
    seconds_box.innerHTML = '00';
});

// reset  topper 
clearHighscore_btn.addEventListener('click', function(){
    for(let topper of toppers){
        topper.name = 'Player',
        topper.score = 0
    }
    loadtoppers();
});


// ##### all functions bellow #####

// function for getting 10 new questions using API 
function fetchQuestions(url){
   return fetch(url)
  .then(response => response.json())
  .then(data => {
    // return the data here
    return data.results;
  })
  .catch(error => {
    // handle errors here
    console.error(error);
  });
}

// formate fetched data
function formateFetchedData(data){
    questions = [];
    let quesNumber = 1;
    for( let question of data){
        const myObj = new Object();
        //adding question number to question 
        myObj.questionText = `${quesNumber++}. ${question.question}`;
        //keeping all options in options array
        let options = [...question.incorrect_answers];
        options.push(question.correct_answer);
        //random options placing
        let rnd = Math.floor(Math.random() * (3 - 0 + 1)) + 0;
        [options[3], options[rnd]] = [options[rnd], options[3]];
        //adding options number in small letters (a,b,c,d)
        let optionNumber = 97;
        options.forEach(
            (option, index, array)=>{
                array[index] = String.fromCharCode(optionNumber++)+ '. ' + option;
            }
        );

        myObj.options = options;
        
        myObj.answer = options[rnd];
        //pushing all question one by one to questions array that stores all question for quiz 
        questions.push(myObj);
    }
}

// reset ques box innertext
function resetQuesBox(){
    question_box.innerHTML = 'loading...';
    for( let option of options_box){
        option.innerHTML = '';
    }
    next_btn.innerHTML = 'Next';
}

//function sets Numerator and Denominator of current-ques 
function setNumDen(){
    marking_box.style.display = 'flex';
    numerator.innerText = rightAnswer;
    denominator.innerText = totalQuestion;
}
// setNumDen();

//timer function
function timer() {
    let minutes = Math.floor(time / 60);
    let seconds = time % 60;
    minutes_box.innerHTML = minutes;
    seconds_box.innerHTML = seconds;
    if (time > 0 && timer_flag){
        time -= 1;
        setTimeout(timer, 1000);
    }else if(time <= 0){
        endQuiz();
    }
        
}

// function for reset variables for new starting 
function reset(){
    time = 120;
    timer_flag = true;
    totalQuestion = questions.length;
    questionIndex = 0;
    rightAnswer = 0; 
    attemptedQuestion = 0;
    userAllAnswers =[];
    resetOptionsBackground();
}

// function for showing toppers 
function showHighscores(){
    updateToppers();
    loadtoppers();
    rightAnswer = 0;
    start_box.style.display = 'none';
    ques_box.style.display = 'none';
    alldone_box.style.display = 'none';
    highScores_box.style.display = 'flex';
}

// function for loading new question 
function loadQuestion(){
    resetOptionsBackground();
    let optionIndex = 0;
    const data = questions[questionIndex];
    const questionText = data.questionText;
    const options = data.options; 
    correctAnswer = data.answer; //updatig correct answer of current question
    question_box.innerHTML = questionText;
    options.forEach(
        (option) =>{
            options_box[optionIndex++].innerHTML = option;
        }
    );
}

//function for counting score (right answers)
function countScore(idx){
    let userAnswer = questions[questionIndex].options[idx];
    if(userAnswer == correctAnswer){
        rightAnswer++;
    }
}

// function for animating option box after choosing answer 
function answerAnimation(idx){
    let options = questions[questionIndex].options;
    let userAnswer = options[idx];
    let optionelement = options_box[idx];
    resetOptionsBackground();

    if(userAnswer == correctAnswer){
        wrightAnswerAnimation(optionelement);
    }
    else{
        wrongAnswerAnimation(optionelement);
        options.forEach(
            (option, idx)=>{
                if(option == correctAnswer){
                    wrightAnswerAnimation(options_box[idx]);
                }
            }
        );
    }
}

// function for reset option background for next question
function resetOptionsBackground(){
    for(let option of options_box){
        option.style.background = '#218380'
    }
}

// function for right answer animation 
function wrightAnswerAnimation(option){
    option.style.background = 'green';
}

// function for wrong answer animation 
function wrongAnswerAnimation(option){
    option.style.background = 'red';
}

// function for loading toppers for showing 
function loadtoppers(){
    toppers_box.innerHTML = '';
    let index = 1;
    for (let topper of toppers){
        toppers_box.innerHTML += `
        <p>
            <span class="index">${index++}</span>
            <span class="name">. ${topper.name}</span>
            <span class="score">: ${topper.score}</span>
        </p>
        `
    }
}

// function for updating toppers when quiz end 
function updateToppers(){
    let userName = alldone_box.querySelector('input').value;
    alldone_box.querySelector('input').value ='';

    let idx =-1; //store current player right place 
    for(let i=0; i<toppers.length; i++){
        if(rightAnswer > toppers[i].score){
            idx = i; // current player right place (index) in toppers array 
            break;
        }
    }
    // updating toppers array to place current player
    if(idx >=0){
        for(let i=toppers.length-1; i>idx; i--){
            toppers[i] = toppers[i-1];
        }
        let data ={
            name: userName,
            score: rightAnswer
        }
        toppers[idx] = data;
    }
}

// function for handling when quiz end 
function endQuiz(){
    timer_flag = false;
    alldone_box.querySelector('p span').innerText = rightAnswer;
    ques_box.style.display = 'none';
    alldone_box.style.display = 'flex';
}
