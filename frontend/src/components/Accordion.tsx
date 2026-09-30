import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/classes';
import { Accordion as BaseAccordion } from '@base-ui/react/accordion';

export interface AccordionProps extends Omit<React.ComponentPropsWithoutRef<typeof BaseAccordion.Root>, 'defaultValue' | 'value'> {
  type?: 'single' | 'multiple';
  collapsible?: boolean;
  defaultValue?: any;
  value?: any;
  ref?: React.Ref<React.ComponentRef<typeof BaseAccordion.Root>>;
}

const Accordion = ({ type = 'single', collapsible = true, multiple, defaultValue, value, ref, ...props }: AccordionProps) => {
  const isMultiple = multiple !== undefined ? multiple : type === 'multiple';
  const normalizedDefaultValue = Array.isArray(defaultValue) ? defaultValue : defaultValue !== undefined ? [defaultValue] : undefined;
  const normalizedValue = Array.isArray(value) ? value : value !== undefined ? [value] : undefined;

  return <BaseAccordion.Root ref={ref} multiple={isMultiple} defaultValue={normalizedDefaultValue} value={normalizedValue} {...props} />;
};
Accordion.displayName = 'Accordion';

const AccordionItem = ({
  className,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseAccordion.Item> & {
  ref?: React.Ref<React.ComponentRef<typeof BaseAccordion.Item>>;
}) => <BaseAccordion.Item ref={ref} className={cn('border-b', className)} {...props} />;
AccordionItem.displayName = 'AccordionItem';

const AccordionTrigger = ({
  className,
  children,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseAccordion.Trigger> & {
  ref?: React.Ref<React.ComponentRef<typeof BaseAccordion.Trigger>>;
}) => (
  <BaseAccordion.Header className="flex">
    <BaseAccordion.Trigger
      ref={ref}
      className={cn(
        'flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[aria-expanded=true]>svg]:rotate-180 aria-expanded:[&>svg]:rotate-180 aria-disabled:text-muted-foreground! aria-disabled:no-underline aria-disabled:cursor-not-allowed',
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </BaseAccordion.Trigger>
  </BaseAccordion.Header>
);
AccordionTrigger.displayName = 'AccordionTrigger';

const AccordionContent = ({
  className,
  children,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseAccordion.Panel> & {
  ref?: React.Ref<React.ComponentRef<typeof BaseAccordion.Panel>>;
}) => (
  <BaseAccordion.Panel
    ref={ref}
    className="overflow-hidden text-sm transition-all data-closed:animate-accordion-up data-open:animate-accordion-down"
    {...props}
  >
    <div className={cn('pb-4 pt-0', className)}>{children}</div>
  </BaseAccordion.Panel>
);
AccordionContent.displayName = 'AccordionContent';

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
