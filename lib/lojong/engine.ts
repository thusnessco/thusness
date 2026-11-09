import { concepts, type Skill } from "./curriculum";
import { diagnosticIds, questionById, questions, type Question } from "./questions";

export type Confidence = "knew" | "guessed" | "unsure";
export type Attempt = { questionId: string; concept: string; skill: Skill; correct: boolean; confidence: Confidence; at: number };
export type Response = { answer: string[]; correct: boolean; confidence: Confidence | null };
export type Session = { mode: "diagnostic" | "review"; ids: string[]; response: Response | null; finished: boolean };
export type Progress = { version: 1; attempts: Attempt[]; session: Session | null; completedSessions: number };
export const emptyProgress = (): Progress => ({ version: 1, attempts: [], session: null, completedSessions: 0 });
export const SESSION_LENGTH = 6;
const DAY = 86_400_000;

export function isCorrect(q: Question, answer: string[]): boolean {
  if (answer.length !== q.answer.length || new Set(answer).size !== answer.length) return false;
  return q.kind === "multiple" ? q.answer.every(id => answer.includes(id)) : q.answer.every((id, i) => answer[i] === id);
}

export function learningState(progress: Progress, concept: string, skill: Skill, now = Date.now()) {
  const attempts = progress.attempts.filter(a => a.concept === concept && a.skill === skill);
  const last = attempts.at(-1);
  let streak = 0;
  for (let i = attempts.length - 1; i >= 0; i--) {
    if (!attempts[i].correct || attempts[i].confidence !== "knew") break;
    streak++;
  }
  const status = !last ? "unexplored" : !last.correct ? "revisit" : last.confidence !== "knew" ? "uncertain" : "demonstrated";
  const interval = status === "demonstrated" ? [1, 3, 7, 14, 30][Math.min(streak - 1, 4)] * DAY : 0;
  const due = !last || now >= last.at + interval;
  return { status, due, streak, dueAt: last ? last.at + interval : null, attempts: attempts.length };
}

export function chooseNext(progress: Progress, sessionIds: string[], now = Date.now()): string | null {
  const lastTwoConcepts = sessionIds.slice(-2).map(id => questionById[id]?.concept);
  const candidates = questions.filter(q => !sessionIds.includes(q.id));
  const scored = candidates.map((q, index) => {
    const state = learningState(progress, q.concept, q.skill, now);
    const recognition = learningState(progress, q.concept, "recognition", now);
    const previous = [...progress.attempts].reverse().find(a => a.questionId === q.id);
    let score = state.status === "revisit" ? 100 : state.status === "uncertain" ? 90 : state.status === "unexplored" ? 50 : state.due ? 70 : 5;
    // Application follows some evidence of recognition, but is never counted as recall.
    if (q.skill === "application" && recognition.status !== "demonstrated") score -= 45;
    if (lastTwoConcepts.includes(q.concept)) score -= 110;
    if (previous && now - previous.at < DAY) score -= 25;
    return { id: q.id, score, index };
  });
  scored.sort((a, b) => b.score - a.score || a.index - b.index);
  return scored[0]?.id ?? null;
}

export function beginSession(progress: Progress): Progress {
  const mode = progress.completedSessions === 0 && progress.attempts.length === 0 ? "diagnostic" : "review";
  return { ...progress, session: { mode, ids: [mode === "diagnostic" ? diagnosticIds[0] : chooseNext(progress, [])!], response: null, finished: false } };
}

export function respond(progress: Progress, answer: string[], unsure = false, now = Date.now()): Progress {
  const session = progress.session;
  if (!session || session.finished || session.response) return progress;
  const q = questionById[session.ids.at(-1)!];
  const correct = !unsure && isCorrect(q, answer);
  const response: Response = { answer, correct, confidence: unsure ? "unsure" : correct ? null : "knew" };
  const next = { ...progress, session: { ...session, response } };
  return response.confidence ? record(next, response.confidence, now) : next;
}

function record(progress: Progress, confidence: Confidence, now: number): Progress {
  const session = progress.session!;
  const q = questionById[session.ids.at(-1)!];
  const response = session.response!;
  const attempt: Attempt = { questionId: q.id, concept: q.concept, skill: q.skill, correct: response.correct, confidence, at: now };
  return { ...progress, attempts: [...progress.attempts.slice(-1999), attempt], session: { ...session, response: { ...response, confidence } } };
}

export function setConfidence(progress: Progress, confidence: "knew" | "guessed", now = Date.now()): Progress {
  if (!progress.session?.response?.correct || progress.session.response.confidence) return progress;
  return record(progress, confidence, now);
}

export function advance(progress: Progress, now = Date.now()): Progress {
  const session = progress.session;
  if (!session?.response?.confidence || session.finished) return progress;
  if (session.ids.length >= SESSION_LENGTH) return { ...progress, completedSessions: progress.completedSessions + 1, session: { ...session, finished: true } };
  const id = session.mode === "diagnostic" ? diagnosticIds[session.ids.length] : chooseNext(progress, session.ids, now);
  if (!id) return { ...progress, completedSessions: progress.completedSessions + 1, session: { ...session, finished: true } };
  return { ...progress, session: { ...session, ids: [...session.ids, id], response: null } };
}

export function reviewConcepts(progress: Progress, now = Date.now()) {
  return concepts.filter(c => ["recognition", "application"].some(skill => {
    const s = learningState(progress, c.id, skill as Skill, now);
    return s.status !== "unexplored" && s.due;
  }));
}

// Imported progress is data, never trusted executable content or arbitrary storage keys.
export function parseProgress(value: unknown): Progress | null {
  if (!value || typeof value !== "object") return null;
  const p = value as Partial<Progress>;
  if (p.version !== 1 || !Array.isArray(p.attempts) || p.attempts.length > 2000 || !Number.isInteger(p.completedSessions) || p.completedSessions! < 0) return null;
  const knownQuestion = (id: string) => typeof id === "string" && Object.hasOwn(questionById, id);
  const validAttempt = (a: Attempt) => a && knownQuestion(a.questionId) && a.concept === questionById[a.questionId].concept && a.skill === questionById[a.questionId].skill && typeof a.correct === "boolean" && ["knew", "guessed", "unsure"].includes(a.confidence) && typeof a.at === "number" && Number.isFinite(a.at) && a.at > 0 && a.at < Date.now() + DAY;
  if (!p.attempts.every(validAttempt)) return null;
  if (p.session !== null) {
    const s = p.session;
    if (!s || !["diagnostic", "review"].includes(s.mode) || !Array.isArray(s.ids) || s.ids.length < 1 || s.ids.length > SESSION_LENGTH || !s.ids.every(knownQuestion) || new Set(s.ids).size !== s.ids.length || typeof s.finished !== "boolean") return null;
    if (s.response !== null) {
      const r = s.response;
      const q = questionById[s.ids.at(-1)!];
      if (!r || !Array.isArray(r.answer) || r.answer.length > 7 || !r.answer.every(id => q.options.some(o => o.id === id)) || typeof r.correct !== "boolean" || ![null, "knew", "guessed", "unsure"].includes(r.confidence) || (r.correct && !isCorrect(q, r.answer)) || (r.confidence === null && !r.correct)) return null;
    }
  }
  return { version: 1, attempts: p.attempts, session: p.session!, completedSessions: p.completedSessions! };
}
