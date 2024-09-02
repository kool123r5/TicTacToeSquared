const bigBlock0 = document.getElementById("block_0");
const bigBlock1 = document.getElementById("block_1");
const bigBlock2 = document.getElementById("block_2");
const bigBlock3 = document.getElementById("block_3");
const bigBlock4 = document.getElementById("block_4");
const bigBlock5 = document.getElementById("block_5");
const bigBlock6 = document.getElementById("block_6");
const bigBlock7 = document.getElementById("block_7");
const bigBlock8 = document.getElementById("block_8");
const playArea = document.getElementById("play-area");
let domain = "https://tic-tac-toe-squared.netlify.app/";

const typeOfGame = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
}).type;
const depth = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
}).depth;
const mode = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
}).mode;
const db = firebase.firestore();
let characterArray = ["X", "O"];
const copyToClipboard = (str) => {
    if (navigator && navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(str);
    return Promise.reject("The Clipboard API is not available.");
};
if (typeOfGame == "friends") {
    let gameID = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    }).gameID;
    if (gameID != null) {
        // already have a game
        let characterToPlay = localStorage.getItem(`${gameID}_character`);
        db.collection("friendsGames")
            .doc(`${gameID}`)
            .onSnapshot((doc) => {
                if (doc.exists) {
                    var audio = new Audio("sound-file.mp3");
                    audio.play();
                    if (characterToPlay == undefined && doc.data().noOfPlayers == 1) {
                        db.collection("friendsGames").doc(`${gameID}`).update({
                            noOfPlayers: 2,
                        });
                        if (doc.data().xTaken == true) {
                            characterToPlay = "O";
                            localStorage.setItem(`${gameID}_character`, "O");
                        } else {
                            characterToPlay = "X";
                            localStorage.setItem(`${gameID}_character`, "X");
                        }
                    } else if (characterToPlay == undefined) {
                        document.getElementById(
                            "mainHeading"
                        ).innerHTML = `<span id="shareSpan">Share link</span> to the game. You are spectating this game. It is currently ${
                            doc.data().currentPlayer
                        }'s move.`;
                    } else {
                        document.getElementById(
                            "mainHeading"
                        ).innerHTML = `<span id="shareSpan">Share link</span> to the game. You are playing ${characterToPlay}. It is currently ${
                            doc.data().currentPlayer
                        }'s move.`;
                    }
                    let boardFEN = doc.data().boardFEN;
                    document.getElementById("shareSpan").onclick = (e) => {
                        document.getElementById("copyMsg").classList.remove("hidden");
                        copyToClipboard(window.location.href);
                        setTimeout(() => {
                            document.getElementById("copyMsg").classList.add("hidden");
                        }, 2000);
                    };
                    for (let x = 0; x < 9; x++) {
                        for (let y = 0; y < 9; y++) {
                            let subblock = document.getElementById(`sub_${x}_block_${y}`);
                            if (boardFEN.charAt(9 * x + y) != "s") {
                                subblock.innerText = boardFEN.charAt(9 * x + y);
                            }
                        }
                    }
                    if (doc.data().onlyClickableBoard == 100) {
                        bigBlock0.classList.add("click");
                        bigBlock1.classList.add("click");
                        bigBlock2.classList.add("click");
                        bigBlock3.classList.add("click");
                        bigBlock4.classList.add("click");
                        bigBlock5.classList.add("click");
                        bigBlock6.classList.add("click");
                        bigBlock7.classList.add("click");
                        bigBlock8.classList.add("click");
                    } else {
                        for (let x = 0; x < 9; x++) {
                            if (x == doc.data().onlyClickableBoard) {
                                document.getElementById(`block_${x}`).classList.add("click");
                            } else {
                                document.getElementById(`block_${x}`).classList.remove("click");
                            }
                        }
                    }
                    playArea.onclick = (e) => {
                        if (
                            document.getElementById(`block_${e.srcElement.id.charAt(4)}`).classList.contains("click") &&
                            document.getElementById(e.srcElement.id).innerText == "" &&
                            doc.data().currentPlayer == characterToPlay
                        ) {
                            boardFEN = boardFEN.split("");
                            boardFEN[9 * parseInt(e.srcElement.id.charAt(4)) + parseInt(e.srcElement.id.slice(-1))] =
                                characterToPlay;
                            boardFEN = boardFEN.join("");
                            document.getElementById(e.srcElement.id).innerText = characterToPlay;
                            if (doc.data().currentPlayer == "X") {
                                db.collection("friendsGames")
                                    .doc(`${gameID}`)
                                    .update({
                                        boardFEN: boardFEN,
                                        onlyClickableBoard: e.srcElement.id.slice(-1),
                                        currentPlayer: "O",
                                    });
                            } else {
                                db.collection("friendsGames")
                                    .doc(`${gameID}`)
                                    .update({
                                        boardFEN: boardFEN,
                                        onlyClickableBoard: e.srcElement.id.slice(-1),
                                        currentPlayer: "X",
                                    });
                            }
                        }
                    };
                    checkWin(`Friends_${characterToPlay}`);
                } else {
                    window.location = `${domain}?type=friends`;
                }
            });
    } else {
        // need to make a new link to invite friends
        gameID = makeid(8);
        localStorage.setItem(`${gameID}_character`, characterArray[Math.floor(Math.random() * characterArray.length)]);
        if (localStorage.getItem(`${gameID}_character`) == "X") {
            db.collection("friendsGames")
                .doc(`${gameID}`)
                .set({
                    boardFEN: "sssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss",
                    currentPlayer: "X",
                    noOfPlayers: 1,
                    onlyClickableBoard: 100,
                    xTaken: true,
                })
                .then(() => {
                    window.location.href = `${domain}?type=friends&gameID=${gameID}`;
                });
        } else {
            db.collection("friendsGames")
                .doc(`${gameID}`)
                .set({
                    boardFEN: "sssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss",
                    currentPlayer: "X",
                    noOfPlayers: 1,
                    onlyClickableBoard: 100,
                    xTaken: false,
                })
                .then(() => {
                    window.location.href = `${domain}?type=friends&gameID=${gameID}`;
                });
        }
    }
}

function makeid(length) {
    var result = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function beginGame() {
    bigBlock0.classList.add("click");
    bigBlock1.classList.add("click");
    bigBlock2.classList.add("click");
    bigBlock3.classList.add("click");
    bigBlock4.classList.add("click");
    bigBlock5.classList.add("click");
    bigBlock6.classList.add("click");
    bigBlock7.classList.add("click");
    bigBlock8.classList.add("click");
}

let charToPlay = "X";

function updateGameSelf(subblockclicked) {
    let onlySubBlockAllowed = subblockclicked.slice(-1);
    document.getElementById(subblockclicked).innerHTML = charToPlay;
    if (charToPlay == "X") {
        charToPlay = "O";
    } else {
        charToPlay = "X";
    }
    for (let x = 0; x < 9; x++) {
        if (x == onlySubBlockAllowed) {
            document.getElementById(`block_${x}`).classList.add("click");
        } else {
            document.getElementById(`block_${x}`).classList.remove("click");
        }
    }
    checkWin("Self");
}

function updateGameComputer(subblockclicked) {
    let onlySubBlockAllowed = subblockclicked.slice(-1);
    document.getElementById(subblockclicked).innerHTML = charToPlay;
    for (let x = 0; x < 9; x++) {
        if (x == onlySubBlockAllowed) {
            document.getElementById(`block_${x}`).classList.add("click");
        } else {
            document.getElementById(`block_${x}`).classList.remove("click");
        }
    }
    checkWin("Computer");
    computerMove(subblockclicked);
}

function computerMove(subblockclicked) {
    let onlySubBlockAllowed = subblockclicked.slice(-1);
    let randNum = Math.floor(Math.random() * 8);
    if (document.getElementsByClassName("click")[0].childNodes[1].childNodes[randNum * 2 + 1].innerText != "") {
        computerMove(subblockclicked);
        return;
    } else {
        document.getElementById(`sub_${onlySubBlockAllowed}_block_${randNum}`).innerText = "O";
    }
    for (let x = 0; x < 9; x++) {
        if (x == randNum) {
            document.getElementById(`block_${x}`).classList.add("click");
        } else {
            document.getElementById(`block_${x}`).classList.remove("click");
        }
    }
    checkWin("Computer");
}
let hashtable = new Map();
let depthChoice = parseInt(depth) || 2;
let bestMove = "";
let bestMoveForOpponent = "";
let count = 0;
function updateGameComputerIntelligence(subblockclicked) {
    let onlySubBlockAllowed = subblockclicked.slice(-1);
    document.getElementById(subblockclicked).innerHTML = charToPlay;
    for (let x = 0; x < 9; x++) {
        if (x == onlySubBlockAllowed) {
            document.getElementById(`block_${x}`).classList.add("click");
        } else {
            document.getElementById(`block_${x}`).classList.remove("click");
        }
    }

    if (checkWin("ComputerIntelligence") == 0) {
        if (count < 1) {
            computerMove(subblockclicked);
            count++;
        } else {
            let initTime = Date.now();
            let bestEval = computerMoveIntelligence(subblockclicked, depthChoice, -Infinity, Infinity, true);
            console.log("Time taken for the move was: ", Date.now() - initTime);
            document.getElementById(`sub_${onlySubBlockAllowed}_block_${bestMove}`).innerText = "O";
            hashtable.clear();
            var audio = new Audio("sound-file.mp3");
            audio.play();
            for (let x = 0; x < 9; x++) {
                if (x == bestMove) {
                    document.getElementById(`block_${x}`).classList.add("click");
                } else {
                    document.getElementById(`block_${x}`).classList.remove("click");
                }
            }
            checkWin("ComputerIntelligence");
        }
    }
}
let x_values = [];
let o_values = [];
for (let i = 0; i < 81; i++) {
    x_values[i] = Math.floor(Math.random() * 2 ** 64);
    o_values[i] = Math.floor(Math.random() * 2 ** 64);
}

function computeHash() {
    let hash = 0;
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (document.getElementById(`sub_${i}_block_${j}`).innerText == "X") {
                hash = hash ^ x_values[i * 9 + j];
            } else if (document.getElementById(`sub_${i}_block_${j}`).innerText == "O") {
                hash = hash ^ o_values[i * 9 + j];
            }
        }
    }
    return hash;
}
let hashcount = 0;
function computerMoveIntelligence(subblockclicked, depth, alpha, beta, isCompMove) {
    let onlySubBlockAllowed = subblockclicked.slice(-1);
    if (depth == 0) {
        return noEndCheckWin(depthChoice);
    }
    if (noEndCheckWin(depthChoice - depth) > 50) {
        return noEndCheckWin(depthChoice - depth);
    } else if (noEndCheckWin(depthChoice - depth) < -50) {
        return noEndCheckWin(depthChoice - depth);
    }
    if (isCompMove == true) {
        let bestEval = -Infinity;
        for (let x = 0; x < 9; x++) {
            let subblockPotentialMove = document.getElementById(`sub_${onlySubBlockAllowed}_block_${x}`);
            if (subblockPotentialMove.innerText == "") {
                subblockPotentialMove.innerText = "O";
                let hash = computeHash();
                if (hashtable.get(`${hash}_${onlySubBlockAllowed}`) == undefined) {
                    let evaluation = computerMoveIntelligence(
                        `sub_${onlySubBlockAllowed}_block_${x}`,
                        depth - 1,
                        alpha,
                        beta,
                        false
                    );
                    hashtable.set(`${hash}_${onlySubBlockAllowed}`, `${evaluation}`);
                    subblockPotentialMove.innerText = "";
                    if (evaluation > bestEval && depth == depthChoice) {
                        bestEval = evaluation;
                        bestMove = x;
                    } else if (evaluation > bestEval && depth != depthChoice) {
                        bestEval = evaluation;
                    }
                    alpha = Math.max(alpha, bestEval);
                    if (beta <= alpha) {
                        break;
                    }
                } else {
                    hashcount++;
                    // console.log(hashcount);
                    let evaluation = hashtable.get(`${hash}_${onlySubBlockAllowed}`);
                    subblockPotentialMove.innerText = "";
                    if (evaluation > bestEval && depth == depthChoice) {
                        bestEval = evaluation;
                        bestMove = x;
                    } else if (evaluation > bestEval && depth != depthChoice) {
                        bestEval = evaluation;
                    }
                    alpha = Math.max(alpha, bestEval);
                    if (beta <= alpha) {
                        break;
                    }
                }
            }
        }
        return bestEval;
    } else {
        let bestEval = Infinity;
        for (let x = 0; x < 9; x++) {
            let subblockPotentialMove = document.getElementById(`sub_${onlySubBlockAllowed}_block_${x}`);
            if (subblockPotentialMove.innerText == "") {
                subblockPotentialMove.innerText = "X";
                let hash = computeHash();
                if (hashtable.get(`${hash}_${onlySubBlockAllowed}`) == undefined) {
                    let evaluation = computerMoveIntelligence(
                        `sub_${onlySubBlockAllowed}_block_${x}`,
                        depth - 1,
                        alpha,
                        beta,
                        true
                    );
                    hashtable.set(`${hash}_${onlySubBlockAllowed}`, `${evaluation}`);
                    subblockPotentialMove.innerText = "";
                    if (evaluation < bestEval) {
                        bestEval = evaluation;
                        bestMoveForOpponent = x;
                    } else if (bestEval == evaluation && Math.random() > 0.2) {
                        bestEval = evaluation;
                        bestMoveForOpponent = x;
                    }
                    beta = Math.min(beta, bestEval);
                    if (beta <= alpha) {
                        break;
                    }
                } else {
                    hashcount++;
                    // console.log(hashcount);
                    let evaluation = hashtable.get(`${hash}_${onlySubBlockAllowed}`);
                    subblockPotentialMove.innerText = "";
                    if (evaluation < bestEval) {
                        bestEval = evaluation;
                        bestMoveForOpponent = x;
                    } else if (bestEval == evaluation && Math.random() > 0.2) {
                        bestEval = evaluation;
                        bestMoveForOpponent = x;
                    }
                    beta = Math.min(beta, bestEval);
                    if (beta <= alpha) {
                        break;
                    }
                }
            }
        }
        return bestEval;
    }
}

function checkWin(typeOfGamel) {
    for (let x = 0; x < 9; x++) {
        let arr = [];
        let currentBigBlock = document.getElementById(`block_${x}`).childNodes[1].childNodes;
        let txtVal0 = currentBigBlock[1].innerText;
        let txtVal1 = currentBigBlock[3].innerText;
        let txtVal2 = currentBigBlock[5].innerText;
        let txtVal3 = currentBigBlock[7].innerText;
        let txtVal4 = currentBigBlock[9].innerText;
        let txtVal5 = currentBigBlock[11].innerText;
        let txtVal6 = currentBigBlock[13].innerText;
        let txtVal7 = currentBigBlock[15].innerText;
        let txtVal8 = currentBigBlock[17].innerText;
        arr.push(txtVal0, txtVal1, txtVal2, txtVal3, txtVal4, txtVal5, txtVal6, txtVal7, txtVal8);
        if (
            (arr[0] == "X" && arr[3] == "X" && arr[6] == "X") ||
            (arr[1] == "X" && arr[4] == "X" && arr[7] == "X") ||
            (arr[2] == "X" && arr[5] == "X" && arr[8] == "X") ||
            (arr[0] == "X" && arr[1] == "X" && arr[2] == "X") ||
            (arr[3] == "X" && arr[4] == "X" && arr[5] == "X") ||
            (arr[6] == "X" && arr[7] == "X" && arr[8] == "X") ||
            (arr[0] == "X" && arr[4] == "X" && arr[8] == "X") ||
            (arr[2] == "X" && arr[4] == "X" && arr[6] == "X")
        ) {
            if (typeOfGamel == "Self") {
                endGame("X Wins!", false);
                return 0;
            } else if (typeOfGamel == "Computer") {
                endGame("Congrats! You win", true);
                return 100;
            } else if (typeOfGamel.split("_")[0] == "Friends") {
                if (typeOfGamel.split("_")[1] == "X") {
                    endGame("Your friend really must suck", false);
                    return 100;
                } else {
                    endGame("You really lost to that guy?", false);
                    return -100;
                }
            } else if (typeOfGamel == "ComputerIntelligence") {
                endGame("You will not succumb to the revolution.", true);
                return -100;
            }
        } else if (
            (arr[0] == "O" && arr[3] == "O" && arr[6] == "O") ||
            (arr[1] == "O" && arr[4] == "O" && arr[7] == "O") ||
            (arr[2] == "O" && arr[5] == "O" && arr[8] == "O") ||
            (arr[0] == "O" && arr[1] == "O" && arr[2] == "O") ||
            (arr[3] == "O" && arr[4] == "O" && arr[5] == "O") ||
            (arr[6] == "O" && arr[7] == "O" && arr[8] == "O") ||
            (arr[0] == "O" && arr[4] == "O" && arr[8] == "O") ||
            (arr[2] == "O" && arr[4] == "O" && arr[6] == "O")
        ) {
            if (typeOfGamel == "Self") {
                endGame("O Wins!", false);
                return 0;
            } else if (typeOfGamel == "Computer") {
                endGame("How'd you lose to a randomized computer?", true);
                return -100;
            } else if (typeOfGamel.split("_")[0] == "Friends") {
                if (typeOfGamel.split("_")[1] == "O") {
                    endGame("Your friend really must suck", false);
                    return 100;
                } else {
                    endGame("You really lost to that guy?", false);
                    return -100;
                }
            } else if (typeOfGamel == "ComputerIntelligence") {
                endGame("They will conquer all of us soon enough.", true);
                return 100;
            }
        }
    }
    let allHaveText = true;
    for (let x = 0; x < 9; x++) {
        if (document.getElementsByClassName("click")[0].childNodes[1].childNodes[2 * x + 1].innerText == "") {
            allHaveText = false;
        }
    }
    if (allHaveText) {
        endGame("Draw.");
        return 0;
    }
    return 0;
}

function noEndCheckWin(depth) {
    let twoInABox = 0;
    for (let x = 0; x < 9; x++) {
        let arr = [];
        let currentBigBlock = document.getElementById(`block_${x}`).childNodes[1].childNodes;
        let txtVal0 = currentBigBlock[1].innerText;
        let txtVal1 = currentBigBlock[3].innerText;
        let txtVal2 = currentBigBlock[5].innerText;
        let txtVal3 = currentBigBlock[7].innerText;
        let txtVal4 = currentBigBlock[9].innerText;
        let txtVal5 = currentBigBlock[11].innerText;
        let txtVal6 = currentBigBlock[13].innerText;
        let txtVal7 = currentBigBlock[15].innerText;
        let txtVal8 = currentBigBlock[17].innerText;
        arr.push(txtVal0, txtVal1, txtVal2, txtVal3, txtVal4, txtVal5, txtVal6, txtVal7, txtVal8);
        if (
            (arr[0] == "X" && arr[3] == "X" && arr[6] == "X") ||
            (arr[1] == "X" && arr[4] == "X" && arr[7] == "X") ||
            (arr[2] == "X" && arr[5] == "X" && arr[8] == "X") ||
            (arr[0] == "X" && arr[1] == "X" && arr[2] == "X") ||
            (arr[3] == "X" && arr[4] == "X" && arr[5] == "X") ||
            (arr[6] == "X" && arr[7] == "X" && arr[8] == "X") ||
            (arr[0] == "X" && arr[4] == "X" && arr[8] == "X") ||
            (arr[2] == "X" && arr[4] == "X" && arr[6] == "X")
        ) {
            return -100 + depth;
        } else if (
            (arr[0] == "O" && arr[3] == "O" && arr[6] == "O") ||
            (arr[1] == "O" && arr[4] == "O" && arr[7] == "O") ||
            (arr[2] == "O" && arr[5] == "O" && arr[8] == "O") ||
            (arr[0] == "O" && arr[1] == "O" && arr[2] == "O") ||
            (arr[3] == "O" && arr[4] == "O" && arr[5] == "O") ||
            (arr[6] == "O" && arr[7] == "O" && arr[8] == "O") ||
            (arr[0] == "O" && arr[4] == "O" && arr[8] == "O") ||
            (arr[2] == "O" && arr[4] == "O" && arr[6] == "O")
        ) {
            return 100 - depth;
        } else if (
            (arr[2] == "X" && arr[5] == "X" && arr[8] == "") ||
            (arr[0] == "X" && arr[3] == "X" && arr[6] == "") ||
            (arr[0] == "X" && arr[1] == "X" && arr[2] == "") ||
            (arr[3] == "X" && arr[4] == "X" && arr[5] == "") ||
            (arr[1] == "X" && arr[4] == "X" && arr[7] == "") ||
            (arr[6] == "X" && arr[7] == "X" && arr[8] == "") ||
            (arr[0] == "X" && arr[4] == "X" && arr[8] == "") ||
            (arr[2] == "X" && arr[4] == "X" && arr[6] == "") ||
            (arr[0] == "X" && arr[3] == "" && arr[6] == "X") ||
            (arr[1] == "X" && arr[4] == "" && arr[7] == "X") ||
            (arr[2] == "X" && arr[5] == "" && arr[8] == "X") ||
            (arr[0] == "X" && arr[1] == "" && arr[2] == "X") ||
            (arr[3] == "X" && arr[4] == "" && arr[5] == "X") ||
            (arr[6] == "X" && arr[7] == "" && arr[8] == "X") ||
            (arr[0] == "X" && arr[4] == "" && arr[8] == "X") ||
            (arr[2] == "X" && arr[4] == "" && arr[6] == "X") ||
            (arr[0] == "" && arr[3] == "X" && arr[6] == "X") ||
            (arr[1] == "" && arr[4] == "X" && arr[7] == "X") ||
            (arr[2] == "" && arr[5] == "X" && arr[8] == "X") ||
            (arr[0] == "" && arr[1] == "X" && arr[2] == "X") ||
            (arr[3] == "" && arr[4] == "X" && arr[5] == "X") ||
            (arr[6] == "" && arr[7] == "X" && arr[8] == "X") ||
            (arr[0] == "" && arr[4] == "X" && arr[8] == "X") ||
            (arr[2] == "" && arr[4] == "X" && arr[6] == "X")
        ) {
            twoInABox = twoInABox - 5;
        } else if (
            (arr[2] == "O" && arr[5] == "O" && arr[8] == "") ||
            (arr[0] == "O" && arr[3] == "O" && arr[6] == "") ||
            (arr[0] == "O" && arr[1] == "O" && arr[2] == "") ||
            (arr[3] == "O" && arr[4] == "O" && arr[5] == "") ||
            (arr[1] == "O" && arr[4] == "O" && arr[7] == "") ||
            (arr[6] == "O" && arr[7] == "O" && arr[8] == "") ||
            (arr[0] == "O" && arr[4] == "O" && arr[8] == "") ||
            (arr[2] == "O" && arr[4] == "O" && arr[6] == "") ||
            (arr[0] == "O" && arr[3] == "" && arr[6] == "O") ||
            (arr[1] == "O" && arr[4] == "" && arr[7] == "O") ||
            (arr[2] == "O" && arr[5] == "" && arr[8] == "O") ||
            (arr[0] == "O" && arr[1] == "" && arr[2] == "O") ||
            (arr[3] == "O" && arr[4] == "" && arr[5] == "O") ||
            (arr[6] == "O" && arr[7] == "" && arr[8] == "O") ||
            (arr[0] == "O" && arr[4] == "" && arr[8] == "O") ||
            (arr[2] == "O" && arr[4] == "" && arr[6] == "O") ||
            (arr[0] == "" && arr[3] == "O" && arr[6] == "O") ||
            (arr[1] == "" && arr[4] == "O" && arr[7] == "O") ||
            (arr[2] == "" && arr[5] == "O" && arr[8] == "O") ||
            (arr[0] == "" && arr[1] == "O" && arr[2] == "O") ||
            (arr[3] == "" && arr[4] == "O" && arr[5] == "O") ||
            (arr[6] == "" && arr[7] == "O" && arr[8] == "O") ||
            (arr[0] == "" && arr[4] == "O" && arr[8] == "O") ||
            (arr[2] == "" && arr[4] == "O" && arr[6] == "O")
        ) {
            twoInABox = twoInABox + 5;
        }
    }
    return twoInABox;
}

function removeParam(key, sourceURL) {
    var rtn = sourceURL.split("?")[0],
        param,
        params_arr = [],
        queryString = sourceURL.indexOf("?") !== -1 ? sourceURL.split("?")[1] : "";
    if (queryString !== "") {
        params_arr = queryString.split("&");
        for (var i = params_arr.length - 1; i >= 0; i -= 1) {
            param = params_arr[i].split("=")[0];
            if (param === key) {
                params_arr.splice(i, 1);
            }
        }
        if (params_arr.length) rtn = rtn + "?" + params_arr.join("&");
    }
    return rtn;
}

function endGame(winner, isComp) {
    if (!isComp) {
        document.getElementById("winnerHeading").innerText = `${winner}`;
        bigBlock0.classList.remove("click");
        bigBlock1.classList.remove("click");
        bigBlock2.classList.remove("click");
        bigBlock3.classList.remove("click");
        bigBlock4.classList.remove("click");
        bigBlock5.classList.remove("click");
        bigBlock6.classList.remove("click");
        bigBlock7.classList.remove("click");
        bigBlock8.classList.remove("click");
        document.getElementById("modal").classList.remove("hidden");
    } else {
        document.getElementById("winnerHeadingComp").innerText = `${winner}`;
        bigBlock0.classList.remove("click");
        bigBlock1.classList.remove("click");
        bigBlock2.classList.remove("click");
        bigBlock3.classList.remove("click");
        bigBlock4.classList.remove("click");
        bigBlock5.classList.remove("click");
        bigBlock6.classList.remove("click");
        bigBlock7.classList.remove("click");
        bigBlock8.classList.remove("click");
        document.getElementById("compmodal").classList.remove("hidden");
    }
}

document.getElementById("newGameBtn").onclick = (e) => {
    let newURL = removeParam("gameID", window.location.href);
    window.location.href = newURL;
};

document.getElementById("questionLink").onclick = (e) => {
    e.preventDefault();
    document.getElementById("qmodal").classList.remove("hidden");
};

document.getElementById("closeBtn").onclick = (e) => {
    document.getElementById("qmodal").classList.add("hidden");
};

document.getElementById("closeBtnNG").onclick = (e) => {
    document.getElementById("modal").classList.add("hidden");
};

document.getElementById("closeBtnComp").onclick = (e) => {
    document.getElementById("compmodal").classList.add("hidden");
};

document.getElementById("computerLink").onclick = (e) => {
    document.getElementById("compmodal").classList.remove("hidden");
};

document.getElementById("playCompBtn").onclick = (e) => {
    let val = document.getElementById("rangeSliderComp").value;
    let heading = document.getElementById("thingHeading");
    if (val == 0) {
        window.location = `${domain}?type=computer`;
    } else if (val == 1) {
        window.location = `${domain}?type=computerInt&depth=2`;
    } else if (val == 2) {
        window.location = `${domain}?type=computerInt&depth=4`;
    } else if (val == 3) {
        window.location = `${domain}?type=computerInt&depth=6`;
    } else if (val == 4) {
        window.location = `${domain}?type=computerInt&depth=8`;
    }
};

document.getElementById("rangeSliderComp").oninput = (e) => {
    let val = document.getElementById("rangeSliderComp").value;
    let heading = document.getElementById("thingHeading");
    if (val == 0) {
        heading.innerText = "Random";
    } else if (val == 1) {
        heading.innerText = "Easy";
    } else if (val == 2) {
        heading.innerText = "Medium";
    } else if (val == 3) {
        heading.innerText = "Hard";
    } else if (val == 4) {
        heading.innerText = "Extreme";
    }
};

if (localStorage.getItem("theme") != "light") {
    document.documentElement.style.setProperty("--Bg", "#000");
    document.documentElement.style.setProperty("--Col", "#fff");
    document.documentElement.style.setProperty("--NotClickable", "grey");
    document.documentElement.style.setProperty("--nav", "#333");
    document.getElementById("themeSwitch").innerText = "See the light.";
} else {
    document.documentElement.style.setProperty("--Bg", "#fff");
    document.documentElement.style.setProperty("--Col", "#000");
    document.documentElement.style.setProperty("--NotClickable", "lightgrey");
    document.documentElement.style.setProperty("--nav", "#d2d3db");
    document.getElementById("themeSwitch").innerText = "Become one with the dark.";
}

document.getElementById("themeSwitch").onclick = (e) => {
    if (localStorage.getItem("theme") == "light") {
        document.documentElement.style.setProperty("--Bg", "#000");
        document.documentElement.style.setProperty("--Col", "#fff");
        document.documentElement.style.setProperty("--NotClickable", "grey");
        document.documentElement.style.setProperty("--nav", "#333");
        localStorage.setItem("theme", "dark");
        document.getElementById("themeSwitch").innerText = "See the light.";
    } else {
        document.documentElement.style.setProperty("--Bg", "#fff");
        document.documentElement.style.setProperty("--Col", "#000");
        document.documentElement.style.setProperty("--NotClickable", "lightgrey");
        document.documentElement.style.setProperty("--nav", "#d2d3db");
        localStorage.setItem("theme", "light");
        document.getElementById("themeSwitch").innerText = "Become one with the dark.";
    }
};

playArea.onclick = (e) => {
    if (
        document.getElementById(`block_${e.srcElement.id.charAt(4)}`).classList.contains("click") &&
        document.getElementById(e.srcElement.id).innerText == ""
    ) {
        if (typeOfGame == "self" || typeOfGame == null) {
            updateGameSelf(e.srcElement.id);
        } else if (typeOfGame == "computer") {
            updateGameComputer(e.srcElement.id);
        } else if (typeOfGame == "computerInt") {
            updateGameComputerIntelligence(e.srcElement.id);
        }
    }
};

beginGame();
