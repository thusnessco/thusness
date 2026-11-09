import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const compiled = process.env.LOJONG_COMPILED_DIR;
if (!compiled) throw new Error('Run with scripts/test-lojong.sh');
const { default: engine } = await import(pathToFileURL(path.join(compiled, 'engine.js')).href);
const { default: curriculum } = await import(pathToFileURL(path.join(compiled, 'curriculum.js')).href);
const { default: questionData } = await import(pathToFileURL(path.join(compiled, 'questions.js')).href);
const { concepts, points, slogans, verses } = curriculum;
const { diagnosticIds, questions, questionById } = questionData;
const { default: storage } = await import(pathToFileURL(path.join(compiled, 'storage.js')).href);
const { default: practice } = await import(pathToFileURL(path.join(compiled, 'practice.js')).href);
const now = Date.now();

function answerCurrent(p, confidence = 'knew') {
  const q = questionById[p.session.ids.at(-1)];
  const answered = engine.respond(p, q.answer, false, now);
  return engine.setConfidence(answered, confidence, now);
}

test('curriculum references are complete and numbering stays edition-specific', () => {
  assert.equal(points.length, 7);
  assert.equal(verses.length, 8);
  assert.equal(slogans.length, 61);
  assert.equal(slogans[60].text, 'Do not expect applause.');
  assert.equal(new Set(questions.map(q => q.id)).size, questions.length);
  for (const q of questions) {
    assert.ok(concepts.some(c => c.id === q.concept), q.id);
    assert.ok(q.answer.every(id => q.options.some(o => o.id === id)), q.id);
    assert.ok(engine.isCorrect(q, q.answer), q.id);
  }
  for (const concept of concepts) assert.ok(questions.filter(q => q.concept === concept.id).length >= 2, concept.id);
});

test('a correct answer waits for confidence before creating learning evidence', () => {
  const p = engine.beginSession(engine.emptyProgress());
  const q = questionById[p.session.ids[0]];
  const waiting = engine.respond(p, q.answer, false, now);
  assert.equal(waiting.attempts.length, 0);
  assert.deepEqual(engine.advance(waiting), waiting);
  assert.ok(engine.parseProgress(JSON.parse(JSON.stringify(waiting))));
});

test('guessed correctness remains uncertain and never implies recall', () => {
  const p = answerCurrent(engine.beginSession(engine.emptyProgress()), 'guessed');
  assert.equal(engine.learningState(p, 'purpose', 'recognition', now).status, 'uncertain');
  assert.equal(engine.learningState(p, 'purpose', 'recall', now).status, 'unexplored');
  assert.equal(engine.learningState(p, 'purpose', 'application', now).status, 'unexplored');
  assert.equal(engine.learningState(p, 'purpose', 'recognition', now).due, true);
});

test('not sure records missing knowledge, teaches, and permits continuation', () => {
  const p = engine.respond(engine.beginSession(engine.emptyProgress()), [], true, now);
  assert.equal(p.attempts[0].confidence, 'unsure');
  assert.equal(p.attempts[0].correct, false);
  assert.equal(engine.learningState(p, 'purpose', 'recognition', now).status, 'revisit');
  assert.equal(engine.advance(p, now).session.ids.length, 2);
});

test('multiple select rejects extra, missing, and duplicate answers', () => {
  const q = questionById['multi-guardrails'];
  assert.equal(engine.isCorrect(q, ['weak', 'badge', 'reward']), true);
  assert.equal(engine.isCorrect(q, ['weak', 'badge']), false);
  assert.equal(engine.isCorrect(q, ['weak', 'badge', 'reward', 'joy']), false);
  assert.equal(engine.isCorrect(q, ['badge', 'badge', 'reward']), false);
});

test('ordering and matching require correct sequence', () => {
  for (const id of ['order-points', 'match-567', 'antidote-order']) {
    const q = questionById[id];
    assert.equal(engine.isCorrect(q, q.options.map(o => o.id)), false);
    assert.equal(engine.isCorrect(q, q.answer), true);
    assert.equal(engine.isCorrect(q, [...q.answer].reverse()), false);
  }
});

test('a diagnostic completes once and starts adaptive review next', () => {
  let p = engine.beginSession(engine.emptyProgress());
  for (let i = 0; i < engine.SESSION_LENGTH; i++) {
    assert.equal(p.session.ids.at(-1), diagnosticIds[i]);
    p = engine.advance(answerCurrent(p), now);
  }
  assert.equal(p.session.finished, true);
  assert.equal(p.completedSessions, 1);
  assert.equal(p.attempts.length, 6);
  assert.deepEqual(engine.advance(p), p);
  assert.equal(engine.beginSession(p).session.mode, 'review');
});

test('duplicate submission and confidence clicks do not duplicate evidence', () => {
  const p = answerCurrent(engine.beginSession(engine.emptyProgress()));
  assert.equal(engine.setConfidence(p, 'knew', now).attempts.length, 1);
  assert.equal(engine.respond(p, [], true, now).attempts.length, 1);
});

test('confident learning is scheduled later and lapses reset it', () => {
  const p = answerCurrent(engine.beginSession(engine.emptyProgress()));
  assert.equal(engine.learningState(p, 'purpose', 'recognition', now).due, false);
  assert.equal(engine.learningState(p, 'purpose', 'recognition', now + 86_400_001).due, true);
  const longer = { ...p, attempts: [...p.attempts, { ...p.attempts[0], at: now + 86_400_001 }] };
  assert.equal(engine.learningState(longer, 'purpose', 'recognition', now + 86_400_001).dueAt, now + 4 * 86_400_000 + 1);
  const lapse = { ...longer, attempts: [...longer.attempts, { ...p.attempts[0], correct: false, at: now + 86_400_002 }] };
  assert.equal(engine.learningState(lapse, 'purpose', 'recognition', now + 86_400_002).streak, 0);
  assert.equal(engine.learningState(lapse, 'purpose', 'recognition', now + 86_400_002).due, true);
});

test('adaptive selection targets weak concepts with a different question', () => {
  const p = {
    ...engine.emptyProgress(), completedSessions: 1,
    attempts: [{ questionId: 'commit-a', concept: 'point-6', skill: 'recognition', correct: false, confidence: 'unsure', at: now }],
  };
  const next = engine.chooseNext(p, [], now);
  assert.equal(questionById[next].concept, 'point-6');
  assert.notEqual(next, 'commit-a');
  assert.notEqual(engine.chooseNext(p, [next], now), next);
  assert.notEqual(questionById[engine.chooseNext(p, [next], now)].concept, 'point-6');
});

test('valid session export roundtrips and malformed files are rejected', () => {
  const p = answerCurrent(engine.beginSession(engine.emptyProgress()));
  assert.deepEqual(engine.parseProgress(JSON.parse(JSON.stringify(p))), p);
  for (const bad of [null, {}, { ...p, version: 2 }, { ...p, session: { ...p.session, ids: ['unknown'] } }, { ...p, session: { ...p.session, ids: ['toString'] } }, { ...p, completedSessions: -1 }, { ...p, attempts: [{ ...p.attempts[0], concept: 'wrong' }] }]) {
    assert.equal(engine.parseProgress(bad), null);
  }
});

test('browser persistence survives reloads, and storage failure keeps a working session in memory', () => {
  const values = new Map();
  globalThis.window = {
    localStorage: { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) },
  };
  try {
    const first = storage.createProgressStore();
    const p = answerCurrent(engine.beginSession(first.getSnapshot()), 'guessed');
    first.update(p);
    assert.deepEqual(storage.createProgressStore().getSnapshot(), p);
    window.localStorage.setItem = () => { throw new Error('Quota exceeded'); };
    const next = engine.advance(p);
    first.update(next);
    assert.deepEqual(first.getSnapshot(), next);
    assert.match(first.getMessage(), /only in memory/);
    values.set(storage.STORAGE_KEY, '{broken');
    assert.deepEqual(storage.createProgressStore().getSnapshot(), engine.emptyProgress());
  } finally { delete globalThis.window; }
});

test('practice suggestions distinguish expectations, retaliation, and grasping', () => {
  const reward = practice.suggestedRoots(['resentment'], ['appreciation']);
  assert.ok(reward.includes(29) && reward.includes(61));
  assert.ok(!reward.includes(31));
  assert.ok(!reward.includes(2));
  const wisdom = practice.suggestedRoots(['grasping'], []);
  assert.ok([2, 3, 4].every(id => wisdom.includes(id)));
  const uncertain = practice.suggestedRoots(['unsure'], []);
  assert.ok(uncertain.includes(57));
  assert.ok(!uncertain.includes(31));
});

test('practice review preserves the user account and does not assume the antidote worked', () => {
  const r = { ...practice.emptyReflection(), event: 'He wanted to stay longer.', interpretation: 'I felt unappreciated.', states: ['resentment'], motives: ['appreciation'], roots: [29, 61], method: 'expectation', outcome: 'unchanged' };
  const summary = practice.reflectionSummary(r);
  assert.ok(summary.includes(r.event) && summary.includes(r.interpretation));
  assert.match(summary, /No clear change/);
  assert.match(summary, /effect is not established/);
  assert.match(summary, /does not establish a diagnosis, a broken commitment/);
});

test('practice references resolve and the single-means approach includes bodhicitta', () => {
  for (const note of practice.rootNotes) assert.ok(slogans.some(s => s.number === note.number));
  const compassion = practice.methods.find(m => m.id === 'compassion');
  assert.match(compassion.steps.join(' '), /bodhicitta/);
  assert.match(compassion.source, /adapted practice outline/);
  const p2 = points.find(p => p.id === 'point-2');
  assert.equal(p2.sections.length, 2);
  assert.match(p2.sections[0].title, /Conventional/);
  assert.match(p2.sections[1].title, /Ultimate/);
});

test('each selectable practice supplies its own instructions to the review', () => {
  const ids = ['equality', 'tonglen', 'compassion', 'patience', 'investigate', 'kindness', 'generosity', 'emptiness', 'expectation'];
  assert.equal(new Set(practice.methods.map(m => m.id)).size, practice.methods.length);
  for (const id of ids) {
    const method = practice.methods.find(m => m.id === id);
    assert.ok(method?.steps.length && method.source, id);
    const summary = practice.reflectionSummary({ ...practice.emptyReflection(), method: id, outcome: 'unsure' });
    assert.ok(summary.includes(method.title) && summary.includes(method.steps[0]), id);
    assert.match(summary, /Not sure yet/);
  }
});


test('recognized states lead to direct, available practices without duplicate choices', () => {
  for (const state of practice.observations) {
    const suggestions = practice.suggestedAntidotes([state.id]);
    assert.ok(suggestions.length, state.id);
    for (const suggestion of suggestions) assert.ok(practice.methods.some(method => method.id === suggestion.method));
  }
  assert.equal(practice.suggestedAntidotes(['envy'])[0].method, 'rejoicing');
  assert.equal(practice.suggestedAntidotes(['withholding'])[0].method, 'generosity');
  assert.equal(practice.suggestedAntidotes(['grasping'])[0].method, 'investigate');
  assert.equal(practice.suggestedAntidotes(['pride', 'selfcherishing']).length, 1);
});


test('every practical outline has explicit connections to existing course instructions', () => {
  for (const method of practice.methods) {
    const connection = practice.practiceConnections[method.id];
    assert.ok(connection?.context, method.id);
    assert.ok(connection.instructions.length, method.id);
    for (const number of connection.instructions) assert.ok(slogans.some(s => s.number === number), method.id);
  }
  assert.equal(practice.suggestedAntidotes(['attachment'])[0].method, 'investigate');
});


test('slideshow keeps the complete instruction numbered 11–12 together', () => {
  const slides = curriculum.sloganStudySlides;
  const joined = slides.find(s => s.number === 11);
  assert.equal(joined.displayNumber, '11–12');
  assert.ok(joined.text.includes(slogans[10].text));
  assert.ok(joined.text.includes(slogans[11].text));
  assert.deepEqual(slides.flatMap(s => s.sourceNumbers), slogans.map(s => s.number));
  assert.equal(slides.length, 60);
  assert.equal(slogans.length, 61);
});


test('One Thing Today stays stable within a day and uses valid source instructions', () => {
  assert.equal(practice.oneThingForDate(new Date(2026, 10, 8, 1)), practice.oneThingForDate(new Date(2026, 10, 8, 23)));
  assert.notEqual(practice.oneThingForDate(new Date(2026, 10, 8)), practice.oneThingForDate(new Date(2026, 10, 9)));
  for (const lesson of practice.oneThingLessons) {
    assert.ok(slogans.some(s => s.number === lesson.slogan));
    assert.ok(practice.rootNotes.some(n => n.number === lesson.slogan));
    assert.ok(lesson.explanation && lesson.action && lesson.review);
  }
});
