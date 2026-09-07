from http import HTTPStatus
from typing import Optional

from fastapi.responses import JSONResponse
from model.email.email import EmailIn, EmailType
from model.events.event import Event
from model.payments.payments import PaymentTransactionOut
from model.registrations.registration import Registration
from repository.events_repository import EventsRepository
from repository.registrations_repository import RegistrationsRepository
from usecase.email_usecase import EmailUsecase
from utils.logger import log_execution, logger, mask_email


DURIANPY_BCC_EMAIL = 'durianpy.davao+email_service@gmail.com'


class PyConRegistrationEmailNotification:
    def __init__(self) -> None:
        self.__email_usecase = EmailUsecase()
        self.__registrations_repository = RegistrationsRepository()
        self.__events_repository = EventsRepository()

    @log_execution
    def send_registration_success_email(
        self,
        email: str,
        event: Event,
        is_pycon_event: bool = True,
        registration_data: Optional[Registration] = None,
        bcc: Optional[list[str]] = None,
    ) -> None:
        masked_email = mask_email(email)
        logger.info(
            f'Preparing to send registration success email to {masked_email} for event {event.name} (event_id={event.eventId})'
        )
        if not registration_data:
            _, registration, _ = self.__registrations_repository.query_registrations_with_email(
                email=email, event_id=event.eventId
            )
            registration_data = registration[0] if registration else None

        if not registration_data:
            logger.error(f'No registration found for email: {masked_email} and event_id: {event.eventId}')
            return

        ticket_type_val = (
            registration_data.ticketType.value
            if hasattr(registration_data.ticketType, 'value')
            else registration_data.ticketType
        )

        details = [
            f'Email: {email}',
            f'Registration ID: {registration_data.registrationId}',
            f'Ticket Type: {str(ticket_type_val).capitalize() if ticket_type_val else "N/A"}',
            f'Sprint Day Participation: {"Yes" if registration_data.sprintDay else "No"}',
            f'Amount Paid: ₱{registration_data.amountPaid if registration_data.amountPaid else "0"}',
            f'Transaction ID: {registration_data.transactionId if registration_data.transactionId else "N/A"}',
        ]

        contact_email = 'durianpy.davao@gmail.com' if is_pycon_event else (event.email or 'durianpy.davao@gmail.com')
        bcc_list = list({DURIANPY_BCC_EMAIL, *(b for b in (bcc or []) if b)})

        body = [
            f"Thank you for registering for {event.name}! Your payment was successful, and we're excited to see you at the event."
            if not is_pycon_event
            else "Thank you for registering for PyCon Davao 2026 by DurianPy! Your payment was successful, and we're excited to see you at the event.",
            self.__email_bold_element('Below is a summary of your registration details:'),
            self.__email_list_elements(details),
            self.__email_newline_element(),
            f"If you have any questions or need assistance, please don't hesitate to reach out to us at {contact_email}. We're here to help!",
            self.__email_newline_element(),
            'See you at the event!',
        ]

        email_in = EmailIn(
            to=[email],
            cc=None,
            bcc=bcc_list,
            subject=f"You're all set for {event.name}!"
            if not is_pycon_event
            else "You're all set for PyCon Davao 2026!",
            salutation=f'Dear {registration_data.firstName},'
            if registration_data and registration_data.firstName
            else 'Dear Attendee,',
            body=body,
            regards=['Best,'],
            emailType=EmailType.REGISTRATION_EMAIL,
            eventId=str(event.eventId),
            isDurianPy=is_pycon_event,
        )
        self.__email_usecase.send_email(email_in=email_in, event=event)
        logger.info(
            f'Registration success email sent to {masked_email} for event {event.name} '
            f'(event_id={event.eventId}, registration_id={registration_data.registrationId})'
        )

    @log_execution
    def send_registration_failure_email(
        self,
        email: str,
        event: Event,
        payment_transaction: PaymentTransactionOut,
        is_pycon_event: bool = True,
        bcc: Optional[list[str]] = None,
    ) -> None:
        masked_email = mask_email(email)
        tx_id = (
            payment_transaction.transactionId
            or getattr(payment_transaction, 'entryId', None)
            or 'N/A'
        )
        logger.info(
            f'Preparing to send registration failure email to {masked_email} for event {event.name} '
            f'(event_id={event.eventId}, transaction_id={tx_id})'
        )

        details = [
            f'Email: {email}',
            f'Transaction ID: {tx_id}',
        ]

        bcc_list = list({DURIANPY_BCC_EMAIL, *(b for b in (bcc or []) if b)})

        body = [
            f'There was an issue processing your payment for {event.name}. Please check your payment details or try again.',
            self.__email_bold_element('Payment details:'),
            self.__email_list_elements(details),
            self.__email_newline_element(),
            f'If the problem persists, please contact our support team at durianpy.davao@gmail.com and present your transaction ID: {tx_id}.'
            if is_pycon_event
            else f'If the problem persists, please contact our support team at {event.email} and present your transaction ID: {tx_id}.',
        ]

        email_in = EmailIn(
            to=[email],
            cc=None,
            bcc=bcc_list,
            subject=f'Issue with your {event.name} Payment'
            if not is_pycon_event
            else 'Issue with your PyCon Davao 2026 Payment',
            salutation='Dear Attendee,'
            if not payment_transaction.registrationData
            else f'Dear {payment_transaction.registrationData.firstName},',
            body=body,
            regards=['Sincerely,'],
            emailType=EmailType.REGISTRATION_EMAIL,
            eventId=event.eventId,
            isDurianPy=is_pycon_event,
        )

        self.__email_usecase.send_email(email_in=email_in, event=event)
        logger.info(
            f'Registration failure email sent to {masked_email} for event {event.name} '
            f'(event_id={event.eventId}, transaction_id={tx_id})'
        )

    @log_execution
    def resend_confirmation_email(self, event_id: str, email: str) -> JSONResponse:
        masked_email = mask_email(email)
        logger.info(f'Processing resend confirmation email request for email={masked_email}, event_id={event_id}')
        event_status, event_detail, event_message = self.__events_repository.query_events(event_id=event_id)
        if isinstance(event_detail, list):
            event_detail = event_detail[0] if event_detail else None

        if event_status != HTTPStatus.OK or not isinstance(event_detail, Event):
            logger.error(
                f'Event not found for event_id={event_id} while resending confirmation email to {masked_email}: {event_message}'
            )
            return JSONResponse(status_code=event_status or HTTPStatus.NOT_FOUND, content={'message': event_message})

        reg_status, registrations, reg_message = self.__registrations_repository.query_registrations_with_email(
            event_id=event_id, email=email
        )

        if reg_status != HTTPStatus.OK or not registrations or not registrations[0].transactionId:
            message = reg_message if reg_message else 'Registration not found or incomplete.'
            logger.warning(
                f'Registration not found or incomplete for email={masked_email}, event_id={event_id}: {message}'
            )
            return JSONResponse(status_code=HTTPStatus.NOT_FOUND, content={'message': message})

        logger.info(
            f'Found registration for email={masked_email} and event={event_detail.name} (event_id={event_id}), '
            f'resending confirmation email.'
        )

        try:
            self.send_registration_success_email(
                email=email,
                event=event_detail,
                is_pycon_event=True,
                registration_data=registrations[0],
            )
            logger.info(f'Resent confirmation email to {masked_email} for event_id={event_id}')
            return JSONResponse(status_code=HTTPStatus.OK, content={'message': f'Confirmation email sent to {email}'})
        except Exception as e:
            logger.error(f'Failed to resend confirmation email to {masked_email} for event_id={event_id}: {e}')
            return JSONResponse(
                status_code=HTTPStatus.INTERNAL_SERVER_ERROR, content={'message': 'Failed to send email.'}
            )

    def __email_list_elements(self, elements: list[str]) -> str:
        return '\n'.join([f'<li>{element}</li>' for element in elements])

    def __email_bold_element(self, element: str) -> str:
        return f'<b>{element}</b>'

    def __email_newline_element(self) -> str:
        return '<br/>'
