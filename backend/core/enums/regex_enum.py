import re
from enum import Enum

from django.core.validators import RegexValidator


class RegexEnum(Enum):
    NAME=(
        r'^[A-Z][a-z]{0,29}$',
        'Only alphanumeric characters are allowed.',
    )
    PHONE = (
        r'^\+(\d{2}) \(\d{3}\) \d{3}-\d{2}-\d{2}$',
        'Phone number must be in format +xx (xxx) xxx-xx-xx',
    )

    def __init__(self, pattern:str,msg:str):
        self.pattern = pattern
        self.msg = msg

    def validate(self, value: str):
        if not re.match(self.pattern, value):
            raise ValueError(self.msg)

phone_validator = RegexValidator(
    regex=RegexEnum.PHONE.pattern,
    message=RegexEnum.PHONE.msg
)