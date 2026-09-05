"""Logging module providing singleton Logger, decorator, and mask_string utility."""

import datetime
import functools
import inspect
import logging
import os
import sys
import threading
from typing import Any, Callable, Optional, Type, TypeVar, Union

try:
    from src.core.settings import LogLevel, Settings  # type: ignore[import-not-found]
except ImportError:
    try:
        from constants.common_constants import LogLevel
    except ImportError:
        from enum import Enum

        class LogLevel(str, Enum):  # type: ignore[no-redef]
            """Supported logging severity levels."""

            CRITICAL = 'CRITICAL'
            FATAL = 'FATAL'
            ERROR = 'ERROR'
            WARNING = 'WARNING'
            WARN = 'WARN'
            INFO = 'INFO'
            DEBUG = 'DEBUG'
            NOTSET = 'NOTSET'

    class Settings:
        """Application settings for logger configuration."""

        APP_NAME: str = os.getenv('APP_NAME', 'techtix-events-service')
        LOG_LEVEL: Union[str, LogLevel] = os.getenv('LOG_LEVEL', LogLevel.DEBUG.value)

        def __init__(
            self,
            app_name: Optional[str] = None,
            log_level: Optional[Union[str, LogLevel]] = None,
        ) -> None:
            """
            Initialize settings with environment defaults or overrides.

            :param app_name: Optional application name identifier.
            :type app_name: Optional[str]
            :param log_level: Optional logging level threshold.
            :type log_level: Optional[Union[str, LogLevel]]
            """
            self.APP_NAME: str = app_name or os.getenv('APP_NAME', 'techtix-events-service')
            self.LOG_LEVEL: Union[str, LogLevel] = log_level or os.getenv('LOG_LEVEL', LogLevel.DEBUG.value)

F = TypeVar('F', bound=Callable[..., Any])


class _ISOFormatter(logging.Formatter):
    """Logging formatter that outputs timestamps in ISO 8601 format."""

    def formatTime(self, record: logging.LogRecord, datefmt: Optional[str] = None) -> str:
        """
        Format record timestamp into ISO 8601 string representation.

        :param record: Log record containing timestamp.
        :type record: logging.LogRecord
        :param datefmt: Optional date format string (ignored in favor of ISO 8601).
        :type datefmt: Optional[str]
        :returns: ISO 8601 formatted timestamp string.
        :rtype: str
        """
        dt = datetime.datetime.fromtimestamp(record.created).astimezone()
        return dt.isoformat()

    def format(self, record: logging.LogRecord) -> str:
        uid = getattr(record, 'user_id', None) or os.getenv('CURRENT_USER')
        if uid:
            msg_str = str(record.msg)
            if '[userid=' not in msg_str and '[user=' not in msg_str:
                record.msg = f'[userid={uid}] {record.msg}'
        return super().format(record)


class Logger:
    """Singleton Logger class wrapping Python's standard logging module."""

    __instance: Optional['Logger'] = None
    __lock: threading.Lock = threading.Lock()

    def __new__(cls, *_args: Any, **_kwargs: Any) -> 'Logger':
        """
        Create or return the singleton Logger instance.

        :returns: The singleton Logger instance.
        :rtype: Logger
        """
        if cls.__instance is None:
            with cls.__lock:
                if cls.__instance is None:
                    instance = super().__new__(cls)
                    instance.__initialized = False
                    cls.__instance = instance
        return cls.__instance

    def __init__(
        self,
        name: Optional[str] = None,
        level: Optional[Union[str, int, LogLevel]] = None,
    ) -> None:
        """
        Initialize the Logger instance if not already initialized.

        :param name: Optional logger name identifier.
        :type name: Optional[str]
        :param level: Optional log severity level threshold.
        :type level: Optional[Union[str, int, LogLevel]]
        :returns: None
        :rtype: None
        """
        if self.__initialized:
            return

        with self.__lock:
            if self.__initialized:
                return

            settings = Settings()
            logger_name = name or settings.APP_NAME
            raw_level = level if level is not None else settings.LOG_LEVEL

            if isinstance(raw_level, LogLevel):
                str_level = raw_level.value
            elif isinstance(raw_level, str):
                str_level = raw_level
            else:
                str_level = None

            if str_level is not None:
                int_level = getattr(logging, str_level.upper(), logging.INFO)
            else:
                int_level = int(raw_level)

            self.__logger = logging.getLogger(logger_name)
            self.__logger.setLevel(int_level)

            if not self.__logger.handlers:
                handler = logging.StreamHandler(sys.stdout)
                if os.getenv('AWS_EXECUTION_ENV'):  # pragma: no cover
                    self.__logger.propagate = False
                    formatter = _ISOFormatter('[%(levelname)s] %(message)s')
                else:
                    formatter = _ISOFormatter('%(asctime)s [%(levelname)s] %(message)s')
                handler.setFormatter(formatter)
                self.__logger.addHandler(handler)

            self.__initialized = True

    @classmethod
    def get_logger(
        cls,
        logger_name: Optional[str] = None,
        log_level: Optional[Union[str, int, LogLevel]] = None,
    ) -> 'Logger':
        """
        Initialize and return the configured singleton Logger instance.

        :param logger_name: Optional logger name identifier.
        :type logger_name: Optional[str]
        :param log_level: Optional log level threshold.
        :type log_level: Optional[Union[str, int, LogLevel]]
        :returns: Configured singleton Logger instance.
        :rtype: Logger
        """
        return cls(name=logger_name, level=log_level)

    @classmethod
    def _reset(cls) -> None:
        """Reset the singleton instance (intended for test isolation)."""
        with cls.__lock:
            cls.__instance = None

    def setLevel(self, level: Union[str, int, LogLevel]) -> None:
        """
        Set the logging severity level threshold.

        :param level: Severity level threshold.
        :type level: Union[str, int, LogLevel]
        :returns: None
        :rtype: None
        """
        if isinstance(level, LogLevel):
            str_level = level.value
        elif isinstance(level, str):
            str_level = level
        else:
            str_level = None

        if str_level is not None:
            int_level = getattr(logging, str_level.upper(), logging.INFO)
        else:
            int_level = int(level)

        self.__logger.setLevel(int_level)

    @staticmethod
    def log_execution(domain_exception: Optional[Any] = None) -> Any:
        """
        Log function/method entrypoint and optional domain exception mapping.

        :param domain_exception: Optional domain exception class to re-raise upon
            error, or decorated target function.
        :type domain_exception: Optional[Any]
        :returns: Decorated target function or decorator wrapper.
        :rtype: Any
        """
        return log_execution(domain_exception)

    def _format_message(self, msg: Any, user_id: Optional[str] = None) -> str:
        """
        Prepend [userid=<uid>] to log message if a user is authenticated and not already tagged.

        :param msg: Original log message.
        :type msg: Any
        :param user_id: Optional explicit user ID.
        :type user_id: Optional[str]
        :returns: Formatted message with user tag if applicable.
        :rtype: str
        """
        str_msg = str(msg)
        uid = user_id or os.getenv('CURRENT_USER')
        if uid and '[userid=' not in str_msg and '[user=' not in str_msg:
            return f'[userid={uid}] {str_msg}'
        return str_msg

    def debug(self, msg: Any, *args: Any, **kwargs: Any) -> None:
        """Log message with DEBUG severity, automatically tagging user context."""
        user_id = kwargs.pop('user_id', None)
        self.__logger.debug(self._format_message(msg, user_id), *args, **kwargs)

    def info(self, msg: Any, *args: Any, **kwargs: Any) -> None:
        """Log message with INFO severity, automatically tagging user context."""
        user_id = kwargs.pop('user_id', None)
        self.__logger.info(self._format_message(msg, user_id), *args, **kwargs)

    def warning(self, msg: Any, *args: Any, **kwargs: Any) -> None:
        """Log message with WARNING severity, automatically tagging user context."""
        user_id = kwargs.pop('user_id', None)
        self.__logger.warning(self._format_message(msg, user_id), *args, **kwargs)

    def warn(self, msg: Any, *args: Any, **kwargs: Any) -> None:
        """Log message with WARNING severity, automatically tagging user context."""
        user_id = kwargs.pop('user_id', None)
        self.__logger.warning(self._format_message(msg, user_id), *args, **kwargs)

    def error(self, msg: Any, *args: Any, **kwargs: Any) -> None:
        """Log message with ERROR severity, automatically tagging user context."""
        user_id = kwargs.pop('user_id', None)
        self.__logger.error(self._format_message(msg, user_id), *args, **kwargs)

    def critical(self, msg: Any, *args: Any, **kwargs: Any) -> None:
        """Log message with CRITICAL severity, automatically tagging user context."""
        user_id = kwargs.pop('user_id', None)
        self.__logger.critical(self._format_message(msg, user_id), *args, **kwargs)

    def exception(self, msg: Any, *args: Any, **kwargs: Any) -> None:
        """Log message with ERROR severity including exception trace and user context."""
        user_id = kwargs.pop('user_id', None)
        self.__logger.exception(self._format_message(msg, user_id), *args, **kwargs)

    def log(self, level: int, msg: Any, *args: Any, **kwargs: Any) -> None:
        """Log message with specified severity level, automatically tagging user context."""
        user_id = kwargs.pop('user_id', None)
        self.__logger.log(level, self._format_message(msg, user_id), *args, **kwargs)

    @staticmethod
    def mask_string(
        value: Optional[str],
        visible_prefix: int = 2,
        visible_suffix: int = 2,
        mask_char: str = '*',
    ) -> str:
        """
        Mask sensitive string data while preserving visible prefix and suffix.

        :param value: The string value to mask.
        :type value: Optional[str]
        :param visible_prefix: Number of characters to leave visible at the start.
        :type visible_prefix: int
        :param visible_suffix: Number of characters to leave visible at the end.
        :type visible_suffix: int
        :param mask_char: Masking character used to hide middle content.
        :type mask_char: str
        :returns: The masked string representation.
        :rtype: str
        """
        return mask_string(
            value,
            visible_prefix=visible_prefix,
            visible_suffix=visible_suffix,
            mask_char=mask_char,
        )

    @staticmethod
    def mask_email(email: Optional[str]) -> str:
        """
        Mask email address for privacy-safe logging.

        :param email: Email address to mask.
        :type email: Optional[str]
        :returns: Masked email string.
        :rtype: str
        """
        return mask_email(email)

    def __getattr__(self, name: str) -> Any:
        """
        Delegate attribute access to underlying logging.Logger instance.

        :param name: Attribute or method name to access.
        :type name: str
        :returns: Attribute from underlying logger instance.
        :rtype: Any
        """
        logger_inst = self.__dict__.get('_Logger__logger')
        if logger_inst is not None:
            return getattr(logger_inst, name)
        raise AttributeError(f"'Logger' object has no attribute '{name}'")


def __extract_class_name(func: Callable[..., Any], args: tuple[Any, ...]) -> str:
    """
    Extract class name or module name for logging format.

    :param func: Target callable function or method.
    :type func: Callable[..., Any]
    :param args: Positional arguments passed to the function.
    :type args: tuple[Any, ...]
    :returns: Extracted class or module name.
    :rtype: str
    """
    if args:
        first_arg = args[0]
        if inspect.isclass(first_arg):
            return first_arg.__name__
        if hasattr(first_arg, '__class__') and '.' in getattr(func, '__qualname__', ''):
            return first_arg.__class__.__name__

    qualname = getattr(func, '__qualname__', '')
    if '.' in qualname:
        return qualname.rsplit('.', 1)[0]

    return getattr(func, '__module__', 'App')


def __extract_user_id(args: tuple[Any, ...], kwargs: dict[str, Any]) -> Optional[str]:
    """
    Extract authenticated user ID from function parameters or environment context.

    :param args: Positional arguments passed to the function.
    :type args: tuple[Any, ...]
    :param kwargs: Keyword arguments passed to the function.
    :type kwargs: dict[str, Any]
    :returns: User ID string if found, otherwise None.
    :rtype: Optional[str]
    """
    if 'current_user' in kwargs:
        current_user = kwargs['current_user']
        if hasattr(current_user, 'sub') and getattr(current_user, 'sub'):
            return str(getattr(current_user, 'sub'))
        if isinstance(current_user, str) and current_user:
            return current_user

    if 'user_id' in kwargs and kwargs['user_id']:
        return str(kwargs['user_id'])

    for arg in args:
        if hasattr(arg, 'sub') and getattr(arg, 'sub'):
            return str(getattr(arg, 'sub'))

    env_user = os.getenv('CURRENT_USER')
    if env_user:
        return env_user

    return None


def __decorate(
    func: Callable[..., Any],
    domain_exception: Optional[Type[BaseException]],
) -> Any:
    """
    Apply entrypoint logging and domain exception mapping to a function.

    :param func: Function to decorate.
    :type func: Callable[..., Any]
    :param domain_exception: Optional domain exception class to re-raise upon error.
    :type domain_exception: Optional[Type[BaseException]]
    :returns: Decorated sync or async wrapper function.
    :rtype: Any
    """
    logger = Logger()

    if inspect.iscoroutinefunction(func):

        @functools.wraps(func)
        async def async_wrapper(*args: Any, **kwargs: Any) -> Any:
            classname = __extract_class_name(func, args)
            methodname = getattr(func, '__name__', str(func))
            user_id = __extract_user_id(args, kwargs)
            user_tag = f' [userid={user_id}]' if user_id else ''
            logger.info(f'[{classname}]{user_tag} Executing {methodname}')
            try:
                return await func(*args, **kwargs)
            except Exception as exc:
                logger.error(f'[{classname}]{user_tag} Exception in {methodname}: {exc}')
                if domain_exception is not None:
                    if isinstance(exc, domain_exception):
                        raise
                    try:
                        raise domain_exception(str(exc)) from exc
                    except TypeError:
                        raise domain_exception() from exc
                raise

        return async_wrapper

    @functools.wraps(func)
    def sync_wrapper(*args: Any, **kwargs: Any) -> Any:
        classname = __extract_class_name(func, args)
        methodname = getattr(func, '__name__', str(func))
        user_id = __extract_user_id(args, kwargs)
        user_tag = f' [userid={user_id}]' if user_id else ''
        logger.info(f'[{classname}]{user_tag} Executing {methodname}')
        try:
            return func(*args, **kwargs)
        except Exception as exc:
            logger.error(f'[{classname}]{user_tag} Exception in {methodname}: {exc}')
            if domain_exception is not None:
                if isinstance(exc, domain_exception):
                    raise
                try:
                    raise domain_exception(str(exc)) from exc
                except TypeError:
                    raise domain_exception() from exc
            raise

    return sync_wrapper


def log_execution(
    domain_exception: Optional[Any] = None,
) -> Any:
    """
    Log function/method entrypoint and optional domain exception mapping.

    :param domain_exception: Optional domain exception class to re-raise upon
        error, or decorated target function.
    :type domain_exception: Optional[Any]
    :returns: Decorated target function or decorator wrapper.
    :rtype: Any
    """
    if callable(domain_exception) and not (
        inspect.isclass(domain_exception) and issubclass(domain_exception, BaseException)
    ):
        func = domain_exception
        return __decorate(func, None)

    def decorator(func: F) -> F:
        return __decorate(func, domain_exception)

    return decorator


def mask_string(
    value: Optional[str],
    visible_prefix: int = 2,
    visible_suffix: int = 2,
    mask_char: str = '*',
) -> str:
    """
    Mask sensitive string data while preserving visible prefix and suffix characters.

    :param value: The string value to mask.
    :type value: Optional[str]
    :param visible_prefix: Number of characters to leave visible at the start.
    :type visible_prefix: int
    :param visible_suffix: Number of characters to leave visible at the end.
    :type visible_suffix: int
    :param mask_char: Masking character used to hide middle content.
    :type mask_char: str
    :returns: The masked string representation.
    :rtype: str
    """
    if not value:
        return ''

    str_val = str(value)
    length = len(str_val)

    prefix_len = max(0, visible_prefix)
    suffix_len = max(0, visible_suffix)

    if length <= prefix_len + suffix_len:
        return mask_char * length

    prefix = str_val[:prefix_len]
    suffix = str_val[length - suffix_len :] if suffix_len > 0 else ''
    masked_part = mask_char * (length - prefix_len - suffix_len)

    return f'{prefix}{masked_part}{suffix}'


def mask_email(email: Optional[str]) -> str:
    """
    Mask sensitive email address while keeping domain and first/last local characters visible.

    Example: 'user@example.com' -> 'u**r@example.com'

    :param email: Email string to mask.
    :type email: Optional[str]
    :returns: Masked email string representation.
    :rtype: str
    """
    if not email:
        return ''

    str_email = str(email).strip()
    if '@' not in str_email:
        return mask_string(str_email)

    local_part, domain = str_email.rsplit('@', 1)
    masked_local = mask_string(local_part, visible_prefix=1, visible_suffix=1, mask_char='*')
    return f'{masked_local}@{domain}'


logger = Logger()
