import { auditChecklist, auditHistory, planFamilyDeadlines, reviewChanges } from './immigration-workspace.js';

const definitions = [
  { id: 'checklist', title: 'Application checklist audit', description: 'Copy the requirements from your actual program checklist, then flag missing documents, translation work and expiry conflicts.',
    fields: [['submissionDate', 'Planned submission', 'date']],
    rows: [['name', 'Document name', 'text'], ['status', 'Document status', ['missing', 'ready', 'translation', 'review']], ['expiry', 'Expiry date (optional)', 'date', true]],
    list: 'documents', run: auditChecklist,
    example: { submissionDate: '2027-02-01', documents: [{ name: 'Example travel document', status: 'ready', expiry: '2027-01-15' }, { name: 'Example employment letter', status: 'translation', expiry: '' }] } },
  { id: 'history', title: 'History gap & overlap checker', description: 'Check a personal, address or work history before copying it into a form. Use a separate check for each type of history.',
    fields: [['startDate', 'History window start', 'date'], ['endDate', 'History window end', 'date']],
    rows: [['label', 'Activity or address label', 'text'], ['start', 'Start date', 'date'], ['end', 'End date', 'date']],
    list: 'periods', run: auditHistory,
    example: { startDate: '2026-01-01', endDate: '2026-03-31', periods: [{ label: 'Example study period', start: '2026-01-01', end: '2026-01-31' }, { label: 'Example work period', start: '2026-02-10', end: '2026-03-31' }] } },
  { id: 'family-plan', title: 'Family deadline planner', description: 'Work backwards from deadlines you received. Compare preparation dates and flag tasks due on the same day across family members.',
    fields: [['asOf', 'Planning date', 'date']],
    rows: [['person', 'Person (use a nickname)', 'text'], ['task', 'Task', 'text'], ['deadline', 'Deadline from your instructions', 'date'], ['preparationDays', 'Estimated preparation days', 'number']],
    list: 'tasks', run: planFamilyDeadlines,
    example: { asOf: '2026-11-01', tasks: [{ person: 'Applicant A', task: 'Collect letter', deadline: '2026-11-20', preparationDays: 25 }, { person: 'Applicant B', task: 'Review translation', deadline: '2026-11-20', preparationDays: 10 }] } },
  { id: 'change-review', title: 'Application change review', description: 'Compare earlier and current details to create a review list for an application already in progress. Use brief descriptions, not document numbers.',
    fields: [], rows: [['field', 'Change category', ['address', 'passport', 'family', 'employment', 'travel', 'status']], ['previous', 'Previous detail', 'text'], ['current', 'Current detail', 'text']],
    list: 'changes', run: reviewChanges,
    example: { changes: [{ field: 'address', previous: 'Old mailing address', current: 'New mailing address' }] } }
];
function node(tag, text, className) {
  const el = document.createElement(tag);
  if (text !== undefined) el.textContent = text;
  if (className) el.className = className;
  return el;
}
function field([name, label, kind, optional], prefix) {
  const wrapper = node('label', label), input = node(Array.isArray(kind) ? 'select' : 'input');
  input.name = name;
  input.id = `${prefix}-${name}`;
  if (Array.isArray(kind)) for (const value of kind) { const option = node('option', value); option.value = value; input.append(option); }
  else input.type = kind;
  if (kind === 'text') input.maxLength = 200;
  if (kind === 'number') { input.min = '0'; input.max = '3650'; input.step = '1'; }
  input.required = !optional;
  wrapper.append(input);
  return wrapper;
}
export function mountImmigrationWorkspace(root) {
  if (!root || root.dataset.mounted) return;
  root.dataset.mounted = 'true';
  for (const def of definitions) {
    const card = node('article', undefined, 'case-card'); card.id = def.id;
    card.append(node('h2', def.title), node('p', def.description));
    const form = node('form'), globals = node('div', undefined, 'case-fields'), entries = node('div'), output = node('div', undefined, 'case-output');
    output.setAttribute('role', 'status'); output.setAttribute('aria-live', 'polite');
    for (const spec of def.fields) globals.append(field(spec, def.id));
    let serial = 0;
    function addRow(values = {}) {
      if (entries.children.length >= 100) { output.textContent = 'Maximum 100 entries.'; return; }
      const row = node('fieldset', undefined, 'case-row');
      row.append(node('legend', `Entry ${++serial}`));
      for (const spec of def.rows) {
        const wrapper = field(spec, `${def.id}-${serial}`);
        if (values[spec[0]] !== undefined) wrapper.lastElementChild.value = values[spec[0]];
        row.append(wrapper);
      }
      const remove = node('button', 'Remove entry'); remove.type = 'button';
      remove.addEventListener('click', () => { row.remove(); output.replaceChildren(); });
      row.append(remove); entries.append(row);
    }
    const actions = node('div', undefined, 'case-actions');
    const add = node('button', 'Add entry'), demo = node('button', 'Load example'), reset = node('button', 'Clear'), submit = node('button', 'Run check', 'primary');
    for (const button of [add, demo, reset]) button.type = 'button';
    submit.type = 'submit';
    add.addEventListener('click', () => { addRow(); output.replaceChildren(); });
    demo.addEventListener('click', () => {
      for (const input of globals.querySelectorAll('input,select')) input.value = def.example[input.name] ?? '';
      entries.replaceChildren(); def.example[def.list].forEach(addRow); output.replaceChildren();
    });
    reset.addEventListener('click', () => { form.reset(); entries.replaceChildren(); addRow(); output.replaceChildren(); });
    form.addEventListener('input', () => output.replaceChildren());
    form.addEventListener('change', () => output.replaceChildren());
    form.addEventListener('submit', event => {
      event.preventDefault(); output.replaceChildren();
      const values = area => Object.fromEntries([...area.querySelectorAll('input,select')].map(input => [input.name, input.value]));
      try {
        const report = def.run({ ...values(globals), [def.list]: [...entries.children].map(values) });
        output.append(node('h3', report.title), node('p', report.summary));
        const list = node('ul'); for (const item of report.items) list.append(node('li', item)); output.append(list);
        const source = node('a', 'Check official IRCC instructions'); source.href = report.source; source.target = '_blank'; source.rel = 'noopener noreferrer'; output.append(source);
        const save = node('button', 'Download review'); save.type = 'button';
        save.addEventListener('click', () => {
          const content = `${report.title}\n\n${report.summary}\n\n${report.items.map(i => '- ' + i).join('\n')}\n\n${report.source}\n`;
          const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
          const anchor = node('a'); anchor.href = url; anchor.download = `northstar-${def.id}-review.txt`; anchor.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        });
        output.append(save);
      } catch (error) { output.append(node('p', error.message, 'case-error')); }
    });
    actions.append(add, demo, reset, submit); form.append(globals, entries, actions); card.append(form, output); root.append(card); addRow();
  }
}
