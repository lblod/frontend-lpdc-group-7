import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class AiSearchController extends Controller {
  @tracked searchTerm = '';
  @tracked answer = '';
  @tracked sources = [];

  @action
  updateSearchTerm(event) {
    this.searchTerm = event.target.value;
  }

  @action
  performSearch() {
    this.getAiresponse();
  }

  getAiresponse() {
    const mockAnswer =
      'Om voedsel te verkopen op een losse standplaats op de openbare markt in Mechelen moet je aan de onderstaande voorwaarden voldoen. Je hebt een machtiging tot het uitoefenen van ambulante activiteiten als werkgever (de zogenaamde leurkaart). Die machtiging wordt afgeleverd door een erkend ondernemingsloket en is geldig in heel België voor de duur van de activiteit. Uitzondering: voor occasionele verkopen met niet-commercieel karakter is geen machtiging vereist. Je hebt een registratie, erkenning of toelating van het Federaal Agentschap voor de Veiligheid van de Voedselketen (FAVV) .';
    this.answer = mockAnswer;
    const response = this.getAnswerJSON(this.searchTerm);

    this.answer = response.answer;
    this.sources = response.sources;
  }

  getLinks() {
    const mockLinks = ['Marktvoorwaarde Mechelen', 'test link'];
    this.links = mockLinks;
  }

  getAnswerJSON(question) {
    const url = 'ai-search/question';
    const payload = {
      question: question.trim(),
    };

    console.log('POST request to:', url, 'with payload:', payload);

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }).then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      return response.json();
    });
  }
}
