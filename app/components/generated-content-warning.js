import Component from '@glimmer/component';

export default class GeneratedContentWarning extends Component {
  get isGeneratedFormalVersion() {
    return this.args.languageVersion.includes('generated-formal');
  }

  get isGeneratedInformalVersion() {
    return this.args.languageVersion.includes('generated-informal');
  }

  get mailToContent() {
    const destination = 'loketlokaalbestuur@vlaanderen.be';
    const subject =
      'LPDC/IPDC - Melding i.v.m. automatische omzetting in concept';
    const body = this.emailBody;
    return `mailto:${destination}?subject=${subject}&body=${body}`;
  }

  get emailBody() {
    return `
    * Melding probleem automatische omzetting van ${this.getConversionText()} in concept ${
      this.args.conceptName
    } (${this.args.conceptProductId}) %0D%0A
    %0D%0A
    * Probleem in veld(en) (kruis aan): %0D%0A
      [ ] Beschrijving %0D%0A
      [ ] Aanvullende beschrijving %0D%0A
      [ ] Uitzonderingen %0D%0A
      [ ] Voorwaarde %0D%0A
      [ ] Bewijsstuk %0D%0A
      [ ] Procedure %0D%0A
      [ ] Beschrijving website procedure %0D%0A
      [ ] Beschrijving website %0D%0A
      [ ] Kost %0D%0A
      [ ] Financieel voordeel %0D%0A
      [ ] Regelgeving %0D%0A
      [ ] Alle bovenstaande velden %0D%0A
      [ ] Ander veld: %0D%0A
    %0D%0A
    * Beschrijving van het probleem (vul aan): %0D%0A
    %0D%0A
    `;
  }

  getConversionText() {
    return this.isGeneratedFormalVersion ? 'je naar u' : 'u naar je';
  }
}
