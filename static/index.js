'use strict'

let testData = new TestData();
assignEventListeners();

function TestData() {
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
}

function getCorrectColor() {
    return getComputedStyle(document.querySelector('.text-color')).color;
}

function getIncorrectColor() {
    return getComputedStyle(document.querySelector('.incorrect-color')).color;
}

function assignEventListeners() {
    let elements = getAllInteractiveElements();
    addMultipleEvents(elements.window, ['resize', 'DOMContentLoaded', 'DOMContentLoaded'], [resizeText, changeText, () => {
        document.getElementById('text-input').focus();
    }]);
    elements.wordset.addEventListener('change', resetTest);
    elements.duration.addEventListener('click', durationPressed);
    addMultipleEvents(elements.quotes, ['click', 'click', 'click'], [toggleButton, unpressTextModifyingButtons, resetTest]);
    addMultipleEvents(elements.punctuation, ['click', 'click', 'click'], [toggleButton, unpressQuotes, resetTest]);
    addMultipleEvents(elements.numbers, ['click', 'click', 'click'], [toggleButton, unpressQuotes, resetTest]);
    addMultipleEvents(elements.specialCharacters, ['click', 'click', 'click',], [toggleButton, unpressQuotes, resetTest]);
    elements.textInput.addEventListener('input', textInputHandler);
    elements.reloadButton.addEventListener('click', resetTest);
    elements.themes.addEventListener('click', changeTheme);
}

function changeTheme(event) {
    if (event.target.value === undefined) {
        return;
    }
    let newTheme = event.target.value;
    let style = window.getComputedStyle(event.target, null);
    let themeBgColor = style.getPropertyValue('background-color');
    let themeColor = style.getPropertyValue('color');
    let themeButton = document.getElementById('cur-theme-btn');
    themeButton.innerHTML = newTheme;
    themeButton.value = newTheme;
    themeButton.style.backgroundColor = themeBgColor;
    themeButton.style.color = themeColor;
    changeThemeHref(newTheme.split(' ').join(''));
}

function changeThemeHref(newTheme) {
    let theme = document.getElementById('theme');
    let href = theme.href;
    let themeIndex = href.lastIndexOf('/') + 1;
    let link = document.createElement('link');
    link.id = 'theme';
    link.rel = 'stylesheet';
    link.href = href.slice(0, themeIndex) + newTheme + '.css';
    document.head.appendChild(link);
    link.onload = () => {
        theme.remove();
        redisplayText()
    }
}

function addMultipleEvents(element, events, handlers) {
    for (let i = 0; i < events.length; ++i) {
        element.addEventListener(events[i], handlers[i]);
    }
}

function durationPressed(event) {
    let durButtons= event.currentTarget.querySelectorAll('.dur-btn');
    for (let durButton of durButtons) {
        if (durButton !== event.target) {
            durButton.classList.remove('color3');
        }
    }
    event.target.classList.add('color3');
    if (!testData.testStarted) {
        document.getElementById('timer').innerHTML = event.target.value;
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
    let button = event.currentTarget;
    button.classList.toggle('color3');
    if (button.classList.contains('not-timed') && buttonPressed(button)) {
        hideTimer();
    } else {
        showTimer();
    }
}

function hideTimer() {   
    document.getElementById('timer').style.display = 'none';
}

function showTimer() {
    document.getElementById('timer').style.display = 'block';
}

function buttonPressed(button) {
    return button.classList.contains('color3');
}

function getDuration() {
    return document.querySelector('#dur-btn-group .color3').value;
}

function resetTest() {
    clearInterval(testData.intervalId);
    testData = new TestData();
    document.getElementById('timer').innerHTML = getDuration(); 
    changeText();
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
    if (!testData.testStarted) {
        startTest(!buttonPressed(document.getElementById('quotes')));
    }
    if ((input[input.length - 1] === ' ') ||
    (testData.curWordIndex === testData.text.length - 1 && isWordCorrect(input, true))) {
        incrementWord(input);
        event.currentTarget.value = '';
    } else {
        if (!isWordCorrect(input)) {
            testData.text[testData.curWordIndex].correct = false;
        } else {
            testData.text[testData.curWordIndex].correct = true;
        }
    }
    redisplayText();
}

function incrementWord(input) {
    if (lastWordIndices().includes(testData.curWordIndex)) {
        testData.firstVisibleWordIndex = testData.curWordIndex + 1;
        calculateLines();
    }
    let trimmedInput = input.trimEnd();
    testData.charsTyped += trimmedInput.length + 1;
    if (!isWordCorrect(trimmedInput, true)) {
        testData.text[testData.curWordIndex].correct = false;
    } else {
        testData.correctChars += trimmedInput.length + 1 
    }
    if (testData.curWordIndex === testData.text.length - 1) {
        endTest();
    } else {
        ++testData.curWordIndex;
    }
}

function lastWordIndices() {
    return [testData.line2Index-1, testData.line3Index-1, testData.nextNonvisibleWordIndex -1];
}

function isWordCorrect(word, mustMatch=false) {
    let correctWord = testData.text[testData.curWordIndex].word;
    if (mustMatch) {
        return word === correctWord;
    }
    return correctWord.slice(0, word.length) === word;
}

function startTest(timed) {
    testData.testStarted = true;
    testData.startTime = new Date();
    if (!timed) {
        return;
    }
    let timer = document.getElementById('timer');
    let time = parseFloat(getDuration());
    testData.intervalId = setInterval(function() {
        --time;
        if (time === 0) {
            clearInterval(testData.intervalId);
            endTest();
        } else {
            timer.innerHTML = time;
        }
    }, 1000);
}

function endTest() {
    let wpm = ((testData.correctChars / 5) / elapsedTime()) * 60;
    wpm = Math.round(wpm);
    let acc = Math.round((testData.correctChars / testData.charsTyped) * 100);
    let results = document.querySelector('#results p');
    results.innerHTML = `wpm: ${wpm}    accuracy: ${acc}%`;
    resetTest();
    document.getElementById('text-input').blur();
}

function elapsedTime() {
    return (new Date() - testData.startTime) / 1000;
}

function getAllInteractiveElements() {
    let elements = getTextModifyingElements();
    elements.reloadButton = document.getElementById('reload-button');
    elements.window = window;
    elements.textInput = document.getElementById('text-input');
    elements.duration = document.getElementById('dur-btn-group');
    elements.themes = document.getElementById('theme-dropup');

    return elements;
}

async function changeText() {
    let words = (await requestText()).split(' ');
    testData.text = [];
    for (let word of words) {
        testData.text.push({word: word, correct: true});
    }
    resizeText();
}

function resizeText() {
    calculateLines();
    redisplayText();
}

function redisplayText() {
    line1.innerHTML = getHTMLLine(testData.line1Index, testData.line2Index);
    line2.innerHTML = getHTMLLine(testData.line2Index, testData.line3Index);
    line3.innerHTML = getHTMLLine(testData.line3Index, testData.nextNonvisibleWordIndex);
}

function calculateLines() {
    testData.line1Index = testData.firstVisibleWordIndex;
    testData.line2Index = calculateNextLineIndex(testData.line1Index);
    testData.line3Index = calculateNextLineIndex(testData.line2Index);
    testData.nextNonvisibleWordIndex =
        calculateNextLineIndex(testData.line3Index);
}

function calculateNextLineIndex(index) {
    let text = testData.text;
    let line = '';
    for (; index < text.length && stringFits(line + text[index].word + ' '); ++index) {
        line += text[index].word + ' ';
    }
    return index;
}

function getHTMLLine(startIndex, endIndex) {
    let HTMLLine = '';
    for (; startIndex < endIndex; ++startIndex) {
        HTMLLine += getColoredWordAsHTML(startIndex) + ' ';
    }
    return HTMLLine;
}

function getColoredWordAsHTML(wordIndex) {
    let word = testData.text[wordIndex];
    let color = word.correct ? getCorrectColor() : getIncorrectColor();
    if (testData.curWordIndex === wordIndex) {
        return `<span style="color:${color}" class='highlight'>${word.word}</span>`;
    }
    return `<span style="color:${color}">${word.word}</span>`;
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
            'punctuation': buttonPressed(elements.punctuation),
            'numbers': buttonPressed(elements.numbers),
            'specialCharacters' : buttonPressed(elements.specialCharacters),
            'quote': buttonPressed(elements.quotes)
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