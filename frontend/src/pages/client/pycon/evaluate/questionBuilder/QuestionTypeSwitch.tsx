import { ControllerRenderProps, FieldPath, FieldValues } from 'react-hook-form';
import Checkbox from '@/components/Checkbox';
import Input from '@/components/Input';
import { RadioGroup, RadioGroupItem } from '@/components/RadioGroup';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from '@/components/Select';
import Slider from '@/components/Slider';
import { Textarea } from '@/components/TextArea';
import { QuestionConfigItem } from '@/model/pycon/evaluations';
import { cn } from '@/utils/classes';

const QuestionTypeSwitch = <TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>(
  question: QuestionConfigItem,
  field: ControllerRenderProps<FieldValues, TName>,
  disabled: boolean = false
) => {
  switch (question.questionType) {
    case 'text_short':
      return <Input pyconStyles type="text" placeholder="Type your answer here..." {...field} disabled={disabled} />;
    case 'text_long':
      return <Textarea pyconStyles placeholder="Type your feedback here..." rows={4} {...field} disabled={disabled} />;
    case 'multiple_choice_dropdown':
      return (
        <Select onValueChange={field.onChange} value={field.value || undefined} disabled={disabled}>
          <SelectTrigger className="bg-pycon-dirty-white text-pycon-dark-blue font-inter text-base md:text-lg h-13 md:h-14 px-5 py-3.5 rounded-2xl border-2 border-transparent focus-visible:border-pycon-teal/40 focus-visible:ring-2 focus-visible:ring-pycon-teal/10 shadow-xs">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-[#F995081F] rounded-2xl shadow-lg">
            <SelectGroup>
              {question.options &&
                Array.isArray(question.options) &&
                question?.options.map((option, index) => (
                  <SelectItem
                    key={index}
                    value={option}
                    className="font-inter text-pycon-dark-blue hover:bg-pycon-dirty-white cursor-pointer py-2.5 px-3 rounded-xl"
                  >
                    {option}
                  </SelectItem>
                ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      );
    case 'multiple_choice':
      return (
        <RadioGroup className="flex flex-col gap-3 py-1" onValueChange={field.onChange} value={field.value} disabled={disabled}>
          {question.options &&
            Array.isArray(question.options) &&
            question?.options.map((option, index) => {
              const optionId = `${question.name}-${index}`;
              return (
                <label key={index} htmlFor={optionId} className="flex items-center gap-3 cursor-pointer group">
                  <RadioGroupItem pyconStyles value={option} id={optionId} className="border-pycon-dark-blue/30 bg-transparent cursor-pointer" />
                  <span className="font-inter font-medium text-sm sm:text-base text-pycon-dark-blue group-hover:text-pycon-teal transition-colors">
                    {option}
                  </span>
                </label>
              );
            })}
        </RadioGroup>
      );
    case 'multiple_answers':
      return (
        <div className="flex flex-col gap-3 py-1">
          {question.options &&
            Array.isArray(question.options) &&
            question?.options.map((option, index) => {
              const optionId = `${question.name}-${index}`;
              const fieldValue = Array.isArray(field.value) ? (field.value as string[]) : [];

              return (
                <label key={index} htmlFor={optionId} className="flex items-center gap-3 cursor-pointer group">
                  <Checkbox
                    pyconStyles
                    id={optionId}
                    value={option}
                    checked={fieldValue.includes(option)}
                    disabled={disabled}
                    onCheckedChange={(checked) =>
                      checked ? field.onChange([...fieldValue, option]) : field.onChange(fieldValue.filter((item) => item !== option))
                    }
                    className="cursor-pointer"
                  />
                  <span className="font-inter font-medium text-sm sm:text-base text-pycon-dark-blue group-hover:text-pycon-teal transition-colors">
                    {option}
                  </span>
                </label>
              );
            })}
        </div>
      );
    case 'slider': {
      const hasRating = (Array.isArray(field.value) && field.value.length > 0) || (typeof field.value === 'number' && field.value >= 1 && field.value <= 5);
      const currentVal = Array.isArray(field.value) && field.value.length > 0 ? field.value[0] : typeof field.value === 'number' ? field.value : null;
      const sliderVal = currentVal !== null ? [currentVal] : [3];

      return (
        <div className="w-full pt-3 pb-2 px-1">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-inter font-bold text-pycon-dark-blue/40 uppercase tracking-wider">Rating:</span>
            {currentVal !== null ? (
              <span className="text-sm font-sora font-extrabold text-[#04B1A4] bg-[#04B1A4]/10 border border-[#04B1A4]/20 px-3.5 py-1 rounded-full">
                {currentVal} of 5
              </span>
            ) : (
              <span className="text-xs font-inter font-medium text-pycon-dark-blue/40 italic">Slide or tap a number to rate</span>
            )}
          </div>
          <Slider className="w-full" min={1} max={5} step={1} hasValue={hasRating} value={sliderVal} onValueChange={field.onChange} disabled={disabled} />
          <div className="flex justify-between px-1 mt-4">
            {[1, 2, 3, 4, 5].map((val) => (
              <button
                type="button"
                key={val}
                disabled={disabled}
                onClick={() => !disabled && field.onChange([val])}
                className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center text-xs font-inter font-bold transition-all cursor-pointer',
                  currentVal === val
                    ? 'bg-pycon-orange text-white shadow-xs scale-110'
                    : 'text-pycon-dark-blue/50 hover:text-pycon-dark-blue hover:bg-pycon-dirty-white'
                )}
              >
                {val}
              </button>
            ))}
          </div>
        </div>
      );
    }
    case 'radio_buttons': {
      const selectedValue = String(field.value ?? '');
      return (
        <RadioGroup onValueChange={field.onChange} value={selectedValue} disabled={disabled} className="w-full">
          <div className="grid grid-cols-5 gap-2 sm:gap-4 p-3 bg-pycon-dirty-white/60 rounded-2xl border border-pycon-dark-blue/5">
            {[1, 2, 3, 4, 5].map((num) => {
              const strNum = String(num);
              const isSelected = selectedValue === strNum;
              const itemId = `${question.name}-${num}`;
              return (
                <label
                  key={num}
                  htmlFor={itemId}
                  className={cn(
                    'flex flex-col items-center justify-center gap-2 p-2.5 rounded-xl cursor-pointer transition-all',
                    isSelected ? 'bg-white shadow-xs font-bold text-pycon-orange' : 'hover:bg-white/60 text-pycon-dark-blue/70'
                  )}
                >
                  <span className="text-xs sm:text-sm font-inter font-semibold">{num}</span>
                  <RadioGroupItem value={strNum} id={itemId} pyconStyles={true} className="cursor-pointer" />
                </label>
              );
            })}
          </div>
        </RadioGroup>
      );
    }
  }
};

export default QuestionTypeSwitch;
