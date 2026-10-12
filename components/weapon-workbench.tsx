"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CLASS_RULES, CLASS_SKILLS, MOVEMENTS, TRAIT_DESCRIPTIONS, WEAPON_RULES, WEAPON_TRAITS, calculateWeaponDamage, canUseClassSkill, damageReduction, remainingDurability, ruleValue, type WeaponSetup, type WeaponTrait } from "@/lib/weapon-rules";
import type { Character, Weapon } from "@/lib/character";

function NumericSetting({ id, label, value, min, max, step = 1, onChange }: { id: string; label: string; value: number; min: number; max: number; step?: number; onChange: (value: number) => void }) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  const commit = () => {
    const requested = draft.trim() ? Number(draft) : value;
    const next = Math.round(Math.max(min, Math.min(max, Number.isFinite(requested) ? requested : value)) / step) * step;
    const rounded = Number(next.toFixed(2)); setDraft(String(rounded)); onChange(rounded);
  };
  return <div><label className="field-label" htmlFor={id}>{label}</label><Input id={id} type="number" inputMode={step === 1 ? "numeric" : "decimal"} value={draft} min={min} max={max} step={step} onChange={event => { const raw = event.target.value; setDraft(raw); const n = Number(raw); if (raw.trim() && Number.isFinite(n) && n >= min && n <= max) onChange(Math.round(n / step) * step); }} onBlur={commit} onKeyDown={event => { if (event.key === "Enter") { commit(); event.currentTarget.blur(); } }} /></div>;
}

export function WeaponWorkbench({ character: c, change }: { character: Character; change: (patch: Partial<Character>) => void }) {
  const setup = c.weaponSetup, classRule = c.baseClass ? CLASS_RULES[c.baseClass] : null;
  const update = (patch: Partial<WeaponSetup>) => change({ weaponSetup: { ...setup, ...patch } });
  const classSkills = CLASS_SKILLS.filter(skill => skill.baseClass === c.baseClass && skill.trainerId === c.trainerId);
  return <section className="weapon-workbench" aria-labelledby="weapon-rules-title">
    <div className="weapon-workbench-heading"><div><h3 id="weapon-rules-title">무기 성능과 대미지</h3><p>공식 기획안 기준 · 대미지와 내구도 손실을 구분해요.</p></div><span className="quiet-badge">WEAPON DATA</span></div>
    {classRule && <div className="class-weapon-info"><h4>{c.baseClass} · 스킬 대응 무기</h4><p>{classRule.weapons.join(" · ")}</p><small>무기는 자유롭게 사용할 수 있지만, 대응 무기가 아니면 일부 계열 스킬을 사용할 수 없어요.</small></div>}
    <div className="damage-conditions">
      <NumericSetting id="target-toughness" label="상대 맷집" value={setup.targetToughness} min={0} max={1000} onChange={targetToughness => update({ targetToughness })} />
      <div><label className="field-label" htmlFor="damage-movement">이동 상태 · 근접 위력</label><Select value={setup.movement} onValueChange={movement => update({ movement: movement as WeaponSetup["movement"] })}><SelectTrigger id="damage-movement"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(MOVEMENTS).map(([key, value]) => <SelectItem key={key} value={key}>{value.name} · {value.power}배</SelectItem>)}</SelectContent></Select></div>
      <NumericSetting id="weapon-skill-multiplier" label="무기 스킬 배율" value={setup.skillMultiplier} min={1} max={3} step={.01} onChange={skillMultiplier => update({ skillMultiplier: Number(skillMultiplier.toFixed(2)) })} />
    </div>
    <p className="damage-reduction" aria-live="polite">상대 피해감소율 <strong>{damageReduction(setup.targetToughness)}%</strong><span>상대 맷집은 계산용 입력이에요. 캐릭터의 능력 수치(최대 100)는 바뀌지 않아요.</span></p>
    <div className="weapon-performance-grid">{(["primary", "secondary"] as const).map((slot, index) => {
      const weapon: Weapon = index === 0 ? c.primaryWeapon : c.secondaryWeapon, state = setup[slot];
      if (!weapon) return <article key={slot} className="weapon-performance empty"><h4>{index === 0 ? "주무기" : "보조무기"}</h4><p>위에서 무기를 선택하면 성능과 계산 결과가 표시돼요.</p></article>;
      const rule = WEAPON_RULES[weapon], remaining = remainingDurability(weapon, state), result = calculateWeaponDamage(weapon, setup, state);
      const equipment = (patch: Partial<typeof state>) => update({ [slot]: { ...state, ...patch } });
      const metrics = [["일반 공격 대미지", ruleValue(rule.normal)], ["강공격 대미지", ruleValue(rule.heavy)], ["선딜", `${rule.charge ? "차지 ~" : ""}${ruleValue(rule.windup, "초")}`], ["후딜", ruleValue(rule.recovery, "초")], ["가드 내구도 손실", ruleValue(rule.guardWear)], ["패리 내구도 손실", ruleValue(rule.parryWear)], ["가드 관통률", ruleValue(rule.guardPierce, "%")], ["패리 관통률", "X / 미기재"]];
      return <article className="weapon-performance" key={slot}>
        <header><span>{index === 0 ? "주무기" : "보조무기"}</span><h4>{weapon}</h4><p>{rule.category}{rule.shield && rule.category === "원거리" ? " · 방패 겸용" : ""}</p></header>
        <dl className="weapon-metrics">{metrics.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        <label className="field-label" htmlFor={`${slot}-weapon-trait`}>무기 특성</label><Select value={state.trait} onValueChange={trait => equipment({ trait: trait as WeaponTrait })}><SelectTrigger id={`${slot}-weapon-trait`}><SelectValue /></SelectTrigger><SelectContent>{WEAPON_TRAITS.map(trait => <SelectItem key={trait} value={trait} disabled={trait === "견습" && rule.category === "원거리" && weapon !== "새총"}>{trait}</SelectItem>)}</SelectContent></Select><p className="weapon-rule-note">{TRAIT_DESCRIPTIONS[state.trait]}</p>
        {rule.durability != null ? <><NumericSetting id={`${slot}-durability`} label={`남은 내구도 / ${rule.durability.toLocaleString()}`} value={remaining ?? 0} min={0} max={rule.durability} onChange={value => equipment({ remaining: value, trait: value > 0 && state.trait === "파괴된" ? "일반" : state.trait })} /><div className="durability-actions"><Button variant="outline" size="sm" disabled={rule.guardWear == null || !remaining} onClick={() => equipment({ remaining: Math.max(0, (remaining ?? 0) - (rule.guardWear ?? 0)) })}>가드 1회</Button><Button variant="outline" size="sm" disabled={rule.parryWear == null || !remaining} onClick={() => equipment({ remaining: Math.max(0, (remaining ?? 0) - (rule.parryWear ?? 0)) })}>패리 1회</Button><Button variant="ghost" size="sm" onClick={() => equipment({ remaining: null, trait: state.trait === "파괴된" ? "일반" : state.trait })}>완전 수리</Button></div></> : <p className="weapon-rule-note">내구도: X / 미기재</p>}
        <div className="weapon-damage-results" aria-live="polite"><h5>예상 대미지</h5>{result.unavailable ? <p>{result.unavailable}</p> : <dl>{([["일반", result.normal], ["강공격", result.heavy], ["스킬", result.skill], ["가드 관통", result.guardPiercing]] as const).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{typeof value === "number" ? value : "—"}</dd></div>)}</dl>}</div>
        {rule.category === "원거리" && weapon !== "새총" && <p className="weapon-rule-note">견습 원거리 무기는 없어요. 문서의 수치표를 표시하며, 견습 특성은 선택할 수 없어요.</p>}
      </article>;
    })}</div>
    {classSkills.length > 0 && <section className="class-skill-presets"><h4>선택한 트레이너의 계열 스킬</h4>{classSkills.map(skill => <article key={skill.name}><div><h5>{skill.name}</h5><p>{skill.description}</p><p>{skill.multiplier}배 · 쿨다운 {skill.cooldown}초 · 선딜 {skill.charge ? "차지 ~" : ""}{skill.windup}초 · 후딜 {skill.recovery}초 · 패리 {skill.parry ? "가능" : "불가"}</p></div><Button variant="outline" disabled={!canUseClassSkill(c.baseClass, c.primaryWeapon) && !canUseClassSkill(c.baseClass, c.secondaryWeapon)} onClick={() => update({ skillMultiplier: skill.multiplier })}>배율 적용</Button><div className="class-skill-damage">{([c.primaryWeapon, c.secondaryWeapon] as const).map((weapon, i) => <span key={i}>{i === 0 ? "주무기" : "보조무기"}: {canUseClassSkill(c.baseClass, weapon) ? ruleValue(calculateWeaponDamage(weapon, { ...setup, skillMultiplier: skill.multiplier }, i === 0 ? setup.primary : setup.secondary).skill) : "대응 무기 필요"}</span>)}</div></article>)}<p className="weapon-rule-note">배율 적용은 계산 조건만 바꿔요. 스킬 습득이나 슬롯 장착을 의미하지 않아요. 출혈의 지속시간이 없으므로 Flash Cut의 누적 출혈 대미지는 합산하지 않아요.</p></section>}
    <details className="weapon-rule-details"><summary>계산 공식과 미기재 항목</summary><ul>
      <li>근접 일반·강공격: 공격값 × (1 − 피해감소율) × 이동 위력(걷기 1 / 뛰기 2 / 돌진 3)</li>
      <li>근접 스킬: (일반 + 강공격) × (1 − 피해감소율) × 스킬 배율</li>
      <li>원거리 일반: 일반 공격 × (1 − 피해감소율) / 원거리 스킬: 여기에 스킬 배율 적용</li>
      <li>원거리 가드 관통: 일반 공격 × 가드 관통률. 문서 공식대로 피해감소율을 추가로 곱하지 않아요.</li>
      <li>원거리와 스킬에는 이동 위력을 적용하지 않아요. 방패 강공격은 근접 강공격으로 계산하고, 일반 공격이 X라 스킬 대미지는 계산하지 않아요.</li>
      <li>맷집 구간별 피해감소: 1–100은 1당 0.4%, 101–300은 0.2%, 301–600은 0.04%, 601–800은 0.02%, 801–1000은 0.004%. 맷집 1000에서 96.8%예요.</li>
      <li>소수점 첫째 자리로 반올림해요. X/미기재와 계산 불가(—)는 0 대미지가 아니에요.</li>
      <li>일반·강공격 시 내구도가 닳는다는 설명은 있지만 소모량이 없어 자동 차감하지 않아요. 가드·패리만 명시된 내구도 손실을 적용해요.</li>
      <li>견습의 감속 수치와 단단한·가벼운·약한·반듯한의 세부 효과는 미기재라 계산에 넣지 않아요. 내구도 표의 ‘견습용 기준’과 ‘새총 외 원거리 견습 무기 없음’을 함께 보존했어요.</li>
      <li>근력의 위력 증가·방어력 증가를 최종 공식에 결합하는 방식은 미기재라 별도 가산하지 않아요. 기존 능력 기반 스킬은 무기 스킬 계산과 분리돼요.</li>
    </ul></details>
  </section>;
}
