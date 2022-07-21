'use strict'

main();

function main() {
    let textData = new TextData();
    distributeTextData(textData);
    assignEventListeners();
}

function TextData() {
    this.text = [];
    this.firstVisibleWordIndex = 0;
    this.nextNonvisibleWordIndex = 0;
    this.curWordIndex = 0;
    this.correctChars = 0;
    this.charsTyped = 0;
    this.testStarted = false;
    this.indexesOfLastWords = [];
    this.correctColor = getCorrectColor();
    this.incorrectColor = getIncorrectColor();
    this.reset = () => {
        for (let prop in this) {
            if (prop != 'reset') {
                this[prop] = 0;
            }
        }
        this.correctColor = getCorrectColor();
        this.incorrectColor = getIncorrectColor();
    }
}

function getCorrectColor() {
    return getComputedStyle(document.querySelector('.color1')).color;
}

function getIncorrectColor() {
    return getComputedStyle(document.querySelector('.color3')).backgroundColor;
}


function assignEventListeners() {
    let elements = getAllInteractiveElements();

    elements.numbers.addEventListener('click', toggleButton);
    elements.punctuation.addEventListener('click', toggleButton);
    elements.specialCharacters.addEventListener('click', toggleButton);

    elements.wordset.addEventListener('change', resetTest);
    elements.punctuation.addEventListener('click', resetTest);
    elements.numbers.addEventListener('click', resetTest);
    elements.specialCharacters.addEventListener('click', resetTest);
    elements.reloadButton.addEventListener('click', resetTest);
    elements.window.addEventListener('resize', reloadText);
    elements.window.addEventListener('DOMContentLoaded', changeText);
    elements.textInput.addEventListener('input', textInputHandler);
    elements.duration.addEventListener('change', resetTest)
}


function toggleButton(event) {
    event.currentTarget.classList.toggle('color3');
}


function resetTest(event) {
    clearInterval(event.currentTarget.textData.intervalId);
    event.currentTarget.textData.reset();
    document.getElementById('timer').innerHTML = document.getElementById('duration').value;
    changeText(event);
    let textInput = document.getElementById('text-input');
    textInput.value = '';
    textInput.focus();
}


function textInputHandler(event) {
    let textData = event.currentTarget.textData;
    if (!textData.testStarted) {
        startTest(textData);
    }
    let input = event.currentTarget.value; 
    if (input === ' ') {
        event.currentTarget.value = '';
        return;
    }
    if (input[input.length - 1] === ' ') {
        incrementWord(textData, input);
        event.currentTarget.value = '';
    } else if (input === '') { 
        textData.text[textData.curWordIndex].color = textData.correctColor;
    } else {
        if (!isWordCorrect(input, textData)) {
            colorWord(textData, textData.incorrectColor);

        } else {
            colorWord(textData, textData.correctColor);
        }
    }
    reloadText(event);
}

function incrementWord(textData, input) {
    if (textData.indexesOfLastWords.includes(textData.curWordIndex)) {
        textData.firstVisibleWordIndex = textData.curWordIndex + 1;
    }
    let trimmedInput = input.trimEnd();
    textData.charsTyped += trimmedInput.length + 1;
    let correct = isWordCorrect(trimmedInput , textData, true);
    if (!isWordCorrect(trimmedInput , textData, true)) {
        colorWord(textData, textData.incorrectColor);
    } else {
        textData.correctChars += trimmedInput.length + 1 
    }
    
    textData.text[textData.curWordIndex].current = false;
    ++textData.curWordIndex;
    textData.text[textData.curWordIndex].current = true;
}


function isWordCorrect(word, textData, mustMatch=false) {
    let correctWord = textData.text[textData.curWordIndex].word;
    if (mustMatch) {
        return word === correctWord;
    }
    return correctWord.slice(0, word.length) === word;
}


function colorWord(textData, color) {
    textData.text[textData.curWordIndex].color = color;
}


function startTest(textData) {
    textData.testStarted = true;
    let timer = document.getElementById('timer');
    let time = parseFloat(document.getElementById('duration').value);

    textData.intervalId = setInterval(function() {
        --time;
        if (time === 0) {
            clearInterval(textData.intervalId);
            endTest(textData);
        } else {
            timer.innerHTML = time;
        }
    }, 1000);
}


function endTest(textData) {
    let wmp = ((textData.correctChars / 5) / document.getElementById('duration').value) * 60;
    wmp = Math.round(wmp);
    console.log(textData.correctChars, textData.charsTyped);
    let acc = Math.round((textData.correctChars / textData.charsTyped) * 100);
    let results = document.querySelector('#results p');
    results.innerHTML = `wmp: ${wmp}    accuracy: ${acc}%`;
    resetTest({currentTarget: {textData: textData}});
    
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
        ct.textData.text.push({word: word, color: ct.textData.correctColor});
    }
    ct.textData.text[0].current = true;
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
        let wordLine = '';
        let line = '';      
        for (; stringFits(wordLine + text[index].word + ' '); ++index) {
            wordLine += text[index].word + ' ';
            line += getColoredWordAsStr(text[index]) + ' ';
        }
        textData.indexesOfLastWords.push(index - 1);
        lines.push(line);
    }
    textData.nextNonvisibleWordIndex = index;
    return lines;
}
/*
function getLines(textData, numLines) {
    let lines = [];
    let index = textData.firstVisibleWordIndex;
    let text = textData.text;
    textData.indexesOfLastWords = [];
    for (let i = 0; i < numLines; ++i) {
        let wordLine = '';
        let line = '';      
        while (true) {
            let toAdd = text[index] ? text[index].word : '';
            if (!stringFits(wordLine + toAdd + ' ')) {
                break;
            }
            wordLine += toAdd + ' ';
            if (toAdd) {
                line += getColoredWordAsStr(text[index]) + ' ';
            } else {
                line += ' ';
            }
            ++index;
        }
        textData.indexesOfLastWords.push(index - 1);
        lines.push(line);
    }
    textData.nextNonvisibleWordIndex = index;
    return lines;
}
*/


function getColoredWordAsStr(word) {
    if (word.current) {
        //return `<span style="color:${word.color}; text-decoration:underline">${word.word}</span>`;

        return `<span style="color:${word.color}" class='highlight'>${word.word}</span>`;
        
    }
    return `<span style="color:${word.color}">${word.word}</span>`;
}


function stringFits(str) {
   return getVisualLength(str) < document.getElementById('text-box').clientWidth;
}


function getVisualLength(str) {
    let fontEl = document.querySelector('#text-box p');
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
            'numWords': Number(elements.wordset.value),
            'wordset': elements.wordset.options[elements.wordset.selectedIndex].dataset.wordset,
            'punctuation': elements.punctuation.classList.contains('color3'),
            'numbers': elements.numbers.classList.contains('color3'),
            'specialCharacters' : elements.specialCharacters.classList.contains('color3'),
            'quote': false 
        })
    })
    let text = await response.json();
    return text["text"];
}


function getTextModifyingElements() {
    return {
        'wordset': document.getElementById('wordset'),
        'punctuation': document.getElementById('punctuation'),
        'numbers': document.getElementById('numbers'),
        'specialCharacters' : document.getElementById('special-characters')
    };
}