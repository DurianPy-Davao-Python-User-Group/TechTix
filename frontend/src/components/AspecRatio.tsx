import * as React from 'react';

export interface AspectRatioProps extends React.HTMLAttributes<HTMLDivElement> {
  ratio?: number;
}

const AspectRatio = ({ ratio = 1 / 1, style, children, ...props }: AspectRatioProps) => {
  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: `${ratio}`, ...style }} {...props}>
      {children}
    </div>
  );
};

export default AspectRatio;
