import { FC, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import moment from 'moment';
import { Facebook, Instagram, Linkedin, ShoppingBag } from 'lucide-react';
import Button from '@/components/Button';
import Icon from '@/components/Icon';
import ImageViewer from '@/components/ImageViewer';
import Modal from '@/components/Modal';
import Skeleton from '@/components/Skeleton';
import { getEvent } from '@/api/events';
import { getEventRegistrationWithEmail } from '@/api/pycon/registrations';
import { formatMoney } from '@/utils/functions';
import { useApiQuery } from '@/hooks/useApi';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import PyconBackground from '@/routes/layouts/PyconBackground';
import { SummaryCard, SummaryRow } from './steps/SummaryCard';

const UserInfoPage = () => {
  const { eventId } = useParams();
  const auth = useCurrentUser();

  const [showModal, setShowModal] = useState(false);

  const { data: event, isPending: eventPending } = useApiQuery(getEvent(eventId!));
  const { data: registration, isPending: registrationPending } = useApiQuery(getEventRegistrationWithEmail(eventId!, auth?.user?.email!));

  if (eventPending || registrationPending) {
    return <Skeleton className="w-full h-full" />;
  }

  if (!registration?.data || !event?.data) {
    return <Navigate to={`/${eventId}/register`} />;
  }

  const { name, startDate, endDate, venue } = event.data;

  const {
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
    ticketType,
    sprintDay,
    discountCode,
    amountPaid,
    communityInvolvement,
    futureVolunteer,
    dietaryRestrictions,
    accessibilityNeeds,
    validIdObjectKey
  } = registration.data;

  const isSameDayEvent = moment(startDate).isSame(endDate, 'day');
  const getDate = () => {
    if (isSameDayEvent) {
      return `${moment(startDate).format('MMMM Do YYYY, h:mm A')} - ${moment(endDate).format('LT')}`;
    }
    return `${moment(startDate).format('MMMM Do YYYY, h:mm A')} - ${moment(endDate).format('MMMM Do YYYY')}`;
  };

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
    return parts[parts.length - 1] || 'Uploaded ID';
  };

  return (
    <div className="flex flex-col grow w-full">
      <section className="flex flex-col grow space-y-8 text-pycon-dark-blue max-w-3xl w-full mx-auto pt-4 md:pt-10 pb-28 px-4 font-inter">
        {/* 1. Event Header Confirmation Card */}
        <div className="w-full text-left rounded-3xl sm:rounded-[2.5rem] bg-white/85 backdrop-blur-md border border-[#F995081F] p-6 sm:p-8 md:p-10 shadow-[0px_6px_40px_0px_#F9950812] flex flex-col gap-5">
          <div className="space-y-2 text-left w-full">
            <p className="text-xs sm:text-sm font-extrabold tracking-[0.16em] text-[#04b1a4] uppercase font-inter">
              REGISTRATION CONFIRMED
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#04b1a4] md:text-[#F99508] font-sora tracking-tight leading-tight">
              See you at {name}!
            </h1>
            <p className="text-sm sm:text-base text-pycon-dark-blue/80 font-inter">
              Please follow DurianPy&apos;s social media accounts and check your email for updates!
            </p>
          </div>

          <div className="w-full grid grid-cols-[auto_1fr] text-pycon-dark-blue justify-center items-center gap-x-3.5 gap-y-2.5 font-inter text-left pt-3 border-t border-[#072E4714]">
            <Icon name="Clock" size={18} className="col-span-1 text-pycon-teal shrink-0" />
            <p className="text-sm sm:text-base col-span-1 font-inter font-medium text-pycon-dark-blue/80">{getDate()}</p>

            <Icon name="MapPin" size={18} className="col-span-1 text-pycon-teal shrink-0" />
            <p className="text-sm sm:text-base col-span-1 font-inter font-medium text-pycon-dark-blue/80">{venue}</p>
          </div>
        </div>

        {/* 2. Registration Details Card with frosted background to prevent contrast clash with snake tail */}
        <div className="flex flex-col gap-8 w-full text-left rounded-3xl sm:rounded-[2.5rem] bg-white/85 backdrop-blur-md border border-[#F995081F] p-6 sm:p-8 md:p-10 shadow-[0px_6px_40px_0px_#F9950812]">
          <div>
            <h2 className="font-sora text-xl sm:text-2xl font-bold text-pycon-dark-blue">
              Registration Details
            </h2>
            <p className="text-xs sm:text-sm text-pycon-dark-blue/60 font-inter mt-1">
              Summary of your registered information
            </p>
          </div>

          {/* Basic Information Card */}
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

          {/* Ticket Selection Card */}
          <SummaryCard title="TICKET SELECTION">
            <SummaryRow label="PACKAGE" value={ticketType || 'Standard'} isAlt={true} />
            <SummaryRow label="SPRINT DAY" value={sprintDay ? 'Yes' : 'No'} isAlt={false} />
            {discountCode ? <SummaryRow label="DISCOUNT CODE" value={discountCode} isAlt={true} /> : null}
            <SummaryRow
              label="AMOUNT PAID"
              value={<span className="font-extrabold text-neutral-900">{formatMoney(amountPaid, 'PHP')}</span>}
              isAlt={!discountCode}
            />
          </SummaryCard>

          {/* Miscellaneous Card */}
          <SummaryCard title="MISCELLANEOUS">
            <SummaryRow label="TECH COMMUNITY MEMBER?" value={communityInvolvement ? 'Yes' : 'No'} isAlt={true} />
            <SummaryRow label="VOLUNTEER IN FUTURE?" value={futureVolunteer ? 'Yes' : 'No'} isAlt={false} />
            <SummaryRow label="DIETARY RESTRICTIONS" value={dietaryRestrictions || 'None'} isAlt={true} />
            <SummaryRow label="ACCESSIBILITY NEEDS" value={accessibilityNeeds || 'None'} isAlt={false} />
          </SummaryCard>

          {/* Promotions & Verification Card */}
          <SummaryCard title="PROMOTIONS & VERIFICATION">
            <SummaryRow label="DISCOUNT CODE" value={discountCode || 'None'} isAlt={true} />
            <SummaryRow
              label="UPLOADED ID"
              value={
                validIdObjectKey ? (
                  <div className="flex items-center gap-3">
                    <span className="truncate max-w-[180px] sm:max-w-[240px]" title={getUploadedIdDisplay()}>
                      {getUploadedIdDisplay()}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowModal(true)}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#04b1a4]/10 text-[#04b1a4] hover:bg-[#04b1a4]/20 cursor-pointer transition-colors shrink-0"
                    >
                      View ID
                    </button>
                  </div>
                ) : (
                  'None'
                )
              }
              isAlt={false}
            />
          </SummaryCard>

          {validIdObjectKey && (
            <div className="flex justify-center w-full pt-2">
              <Button
                className="cursor-pointer bg-white text-pycon-dark-blue border border-[#072E4714] shadow-xs hover:bg-neutral-50 rounded-2xl px-8 py-3.5 font-semibold text-sm"
                onClick={() => setShowModal(true)}
              >
                View submitted ID
              </Button>
            </div>
          )}
        </div>

        {/* 3. Merch Announcement & Social Media Card */}
        <div className="w-full text-left rounded-3xl sm:rounded-[2.5rem] bg-white/85 backdrop-blur-md border border-[#F995081F] p-6 sm:p-8 md:p-10 shadow-[0px_6px_40px_0px_#F9950812] flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-[#F99508]/15 text-[#F99508] shrink-0">
              <ShoppingBag className="w-5 h-5 text-[#F99508]" />
            </div>
            <div>
              <h3 className="font-sora text-xl sm:text-2xl font-bold text-pycon-dark-blue">
                Interested in PyCon Merch?
              </h3>
              <p className="text-xs sm:text-sm text-pycon-dark-blue/60 font-inter">
                Stay tuned on our official social media channels
              </p>
            </div>
          </div>

          <p className="text-sm sm:text-base text-pycon-dark-blue/80 font-inter leading-relaxed">
            If you&apos;re interested in buying official PyCon merchandise, look out for upcoming posts and updates on DurianPy&apos;s social media pages:
          </p>

          <div className="flex flex-wrap gap-3 pt-1">
            <a
              href="https://www.facebook.com/durianpy"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-2xl bg-white hover:bg-neutral-50 text-pycon-dark-blue text-xs sm:text-sm font-semibold border border-[#072E4714] shadow-xs transition-all hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0"
            >
              <Facebook className="w-4 h-4 text-[#1877F2] shrink-0" />
              <span>Facebook</span>
            </a>
            <a
              href="https://www.instagram.com/durianpy.dvo/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-2xl bg-white hover:bg-neutral-50 text-pycon-dark-blue text-xs sm:text-sm font-semibold border border-[#072E4714] shadow-xs transition-all hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0"
            >
              <Instagram className="w-4 h-4 text-[#E4405F] shrink-0" />
              <span>Instagram</span>
            </a>
            <a
              href="https://www.linkedin.com/company/durianpy"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-2xl bg-white hover:bg-neutral-50 text-pycon-dark-blue text-xs sm:text-sm font-semibold border border-[#072E4714] shadow-xs transition-all hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0"
            >
              <Linkedin className="w-4 h-4 text-[#0A66C2] shrink-0" />
              <span>LinkedIn</span>
            </a>
          </div>
        </div>

        <UserIdModal eventId={eventId!} validIdObjectKey={validIdObjectKey} showModal={showModal} setShowModal={setShowModal} />
      </section>

      <PyconBackground />
    </div>
  );
};

interface UserIdModalProps {
  eventId: string;
  validIdObjectKey: string;
  showModal: boolean;
  setShowModal: (value: boolean) => void;
}

const UserIdModal: FC<UserIdModalProps> = ({ eventId, showModal, validIdObjectKey, setShowModal }) => {
  return (
    <Modal modalTitle="Submitted ID" visible={showModal} onOpenChange={setShowModal} className="md:max-w-2xl bg-white rounded-3xl border border-[#072E4714] text-pycon-dark-blue">
      <div className="flex flex-col w-full items-center justify-center p-2">
        <ImageViewer eventId={eventId} objectKey={validIdObjectKey} className="max-h-[70vh] w-auto max-w-full object-contain rounded-xl" />
      </div>
    </Modal>
  );
};

export const Component = UserInfoPage;

export default UserInfoPage;
