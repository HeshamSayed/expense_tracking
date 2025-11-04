"""
Custom exceptions for the application.
"""
from rest_framework.exceptions import APIException
from rest_framework import status


class InsufficientBudgetException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Insufficient budget for this expense.'
    default_code = 'insufficient_budget'


class InvalidDateRangeException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Invalid date range provided.'
    default_code = 'invalid_date_range'


class DuplicateEntryException(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_detail = 'Entry already exists.'
    default_code = 'duplicate_entry'
