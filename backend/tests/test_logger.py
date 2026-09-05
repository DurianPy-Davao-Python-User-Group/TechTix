"""Unit tests for the logger utility module."""

import asyncio
import logging
import os
import unittest
from concurrent.futures import ThreadPoolExecutor
from typing import Any
from unittest.mock import MagicMock, patch

from constants.common_constants import LogLevel
from utils.logger import (
    Logger,
    Settings,
    _ISOFormatter,
    log_execution,
    logger,
    mask_email,
    mask_string,
)


class CustomDomainException(Exception):
    """Custom domain exception for testing error mapping."""


class ZeroArgDomainException(Exception):
    """Custom domain exception that takes no arguments."""

    def __init__(self) -> None:
        super().__init__('Zero arg domain error')


class TestISOFormatter(unittest.TestCase):
    """Tests for _ISOFormatter."""

    def test_format_time(self) -> None:
        """Test formatting of timestamp into ISO 8601 format."""
        formatter = _ISOFormatter('%(asctime)s [%(levelname)s] %(message)s')
        record = logging.LogRecord(
            name='test',
            level=logging.INFO,
            pathname='test.py',
            lineno=1,
            msg='Hello World',
            args=(),
            exc_info=None,
        )
        formatted_time = formatter.formatTime(record)
        self.assertIsInstance(formatted_time, str)
        self.assertIn('T', formatted_time)
        formatted_record = formatter.format(record)
        self.assertIn(formatted_time, formatted_record)
        self.assertIn('[INFO] Hello World', formatted_record)

    def test_format_with_user_context(self) -> None:
        """Test that formatter tags [userid=] when user context is available."""
        formatter = _ISOFormatter('%(asctime)s [%(levelname)s] %(message)s')
        record = logging.LogRecord(
            name='test',
            level=logging.DEBUG,
            pathname='test.py',
            lineno=1,
            msg='Debugging details',
            args=(),
            exc_info=None,
        )
        with patch.dict(os.environ, {'CURRENT_USER': 'test-sub-123'}):
            formatted_record = formatter.format(record)
            self.assertIn('[userid=test-sub-123] Debugging details', formatted_record)

        # Test with record attribute user_id
        record2 = logging.LogRecord(
            name='test',
            level=logging.ERROR,
            pathname='test.py',
            lineno=1,
            msg='Something failed',
            args=(),
            exc_info=None,
        )
        record2.user_id = 'explicit-uid-456'
        with patch.dict(os.environ, {}, clear=True):
            formatted_record2 = formatter.format(record2)
            self.assertIn('[userid=explicit-uid-456] Something failed', formatted_record2)


class TestLogger(unittest.TestCase):
    """Tests for Logger singleton class."""

    def tearDown(self) -> None:
        """Reset the logger singleton after each test."""
        Logger._reset()

    def test_singleton_identity(self) -> None:
        """Test that multiple instantiations return the exact same instance."""
        inst1 = Logger()
        inst2 = Logger()
        self.assertIs(inst1, inst2)

    def test_singleton_thread_safety(self) -> None:
        """Test that concurrent instantiation across threads produces a single instance."""
        with ThreadPoolExecutor(max_workers=8) as executor:
            futures = [executor.submit(Logger) for _ in range(20)]
            instances = [f.result() for f in futures]

        first = instances[0]
        for inst in instances[1:]:
            self.assertIs(first, inst)

    def test_get_logger_factory(self) -> None:
        """Test get_logger class method."""
        inst = Logger.get_logger('custom_app', LogLevel.INFO)
        self.assertIsInstance(inst, Logger)
        inst2 = Logger.get_logger()
        self.assertIs(inst, inst2)

    def test_set_level(self) -> None:
        """Test setLevel with LogLevel enum, string, and integer."""
        logger_instance = Logger()
        logger_instance.setLevel(LogLevel.DEBUG)
        self.assertEqual(logger_instance.level, logging.DEBUG)

        logger_instance.setLevel('WARNING')
        self.assertEqual(logger_instance.level, logging.WARNING)

        logger_instance.setLevel(logging.ERROR)
        self.assertEqual(logger_instance.level, logging.ERROR)

    def test_delegation_to_inner_logger(self) -> None:
        """Test method and attribute delegation to logging.Logger."""
        logger_instance = Logger()
        with patch.object(logger_instance._Logger__logger, 'info') as mock_info:
            logger_instance.info('Test info message')
            mock_info.assert_called_once_with('Test info message')

        with patch.object(logger_instance._Logger__logger, 'error') as mock_error:
            logger_instance.error('Test error message')
            mock_error.assert_called_once_with('Test error message')

        with patch.object(logger_instance._Logger__logger, 'warning') as mock_warn:
            logger_instance.warning('Test warn message')
            mock_warn.assert_called_once_with('Test warn message')

        with patch.object(logger_instance._Logger__logger, 'debug') as mock_debug:
            logger_instance.debug('Test debug message')
            mock_debug.assert_called_once_with('Test debug message')

    def test_user_tagging_across_log_levels_with_env_user(self) -> None:
        """Test that debug, info, warning, error, critical, and exception include [userid=] from CURRENT_USER."""
        logger_instance = Logger()
        with patch.dict(os.environ, {'CURRENT_USER': 'test-auth-user'}):
            with patch.object(logger_instance._Logger__logger, 'debug') as mock_debug:
                logger_instance.debug('Checking cache hit')
                mock_debug.assert_called_once_with('[userid=test-auth-user] Checking cache hit')

            with patch.object(logger_instance._Logger__logger, 'error') as mock_error:
                logger_instance.error('Database query failed')
                mock_error.assert_called_once_with('[userid=test-auth-user] Database query failed')

            with patch.object(logger_instance._Logger__logger, 'info') as mock_info:
                logger_instance.info('User initiated checkout')
                mock_info.assert_called_once_with('[userid=test-auth-user] User initiated checkout')

            with patch.object(logger_instance._Logger__logger, 'warning') as mock_warn:
                logger_instance.warning('Rate limit approaching')
                mock_warn.assert_called_once_with('[userid=test-auth-user] Rate limit approaching')

            with patch.object(logger_instance._Logger__logger, 'critical') as mock_crit:
                logger_instance.critical('Fatal crash')
                mock_crit.assert_called_once_with('[userid=test-auth-user] Fatal crash')

            with patch.object(logger_instance._Logger__logger, 'exception') as mock_exc:
                logger_instance.exception('Unhandled exception')
                mock_exc.assert_called_once_with('[userid=test-auth-user] Unhandled exception')

    def test_user_tagging_across_log_levels_with_explicit_user_id(self) -> None:
        """Test that passing explicit user_id attaches [userid=] even if CURRENT_USER differs."""
        logger_instance = Logger()
        with patch.dict(os.environ, {'CURRENT_USER': 'env-user'}):
            with patch.object(logger_instance._Logger__logger, 'debug') as mock_debug:
                logger_instance.debug('Debug task', user_id='explicit-uid')
                mock_debug.assert_called_once_with('[userid=explicit-uid] Debug task')

            with patch.object(logger_instance._Logger__logger, 'error') as mock_error:
                logger_instance.error('Payment gateway error', user_id='explicit-uid')
                mock_error.assert_called_once_with('[userid=explicit-uid] Payment gateway error')

    def test_user_tagging_avoids_duplicate_tags(self) -> None:
        """Test that messages already containing [userid=] are not double-tagged."""
        logger_instance = Logger()
        with patch.dict(os.environ, {'CURRENT_USER': 'env-user'}):
            with patch.object(logger_instance._Logger__logger, 'debug') as mock_debug:
                logger_instance.debug('[userid=existing-user] Already tagged message')
                mock_debug.assert_called_once_with('[userid=existing-user] Already tagged message')

            with patch.object(logger_instance._Logger__logger, 'error') as mock_error:
                logger_instance.error('[userid=existing-user] Already tagged error')
                mock_error.assert_called_once_with('[userid=existing-user] Already tagged error')

    def test_getattr_raises_for_invalid_attribute(self) -> None:
        """Test that accessing invalid attributes raises AttributeError."""
        logger_instance = Logger()
        with self.assertRaises(AttributeError):
            _ = logger_instance.non_existent_attribute_xyz

    def test_aws_lambda_environment(self) -> None:
        """Test logger configuration when AWS_EXECUTION_ENV is set."""
        with patch.dict(os.environ, {'AWS_EXECUTION_ENV': 'AWS_Lambda_python3.11'}):
            Logger._reset()
            # Remove any existing handlers from previous test on root/custom loggers
            logger_instance = Logger(name='lambda_test_logger')
            self.assertFalse(logger_instance.propagate)
            self.assertTrue(len(logger_instance.handlers) > 0)
            record = logging.LogRecord(
                name='lambda_test_logger',
                level=logging.INFO,
                pathname='test.py',
                lineno=1,
                msg='Lambda execution',
                args=(),
                exc_info=None,
            )
            formatted = logger_instance.handlers[0].formatter.format(record)
            self.assertEqual(formatted, '[INFO] Lambda execution')

    def test_static_methods_available_on_class(self) -> None:
        """Test static methods on Logger class."""
        masked = Logger.mask_string('sensitive123')
        self.assertEqual(masked, mask_string('sensitive123'))

        @Logger.log_execution
        def sample() -> str:
            return 'done'

        self.assertEqual(sample(), 'done')


class SampleService:
    """Sample class to test class name extraction in log_execution."""

    @log_execution
    def instance_method(self, val: int) -> int:
        return val * 2

    @log_execution(CustomDomainException)
    def method_with_error(self) -> None:
        raise ValueError('inner value error')

    @classmethod
    @log_execution
    def class_method(cls, name: str) -> str:
        return f'Hello, {name}'


class TestLogExecution(unittest.TestCase):
    """Tests for log_execution decorator."""

    def tearDown(self) -> None:
        """Reset singleton."""
        Logger._reset()

    def test_sync_function_without_parentheses(self) -> None:
        """Test decorating sync function without parentheses."""
        @log_execution
        def calculate(a: int, b: int) -> int:
            return a + b

        with patch.object(logger._Logger__logger, 'info') as mock_info:
            result = calculate(2, 3)
            self.assertEqual(result, 5)
            self.assertTrue(mock_info.called)
            self.assertIn('calculate', mock_info.call_args_list[0][0][0])

    def test_sync_function_with_parentheses(self) -> None:
        """Test decorating sync function with empty parentheses."""
        @log_execution()
        def greet(name: str) -> str:
            return f'Hello {name}'

        result = greet('Python')
        self.assertEqual(result, 'Hello Python')

    def test_class_name_extraction(self) -> None:
        """Test class name extraction for instance and class methods."""
        service = SampleService()
        with patch.object(logger._Logger__logger, 'info') as mock_info:
            result = service.instance_method(5)
            self.assertEqual(result, 10)
            log_msg = mock_info.call_args_list[0][0][0]
            self.assertIn('SampleService', log_msg)
            self.assertIn('instance_method', log_msg)

        with patch.object(logger._Logger__logger, 'info') as mock_info:
            cls_result = SampleService.class_method('DurianPy')
            self.assertEqual(cls_result, 'Hello, DurianPy')
            log_msg = mock_info.call_args_list[0][0][0]
            self.assertIn('SampleService', log_msg)
            self.assertIn('class_method', log_msg)

    def test_async_function(self) -> None:
        """Test decorating async coroutine function."""
        @log_execution
        async def async_fetch(item_id: str) -> str:
            await asyncio.sleep(0.01)
            return f'item-{item_id}'

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            with patch.object(logger._Logger__logger, 'info') as mock_info:
                result = loop.run_until_complete(async_fetch('123'))
                self.assertEqual(result, 'item-123')
                self.assertTrue(mock_info.called)
        finally:
            loop.close()

    def test_exception_logging_and_re_raise(self) -> None:
        """Test that exceptions are logged and re-raised when no domain_exception is provided."""
        @log_execution
        def failing_func() -> None:
            raise KeyError('missing key')

        with patch.object(logger._Logger__logger, 'error') as mock_error:
            with self.assertRaises(KeyError):
                failing_func()
            self.assertTrue(mock_error.called)
            error_msg = mock_error.call_args_list[0][0][0]
            self.assertIn('failing_func', error_msg)
            self.assertIn('missing key', error_msg)

    def test_domain_exception_mapping(self) -> None:
        """Test mapping an exception to a domain exception."""
        service = SampleService()
        with patch.object(logger._Logger__logger, 'error') as mock_error:
            with self.assertRaises(CustomDomainException) as ctx:
                service.method_with_error()
            self.assertIn('inner value error', str(ctx.exception))
            self.assertTrue(mock_error.called)

    def test_domain_exception_already_domain_exception(self) -> None:
        """Test that if raised exception is already domain exception, it is not re-wrapped."""
        @log_execution(CustomDomainException)
        def raise_domain() -> None:
            raise CustomDomainException('already domain')

        with self.assertRaises(CustomDomainException) as ctx:
            raise_domain()
        self.assertEqual(str(ctx.exception), 'already domain')

    def test_domain_exception_zero_arg(self) -> None:
        """Test mapping to domain exception with no-arg constructor."""
        @log_execution(ZeroArgDomainException)
        def fail_with_zero_arg() -> None:
            raise RuntimeError('runtime error')

        with self.assertRaises(ZeroArgDomainException) as ctx:
            fail_with_zero_arg()
        self.assertIn('Zero arg domain error', str(ctx.exception))

    def test_async_exception_mapping(self) -> None:
        """Test exception mapping in async function."""
        @log_execution(CustomDomainException)
        async def async_fail() -> None:
            await asyncio.sleep(0.01)
            raise ValueError('async failure')

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            with self.assertRaises(CustomDomainException):
                loop.run_until_complete(async_fail())
        finally:
            loop.close()

    def test_user_tagging_from_env(self) -> None:
        """Test that CURRENT_USER env var is included in execution logs."""
        service = SampleService()
        with patch.dict(os.environ, {'CURRENT_USER': 'sub-uuid-123'}):
            with patch.object(logger._Logger__logger, 'info') as mock_info:
                result = service.instance_method(4)
                self.assertEqual(result, 8)
                self.assertTrue(mock_info.called)
                log_msg = mock_info.call_args_list[0][0][0]
                self.assertEqual(log_msg, '[SampleService] [userid=sub-uuid-123] Executing instance_method')

    def test_user_tagging_from_current_user_object(self) -> None:
        """Test user extraction from current_user argument with sub attribute."""
        @log_execution
        def endpoint_fn(data: str, current_user: Any = None) -> str:
            return f'{data}-processed'

        mock_user = MagicMock()
        mock_user.sub = 'cognito-sub-789'

        with patch.object(logger._Logger__logger, 'info') as mock_info:
            result = endpoint_fn('item', current_user=mock_user)
            self.assertEqual(result, 'item-processed')
            self.assertTrue(mock_info.called)
            log_msg = mock_info.call_args_list[0][0][0]
            self.assertIn('[userid=cognito-sub-789] Executing endpoint_fn', log_msg)

    def test_user_tagging_from_user_id_kwarg(self) -> None:
        """Test user extraction from user_id keyword argument."""
        @log_execution
        def fn_with_user_id(user_id: str, action: str) -> str:
            return action

        with patch.object(logger._Logger__logger, 'info') as mock_info:
            result = fn_with_user_id(user_id='user-xyz-456', action='read')
            self.assertEqual(result, 'read')
            self.assertTrue(mock_info.called)
            log_msg = mock_info.call_args_list[0][0][0]
            self.assertIn('[userid=user-xyz-456] Executing fn_with_user_id', log_msg)

    def test_exception_logging_with_user_tag(self) -> None:
        """Test that exception logs include the user tag when authenticated."""
        service = SampleService()
        with patch.dict(os.environ, {'CURRENT_USER': 'sub-error-user'}):
            with patch.object(logger._Logger__logger, 'error') as mock_error:
                with self.assertRaises(CustomDomainException):
                    service.method_with_error()
                self.assertTrue(mock_error.called)
                err_msg = mock_error.call_args_list[0][0][0]
                self.assertIn('[SampleService] [userid=sub-error-user] Exception in method_with_error', err_msg)


class TestMaskString(unittest.TestCase):
    """Tests for mask_string utility function."""

    def test_empty_and_none(self) -> None:
        """Test None and empty strings return empty string."""
        self.assertEqual(mask_string(None), '')
        self.assertEqual(mask_string(''), '')

    def test_length_less_than_or_equal_to_visible(self) -> None:
        """Test strings shorter than or equal to prefix + suffix are completely masked."""
        self.assertEqual(mask_string('a', 2, 2), '*')
        self.assertEqual(mask_string('ab', 2, 2), '**')
        self.assertEqual(mask_string('abc', 2, 2), '***')
        self.assertEqual(mask_string('abcd', 2, 2), '****')

    def test_standard_masking(self) -> None:
        """Test normal masking with default prefix=2, suffix=2."""
        self.assertEqual(mask_string('password123'), 'pa*******23')

    def test_custom_prefix_suffix(self) -> None:
        """Test custom prefix, suffix, and mask char."""
        self.assertEqual(mask_string('1234567890', 3, 2, '#'), '123#####90')

    def test_zero_prefix(self) -> None:
        """Test zero prefix."""
        self.assertEqual(mask_string('secrettoken', visible_prefix=0, visible_suffix=3), '********ken')

    def test_zero_suffix(self) -> None:
        """Test zero suffix."""
        self.assertEqual(mask_string('secrettoken', visible_prefix=3, visible_suffix=0), 'sec********')


class TestMaskEmail(unittest.TestCase):
    """Tests for mask_email utility function."""

    def test_empty_and_none(self) -> None:
        """Test None, empty, and whitespace return empty string."""
        self.assertEqual(mask_email(None), '')
        self.assertEqual(mask_email(''), '')

    def test_standard_email(self) -> None:
        """Test masking standard email address."""
        self.assertEqual(mask_email('john.doe@example.com'), 'joh**doe@example.com')
        self.assertEqual(mask_email('aspactores@durianpy.org'), 'aspa**ores@durianpy.org')


    def test_short_local_parts(self) -> None:
        """Test masking short local part emails."""
        self.assertEqual(mask_email('a@test.com'), '*@test.com')
        self.assertEqual(mask_email('ab@test.com'), '**@test.com')
        self.assertEqual(mask_email('abc@test.com'), 'a*c@test.com')

    def test_fallback_when_no_at_sign(self) -> None:
        """Test fallback to mask_string when no @ sign is present."""
        self.assertEqual(mask_email('invalidemailaddress'), mask_string('invalidemailaddress'))


class TestInfoLogging(unittest.TestCase):
    """Tests for Logger.info business event logging."""

    def test_unauthenticated_info(self) -> None:
        """Test logging info without user."""
        logger_instance = Logger()
        with patch.dict(os.environ, {}, clear=True):
            with patch.object(logger_instance._Logger__logger, 'info') as mock_info:
                logger_instance.info('User registration created')
                mock_info.assert_called_once_with('User registration created')

    def test_info_with_explicit_user_id(self) -> None:
        """Test info logging with explicitly passed user_id."""
        logger_instance = Logger()
        with patch.object(logger_instance._Logger__logger, 'info') as mock_info:
            logger_instance.info('Payment successful: ₱1500', user_id='usr-paid-001')
            mock_info.assert_called_once_with('[userid=usr-paid-001] Payment successful: ₱1500')

    def test_info_with_env_current_user(self) -> None:
        """Test info logging falling back to CURRENT_USER env var."""
        logger_instance = Logger()
        with patch.dict(os.environ, {'CURRENT_USER': 'cognito-sub-12345'}):
            with patch.object(logger_instance._Logger__logger, 'info') as mock_info:
                logger_instance.info('Event status changed to OPEN')
                mock_info.assert_called_once_with('[userid=cognito-sub-12345] Event status changed to OPEN')


class TestSettings(unittest.TestCase):
    """Tests for Settings class and LogLevel enum."""

    def test_log_level_values(self) -> None:
        """Test LogLevel enum definitions."""
        self.assertEqual(LogLevel.INFO.value, 'INFO')
        self.assertEqual(LogLevel.DEBUG.value, 'DEBUG')
        self.assertEqual(LogLevel.ERROR.value, 'ERROR')
        self.assertEqual(LogLevel.WARNING.value, 'WARNING')

    def test_settings_defaults(self) -> None:
        """Test Settings default values."""
        settings = Settings()
        self.assertEqual(settings.APP_NAME, 'techtix-events-service')
        self.assertIsNotNone(settings.LOG_LEVEL)

    def test_settings_overrides(self) -> None:
        """Test Settings with explicit overrides."""
        settings = Settings(app_name='custom-app', log_level=LogLevel.INFO)
        self.assertEqual(settings.APP_NAME, 'custom-app')
        self.assertEqual(settings.LOG_LEVEL, LogLevel.INFO)


if __name__ == '__main__':
    unittest.main()
