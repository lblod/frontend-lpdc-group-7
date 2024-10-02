import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task, timeout } from 'ember-concurrency';

export default class AiSearchController extends Controller {
  @tracked searchTerm = '';
  @tracked answer = '';
  @tracked sources = [];
  @tracked isLoading = false;

  mockJSON= {
    "answer": "Om voedsel te verkopen op een losse standplaats op de openbare markt in Mechelen moet je aan de onderstaande voorwaarden voldoen. Je hebt een machtiging tot het uitoefenen van ambulante activiteiten als werkgever (de zogenaamde leurkaart). Die machtiging wordt afgeleverd door een erkend ondernemingsloket en is geldig in heel België voor de duur van de activiteit. Uitzondering: voor occasionele verkopen met niet-commercieel karakter is geen machtiging vereist. Je hebt een registratie, erkenning of toelating van het Federaal Agentschap voor de Veiligheid van de Voedselketen (FAVV).",
    "sources": [
      {
        "product_name": "voorlopig rijbewijs",
        "location": "Mechelen",
        "url": "https://www.vlaanderen.be/"
      },
      {
        "product_name": "voorlopig rijbewijs",
        "location": "Aalat",
        "url": "https://www.vlaanderen.be/"
      }
    ]
  }
  

  @action
  updateSearchTerm(event) {
    this.searchTerm = event.target.value;
  }

  @task({ drop: true })
  *performSearch() {
    this.isLoading = true;
    console.log(this.isLoading)
    this.answer = '';
    this.sources = [];

    try {
      // Simulating a delay for better UX, you can remove the timeout in production
      yield timeout(500); // Optional: simulating a delay for better UX

      const response = yield this.getAnswerJSON(this.searchTerm);

      if (response) {
        this.answer = response.answer;
        this.sources = response.sources;
      } else {
        this.answer = 'Sorry, we kunnen momenteel uw vraag niet beantwoorden.';
      }
    } catch (error) {
      this.answer = 'Sorry, er liep iets fout bij het zoeken.';
      console.error('Error fetching the AI response:', error);
    } finally {
      this.isLoading = false; 
    }
  }

  getLinks() {
    const mockLinks = ['Marktvoorwaarde Mechelen', 'test link'];
    this.links = mockLinks;
  }

  getAnswerJSON(question) {
    const url = 'ai-search/question';
    const payload = {
      question: question.trim(),
      result_limit: 7,
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
    })
    .catch(error => {
      console.error('Error fetching the AI response:', error);
    });;
  }
}
