import * as React from 'react';
import { cn } from '@/utils/classes';

const CardContainer = ({ className, ref, ...props }: React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }) => (
  <div ref={ref} className={cn('rounded-xl border bg-card text-card-foreground shadow-sm', className)} {...props} />
);
CardContainer.displayName = 'Card';

const CardHeader = ({ className, ref, ...props }: React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }) => (
  <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
);
CardHeader.displayName = 'CardHeader';

const CardTitle = ({ className, ref, ...props }: React.HTMLAttributes<HTMLHeadingElement> & { ref?: React.Ref<HTMLDivElement> }) => (
  <div role="CardTitle" ref={ref} className={cn('font-semibold leading-none tracking-tight', className)} {...props} />
);
CardTitle.displayName = 'CardTitle';

const CardDescription = ({ className, ref, ...props }: React.HTMLAttributes<HTMLParagraphElement> & { ref?: React.Ref<HTMLDivElement> }) => (
  <div role="CardDescription" ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
);
CardDescription.displayName = 'CardDescription';

const CardContent = ({ className, ref, ...props }: React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
);
CardContent.displayName = 'CardContent';

const CardFooter = ({ className, ref, ...props }: React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }) => (
  <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
);
CardFooter.displayName = 'CardFooter';

export { CardContainer, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  cardBanner?: string;
  cardTitle?: React.ReactNode;
  cardDescription?: React.ReactNode;
  cardFooter?: React.ReactNode;
}

const Card = ({ cardTitle, cardDescription, cardFooter, children, className, ...props }: CardProps) => {
  return (
    <CardContainer {...props} className={className}>
      <CardHeader className="w-full">
        <CardTitle>{cardTitle}</CardTitle>
        <CardDescription>{cardDescription}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
      <CardFooter className="w-full">{cardFooter}</CardFooter>
    </CardContainer>
  );
};

export default Card;
