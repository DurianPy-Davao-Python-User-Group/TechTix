// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { QuestionConfigItem } from '@/model/pycon/evaluations';
import QuestionTypeSwitch from '../QuestionTypeSwitch';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any;
}

const mockSliderQuestion: QuestionConfigItem = {
  name: 'test_rating',
  questionType: 'slider',
  question: 'How would you rate the event?',
  options: [],
  required: true
};

const TestSliderWrapper = ({ initialValue = [] }: { initialValue?: number[] }) => {
  const form = useForm({
    defaultValues: {
      test_rating: initialValue
    }
  });

  return (
    <FormProvider {...form}>
      <Controller name="test_rating" control={form.control} render={({ field }) => <>{QuestionTypeSwitch(mockSliderQuestion, field as any)}</>} />
    </FormProvider>
  );
};

describe('QuestionTypeSwitch - Slider', () => {
  let container: HTMLDivElement | null = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container) {
      document.body.removeChild(container);
      container = null;
    }
  });

  it('renders unselected state when form state is empty', async () => {
    await act(async () => {
      const root = createRoot(container!);
      root.render(<TestSliderWrapper initialValue={[]} />);
    });

    // Should indicate to slide or tap a number
    expect(container?.textContent).toContain('Slide or tap a number to rate');
    expect(container?.textContent).not.toContain('of 5');

    // Range element should have opacity-0 (not filled)
    const range = container?.querySelector('.bg-pycon-orange');
    expect(range?.className).toContain('opacity-0');
  });

  it('renders active rating when form state has a value', async () => {
    await act(async () => {
      const root = createRoot(container!);
      root.render(<TestSliderWrapper initialValue={[4]} />);
    });

    expect(container?.textContent).toContain('4 of 5');
    const range = container?.querySelector('.bg-pycon-orange');
    expect(range?.className).not.toContain('opacity-0');
  });

  it('updates form state when a number button is clicked', async () => {
    await act(async () => {
      const root = createRoot(container!);
      root.render(<TestSliderWrapper initialValue={[]} />);
    });

    const buttons = container?.querySelectorAll('button[type="button"]');
    // Button for '5' should be the 5th button
    const button5 = Array.from(buttons || []).find((btn) => btn.textContent === '5');
    expect(button5).toBeDefined();

    await act(async () => {
      button5?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(container?.textContent).toContain('5 of 5');
  });
});
