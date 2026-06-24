import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/TranslationProvider';
import { LocalDbService } from '../../db/LocalDbService';
import { useLocalAccountContext } from '../../context/LocalAccountContext';
import { Button } from '../../components/ui/Button';
import { TextInput } from '../../components/ui/TextInput';
import { PageWrapper, PageBackground } from '../../components/common';
import { PageCard } from '../../components/common/PageCard';
import welcomeImg from '../../assets/img/Welcome.png';

type UsageType = 'user' | 'manager' | null;

const TOTAL_STEPS = 4;

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex gap-2 justify-center mb-6">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all duration-300 ${
            i < current ? 'w-6 bg-blue-600' : i === current ? 'w-6 bg-blue-400' : 'w-2 bg-slate-200'
          }`}
        />
      ))}
    </div>
  );
}

export default function OnboardingPage() {
  const { tSync } = useTranslation();
  const navigate = useNavigate();
  const { refreshLocalAccount } = useLocalAccountContext();

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [usageType, setUsageType] = useState<UsageType>(null);
  const [saving, setSaving] = useState(false);

  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => s - 1);

  const handleFinish = async () => {
    setSaving(true);
    try {
      const role = usageType === 'user'
        ? (['sökande'] as const)
        : usageType === 'manager'
          ? (['säljare'] as const)
          : ([] as const);

      const account = await LocalDbService.saveAccount({
        name: name.trim(),
        email: '',
        telephone: '',
        role: [...role],
      });

      if (usageType === 'user') {
        await LocalDbService.addCandidate({
          account_id: account.account_id,
          name: name.trim(),
          email: '',
          telephone: '',
          title: '',
          location: '',
          workplace: [],
          employment_type: [],
          available_from: '',
          travel: false,
          searchable: false,
          is_own_candidate: true,
        });
      }

      await refreshLocalAccount();
      navigate('/');
    } catch {
      // ignore — user can retry
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageBackground imageUrl={welcomeImg} opacity={1} blur={0} className="!z-[2]" />
      <PageWrapper className="relative z-10 flex items-start justify-center">
        <div className="w-full max-w-lg">
          <PageCard title={tSync('onboarding_title')}>
            <StepIndicator current={step} />

            {/* ── Steg 0: Namn ─────────────────────────────────────── */}
            {step === 0 && (
              <div className="flex flex-col gap-6">
                <p className="text-sm text-slate-600">{tSync('onboarding_step1_body')}</p>
                <TextInput
                  label={tSync('onboarding_step1_name_label')}
                  value={name}
                  onChange={setName}
                  placeholder={tSync('onboarding_step1_name_placeholder')}
                  autoFocus
                />
                <div className="flex justify-end pt-2">
                  <Button data-testid="btn-next" variant="primary" size="lg" disabled={!name.trim()} onClick={next}>
                    {tSync('onboarding_next')}
                  </Button>
                </div>
              </div>
            )}

            {/* ── Steg 1: Användningstyp ───────────────────────────── */}
            {step === 1 && (
              <div className="flex flex-col gap-6">
                <p className="text-sm text-slate-600">{tSync('onboarding_step2_body')}</p>
                <div className="flex flex-col gap-3">
                  <label
                    className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                      usageType === 'user' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="usageType"
                      className="mt-0.5 accent-blue-600"
                      checked={usageType === 'user'}
                      onChange={() => setUsageType('user')}
                    />
                    <div>
                      <p className="font-semibold text-slate-800">{tSync('onboarding_step2_user_title')}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{tSync('onboarding_step2_user_desc')}</p>
                    </div>
                  </label>
                  <label
                    className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                      usageType === 'manager' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="usageType"
                      className="mt-0.5 accent-blue-600"
                      checked={usageType === 'manager'}
                      onChange={() => setUsageType('manager')}
                    />
                    <div>
                      <p className="font-semibold text-slate-800">{tSync('onboarding_step2_manager_title')}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{tSync('onboarding_step2_manager_desc')}</p>
                    </div>
                  </label>
                </div>
                <div className="flex justify-between pt-2">
                  <Button data-testid="btn-back" variant="ghost" size="lg" onClick={back}>{tSync('onboarding_back')}</Button>
                  <Button data-testid="btn-next" variant="primary" size="lg" disabled={!usageType} onClick={next}>
                    {tSync('onboarding_next')}
                  </Button>
                </div>
              </div>
            )}

            {/* ── Steg 2: AI-tips ──────────────────────────────────── */}
            {step === 2 && (
              <div className="flex flex-col gap-6">
                <p className="text-sm text-slate-600">{tSync('onboarding_step3_body')}</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                  {tSync('onboarding_step3_tip')}
                </div>
                <div className="flex justify-between pt-2">
                  <Button data-testid="btn-back" variant="ghost" size="lg" onClick={back}>{tSync('onboarding_back')}</Button>
                  <Button data-testid="btn-next" variant="primary" size="lg" onClick={next}>{tSync('onboarding_next')}</Button>
                </div>
              </div>
            )}

            {/* ── Steg 3: Om BE-konto ──────────────────────────────── */}
            {step === 3 && (
              <div className="flex flex-col gap-6">
                <p className="text-sm text-slate-600">{tSync('onboarding_step4_body')}</p>
                <ul className="text-sm text-slate-600 flex flex-col gap-2 pl-1">
                  <li className="flex gap-2"><span className="text-blue-500">✓</span>{tSync('onboarding_step4_benefit1')}</li>
                  <li className="flex gap-2"><span className="text-blue-500">✓</span>{tSync('onboarding_step4_benefit2')}</li>
                  <li className="flex gap-2"><span className="text-blue-500">✓</span>{tSync('onboarding_step4_benefit3')}</li>
                </ul>
                <div className="flex justify-between pt-2">
                  <Button data-testid="btn-back" variant="ghost" size="lg" onClick={back}>{tSync('onboarding_back')}</Button>
                  <Button data-testid="btn-finish" variant="primary" size="lg" loading={saving} onClick={handleFinish}>
                    {tSync('onboarding_finish')}
                  </Button>
                </div>
              </div>
            )}
          </PageCard>
        </div>
      </PageWrapper>
    </>
  );
}
