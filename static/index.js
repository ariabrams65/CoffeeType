'use strict'

main();

function main() {
    let textData = {
        text: [],
        firstVisibleWordIndex: 0,
        nextNonvisibleWordIndex: 0,
        curWordIndex: 0,
        correctWords: 0,
        incorrectWords: 0,
        testStarted: false,
        indexesOfLastWords : []
    }
    distributeTextData(textData);
    assignEventListeners();
}


function assignEventListeners() {
    let elements = getAllInteractiveElements();

    elements.wordset.addEventListener('change', changeText);
    elements.punctuation.addEventListener('change', changeText);
    elements.numbers.addEventListener('change', changeText);
    elements.reloadButton.addEventListener('click', changeText);
    elements.window.addEventListener('resize', reloadText);
    elements.window.addEventListener('DOMContentLoaded', changeText);
    elements.textInput.addEventListener('input', textInputHandler);
    elements.duration.addEventListener('change', function(event) {
        document.getElementById('timer').innerHTML = event.currentTarget.value;
    })
}


function textInputHandler(event) {
    let textData = event.currentTarget.textData;
    if (!textData.testStarted) {
        textData.testStarted = true;
        startTest(textData);
    }
    let input = event.currentTarget.value; 
    if (input === ' ') {
        event.currentTarget.value = '';
        return;
    }
    if (input[input.length - 1] === ' ') {
        if (textData.indexesOfLastWords.includes(textData.curWordIndex)) {
            textData.firstVisibleWordIndex = textData.curWordIndex + 1;
        }
        let bool = isWordCorrect(input.trimEnd(), textData, true);
        bool ? ++textData.correctWords : ++textData.incorrectWords;
        colorWord(textData, bool);
        ++textData.curWordIndex;
        event.currentTarget.value = '';
    } else { 
        colorWord(textData, isWordCorrect(input, textData));
    }
    reloadText(event);
}


function isWordCorrect(word, textData, mustMatch=false) {
    let correctWord = textData.text[textData.curWordIndex].word;
    if (mustMatch) {
        return word === correctWord;
    }
    return correctWord.slice(0, word.length) === word;
}


function colorWord(textData, colorGreen) {
    textData.text[textData.curWordIndex].color =
        colorGreen ? 'green' : 'red';
}


function startTest(textData) {
    let timer = document.getElementById('timer');
    let time = parseFloat(timer.innerHTML);

    let intervalId = setInterval(function() {
        --time;
        if (time === 0) {
            clearInterval(intervalId);
            endTest(textData);
        }
        timer.innerHTML = time;
    }, 1000);
}


function endTest(textData) {
    console.log('end');
}


function distributeTextData(textData) {
    let elements = getAllInteractiveElements();
    for (const element in elements) {
        elements[element].textData = textData;
    }
}


function getAllInteractiveElements() {
    let elements = getTextModifyingElements();
    elements.reloadButton = document.getElementById('reload-button');
    elements.window = window;
    elements.textInput = document.getElementById('text-input');
    elements.duration = document.getElementById('duration');

    return elements;
}


async function changeText(event) {
    let ct = event.currentTarget;
    let words = (await requestText()).split(' ');
    ct.textData.text = [];
    for (let word of words) {
        ct.textData.text.push({word: word, color: 'black'});
    }
    reloadText({currentTarget: ct});
}


function reloadText(event) {
    let line1 = document.getElementById('line1');
    let line2 = document.getElementById('line2');
    let line3 = document.getElementById('line3');
    [line1.innerHTML, line2.innerHTML, line3.innerHTML] =
        getLines(event.currentTarget.textData, 3);
}


function getLines(textData, numLines) {
    let lines = [];
    let index = textData.firstVisibleWordIndex;
    let text = textData.text;
    textData.indexesOfLastWords = [];
    for (let i = 0; i < numLines; ++i) {
        let wordLine = "";
        let line = "";      
        for (; stringFits(wordLine + text[index].word + ' '); ++index) {
            wordLine += text[index].word + ' ';
            line += getColoredWordAsStr(text[index].word, text[index].color) + ' ';
        }
        textData.indexesOfLastWords.push(index - 1);
        lines.push(line);
    }
    textData.nextNonvisibleWordIndex = index;
    return lines;
}


function getColoredWordAsStr(word, color) {
    return `<span style="color:${color}">${word}</span>`;
}


function stringFits(str) {
   return getVisualLength(str) < document.getElementById('text-box').clientWidth;
}


function getVisualLength(str) {
    let fontEl = document.querySelector('.text p');
    let style = window.getComputedStyle(fontEl, null);
    let font = style.getPropertyValue('font-family');
    let fontSize = style.getPropertyValue('font-size');

    const canvas = getVisualLength.canvas || (getVisualLength.canvas = document.createElement("canvas"));
    const context = canvas.getContext("2d");
    context.font = `${fontSize} ${font}`;
    const metrics = context.measureText(str);
    return metrics.width;
}


async function requestText() {
    const elements = getTextModifyingElements();
    let response = await fetch(window.location.href + 'generate-text', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'wordset': elements.wordset.value,
            'punctuation': elements.punctuation.checked,
            'numbers': elements.numbers.checked
        })
    })
    let text = await response.json();
    return text["text"];
}


function getTextModifyingElements() {
    return {
        'wordset': document.getElementById('wordset'),
        'punctuation': document.getElementById('punctuation'),
        'numbers': document.getElementById('numbers')
    };
}