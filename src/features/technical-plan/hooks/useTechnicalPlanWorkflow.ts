import { useState } from 'react';
import type { TechnicalPlanState, TechnicalPlanStep } from '../types';

const initialState: TechnicalPlanState = {
  step: 'document-analysis',
  tenderFile: null,
  projectOverview: '',
  techRequirements: '',
  bidAnalysisMode: 'key',
  bidAnalysisSelectedTaskIds: [],
  bidAnalysisTasks: {},
  outlineData: null,
};

export function useTechnicalPlanWorkflow() {
  const [state, setState] = useState<TechnicalPlanState>(initialState);
  const [hydrated] = useState(true);

  const switchStep = (step: TechnicalPlanStep) => {
    setState((prev) => ({ ...prev, step }));
  };

  return {
    hydrated,
    state,
    setState,
    switchStep,
  };
}