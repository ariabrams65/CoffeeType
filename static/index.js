'use strict'

main();

function main() {
    let textData = {
        text: [],
        firstVisibleWordIndex: 0,
        nextNonvisibleWordIndex: 0,
        curWordIndex: 0,
        correctWords: 0,
        incorrectWords: 0
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
    elements.window.addEventListener('resize', resizeTextToFit);
    elements.window.addEventListener('DOMContentLoaded', changeText);
    elements.textInput.addEventListener('input', textInputHandler);
}

/**
 * 
 * @param {Object} textData data that gets distributed to all interactive elements 
 */
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

    return elements;
}

function textInputHandler(event) {
    
}

async function changeText(event) {
    let ct = event.currentTarget;
    ct.textData.text = (await requestText()).split(' ');
    resizeTextToFit({currentTarget: ct});
}

function resizeTextToFit(event) {
    let line1 = document.getElementById('line1');
    let line2 = document.getElementById('line2');
    let line3 = document.getElementById('line3');
    [line1.innerHTML, line2.innerHTML, line3.innerHTML] =
        getLines(event.currentTarget.textData, 3);
}

function getLines(textData, numLines) {
    let lines = [];
    let index = textData.firstVisibleWordIndex;
    for (let i = 0; i < numLines; ++i) {
        let line = "";      
        for (; stringFits(line + textData.text[index] + ' '); ++index) {
            line += textData.text[index] + ' ';
        }
        lines.push(line);
    }
    textData.nextNonvisibleWordIndex = index;
    return lines;
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