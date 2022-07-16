'use strict'

let typingText = {
    text: [],
    firstVisibleWordIndex: 0,
    lastVisibleWordIndex: 0
};
assignEventListeners();
changeText();

function assignEventListeners() {
    let elements = getTextModifyingElements();

    elements.wordset.addEventListener('change', changeText);
    elements.punctuation.addEventListener('change', changeText);
    elements.numbers.addEventListener('change', changeText);
    document.getElementById('reload-button')
        .addEventListener('mouseup', changeText);
    window.addEventListener('resize', resizeTextToFit)
}

async function changeText()
{
    typingText.text = (await requestText()).split(' ');
    resizeTextToFit();
}

function resizeTextToFit() {
    let line1 = document.getElementById('line1');
    let line2 = document.getElementById('line2');
    let line3 = document.getElementById('line3');

    [line1.innerHTML, line2.innerHTML, line3.innerHTML] = getLines(3);
}

function getLines(numLines) {
    let lines = [];
    let index = typingText.lastVisibleWordIndex;
    for (let i = 0; i < numLines; ++i) {
        let line = "";      
        for (; stringFits(line + typingText.text[index] + ' '); ++index) {
            line += typingText.text[index] + ' ';
        }
        lines.push(line);
    }
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