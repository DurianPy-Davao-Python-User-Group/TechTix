import { FormError, FormItem, FormLabel } from '@/components/Form';
import { QuestionConfigItem } from '@/model/pycon/evaluations';
import QuestionTypeSwitch from './QuestionTypeSwitch';

interface QuestionBuilderProps {
  questions: QuestionConfigItem[];
}

const QuestionBuilder = ({ questions }: QuestionBuilderProps) => {
  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl text-pycon-dark-blue">
      {questions.map((question, index) => (
        <div
          key={question.name || index}
          className="rounded-3xl sm:rounded-[2rem] bg-white/80 sm:bg-white/85 backdrop-blur-md border border-[#F995081F] p-6 sm:p-8 shadow-[0px_4px_24px_0px_#F995080F] flex flex-col gap-3 transition-all hover:border-[#F9950833]"
        >
          <FormItem name={question.name}>
            {({ field }) => (
              <div className="flex flex-col gap-3 w-full">
                <FormLabel className="font-inter font-semibold text-base md:text-[17px] text-pycon-dark-blue tracking-normal leading-relaxed">
                  <span className="text-pycon-orange font-bold mr-1.5">{index + 1}.</span>
                  {question.question}
                  {question.required && <span className="text-[#F99508] font-bold ml-1">*</span>}
                </FormLabel>
                {QuestionTypeSwitch(question, field)}
                <FormError />
              </div>
            )}
          </FormItem>
        </div>
      ))}
    </div>
  );
};

export default QuestionBuilder;

