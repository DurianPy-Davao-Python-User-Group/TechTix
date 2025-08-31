import json
import os
from datetime import datetime, timezone

import boto3
import ulid
from constants.common_constants import EmailType
from model.email.email import EmailIn
from model.payments.payments import PaymentTransactionOut, TransactionStatus
from model.registrations.registration import Registration
from pydantic import BaseModel
from usecase.email_usecase import EmailUsecase
from utils.logger import logger


class PaymentTrackingBody(BaseModel):
    class Config:
        extra = 'ignore'

    registration_details: PaymentTransactionOut
    status: TransactionStatus


SQS = boto3.client('sqs')
PAYMENT_QUEUE = os.environ.get('PAYMENT_QUEUE')


def handler(event, context):
    _ = context
    email_usecase = EmailUsecase()

    for record in event.get('Records', []):
        logger.info(f'Received record: {record}')
        try:
            message_body = json.loads(record['body'])
            # for message in message_body:
            logger.info(f'Processing message: {message_body}')
            payment_tracking_body = PaymentTrackingBody(**message_body)
            registration_details = payment_tracking_body.registration_details
            status = payment_tracking_body.status
            registration_data = registration_details.registrationData

            if status == TransactionStatus.SUCCESS:
                subject = 'Registration Successful'
                body = [
                    'Thank you for registering for PyCon Davao 2025! We are excited to have you join us for this amazing event.',
                    'Your payment has been successfully processed. Below are your registration details:',
                ]

            else:
                subject = 'Payment Unsuccessful'
                body = ['Your payment was not successful. Please try again later.']

            email_in = EmailIn(
                to=[registration_data.email],
                subject=subject,
                salutation=f'Hi {registration_data.firstName},',
                body=body,
                regards=['Best,'],
                emailType=EmailType.REGISTRATION_EMAIL,
                eventId=registration_details.eventId,
                isDurianPy=True,
            )

            email_usecase.send_email(email_in, registration_data)

            if status == TransactionStatus.SUCCESS:
                registration_id = str(ulid.ulid())
                current_date = datetime.now(timezone.utc).isoformat()
                hash_key = str(ulid.ulid())

                registration_item = Registration(
                    hashKey=registration_data.eventId or registration_id,
                    rangeKey=hash_key,
                    registrationId=registration_id,
                    createDate=current_date,
                    updateDate=current_date,
                    email=registration_data.email,
                    firstName=registration_data.firstName,
                    lastName=registration_data.lastName,
                    nickname=registration_data.nickname,
                    pronouns=registration_data.pronouns,
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
                    amountPaid=registration_details.amountPaid,
                    transactionId=registration_details.transactionId,
                    paymentId=registration_details.paymentId,
                    referenceNumber=registration_details.referenceNumber,
                    gcashPayment=registration_details.gcashPayment,
                    registrationEmailSent=True,
                    confirmationEmailSent=True,
                    eventId=registration_details.eventId,
                    entryStatus=status,
                )
                registration_item.save()
                logger.info(f'Successfully saved registration for {registration_data.email}')

        except Exception as e:
            logger.error(f"Failed to process message for {record.get('receiptHandle', 'N/A')}: {e}")
            continue

        finally:
            SQS.delete_message(QueueUrl=PAYMENT_QUEUE, ReceiptHandle=record['receiptHandle'])
            logger.info(f'Processed payment tracking for {registration_data.email} with status: {status}')
