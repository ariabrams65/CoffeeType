import random

def generateText(json, length):
    wordset = _getTruncatedWordset(json['wordset'], json['numWords'])
    finalWordList = []
    for _ in range(length):
        finalWordList.append(_generateWord(wordset, json['numbers'], json['specialCharacters']))

    if (json['punctuation']):
        _punctuateList(finalWordList)

    return ' '.join(finalWordList)


def _getTruncatedWordset(wordset, numWords):
    wordList = []
    with open('text_generation/' + wordset + '_words.txt') as words:
        for index, word in enumerate(words):
            if (index == numWords):
                break
            wordList.append(word.strip())

    return wordList


def _generateWord(wordset, numbers=False, specialChars=False):
    words = [random.choice(wordset), _generateNumber(), _generateSpecialCharWord()]     
    return random.choices(words, weights=getWeights(numbers, specialChars), k=1)[0]


def getWeights(numbers, specialChars):
    if (numbers and specialChars):
        return [.6, .2, .2]
    if (numbers):
        return [.8, .2, 0]
    if (specialChars):
        return [.8, 0, .2]
    
    return [1, 0, 0]


def _generateNumber():
    return ''.join(random.choices('1234567890', k=random.randint(1, 6)))


def _generateSpecialCharWord():
    return ''.join(random.choices('~`!@#$%^&*_-+=[{]}\\|<>/', k=random.randint(1, 4)))


def _punctuateList(wordList):
    wordList[0] = wordList[0].capitalize()
    i = 1
    while (i < len(wordList)):
        if (random.choices([True, False], weights=[3, 7], k=1)[0]):
            if (_punctuateWord(wordList, i) == _endSentence):
                i += 1 
        i += 1 


def _punctuateWord(wordList, index):
    func = random.choice([_surroundWord, _endWord, _endSentence])
    print(index)
    func(wordList, index)
    return func

def _surroundWord(wordList, index):
    punc = random.choice(['()', '""', '\'\''])
    wordList[index] = punc[0] + wordList[index] + punc[1]

def _endWord(wordList, index):
    punc = random.choice([':', ';', ','])
    wordList[index] = wordList[index] + punc

def _endSentence(wordList, index):
    punc = random.choice(['.', '!', '?'])
    wordList[index] = wordList[index] + punc
    if (index + 1 < len(wordList)):
        wordList[index + 1] = wordList[index + 1].capitalize()

