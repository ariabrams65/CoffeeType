'use strict'

assignEventListeners();

function assignEventListeners() {
    let elements = getTextModifyingElements();

    elements.wordset.addEventListener('change', requestText);
    elements.punctuation.addEventListener('change', requestText);
    elements.numbers.addEventListener('change', requestText);
    document.getElementById('reload-button')
        .addEventListener('mouseup', requestText);
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
    let result = await response.json();
}

function getTextModifyingElements() {
    return {
        'wordset': document.getElementById('wordset'),
        'punctuation': document.getElementById('punctuation'),
        'numbers': document.getElementById('numbers')
    };
}