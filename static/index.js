'use strict'

main();

function main() {
    let textData = new TextData();
    distributeTextData(textData);
    assignEventListeners();
}

function TextData() {
    this.startTime;
    this.testStarted = false;
    this.text = [];
    this.firstVisibleWordIndex = 0;
    this.nextNonvisibleWordIndex = 0;
    this.line1Index;
    this.line2Index;
    this.line3Index;
    this.curWordIndex = 0;
    this.correctChars = 0;
    this.charsTyped = 0;
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
    addMultipleEvents(elements.window, ['resize', 'DOMContentLoaded'], [resizeText, changeText]);
    elements.wordset.addEventListener('change', resetTest);
    elements.duration.addEventListener('change', resetTest)
    addMultipleEvents(elements.quotes, ['click', 'click', 'click'], [toggleButton, unpressTextModifyingButtons, resetTest]);
    addMultipleEvents(elements.punctuation, ['click', 'click', 'click'], [toggleButton, unpressQuotes, resetTest]);
    addMultipleEvents(elements.numbers, ['click', 'click', 'click'], [toggleButton, unpressQuotes, resetTest]);
    addMultipleEvents(elements.specialCharacters, ['click', 'click', 'click'], [toggleButton, unpressQuotes, resetTest]);
    elements.textInput.addEventListener('input', textInputHandler);
    elements.reloadButton.addEventListener('click', resetTest);
}

function addMultipleEvents(element, events, handlers) {
    for (let i = 0; i < events.length; ++i) {
        element.addEventListener(events[i], handlers[i]);
    }
}

function unpressQuotes() {
    document.getElementById('quotes').classList.remove('color3');
}

function unpressTextModifyingButtons() {
    document.getElementById('punctuation').classList.remove('color3');
    document.getElementById('numbers').classList.remove('color3');
    document.getElementById('special-characters').classList.remove('color3');
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
    let input = event.currentTarget.value; 
    if (input === ' ') {
        event.currentTarget.value = '';
        return;
    }
    let textData = event.currentTarget.textData;
    if (!textData.testStarted) {
        startTest(textData);
    }
    if ((input[input.length - 1] === ' ') ||
    (textData.curWordIndex === textData.text.length - 1 && isWordCorrect(input, textData, true))) {
        incrementWord(textData, input);
        event.currentTarget.value = '';
    } else {
        if (!isWordCorrect(input, textData)) {
            colorWord(textData, textData.incorrectColor);

        } else {
            colorWord(textData, textData.correctColor);
        }
    }
    resizeText(event);
}

function incrementWord(textData, input) {
    if (lastWordIndices(textData).includes(textData.curWordIndex)) {
        textData.firstVisibleWordIndex = textData.curWordIndex + 1;
    }
    let trimmedInput = input.trimEnd();
    textData.charsTyped += trimmedInput.length + 1;
    if (!isWordCorrect(trimmedInput , textData, true)) {
        colorWord(textData, textData.incorrectColor);
    } else {
        textData.correctChars += trimmedInput.length + 1 
    }
    if (textData.curWordIndex === textData.text.length - 1) {
        endTest(textData);
    } else {
        ++textData.curWordIndex;
    }
}


function lastWordIndices(textData) {
    return [textData.line2Index-1, textData.line3Index-1, textData.nextNonvisibleWordIndex -1];
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
    textData.startTime = new Date();
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
    let wmp = ((textData.correctChars / 5) / elapsedTime(textData)) * 60;
    wmp = Math.round(wmp);
    let acc = Math.round((textData.correctChars / textData.charsTyped) * 100);
    let results = document.querySelector('#results p');
    results.innerHTML = `wmp: ${wmp}    accuracy: ${acc}%`;
    resetTest({currentTarget: {textData: textData}});
    
}

function elapsedTime(textData) {
    return (new Date() - textData.startTime) / 1000;
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
    resizeText({currentTarget: ct});
}


function resizeText(event) {
    let textData = event.currentTarget.textData;
    calculateLines(textData);
    redisplayText(textData);
}


function redisplayText(textData) {
    line1.innerHTML = getHTMLLine(textData.line1Index, textData.line2Index, textData);
    line2.innerHTML = getHTMLLine(textData.line2Index, textData.line3Index, textData);
    line3.innerHTML = getHTMLLine(textData.line3Index, textData.nextNonvisibleWordIndex, textData);
}


function calculateLines(textData) {
    let text = textData.text;
    textData.line1Index = textData.firstVisibleWordIndex;
    textData.line2Index = calculateNextLineIndex(textData.line1Index, text);
    textData.line3Index = calculateNextLineIndex(textData.line2Index, text);
    textData.nextNonvisibleWordIndex =
        calculateNextLineIndex(textData.line3Index, text);
}


function calculateNextLineIndex(index, text) {
    let line = '';
    for (; index < text.length && stringFits(line + text[index].word + ' '); ++index) {
        line += text[index].word + ' ';
    }
    return index;
}


function getHTMLLine(startIndex, endIndex, textData) {
    let HTMLLine = '';
    for (; startIndex < endIndex; ++startIndex) {
        HTMLLine += getColoredWordAsHTML(textData, startIndex) + ' ';
    }
    return HTMLLine;
}


function getColoredWordAsHTML(textData, wordIndex) {
    let word = textData.text[wordIndex];
    if (textData.curWordIndex === wordIndex) {
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
            'quote': elements.quotes.classList.contains('color3') 
        })
    })
    let text = await response.json();
    return text["text"];
}


function getTextModifyingElements() {
    return {
        'wordset': document.getElementById('wordset'),
        'quotes': document.getElementById('quotes'),
        'punctuation': document.getElementById('punctuation'),
        'numbers': document.getElementById('numbers'),
        'specialCharacters' : document.getElementById('special-characters')
    };
}