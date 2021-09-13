function shuffle(array) {
    var currentIndex = array.length,  randomIndex;

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
  
    return array;
}

var N, M, idQs = 0;
var arr;

/// Get config
function getContestName(name) {
    document.getElementById("contestname").innerHTML = name;
}

function getQuestionContent(content) {
    document.getElementById("qs").innerHTML = content;
}

function getTotalQuestion(totalqs) {
    M = totalqs;
}

function getNoUseQuestion(useqs) {
    N = useqs;
}

function ProcessQuestion() {
    document.getElementById("questionField").style.display = "none";
    document.getElementById("correct").style.display = "none";
    document.getElementById("incorrect").style.display = "none";

    google.script.run.withSuccessHandler(getContestName).getContestName();
    google.script.run.withSuccessHandler(getTotalQuestion).getTotalQuestion();
    google.script.run.withSuccessHandler(getNoUseQuestion).getNoUseQuestion();
    
    arr = Array.from({length: M}, (_, index) => index + 1);
    arr = shuffle(arr);
    arr = arr.splice(N, M - N);
}

// Time
var Duration = 0;

function UpdateTime() {
    const startTime = Date.now();
    var x = setInterval(function() {
    var now = Date.now();  
    
    var distance = now - startTime;
    
    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
    var totalTime = minutes * 60 + seconds;
      
    document.getElementById("timeleft").innerHTML = Math.floor((Duration - totalTime) / 60) + " phút " + (Duration - totalTime) % 60 + " giây";
    
    if (Duration < totalTime) {
      clearInterval(x);
      document.getElementById("endtimeNotification").innerHTML = "Đã hết thời gian làm bài";
      var question = document.getElementById("question");
      question.remove();
      var submit = document.getElementById("submit");
      submit.remove();
      var timestatus = document.getElementById("timestatus");
      timestatus.remove();
    }
  }, 1000);
}

function LoadQuestion() {
    idQs++;
    document.getElementById("number").innerHTML = "Câu " + idQs + ": ";
    google.script.run.withSuccessHandler(getQuestionContent).getQuestionContent(arr[idQs - 1]);
}

function start() {
    var min = Number(document.getElementById("min").value);
    var sec = Number(document.getElementById("sec").value);
    var before = document.getElementById("before");
    before.remove();
    LoadQuestion();
    document.getElementById("questionField").style.display = "initial";
    Duration = min * 60 + sec;
    UpdateTime();
}

var answer = "Hello";
var correctans = 0;

function ShowAlert(iscorrect) {
    if(iscorrect == true) {
        correctans += 1;
        document.getElementById("correct").style.display = "inherit";
        setTimeout(function(){document.getElementById("correct").style.display = "none"}, 2000);
        document.getElementById("nocorrectans").innerHTML = " " + correctans + " / " + N;
    }
    else {
        document.getElementById("incorrect").style.display = "inherit";
        setTimeout(function(){document.getElementById("incorrect").style.display = "none"}, 2000);
    }
}

function CheckAns() {
    var output = document.getElementById("answer").value;
    google.script.run.withSuccessHandler(ShowAlert).CheckDB(output, arr[idQs - 1]);
    LoadQuestion();
}