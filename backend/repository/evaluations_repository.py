import logging
import os 
from datetime import datetime
from http import HTTPStatus
from typing import List, Tuple

import ulid
from model.evaluations.evaluation import Evaluation, EvaluationIn
from model.evaluations.evaluations_constants import EvaluationStatus
from pynamodb.connection import Connection
from pynamodb.exceptions import (
    PutError,
    PynamoDBConnectionError,
    QueryError,
    TableDoesNotExist,
    TransactWriteError,
)
from pynamodb.transactions import TransactWrite
from repository.repository_utils import RepositoryUtils

class EvaluationRepository:
    def __init__(self) -> None:
        self.core_obj = 'Evaluation' # NOTE: should i have this?
        self.current_date = datetime.utcnow().isoformat()
        self.conn = Connection(region=os.getenv('REGION'))

    def store_evaluation(self, evaluation_in: EvaluationIn) -> Tuple[HTTPStatus, Evaluation, str]:
        data = RepositoryUtils.load_data(pydantic_schema_in=evaluation_in)
        entry_id = ulid.ulid()
        registration_id = evaluation_in.registrationId
        range_key = f'{registration_id}#{evaluation_in.question}'

        try:
            evaluation_entry = Evaluation(
                hashKey= evaluation_in.eventId,
                rangeKey=range_key,
                createDate=self.current_date,
                updateDate=self.current_date,
                createdBy=os.getenv('CURRENT_USER'),
                updatedBy=os.getenv('CURRENT_USER'),
                entryId=entry_id,
                status=EvaluationStatus.DRAFT.value,
                **data,
            )
            evaluation_entry.save()

        # NOTE: should i be using just range key here or both rk and hk
        except PutError as e:
            message = f'Failed to save evaluation strategy form: {str(e)}'
            logging.error(f'[{self.core_obj} = {range_key}]: {message}')
            return HTTPStatus.INTERNAL_SERVER_ERROR, None, message
        except TableDoesNotExist as db_error:
            message = f'Error on Table, Please check config to make sure table is created: {str(db_error)}'
            logging.error(f'[{self.core_obj} = {range_key}]: {message}')
            return HTTPStatus.INTERNAL_SERVER_ERROR, None, message
        except PynamoDBConnectionError as db_error:
            message = f'Connection error occurred, Please check config(region, table name, etc): {str(db_error)}'
            logging.error(f'[{self.core_obj} = {range_key}]: {message}')
            return HTTPStatus.INTERNAL_SERVER_ERROR, None, message
        else:
            logging.info(f'[{self.core_obj} = {range_key}]: Save Evaluations strategy data successful')
            return HTTPStatus.OK, evaluation_entry, None

    def query_evaluations(self, event_id: str = None, registration_id: str = None, question: str = None) -> Tuple[HTTPStatus, List[Evaluation], str]:
        try:
            # "not"s to avoid nesting. order: only hash key, incomplete range key, complete
            if event_id:
                if not registration_id:
                    range_key_condition = Evaluation.rangeKey.startswith('')
                elif not question:
                    range_key_condition = Evaluation.rangeKey.startswith(f'{registration_id}#')
                else: 
                    range_key = f'{registration_id}#{question}'
                    range_key_condition = Evaluation.rangeKey.__eq__(range_key)

                evaluation_entries = list(
                    Evaluation.query(
                        hash_key=event_id,
                        range_key_condition=range_key_condition
                    )
                )
            
            else:
                evaluation_entries = list(Evaluation.scan())

            if not evaluation_entries:
                if event_id and registration_id and question:
                    message = f'Evaluation with id {event_id}, {registration_id}#{question} not found'
                    logging.error(f'[{self.core_obj}={event_id}] {message}')
                else:
                    message = 'No evaluations found'
                    logging.error(f'[{self.core_obj}] {message}')

                return HTTPStatus.NOT_FOUND, None, message
        
        # NOTE: should i be using hk here or rk
        except QueryError as e:
            message = f'Failed to query evaluation: {str(e)}'
            logging.error(f'[{self.core_obj}={event_id}] {message}')
            return HTTPStatus.INTERNAL_SERVER_ERROR, None, message
        except TableDoesNotExist as db_error:
            message = f'Error on Table, Please check config to make sure table is created: {str(db_error)}'
            logging.error(f'[{self.core_obj}={event_id}] {message}')
            return HTTPStatus.INTERNAL_SERVER_ERROR, None, message
        except PynamoDBConnectionError as db_error:
            message = f'Connection error occurred, Please check config(region, table name, etc): {str(db_error)}'
            logging.error(f'[{self.core_obj}={event_id}] {message}')
            return HTTPStatus.INTERNAL_SERVER_ERROR, None, message
        else:
            if event_id:
                logging.info(f'[{self.core_obj}={event_id}] Fetch Evaluation data successful')
            else:
                logging.info(f'[{self.core_obj}] Fetch Evaluation data successful')
            return HTTPStatus.OK, evaluation_entries, None
            
    def query_evaluations_by_question(self, event_id: str, question: str) -> Tuple[HTTPStatus, List[Evaluation], str]:
        try:
            evaluation_entries = list(Evaluation.question_lsi.query(event_id, question))

            if not evaluation_entries:
                message = f'No evaluations found for event {event_id} and question {question}'
                logging.error(f'[{self.core_obj}={question}] {message}')
                return HTTPStatus.NOT_FOUND, None, message
        
        except QueryError as e:
            message = f'Failed to query evaluation: {str(e)}'
            logging.error(f'[{self.core_obj}={question}] {message}')
            return HTTPStatus.INTERNAL_SERVER_ERROR, None, message
        except TableDoesNotExist as db_error:
            message = f'Error on Table, Please check config to make sure table is created: {str(db_error)}'
            logging.error(f'[{self.core_obj}={question}] {message}')
            return HTTPStatus.INTERNAL_SERVER_ERROR, None, message
        except PynamoDBConnectionError as db_error:
            message = f'Connection error occurred, Please check config(region, table name, etc): {str(db_error)}'
            logging.error(f'[{self.core_obj}={question}] {message}')
            return HTTPStatus.INTERNAL_SERVER_ERROR, None, message
        else:
            logging.info(f'[{self.core_obj}={question}] Fetch Evaluation data successful')
            return HTTPStatus.OK, evaluation_entries, None
          
            
    def update_evaluation(self, evaluation_entry: Evaluation, evaluation_in: EvaluationIn) -> Tuple[HTTPStatus, Evaluation, str]:
        data = RepositoryUtils.load_data(pydantic_schema_in=evaluation_in, exclude_unset=True)
        has_update, updated_data = RepositoryUtils.get_update(
            old_data=RepositoryUtils.db_model_to_dict(evaluation_entry), 
            new_data=data
        )

        if not has_update:
            return HTTPStatus.OK, evaluation_entry, 'no update'
        try:
            with TransactWrite(connection=self.conn) as transaction:
                # update entry
                updated_data.update(
                    updateDate=self.current_date,
                    updatedBy=os.getenv('CURRENT_USER'),
                )
                actions = [getattr(Evaluation, k).set(v) for k, v in updated_data.items()]
                transaction.update(evaluation_entry, actions=actions)

            evaluation_entry.refresh()
            logging.info(f'[{evaluation_entry.rangeKey}] ' f'Update evaluation data successful')
            return HTTPStatus.OK, evaluation_entry, ''

        except TransactWriteError as e:
            message = f'Failed to update evaluation data: {str(e)}'
            logging.error(f'[{self.core_obj}={evaluation_entry.rangeKey}] {message}')
            return HTTPStatus.INTERNAL_SERVER_ERROR, None, message
