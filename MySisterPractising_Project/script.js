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

var contestName, totalQs, id, nofUseQuestion, unixStartTime, maxWrongAnswer, duration, doTestTime = 0;
var arrID;
var answer, idQs = 0, correctAns = 0, wrongAns = 0;
var isEnd = false;
var userName = "";

/// Get setting from config sheet
function getContestName(return_contestName) {
    contestName = return_contestName;
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

function getNotification(string) {
    if (string !== "") {
        document.getElementById("notification").style.display = "inherit";
        showInnerHTML("notification", "Thông báo: " + string);
    }
    else {
        document.getElementById("notification").style.display = "none";
    }
}

function getID(return_id) {
    id = return_id;
}

function getRankTopTen(return_getRankTopTen) {
    if (return_getRankTopTen[0] == "")
        document.getElementById("row1").style.display = "none";
    else {
        showInnerHTML("name1", return_getRankTopTen[0]);
        showInnerHTML("score1", return_getRankTopTen[1]);
    }
    if (return_getRankTopTen[2] == "")
        document.getElementById("row2").style.display = "none";
    else {
        showInnerHTML("name2", return_getRankTopTen[2]);
        showInnerHTML("score2", return_getRankTopTen[3]);
    }
    if (return_getRankTopTen[4] == "")
        document.getElementById("row3").style.display = "none";
    else {
        showInnerHTML("name3", return_getRankTopTen[4]);
        showInnerHTML("score3", return_getRankTopTen[5]);
    }
    if (return_getRankTopTen[6] == "")
        document.getElementById("row4").style.display = "none";
    else {
        showInnerHTML("name4", return_getRankTopTen[6]);
        showInnerHTML("score4", return_getRankTopTen[7]);
    }
    if (return_getRankTopTen[8] == "")
        document.getElementById("row5").style.display = "none";
    else {
        showInnerHTML("name5", return_getRankTopTen[8]);
        showInnerHTML("score5", return_getRankTopTen[9]);
    }
}

function getConfigFile() {
    google.script.run.withSuccessHandler(getContestName).getContestName();
    google.script.run.withSuccessHandler(getNumberofUseQuestion).getNumberofUseQuestion();
    google.script.run.withSuccessHandler(getUnixStartTime).getUnixStartTime();
    google.script.run.withSuccessHandler(getDuration).getDuration();
    google.script.run.withSuccessHandler(getTotalQuestion).getTotalQuestion();
    google.script.run.withSuccessHandler(getMaxWrongAnswer).getMaxWrongAnswer();
    google.script.run.withSuccessHandler(getID).getID();
    google.script.run.withSuccessHandler(getRankTopTen).getRankTopTen();

    google.script.run.withSuccessHandler(getNotification).getNotification();
    var x = setInterval(function () {
        google.script.run.withSuccessHandler(getNotification).getNotification();
    }, 20000);
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
    var timeDistance = Math.floor(timeNow / 1000) - unixStartTime;
    if (timeDistance < 0)
        return -1; // Not start yet
    else if (timeDistance <= duration)
        return 0; // Started
    else
        return 1; // Ended
}

var timeUnit = [" ngày ", " giờ ", " phút ", " giây "];

function updateTime() {
    var x = setInterval(function () {
        if (isEnd == true)
            return;

        var timeNow = Date.now();
        var timeDistance = Math.floor(timeNow / 1000) - unixStartTime;

        var dhms = calculateTime(Math.abs(timeDistance));

        var showContent = "";
        for (let i = 0; i < timeUnit.length; i++)
            if (dhms[i] > 0)
                showContent += dhms[i] + timeUnit[i];

        if (timeDistance <= 0) {
            showContent = "Bắt đầu sau: " + showContent;
            showInnerHTML("timeLeft", showContent);
        }
        else if (timeDistance < duration) {
            dhms = calculateTime(Math.abs(duration - timeDistance));
            showContent = "";
            for (let i = 0; i < timeUnit.length; i++)
                if (dhms[i] > 0)
                    showContent += dhms[i] + timeUnit[i];

            showContent = "Thời gian còn lại: " + showContent;
            showInnerHTML("timeLeft", showContent);
        }
        else if (timeDistance >= duration) {
            showInnerHTML("timeLeft", "Đã kết thúc lượt thi");
            EndTest();
            clearInterval(x);
        }
    }, 1000);
}

var pressStart = 0;
function preLoad() {
    getConfigFile();

    var x = setInterval(function () {
        var dhmsTime = calculateTime(duration);
        var showContentTime = "";
        for (let i = 0; i < timeUnit.length; i++)
            if (dhmsTime[i] > 0)
                showContentTime += dhmsTime[i] + timeUnit[i];
        showInnerHTML("contestNameBoard", "Luyện tập " + contestName);
        showInnerHTML("duringBoard", "Thời gian: " + showContentTime);

        if (isEnd == true)
            return;

        var timeNow = Date.now();
        var timeDistance = Math.floor(timeNow / 1000) - unixStartTime;

        var dhms = calculateTime(Math.abs(timeDistance));

        var showContent = "";
        for (let i = 0; i < timeUnit.length; i++)
            if (dhms[i] > 0)
                showContent += dhms[i] + timeUnit[i];

        if (timeDistance <= 0) {
            showInnerHTML("startStatus", "Kỳ thi sắp tới");
            showInnerHTML("startBoard", showContent);
        }
        else if (timeDistance < duration) {
            dhms = calculateTime(Math.abs(duration - timeDistance));
            showContent = "";
            for (let i = 0; i < timeUnit.length; i++)
                if (dhms[i] > 0)
                    showContent += dhms[i] + timeUnit[i];

            showInnerHTML("startStatus", "Kỳ thi đang diễn ra");
            showInnerHTML("startBoard", showContent);
        }
        else if (timeDistance >= duration) {
            showInnerHTML("startStatus", "Kỳ thi đã kết thúc");
            showInnerHTML("startBoard", " ");
            clearInterval(x);
        }
        else if (pressStart == 1)
            clearInterval(x);
    }, 1000);
}

function randomizeID() {
    arrID = Array.from({ length: totalQs }, (_, index) => index + 1);
    arrID = arrayShuffle(arrID);
    // totalQs - nofUseQuestion must be greater than 0 to use this line
    if (nofUseQuestion != totalQs)
        arrID = arrID.splice(0, nofUseQuestion);
}

function beginLoadData() {
    showInnerHTML("contestName", contestName);
    setQuestionField("none");
    document.getElementById("qs-note").style.display = "inherit";
    document.getElementById("startBtn").style.display = "none";
    document.getElementById("aboveColumn").style.display = "none";
    document.getElementById("showUserName").innerHTML = " " + userName;
    updateTime();


    var x = setInterval(function () {
        var y = isStarted();
        if (y == 0) {
            document.getElementById("startBtn").style.display = "inherit";
            clearInterval(x);
        }
    }, 1000);
}

function start() {
    pressStart = 1;

    doTestTime = Date.now();
    doTestTime = Math.floor(doTestTime / 1000);

    /// Random arrID
    showInnerHTML("status", "Khởi tạo các id câu hỏi...");
    randomizeID();
    setTimeout(function () { showInnerHTML("status", "Đã khởi tạo xong id"); }, 1000);

    /// Show QuestionField & set up footer
    document.getElementById("aboveColumn").style.display = "inherit";
    document.getElementById("startBtn").style.display = "none";
    setQuestionField("inherit");
    showInnerHTML("countCorrectAns", " 0");
    showInnerHTML("countWrongAnswer", " 0");
    showInnerHTML("heart", " " + maxWrongAnswer);
    showInnerHTML("status", " ");

    LoadQuestion(1);
}

function getQuestionContent(questionInfo) {
    showInnerHTML("questionNumber", "Câu hỏi " + idQs + ":");
    showInnerHTML("questionText", questionInfo[0]);
    var imgSrc = document.getElementById("questionImg");
    imgSrc.src = questionInfo[1];
    answer = questionInfo[2];
}

function LoadQuestion(e) {
    showInnerHTML("status", "Loading...");
    idQs = idQs + e;
    if (idQs > nofUseQuestion) {
        EndTest();
        return;
    }
    google.script.run.withSuccessHandler(getQuestionContent).getQuestionContent(arrID[idQs - 1]);
    showInnerHTML("status", "Done");
}

function CheckAns() {
    var output = document.getElementById("output").value;

    if (output == answer) {
        correctAns++;

        var x = document.getElementById("snackbar-correct");
        x.className = "show";
        setTimeout(function () { x.className = x.className.replace("show", ""); }, 3000);

        showInnerHTML("countCorrectAns", " " + correctAns * 10);
        document.getElementById("output").value = "";
    }
    else {
        wrongAns++;

        var x = document.getElementById("snackbar-incorrect");
        x.className = "show";
        setTimeout(function () { x.className = x.className.replace("show", ""); }, 3000);

        showInnerHTML("countWrongAnswer", " " + wrongAns);
        showInnerHTML("heart", " " + (maxWrongAnswer - wrongAns));
        document.getElementById("output").value = "";
        if (wrongAns == maxWrongAnswer) {
            EndTest();
            return;
        }
        document.getElementById("output").value = "";
    }

    LoadQuestion(1);
}

var modal = document.getElementById("myModal");
var close = document.getElementById("close");

function SubmitRound() {
    modal.style.display = "inherit";
    document.getElementById("result").style.display = "none";
    document.getElementById("confirm").style.display = "inherit";
    document.getElementById("end").style.display = "initial";
    showInnerHTML("close", "Đóng");
    return;
}

function EndTest() {
    isEnd = true;

    document.getElementById("btn-submitRound").style.display = "none";
    showInnerHTML("timeLeft", "Đã kết thúc lượt thi");
    document.getElementById("startBtn").style.display = "none";
    document.getElementById("questionField").style.display = "none";
    showInnerHTML("status", "Bạn đã hoàn thành bài thi!");

    modal.style.display = "inherit";
    showInnerHTML("close", "Kết thúc");
    document.getElementById("result").style.display = "inherit";
    document.getElementById("confirm").style.display = "none";
    document.getElementById("end").style.display = "none";
    showInnerHTML("modal-correctAnswer", correctAns * 10);
    if (doTestTime != 0) {
        var endTime = Date.now();
        var dhms = calculateTime(Math.floor(endTime / 1000) - doTestTime);

        var showContent = " ";
        for (let i = 0; i < timeUnit.length; i++)
            if (dhms[i] > 0)
                showContent += dhms[i] + timeUnit[i];
        showInnerHTML("modal-testTime", showContent);
        google.script.run.withSuccessHandler(printLog).sendInfo([userName, endTime / 1000, correctAns * 10, dhms[0] * 86400 + dhms[1] * 3600 + dhms[2] * 60 + dhms[3], id]);
    }
    else
        showInnerHTML("modal-testTime", "0 phút 0 giây");
}

close.onclick = function () {
    modal.style.display = "none";
}

// disable right click
document.addEventListener('contextmenu', event => event.preventDefault());

var fixheight = window.screen.height;
document.onkeydown = function (e) {
    var banPress = [9, 44, 45, 47, 168];
    if (e.keyCode >= 112 && e.keyCode <= 151)
        e.preventDefault();
    for (let i = 0; i < banPress.length; i++)
        if (banPress[i] == e.keyCode())
            e.preventDefault();
    if (e.ctrlKey == true || e.altKey == true)
        e.preventDefault();
}

var outputBox = document.getElementById("output");
outputBox.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        CheckAns();
    }
});

var userNameBox = document.getElementById("userName");
var keysBox = document.getElementById("keys");
userNameBox.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        startFullScreen();
    }
});
keys.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        startFullScreen();
    }
});

function returnCheckKey(e) {
    if (e == -1)
        window.open('https://docs.google.com/spreadsheets/d/1tLXWhJHrd1nrEQpPXZKamxyCa1yq2DYleCUgrINpTas/edit', '_blank');
    else if (e == 0)
        document.getElementById("loginNotification").innerHTML = "Nhập sai key, mời nhập lại!";
    else {
        userName = document.getElementById("userName").value;

        var doc = window.document;
        var docEl = doc.documentElement;

        var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

        if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
            requestFullScreen.call(docEl);

            document.getElementById("note-container").style.display = "none";
            document.getElementById("container").style.display = "initial";
            beginLoadData();

            /// Compare screen height with browser inner height every second
            var x = setInterval(function () {
                if (isEnd == true)
                    clearInterval(x);
                document.getElementById("screendata").innerHTML = window.innerHeight + "-" + fixheight;
                if (window.innerHeight != fixheight) {
                    document.getElementById("screendata").innerHTML = "Bạn có dấu hiệu thoát ra khỏi chế độ toàn màn hình";
                    EndTest();
                    clearInterval(x);
                }
                if (document.hasFocus() == false) {
                    document.getElementById("screendata").innerHTML = "Bạn có dấu hiệu thoát ra khỏi chế độ toàn màn hình";
                    EndTest();
                    clearInterval(x);
                }
            }, 1000);
        }
    }
}

function startFullScreen() {
    google.script.run.withSuccessHandler(returnCheckKey).returnCheckKey(document.getElementById("keys").value);
}
