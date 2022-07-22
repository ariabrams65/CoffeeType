import random
from quotes import getQuote

def generateText(json, length):
    if (json['quote']):
        return getQuote(150, 500)

    wordset = _getTruncatedWordset(json['wordset'], json['numWords'])
    finalWordList = [_generateWord(wordset, json['numbers'], json['specialCharacters']) for _ in range(length)]
    if (json['punctuation']):
        _punctuateList(finalWordList)

    return ' '.join(finalWordList)


def _getTruncatedWordset(wordset, numWords):
    with open('text_generation/' + wordset + '_words.txt') as words:
        return [word.strip() for i, word in enumerate(words) if i < numWords]


def _generateWord(wordset, numbers=False, specialChars=False):
    words = [random.choice(wordset), _generateNumber(), _generateSpecialCharWord()]     
    return random.choices(words, weights=_getWeights(numbers, specialChars), k=1)[0]


def _getWeights(numbers, specialChars):
    numWeight = 2 if numbers else 0
    charWeight = 2 if specialChars else 0
    return [10 - (numWeight + charWeight), numWeight, charWeight]


def _generateNumber():
    return ''.join(random.choices('1234567890', k=random.randint(1, 6)))


def _generateSpecialCharWord():
    return ''.join(random.choices('~`!@#$%^&*_-+=[{]}\\|<>/', k=random.randint(1, 4)))


def _punctuateList(wordList):
    wordList[0] = wordList[0].capitalize()
    for i in range(1, len(wordList), 2):
        if (random.choice([True, False])):
            random.choice([_surroundWord, _endWord, _endSentence])(wordList, i)


def _surroundWord(wordList, index):
    punc = random.choice(['()', '""', '\'\''])
    wordList[index] = punc[0] + wordList[index] + punc[1]


def _endWord(wordList, index):
    punc = random.choice([':', ';', ','])
    wordList[index] = wordList[index] + punc


def _endSentence(wordList, index):
    punc = random.choices(['.', '!', '?'] ,weights=[3, 1, 1])[0]
    wordList[index] = wordList[index] + punc
    if (index + 1 < len(wordList)):
        wordList[index + 1] = wordList[index + 1].capitalize()