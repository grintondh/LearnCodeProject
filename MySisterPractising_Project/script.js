/**
function printLog() {
    /// Just for checking log in App Script
}

function showInnerHTML(stringID, content) {
    document.getElementById(stringID).innerHTML = content;
}

function arrayShuffle(array) {
    var currentIndex = array.length, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
}

var totalQs, nofUseQuestion, unixStartTime, maxWrongAnswer, duration;
var arrID;
var answer, idQs, correctAns;

/// Get setting from config sheet
function getContestName(return_contestName) {
    showInnerHTML("contestname", return_contestName);
}

function getTotalQuestion(return_totalQs) {
    totalQs = Number(return_totalQs);
}

function getNumberofUseQuestion(return_nofUseQuestion) {
    nofUseQuestion = Number(return_nofUseQuestion);
}

function getUnixStartTime(return_unixStartTime) {
    unixStartTime = return_unixStartTime;
}

function getMaxWrongAnswer(return_maxWrongAnswer) {
    maxWrongAnswer = return_maxWrongAnswer;
}

function getDuration(return_duration) {
    duration = return_duration;
}

function getConfigFile() {
    google.script.run.withSuccessHandler(getContestName).getContestName();
    google.script.run.withSuccessHandler(getTotalQuestion).getTotalQuestion();
    google.script.run.withSuccessHandler(getNumberofUseQuestion).getNumberofUseQuestion();
    google.script.run.withSuccessHandler(getUnixStartTime).getUnixStartTime();
    google.script.run.withSuccessHandler(getMaxWrongAnswer).getMaxWrongAnswer();
    google.script.run.withSuccessHandler(getDuration).getDuration();
}

// Setting Time
function calculateTime(unixTime) {
    var days = Math.floor(unixTime / (60 * 60 * 24));
    var hours = Math.floor((unixTime % (60 * 60 * 24)) / (60 * 60));
    var minutes = Math.floor((unixTime % (60 * 60)) / (60));
    var seconds = Math.floor((unixTime % (60)) / 1);
    var dhms = new Array();
    dhms[0] = days; dhms[1] = hours; dhms[2] = minutes; dhms[3] = seconds;
    return dhms;
}

function setQuestionField(status) {
    document.getElementById("questionField").style.display = status;
}

function isStarted() {
    var timeNow = Date.now();
    var timeDistance = Math.floor(timeNow / 1000)  - unixStartTime;
    if(timeDistance < 0)
        return -1; // Not start yet
    else if(timeDistance <= duration)
        return 0; // Started
    else
        return 1; // Ended
}

function updateTime() {
    var timeUnit = [" ngày ", " giờ ", " phút ", " giây "];
    var x = setInterval(function () {
        var timeNow = Date.now();
        var timeDistance = Math.floor(timeNow / 1000) - unixStartTime;

        var dhms = calculateTime(Math.abs(timeDistance));
        
        var showContent = "";
        for(let i = 0; i < timeUnit.length; i++)
            if(dhms[i] > 0)
                showContent += dhms[i] + timeUnit[i];

        if(timeDistance <= 0) {
            showContent = "Bắt đầu sau: " + showContent;
            showInnerHTML("timeLeft", showContent);
        }
        else if(timeDistance < duration) {
            dhms = calculateTime(Math.abs(duration - timeDistance));
        
            showContent = "";
            for(let i = 0; i < timeUnit.length; i++)
                if(dhms[i] > 0)
                    showContent += dhms[i] + timeUnit[i];
            
            showContent = "Thời gian còn lại: " + showContent;
            showInnerHTML("timeLeft", showContent);
        }
        else if(timeDistance == duration)
            EndTest();
        else
            showInnerHTML("timeLeft", "Đã kết thúc lượt thi");
    }, 1000);
}

function randomizeID() {
    arrID = Array.from({ length: totalQs }, (_, index) => index + 1);
    arrID = shuffle(arrID);
    // totalQs - nofUseQuestion must be greater than 0 to use this line
    if (nofUseQuestion !== totalQs)
        arrID = arrID.splice(nofUseQuestion, totalQs - nofUseQuestion);
}

function beginLoadData() {
    setQuestionField("none");
    document.getElementById("startBtn").style.display = "none";
    getConfigFile();
    updateTime();
    
    var x = setInterval( function () {
        var y = isStarted();
        if(y == 0) {
            document.getElementById("startBtn").style.display = "inherit";
            clearInterval(x);
        }
    }, 1000);
}

function start() {
    /// Random arrID
    showInnerHTML("status", "Khởi tạo các id câu hỏi...");
    randomizeID();
    setTimeout(function () { showInnerHTML("status", "Đã khởi tạo xong id"); }, 1000);

    /// Show QuestionField & set up footer
    document.getElementById("startBtn").style.display = "none";
    setQuestionField("inherit");
    showInnerHTML("countCorrectAns", "Số câu trả lời đúng: 0 / " + totalQs);
    showInnerHTML("countWrongAnswer", "Số câu trả lời sai: 0 / " + maxWrongAnswer);
    showInnerHTML("status", "");

    LoadQuestion();
}

function getQuestionContent(questionInfo) {
    showInnerHTML("number", "Câu " + idQs + ": " + questionInfo[0]);
    answer = questionInfo[1];
}

function LoadQuestion() {
    showInnerHTML("check", "Loading...");
    idQs++;
    if (idQs > nofUseQuestion) {
        EndTest();
        return ;
    }
    google.script.run.withSuccessHandler(getQuestionContent).getQuestionContent(arrID[idQs - 1]);
    showInnerHTML("check", "Done");
}

function CheckAns() {
    var output = document.getElementById("output").value;

    if (output == answer) {
        correctAns++;
        document.getElementById("correct").style.display = "inherit";
        setTimeout(function () { document.getElementById("correct").style.display = "none" }, 1500);
        showInnerHTML("countCorrectAns", "Số câu trả lời đúng: " + correctAns + " / " + nofUseQuestion);
        document.getElementById("answer").value = "";
    }
    else {
        document.getElementById("incorrect").style.display = "inherit";
        setTimeout(function () { document.getElementById("incorrect").style.display = "none" }, 1500);
        document.getElementById("answer").value = "";
        showInnerHTML("countWrongAnwer", "Số câu trả lời sai: " + idQs - correctAns + " / " + maxWrongAnswer);
        if(idQs - correctAns == maxWrongans) {
            EndTest();
            return;
        }
    }

    LoadQuestion();
}

function EndTest() {
    showInnerHTML("endtimeNotification", "Bạn đã hoàn thành bài thi!");
    var question = document.getElementById("question");
    question.remove();
    var submit = document.getElementById("submit");
    submit.remove();
    var timestatus = document.getElementById("timestatus");
    timestatus.remove();
}
 */