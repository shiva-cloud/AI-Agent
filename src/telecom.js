import { boundedText } from './text-input.js';

export const telecomSubjects = ['mobile', 'internet', 'complaint'];

export function telecomContext(question) {
  const safeQuestion = boundedText(question, '', 1000);
  const priceRequest = /\bcheapest\b|\bprices?\b|\bpricing\b|\bcosts?\b|\bhow much\b|\bdeals?\b/iu.test(safeQuestion);
  const complaint = /\bcomplain(?:t|ts)?\b|\bdisputes?\b|\bccts\b|\bcooling[- ]off\b|\bcancellation\b|\bcancel\b/iu.test(safeQuestion);
  const rights = /\brights?\b|\bcode\b|\bcontracts?\b|\bunlock(?:ed|ing)?\b|\bdevices?\b|\bnewcomers?\b|\bimmigrants?\b|\bsettlement\b/iu.test(safeQuestion);
  const explicitComplaint = /\bcomplain(?:t|ts)?\b|\bccts\b/iu.test(safeQuestion);
  const subjects = [];
  if (complaint) subjects.push('complaint');
  if ((!priceRequest && !explicitComplaint) || rights || /\btelecom\b/iu.test(safeQuestion)) {
    if (/\binternet\b|\bbroadband\b|\bwi[ -]?fi\b|\bfiber\b|\bfibre\b|\btelecom(?:munication)?s?\b/iu.test(safeQuestion)) subjects.push('internet');
    if (/\bsim\b|\bmobile\b|\bcell[ -]?phone\b|\bwireless\b|\bphone plans?\b|\btelecom(?:munication)?s?\b|\bphones?\b|\bdevices?\b|\bhandsets?\b|\be[- ]?sim\b/iu.test(safeQuestion)) subjects.push('mobile');
  }
  return { subjects, priceRequest };
}
