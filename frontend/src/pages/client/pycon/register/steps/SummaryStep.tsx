import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import Checkbox from '@/components/Checkbox';
import { FormItem, FormError } from '@/components/Form';
import Label from '@/components/Label';
import { Event } from '@/model/events';
import { formatMoney, formatPercentage } from '@/utils/functions';
import { RegisterFormValues } from '../../hooks/useRegisterForm';
import { getEffectivePrice } from '../pricing';
import { SummaryCard, SummaryRow } from './SummaryCard';

const PYCON_CODE_OF_CONDUCT = import.meta.env.VITE_PYCON_CODE_OF_CONDUCT || 'https://pycon-davao.durianpy.org/code-of-conduct';

interface SummaryProps {
  event: Event;
}

const SummaryStep = ({ event }: SummaryProps) => {
  const { control } = useFormContext<RegisterFormValues>();
  const [
    email,
    firstName,
    lastName,
    nickname,
    pronouns,
    contactNumber,
    organization,
    jobTitle,
    facebookLink,
    linkedInLink,
    ticketTypeId,
    sprintDay,
    validCode,
    discountPercentage,
    transactionFee,
    discountedPrice,
    total,
    communityInvolvement,
    futureVolunteer,
    dietaryRestrictions,
    accessibilityNeeds,
    validIdObjectKey
  ] = useWatch({
    control,
    name: [
      'email',
      'firstName',
      'lastName',
      'nickname',
      'pronouns',
      'contactNumber',
      'organization',
      'jobTitle',
      'facebookLink',
      'linkedInLink',
      'ticketType',
      'sprintDay',
      'validCode',
      'discountPercentage',
      'transactionFee',
      'discountedPrice',
      'total',
      'communityInvolvement',
      'futureVolunteer',
      'dietaryRestrictions',
      'accessibilityNeeds',
      'validIdObjectKey'
    ]
  });

  const ticketType = event.ticketTypes?.find((ticket) => ticket.id === ticketTypeId);
  const effectivePrice = getEffectivePrice(event, ticketTypeId);
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || '-';

  const formatSocials = () => {
    const socials: React.ReactNode[] = [];
    if (facebookLink) {
      socials.push(
        <span key="fb" className="block [overflow-wrap:anywhere] break-words">
          [FB] {facebookLink}
        </span>
      );
    }
    if (linkedInLink) {
      socials.push(
        <span key="in" className="block [overflow-wrap:anywhere] break-words">
          [in] {linkedInLink}
        </span>
      );
    }
    return socials.length > 0 ? <div className="flex flex-col gap-1">{socials}</div> : 'None';
  };

  const getUploadedIdDisplay = () => {
    if (!validIdObjectKey) return 'None';
    const parts = validIdObjectKey.split('/');
    return parts[parts.length - 1] || 'Uploaded';
  };

  return (
    <div className="flex flex-col gap-12 mb-6 w-full max-w-3xl text-left">
      {/* 1. Basic Information Card */}
      <SummaryCard title="BASIC INFORMATION">
        <SummaryRow label="NAME" value={fullName} isAlt={true} />
        <SummaryRow label="NICKNAME" value={nickname || '-'} isAlt={false} />
        <SummaryRow label="PRONOUNS" value={pronouns || 'Prefer not to say'} isAlt={true} />
        <SummaryRow label="EMAIL ADDRESS" value={email || '-'} isAlt={false} />
        <SummaryRow label="CONTACT NUMBER" value={contactNumber || '-'} isAlt={true} />
        <SummaryRow label="AFFILIATION" value={organization || '-'} isAlt={false} />
        <SummaryRow label="ROLE IN TECH" value={jobTitle || '-'} isAlt={true} />
        <SummaryRow label="SOCIALS" value={formatSocials()} isAlt={false} />
      </SummaryCard>

      {/* 2. Ticket Selection Card */}
      <SummaryCard title="TICKET SELECTION">
        <SummaryRow label="PACKAGE" value={ticketType?.name || (event.paidEvent ? 'Standard' : 'Free Registration')} isAlt={true} />
        <SummaryRow label="SPRINT DAY" value={sprintDay ? 'Yes' : 'No'} isAlt={false} />

        {event.paidEvent && event.status !== 'preregistration' && (
          <>
            <SummaryRow label="PRICE" value={formatMoney(effectivePrice, 'PHP')} isAlt={true} />

            {discountPercentage && validCode && discountedPrice ? (
              <>
                <SummaryRow label="DISCOUNT CODE" value={validCode} isAlt={false} />
                <SummaryRow label="DISCOUNT" value={formatPercentage(discountPercentage)} isAlt={true} />
                <SummaryRow label="DISCOUNTED PRICE" value={formatMoney(discountedPrice ?? effectivePrice, 'PHP')} isAlt={false} />
              </>
            ) : null}

            {sprintDay && event.sprintDayPrice ? <SummaryRow label="SPRINT DAY FEE" value={formatMoney(event.sprintDayPrice, 'PHP')} isAlt={true} /> : null}

            <SummaryRow label="TRANSACTION FEE" value={transactionFee ? formatMoney(transactionFee, 'PHP') : 'None'} isAlt={false} />
            <SummaryRow
              label="TOTAL"
              value={<span className="font-extrabold text-neutral-900">{formatMoney(total ?? effectivePrice, 'PHP')}</span>}
              isAlt={true}
            />
          </>
        )}
      </SummaryCard>

      {/* 3. Miscellaneous Card */}
      <SummaryCard title="MISCELLANEOUS">
        <SummaryRow label="TECH COMMUNITY MEMBER?" value={communityInvolvement ? 'Yes' : 'No'} isAlt={true} />
        <SummaryRow label="VOLUNTEER IN FUTURE?" value={futureVolunteer ? 'Yes' : 'No'} isAlt={false} />
        <SummaryRow label="DIETARY RESTRICTIONS" value={dietaryRestrictions || 'None'} isAlt={true} />
        <SummaryRow label="ACCESSIBILITY NEEDS" value={accessibilityNeeds || 'None'} isAlt={false} />
      </SummaryCard>

      {/* 4. Promotions & Verification Card */}
      <SummaryCard title="PROMOTIONS & VERIFICATION">
        <SummaryRow label="DISCOUNT CODE" value={validCode || 'None'} isAlt={false} />
        <SummaryRow label="UPLOADED ID" value={getUploadedIdDisplay()} isAlt={true} />
      </SummaryCard>

      {/* 5. Consent Section */}
      <div className="flex flex-col mt-2">
        <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-400 text-left mb-5">CONSENT</p>

        <div className="flex flex-col">
          <FormItem name="agreeToDataUse">
            {({ field }) => (
              <div className="flex flex-col">
                <div className="flex items-center space-x-3">
                  <Checkbox pyconStyles id="agreeToDataUse" checked={field.value} onCheckedChange={field.onChange} />
                  <Label htmlFor="agreeToDataUse" className="text-xs sm:text-sm font-medium cursor-pointer text-neutral-800">
                    I consent to event photography, data processing, and receiving event updates
                  </Label>
                </div>
                <FormError />
              </div>
            )}
          </FormItem>

          <FormItem name="agreeToCodeOfConduct">
            {({ field }) => (
              <div className="flex flex-col">
                <div className="flex items-center space-x-3">
                  <Checkbox pyconStyles id="agreeToCodeOfConduct" checked={field.value} onCheckedChange={field.onChange} />
                  <Label htmlFor="agreeToCodeOfConduct" className="text-xs sm:text-sm font-medium cursor-pointer text-neutral-800">
                    I have read and agree to the{' '}
                    <a
                      href={PYCON_CODE_OF_CONDUCT}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#04b1a4] underline hover:text-[#038e83] transition-colors font-semibold"
                    >
                      Code of Conduct
                    </a>
                  </Label>
                </div>
                <FormError />
              </div>
            )}
          </FormItem>
        </div>
      </div>
    </div>
  );
};

export default SummaryStep;
