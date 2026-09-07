from datetime import datetime, timezone
from http import HTTPStatus
from typing import Optional

import ulid
from model.events.event import Event
from model.payments.payments import PaymentTrackingBody, TransactionStatus
from model.pycon_registrations.pycon_registration import PyconRegistrationIn
from model.registrations.registration import Registration
from repository.events_repository import EventsRepository
from repository.payment_transaction_repository import PaymentTransactionRepository
from repository.registrations_repository import RegistrationsRepository
from usecase.pycon_registration_email_notification import (
    PyConRegistrationEmailNotification,
)
from utils.logger import log_execution, logger, mask_email


class PaymentTrackingUsecase:
    def __init__(self):
        self.registration_repository = RegistrationsRepository()
        self.event_repository = EventsRepository()
        self.payment_transaction_repository = PaymentTransactionRepository()
        self.pycon_email_notification = PyConRegistrationEmailNotification()

    @log_execution
    def process_payment_event(self, message_body: dict, is_pycon_event: bool = True) -> None:
        """
        Processes a payment event message, updates the payment transaction status,
        and stores the registration details.
        """
        try:
            self._update_timestamps(message_body)
            payment_tracking_body = PaymentTrackingBody(**message_body)

            registration_details = payment_tracking_body.registration_details
            transaction_status = payment_tracking_body.status
            registration_data = registration_details.registrationData
            event_id = registration_details.eventId
            entry_id = registration_details.entryId
            masked_email = (
                mask_email(registration_data.email)
                if registration_data and registration_data.email
                else 'unknown'
            )
            recorded_registration_data = None

            logger.info(
                f'Processing payment event message for entry_id={entry_id}, event_id={event_id}, '
                f'status={transaction_status}, email={masked_email}'
            )

            if transaction_status == TransactionStatus.PENDING:
                logger.info(
                    f'Skipping PENDING payment event for entry_id={entry_id}, event_id={event_id}, email={masked_email}'
                )
                return

            _, event_detail, _ = self.event_repository.query_events(event_id)
            if not event_detail:
                logger.error(f'Event details not found for event_id={event_id}, entry_id={entry_id}')
                raise ValueError(f'Event details not found for eventId: {event_id}')

            # Update Payment Transaction Status
            status, _, msg = self.payment_transaction_repository.update_payment_transaction_status(
                event_id=event_id, payment_transaction_id=entry_id, status=transaction_status
            )

            if status != HTTPStatus.OK:
                logger.error(
                    f'Failed to update payment transaction status to {transaction_status} for entry_id={entry_id}, '
                    f'event_id={event_id}: {msg}'
                )
                return

            logger.info(
                f'Payment transaction status updated to {transaction_status} for entry_id={entry_id}, event_id={event_id}'
            )

            status, existing_registrations, _ = self.registration_repository.query_registrations_with_email(
                event_id=event_id, email=registration_data.email
            )

            if status == HTTPStatus.OK and existing_registrations:
                logger.info(
                    f'Skipping duplicate registration for entry_id={entry_id}, event_id={event_id}, '
                    f'email={masked_email} - user already has existing registration'
                )
                return

            if transaction_status == TransactionStatus.SUCCESS:
                recorded_registration_data = self._create_and_save_registration(
                    payment_tracking_body=payment_tracking_body
                )
                if not recorded_registration_data:
                    logger.error(
                        f'Failed to save registration for entry_id={entry_id}, event_id={event_id}, email={masked_email}'
                    )
                else:
                    logger.info(
                        f'Registration created via payment tracking for entry_id={entry_id}, '
                        f'event_id={event_id}, email={masked_email}'
                    )

            elif transaction_status == TransactionStatus.FAILED:
                status, registrations, msg = self.registration_repository.query_registrations_with_email(
                    event_id=event_id, email=registration_data.email
                )
                if status == HTTPStatus.OK and registrations:
                    logger.info(
                        f'Skipping failed payment email for entry_id={entry_id}, event_id={event_id}, '
                        f'email={masked_email} - user already has existing registration'
                    )
                    return

            if transaction_status == TransactionStatus.SUCCESS:
                logger.info(
                    f'Triggering registration success email for entry_id={entry_id}, event_id={event_id}, email={masked_email}'
                )
                self.pycon_email_notification.send_registration_success_email(
                    email=registration_data.email,
                    event=event_detail,
                    is_pycon_event=is_pycon_event,
                    registration_data=recorded_registration_data,
                )
            elif transaction_status == TransactionStatus.FAILED:
                logger.info(
                    f'Triggering registration failure email for entry_id={entry_id}, event_id={event_id}, email={masked_email}'
                )
                self.pycon_email_notification.send_registration_failure_email(
                    email=registration_data.email,
                    event=event_detail,
                    payment_transaction=registration_details,
                    is_pycon_event=is_pycon_event,
                )
            logger.info(
                f'Successfully processed payment event for entry_id={entry_id}, event_id={event_id}, '
                f'status={transaction_status}, email={masked_email}'
            )

        except Exception as e:
            entry_id = (
                message_body.get('registration_details', {}).get('entryId', 'unknown')
                if isinstance(message_body, dict)
                else 'unknown'
            )
            event_id = (
                message_body.get('registration_details', {}).get('eventId', 'unknown')
                if isinstance(message_body, dict)
                else 'unknown'
            )
            logger.error(f'Failed to process payment event for entry_id={entry_id}, event_id={event_id}: {e}')
            raise

    def _update_timestamps(self, message_body: dict):
        registration_details = message_body.get('registration_details')
        if registration_details and 'registrationData' in registration_details:
            current_time = datetime.now(timezone.utc).isoformat()
            registration_data = registration_details['registrationData']

            if 'createDate' not in registration_data:
                registration_data['createDate'] = current_time

            registration_data['updateDate'] = current_time

    def _create_and_save_registration(self, payment_tracking_body: PaymentTrackingBody):
        registration_id = str(ulid.ulid())
        current_date = datetime.now(timezone.utc).isoformat()
        registration_details = payment_tracking_body.registration_details
        registration_data = registration_details.registrationData

        registration_in = PyconRegistrationIn(
            hashKey=registration_data.eventId or registration_id,
            rangeKey=registration_details.entryId,
            registrationId=registration_id,
            createDate=current_date,
            updateDate=current_date,
            email=registration_data.email,
            firstName=registration_data.firstName,
            lastName=registration_data.lastName,
            nickname=registration_data.nickname,
            pronouns=registration_data.pronouns,
            facebookLink=registration_data.facebookLink if registration_data.facebookLink else None,
            linkedInLink=registration_data.linkedInLink if registration_data.linkedInLink else None,
            contactNumber=registration_data.contactNumber,
            organization=registration_data.organization,
            jobTitle=registration_data.jobTitle,
            ticketType=registration_data.ticketType.value,
            sprintDay=registration_data.sprintDay,
            availTShirt=registration_data.availTShirt,
            shirtType=registration_data.shirtType.value if registration_data.shirtType else None,
            shirtSize=registration_data.shirtSize.value if registration_data.shirtSize else None,
            communityInvolvement=registration_data.communityInvolvement,
            futureVolunteer=registration_data.futureVolunteer,
            dietaryRestrictions=registration_data.dietaryRestrictions,
            accessibilityNeeds=registration_data.accessibilityNeeds,
            discountCode=registration_data.discountCode,
            validIdObjectKey=registration_data.validIdObjectKey,
            amountPaid=registration_details.amountPaid or registration_details.price,
            transactionId=registration_details.entryId,
            paymentId=registration_details.paymentId,
            referenceNumber=registration_details.referenceNumber,
            gcashPayment=registration_details.gcashPayment,
            registrationEmailSent=True,
            confirmationEmailSent=True,
            eventId=registration_details.eventId,
            entryStatus=payment_tracking_body.status.value,
        )

        status, stored_registration, message = self.registration_repository.store_registration(
            registration_in=registration_in, registration_id=registration_id
        )

        if status == HTTPStatus.OK:
            logger.info(
                f'Registration stored successfully with status={status}, registration_id={registration_id}, '
                f'event_id={registration_in.eventId}, email={mask_email(registration_in.email)}, '
                f'ticket_type={registration_in.ticketType}'
            )
        else:
            logger.error(
                f'Failed to store registration with status={status}, registration_id={registration_id}, '
                f'event_id={registration_in.eventId}, email={mask_email(registration_in.email)}: {message}'
            )

        return stored_registration


