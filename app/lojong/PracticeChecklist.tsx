"use client";

import { useState } from "react";
import { checklistMethodsForSlogan } from "@/lib/lojong/practice";
import styles from "./lojong.module.css";

export function PracticeChecklist({ slogan }: { slogan: number }) {
  const [checks, setChecks] = useState<string[]>([]);
  function toggle(id: string) { setChecks(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]); }
  function check(id: string, label: string) {
    return <label><input type="checkbox" checked={checks.includes(id)} onChange={() => toggle(id)} /><span>{label}</span></label>;
  }
  return <details className={styles.practiceChecklist}>
    <summary>Practice checklist</summary>
    <fieldset className={styles.checkGrid}><legend>Understand and recognize</legend>
      {check("understand", "I can explain what this instruction is asking.")}
      {check("recognize", "I can identify the pattern in an actual situation.")}
    </fieldset>
    <fieldset className={styles.checklistMethods}><legend>Choose an antidote to try</legend>
      <p className={styles.small}>Options, not a required sequence. Select one to see its steps.</p>
      {checklistMethodsForSlogan(slogan).map(method => <div className={styles.checklistMethod} key={method.id}>
        {check(method.id, method.title)}
        {checks.includes(method.id) ? <div className={styles.checklistSteps}><p className={styles.rootMeta}>{method.basis}</p><ol>{method.steps.map(step => <li key={step}>{step}</li>)}</ol></div> : null}
      </div>)}
    </fieldset>
    <fieldset className={styles.checkGrid}><legend>Check the effect</legend>
      {check("effect", "I checked whether the affliction weakened, stayed the same, or grew stronger.")}
      {check("welfare", "I considered whether my response benefited the other person as well as myself.")}
      {check("adjust", "If it did not help, I examined why or tried another response.")}
    </fieldset>
  </details>;
}
