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
    return `Melding probleem automatische omzetting van ${this.getConversionText()} in concept ${
      this.args.conceptName
    } (${this.args.conceptProductId})%0D
%0D
Probleem in veld(en) (kruis aan):%0D
[ ] Beschrijving%0D
[ ] Aanvullende beschrijving%0D
[ ] Uitzonderingen%0D
[ ] Voorwaarde%0D
[ ] Bewijsstuk%0D
[ ] Procedure%0D
[ ] Beschrijving website procedure%0D
[ ] Beschrijving website%0D
[ ] Kost%0D
[ ] Financieel voordeel%0D
[ ] Regelgeving%0D
[ ] Alle bovenstaande velden%0D
[ ] Ander veld:%0D
%0D
Beschrijving van het probleem (vul aan):%0D
%0D`;
  }

  getConversionText() {
    return this.isGeneratedFormalVersion ? 'je naar u' : 'u naar je';
  }
}
