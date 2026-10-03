"""Unit tests for PyconRegistrationUsecase."""

from http import HTTPStatus
import unittest
from unittest.mock import MagicMock, patch

from model.events.events_constants import EventStatus
from model.pycon_registrations.pycon_registration import (
    PyconRegistrationIn,
    TicketTypes,
)
from usecase.pycon_registration_usecase import PyconRegistrationUsecase


class TestPyconRegistrationUsecase(unittest.TestCase):
    """Test suite for PyconRegistrationUsecase."""

    def setUp(self) -> None:
        self.patcher_events = patch(
            "usecase.pycon_registration_usecase.EventsRepository"
        )
        self.patcher_registrations = patch(
            "usecase.pycon_registration_usecase.RegistrationsRepository"
        )
        self.patcher_ticket_type = patch(
            "usecase.pycon_registration_usecase.TicketTypeRepository"
        )
        self.patcher_discounts = patch(
            "usecase.pycon_registration_usecase.DiscountUsecase"
        )
        self.patcher_payments = patch(
            "usecase.pycon_registration_usecase.PaymentTransactionRepository"
        )
        self.patcher_email = patch(
            "usecase.pycon_registration_usecase.PyConRegistrationEmailNotification"
        )

        self.mock_events_repo = self.patcher_events.start().return_value
        self.mock_registrations_repo = self.patcher_registrations.start().return_value
        self.mock_ticket_type_repo = self.patcher_ticket_type.start().return_value
        self.mock_discount_usecase = self.patcher_discounts.start().return_value
        self.mock_payments_repo = self.patcher_payments.start().return_value
        self.mock_email_notif = self.patcher_email.start().return_value

        self.usecase = PyconRegistrationUsecase()

    def tearDown(self) -> None:
        patch.stopall()

    def _create_mock_event(
        self,
        paid_event: bool = True,
        has_multiple_tickets: bool = True,
        sprint_day_price: float = 0.0,
    ) -> MagicMock:
        event = MagicMock()
        event.eventId = "test-event-id"
        event.status = EventStatus.OPEN.value
        event.registrationCount = 10
        event.isLimitedSlot = False
        event.maximumSlots = 100
        event.paidEvent = paid_event
        event.hasMultipleTicketTypes = has_multiple_tickets
        event.price = 0.0
        event.sprintDayPrice = sprint_day_price
        event.maximumSprintDaySlots = 50
        event.sprintDayRegistrationCount = 5
        return event

    def _create_registration_in(
        self,
        ticket_type: TicketTypes = TicketTypes.CODER,
        sprint_day: bool = False,
        discount_code: str = "",
        transaction_id: str = "",
    ) -> PyconRegistrationIn:
        return PyconRegistrationIn(
            eventId="test-event-id",
            email="test@example.com",
            firstName="John",
            lastName="Doe",
            nickname="JD",
            pronouns="he/him",
            contactNumber="+639123456789",
            organization="Tech Corp",
            jobTitle="Engineer",
            ticketType=ticket_type,
            sprintDay=sprint_day,
            availTShirt=False,
            communityInvolvement=False,
            futureVolunteer=False,
            discountCode=discount_code,
            transactionId=transaction_id,
            validIdObjectKey="id-key-123",
        )

    def test_free_ticket_price_succeeds_without_transaction_id(self) -> None:
        """When ticket price is 0 on a paidEvent, registration should succeed without a transaction ID."""
        event = self._create_mock_event(paid_event=True, has_multiple_tickets=True)
        self.mock_events_repo.query_events.return_value = (HTTPStatus.OK, event, None)
        self.mock_registrations_repo.query_registrations_with_email.return_value = (
            HTTPStatus.NOT_FOUND,
            [],
            None,
        )

        mock_ticket_type = MagicMock()
        mock_ticket_type.price = 0.0
        mock_ticket_type.maximumQuantity = 100
        mock_ticket_type.currentSales = 10
        mock_ticket_type.name = "Free Community Pass"
        self.mock_ticket_type_repo.query_ticket_type_with_ticket_type_id.return_value = (
            HTTPStatus.OK,
            mock_ticket_type,
            None,
        )

        mock_stored_reg = MagicMock()
        mock_stored_reg.registrationId = "reg-123"
        mock_stored_reg.registrationEmailSent = False
        mock_stored_reg.email = "test@example.com"
        mock_stored_reg.to_simple_dict.return_value = {
            "registrationId": "reg-123",
            "eventId": "test-event-id",
            "email": "test@example.com",
            "firstName": "John",
            "lastName": "Doe",
            "nickname": "JD",
            "pronouns": "he/him",
            "contactNumber": "+639123456789",
            "organization": "Tech Corp",
            "jobTitle": "Engineer",
            "ticketType": TicketTypes.CODER.value,
            "sprintDay": False,
            "availTShirt": False,
            "communityInvolvement": False,
            "futureVolunteer": False,
            "validIdObjectKey": "id-key-123",
            "createDate": "2026-10-03T18:00:00+08:00",
            "updateDate": "2026-10-03T18:00:00+08:00",
        }
        self.mock_registrations_repo.store_registration.return_value = (
            HTTPStatus.OK,
            mock_stored_reg,
            None,
        )
        self.mock_events_repo.append_event_registration_count.return_value = (
            HTTPStatus.OK,
            event,
            None,
        )
        self.mock_ticket_type_repo.append_ticket_type_sales.return_value = (
            HTTPStatus.OK,
            mock_ticket_type,
            None,
        )

        reg_in = self._create_registration_in(
            ticket_type=TicketTypes.CODER, transaction_id=""
        )

        with patch.object(
            self.usecase, "collect_pre_signed_url_pycon", side_effect=lambda x: x
        ):
            response = self.usecase.create_pycon_registration(reg_in)

        self.mock_payments_repo.query_payment_transaction_with_payment_transaction_id.assert_not_called()
        self.mock_registrations_repo.store_registration.assert_called_once()
        self.assertEqual(response.email, "test@example.com")

    def test_paid_ticket_price_requires_transaction_id(self) -> None:
        """When ticket price is > 0 on a paidEvent, missing transaction ID should return 400 Bad Request."""
        event = self._create_mock_event(paid_event=True, has_multiple_tickets=True)
        self.mock_events_repo.query_events.return_value = (HTTPStatus.OK, event, None)
        self.mock_registrations_repo.query_registrations_with_email.return_value = (
            HTTPStatus.NOT_FOUND,
            [],
            None,
        )

        mock_ticket_type = MagicMock()
        mock_ticket_type.price = 1500.0
        mock_ticket_type.maximumQuantity = 100
        mock_ticket_type.currentSales = 10
        mock_ticket_type.name = "Professional Ticket"
        self.mock_ticket_type_repo.query_ticket_type_with_ticket_type_id.return_value = (
            HTTPStatus.OK,
            mock_ticket_type,
            None,
        )

        reg_in = self._create_registration_in(
            ticket_type=TicketTypes.CODER, transaction_id=""
        )
        response = self.usecase.create_pycon_registration(reg_in)

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertIn(b"Transaction ID is required", response.body)

    def test_free_ticket_with_paid_sprint_day_requires_transaction_id(self) -> None:
        """When base ticket is 0 but sprint day has a fee, registration must require transaction ID."""
        event = self._create_mock_event(
            paid_event=True, has_multiple_tickets=True, sprint_day_price=500.0
        )
        self.mock_events_repo.query_events.return_value = (HTTPStatus.OK, event, None)
        self.mock_registrations_repo.query_registrations_with_email.return_value = (
            HTTPStatus.NOT_FOUND,
            [],
            None,
        )

        mock_ticket_type = MagicMock()
        mock_ticket_type.price = 0.0
        mock_ticket_type.maximumQuantity = 100
        mock_ticket_type.currentSales = 10
        mock_ticket_type.name = "Free Pass"
        self.mock_ticket_type_repo.query_ticket_type_with_ticket_type_id.return_value = (
            HTTPStatus.OK,
            mock_ticket_type,
            None,
        )

        reg_in = self._create_registration_in(
            ticket_type=TicketTypes.CODER, sprint_day=True, transaction_id=""
        )
        response = self.usecase.create_pycon_registration(reg_in)

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertIn(b"Transaction ID is required", response.body)

    def test_paid_ticket_with_100_percent_discount_succeeds_without_transaction_id(
        self,
    ) -> None:
        """When a 100% discount is applied, registration should succeed without a transaction ID."""
        event = self._create_mock_event(paid_event=True, has_multiple_tickets=True)
        self.mock_events_repo.query_events.return_value = (HTTPStatus.OK, event, None)
        self.mock_registrations_repo.query_registrations_with_email.return_value = (
            HTTPStatus.NOT_FOUND,
            [],
            None,
        )

        mock_ticket_type = MagicMock()
        mock_ticket_type.price = 1500.0
        mock_ticket_type.maximumQuantity = 100
        mock_ticket_type.currentSales = 10
        mock_ticket_type.name = "Professional Ticket"
        self.mock_ticket_type_repo.query_ticket_type_with_ticket_type_id.return_value = (
            HTTPStatus.OK,
            mock_ticket_type,
            None,
        )

        mock_discount = MagicMock()
        mock_discount.isReusable = True
        mock_discount.remainingUses = 5
        mock_discount.claimed = False
        mock_discount.discountPercentage = 1.0
        self.mock_discount_usecase.get_discount.return_value = mock_discount
        self.mock_discount_usecase.claim_discount.return_value = None

        mock_stored_reg = MagicMock()
        mock_stored_reg.registrationId = "reg-456"
        mock_stored_reg.registrationEmailSent = False
        mock_stored_reg.email = "discounted@example.com"
        mock_stored_reg.to_simple_dict.return_value = {
            "registrationId": "reg-456",
            "eventId": "test-event-id",
            "email": "discounted@example.com",
            "firstName": "Jane",
            "lastName": "Doe",
            "nickname": "JD",
            "pronouns": "she/her",
            "contactNumber": "+639123456789",
            "organization": "Tech Corp",
            "jobTitle": "Engineer",
            "ticketType": TicketTypes.CODER.value,
            "sprintDay": False,
            "availTShirt": False,
            "communityInvolvement": False,
            "futureVolunteer": False,
            "discountCode": "DISCOUNT100",
            "validIdObjectKey": "id-key-123",
            "createDate": "2026-10-03T18:00:00+08:00",
            "updateDate": "2026-10-03T18:00:00+08:00",
        }
        self.mock_registrations_repo.store_registration.return_value = (
            HTTPStatus.OK,
            mock_stored_reg,
            None,
        )
        self.mock_events_repo.append_event_registration_count.return_value = (
            HTTPStatus.OK,
            event,
            None,
        )
        self.mock_ticket_type_repo.append_ticket_type_sales.return_value = (
            HTTPStatus.OK,
            mock_ticket_type,
            None,
        )

        reg_in = self._create_registration_in(
            ticket_type=TicketTypes.CODER,
            discount_code="DISCOUNT100",
            transaction_id="",
        )
        reg_in.email = "discounted@example.com"

        with patch.object(
            self.usecase, "collect_pre_signed_url_pycon", side_effect=lambda x: x
        ):
            response = self.usecase.create_pycon_registration(reg_in)

        self.mock_payments_repo.query_payment_transaction_with_payment_transaction_id.assert_not_called()
        self.mock_registrations_repo.store_registration.assert_called_once()
        self.assertEqual(response.email, "discounted@example.com")
