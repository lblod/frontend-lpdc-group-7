import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class AiSearchController extends Controller {
  @tracked searchTerm = '';
  @tracked answer = '';
  @tracked links = [];


  @action
  updateSearchTerm(event) {
    this.searchTerm = event.target.value;
  }

  @action
  performSearch() {
    this.getAiAnswer();
    this.getLinks();
  }

  getAiAnswer() {
    const mockAnswer = 'Om voedsel te verkopen op een losse standplaats op de openbare markt in Mechelen moet je aan de onderstaande voorwaarden voldoen. Je hebt een machtiging tot het uitoefenen van ambulante activiteiten als werkgever (de zogenaamde leurkaart). Die machtiging wordt afgeleverd door een erkend ondernemingsloket en is geldig in heel België voor de duur van de activiteit. Uitzondering: voor occasionele verkopen met niet-commercieel karakter is geen machtiging vereist. Je hebt een registratie, erkenning of toelating van het Federaal Agentschap voor de Veiligheid van de Voedselketen (FAVV) .'
    this.answer = mockAnswer;
  }

  getLinks() {
    const mockLinks = ['Marktvoorwaarde Mechelen', 'test link']
    this.links = mockLinks;
  }
}
