// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { useForm, FormProvider } from 'react-hook-form';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import BasicInfoStep from '../BasicInfoStep';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const TestWrapper = () => {
  const form = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      nickname: '',
      pronouns: '',
      contactNumber: '',
      organization: '',
      jobTitle: '',
      linkedInLink: ''
    }
  });

  return (
    <FormProvider {...form}>
      <BasicInfoStep />
    </FormProvider>
  );
};

describe('BasicInfoStep Component', () => {
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

  it('renders all required headers and sections', async () => {
    await act(async () => {
      createRoot(container!).render(<TestWrapper />);
    });

    expect(container?.textContent).toContain('Registration');
    expect(container?.textContent).toContain('Basic Information');
    expect(container?.textContent).toContain('Tell us a bit about yourself. Fields marked * are required.');
    expect(container?.textContent).toContain('Name');
    expect(container?.textContent).toContain('Identity');
    expect(container?.textContent).toContain('Contact');
    expect(container?.textContent).toContain('Socials (optional)');
  });

  it('renders expected placeholders for inputs', async () => {
    await act(async () => {
      createRoot(container!).render(<TestWrapper />);
    });

    const getPlaceholder = (placeholder: string) => container?.querySelector(`input[placeholder="${placeholder}"]`);

    expect(getPlaceholder('e.g. Maria')).not.toBeNull();
    expect(getPlaceholder('e.g. Santos')).not.toBeNull();
    expect(getPlaceholder('What should we call you?')).not.toBeNull();
    expect(getPlaceholder('e.g. she/her, they/them')).not.toBeNull();
    expect(getPlaceholder('+63 912 345 6789')).not.toBeNull();
    expect(getPlaceholder('Where do you work or study?')).not.toBeNull();
    expect(getPlaceholder('e.g. Software Engineer, Designer, Student')).not.toBeNull();
    expect(getPlaceholder('linkedin.com/in/username')).not.toBeNull();
  });

  it('does not render excluded fields like Middle Name, Email, GitHub, Facebook or Twitter', async () => {
    await act(async () => {
      createRoot(container!).render(<TestWrapper />);
    });

    expect(container?.textContent).not.toContain('Middle Name');
    expect(container?.textContent).not.toContain('Email *');
    expect(container?.textContent).not.toContain('Facebook');
    expect(container?.textContent).not.toContain('GitHub');
    expect(container?.textContent).not.toContain('Twitter');
  });
});
