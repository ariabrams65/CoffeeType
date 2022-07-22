    //start test

    //if input == space
        //do nothing
    //letter/backsapce typed
        //correct word
            //colorWord(correct color)
        //incorrect word
            //colorWord(incorrect color)

    //space typed
        //incrementWord()

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
    } else {
        if (!isWordCorrect(input, textData)) {
            colorWord(textData, textData.incorrectColor);

        } else {
            colorWord(textData, textData.correctColor);
        }
    } 
}

//++charstyped
//word is correct
    ///++correctChars
//word is incorrect
    //colorWord(incorrect color)
//last word
    //endTest()



//resetTest(event)
//changeText(event) - requests new text, reloadText
//resizeText(event) - recalculates the html of each line

//redisplayText

