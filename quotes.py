import requests

def getQuote(minLength, maxLength):
    api_url = 'https://api.quotable.io'
    response = requests.get(f'{api_url}/random?minLength={minLength}&maxLength={maxLength}')
    return response.json()['content']