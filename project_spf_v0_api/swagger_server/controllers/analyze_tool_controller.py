import connexion
import six
import time
from time import strftime, localtime, gmtime
import datetime
import traceback
import logging
import joblib
import sys
from swagger_server.controllers.log_setting import setup_logger

from swagger_server.models.model200_response import Model200Response  # noqa: E501
from swagger_server.models.model400_error_response import Model400ErrorResponse  # noqa: E501
from swagger_server.models.model401_error_response import Model401ErrorResponse  # noqa: E501
from swagger_server.models.model403_error_response import Model403ErrorResponse  # noqa: E501
from swagger_server.models.model500_error_response import Model500ErrorResponse  # noqa: E501
from swagger_server.models.spoof_detector_body import SpoofDetectorBody  # noqa: E501
from swagger_server import util

logger = setup_logger()
logger.info('Logging setup complete.')

all_models = ['v0','v1']

def convert_time(t):
    dt = datetime.datetime.utcfromtimestamp(t).strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3]
    return(dt)
    
    
def spoof_detector(body):  # noqa: E501

    headers = {"Content-Type": "application/json"}
    """detect events from audio data

     # noqa: E501

    :param body: 
    :type body: dict | bytes

    :rtype: Model200Response
    """
    start_time_overall = time.time()

    try:    
        # parse inputs
        reference_id = body['reference_id']
        audio_data = body['audio_data']  #base64encoded
        model_version = body['model_version']
        
        logger.info("analyzing...")
        
        # check input model name
        if model_version not in all_models:
            end_time_check_name = time.time()
            time_check_name = end_time_check_name-start_time_overall
            res_error_input_value = {
                "reference_id": reference_id,
                "uid": "20210827142959-42f091f4",
                "status_code": 400,
                "processing_time": {
                    "start_time": convert_time(start_time_overall),
                    "end_time": convert_time(end_time_check_name),
                    "duration_in_s": time_check_name
                    },
                "error_message": "incorrect input values"
                }

            return res_error_input_value, 400, headers

        prediction = model(audio_data, model_version)

        end_time_overall = time.time()
        overall_time = end_time_overall-start_time_overall
        
        res_success = {"reference_id": reference_id,
                       "uid": "20210827142959-42f091f4",
                       "status_code": 200,
                       "processing_time": {
                                "start_time": convert_time(start_time_overall),
                                "end_time": convert_time(end_time_overall),
                                "duration_in_s": overall_time
                              },
                              "result": "real",
                              "confidence": prediction
                            } 
        logger.info(res_success)
        return res_success, 200, headers
        
    except Exception:
        print(traceback.format_exc())
        end_time_overall = time.time() 
        overall_time = end_time_overall-start_time_overall
        res_excep_others = {
                "reference_id": reference_id,
                "uid": "20210827142959-42f091f4",
                "status_code": 500,
                "processing_time": {
                    "start_time": convert_time(start_time_overall),
                    "end_time": convert_time(end_time_overall),
                    "duration_in_s": overall_time
                    },
                "error_message": "internal error"
                }
     
        return res_excep_others, 500, headers
