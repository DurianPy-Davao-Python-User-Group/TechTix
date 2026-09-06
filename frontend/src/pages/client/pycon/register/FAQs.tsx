import { FC } from 'react';
import { useParams } from 'react-router-dom';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/Accordion';
// import Skeleton from '@/components/Skeleton';
import { getFAQs } from '@/api/events';
import { useApiQuery } from '@/hooks/useApi';

const FAQs: FC = () => {
  const { eventId } = useParams();
  const { data: response /*isPending*/ } = useApiQuery(getFAQs(eventId!));

  //   if (isPending) {
  //     return (
  //       <div className="space-y-4">
  //         <Skeleton className="h-16" />
  //         <Skeleton className="h-16" />
  //         <Skeleton className="h-16" />
  //       </div>
  //     );
  //   }

  if (!response || (response && response?.data && !response?.data?.isActive) || !response?.data?.faqs.length) {
    return <></>;
  }

  const { faqs } = response.data;

  return (
    <div className="my-8 max-w-3xl w-full mx-auto text-left">
      <div className="rounded-3xl sm:rounded-[2.5rem] bg-white/80 sm:bg-white/85 backdrop-blur-md border border-[#F995081F] p-6 sm:p-8 md:p-10 shadow-[0px_6px_40px_0px_#F9950812]">
        <h3 className="font-sora font-extrabold text-2xl md:text-3xl text-pycon-orange! mb-4">FAQs</h3>
        <Accordion type="multiple" className="w-full">
          {faqs.map((faq) => (
            <AccordionItem value={faq.id} key={faq.id} className="border-b last:border-b-0 border-[#072E4714]">
              <AccordionTrigger className="text-pycon-dark-blue font-inter font-semibold hover:text-pycon-teal hover:no-underline text-left py-4 cursor-pointer [&>svg]:text-pycon-teal">
                <p className="text-sm sm:text-base font-semibold text-pycon-dark-blue pr-2">{faq.question}</p>
              </AccordionTrigger>
              <AccordionContent className="text-pycon-dark-blue/80 font-inter text-sm sm:text-base leading-relaxed pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default FAQs;
