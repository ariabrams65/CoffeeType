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
    this.curWordIndex = 0;
    this.correctChars = 0;
    this.charsTyped = 0;
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
    addMultipleEvents(elements.window, ['resize', 'DOMContentLoaded'], [resizeText, changeText]);
    elements.wordset.addEventListener('change', resetTest);
    elements.duration.addEventListener('change', resetTest)
    addMultipleEvents(elements.quotes, ['click', 'click', 'click'], [toggleButton, unpressTextModifyingButtons, resetTest]);
    addMultipleEvents(elements.punctuation, ['click', 'click', 'click'], [toggleButton, resetTest, unpressQuotes]);
    addMultipleEvents(elements.numbers, ['click', 'click', 'click'], [toggleButton, resetTest, unpressQuotes]);
    addMultipleEvents(elements.specialCharacters, ['click', 'click', 'click'], [toggleButton, resetTest, unpressQuotes]);
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
    let textData = event.currentTarget.textData;
    if (!textData.testStarted) {
        startTest(textData);
    }
    let input = event.currentTarget.value; 
    if (input === ' ') {
        event.currentTarget.value = '';
        return;
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
    if (textData.indexesOfLastWords.includes(textData.curWordIndex)) {
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
    let line1 = document.getElementById('line1');
    let line2 = document.getElementById('line2');
    let line3 = document.getElementById('line3');
    [line1.innerHTML, line2.innerHTML, line3.innerHTML] =
        getLines(event.currentTarget.textData, 3);
}


function getLines(textData, numLines) {
    let lines = [];
    let index = textData.firstVisibleWordIndex;
    textData.indexesOfLastWords = [];
    for (let i = 0; i < numLines; ++i) {
        let line = getLine(textData, index);
        index += line.length;
        lines.push(line.join(' '));
    }
    textData.nextNonvisibleWordIndex = index;
    return lines;
}


function getLine(textData, index) {
    let line = '';
    let HTMLLine = [];
    let text = textData.text;
    for (; index < text.length && stringFits(line + text[index].word + ' '); ++index) {
        line += text[index].word + ' ';
        HTMLLine.push(getColoredWordAsHTML(textData, index));
    }
    textData.indexesOfLastWords.push(index - 1);
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