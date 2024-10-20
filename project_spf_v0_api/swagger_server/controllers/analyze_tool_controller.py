import connexion
import six
import time
import datetime
import traceback
import logging
import sys
#import torch  # Import torch to load the new model
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

all_models = ['v0', 'v1']  # Add your new model version here

# Load the new model (assuming it's a PyTorch model)
#model_v1 = torch.load("/Users/coconut/Downloads/LA_model.pth")  # Adjust the path as needed
#model_v1.eval()  # Set model to evaluation mode

def convert_time(t):
    dt = datetime.datetime.utcfromtimestamp(t).strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3]
    return dt

def spoof_detector(body):  # noqa: E501

    headers = {"Content-Type": "application/json"}
    start_time_overall = time.time()

    try:
        # Parse inputs
        reference_id = body['reference_id']
        audio_data = body['audio_data']  # base64encoded
        model_version = body['model_version']

        logger.info("analyzing...")

        # Check input model name
        if model_version not in all_models:
            end_time_check_name = time.time()
            time_check_name = end_time_check_name - start_time_overall
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

        # Decode and process the audio data (e.g., convert from base64 if necessary)
        # You will need to implement the audio preprocessing part

        # Predict based on model version
        '''
        if model_version == 'v1':
            # Convert the audio data into a tensor or format expected by the model
            # Assume 'input_tensor' is the preprocessed tensor ready for prediction
            input_tensor = preprocess_audio(audio_data)  # You need to define this function

            with torch.no_grad():
                prediction = model_v1(input_tensor)
                confidence = torch.softmax(prediction, dim=1)[0][1].item()  # Example of extracting the confidence score

        else:
            # For the older v0 model, you can leave the confidence as a fixed value (or modify it similarly)
            confidence = 0.85
        '''

        #randomly generate a confidence score between 0.8 and 1.0 and bwtween 0.1 and 0.2 take only 2 decimal places
        import random
        confidence = round(random.uniform(0.8, 1.0), 2) if random.randint(0, 1) == 0 else round(random.uniform(0.1, 0.2), 2)


        end_time_overall = time.time()
        overall_time = end_time_overall - start_time_overall

        if confidence < 0.5:
            res_success = {
                "reference_id": reference_id,
                "uid": "20210827142959-42f091f4",
                "status_code": 200,
                "processing_time": {
                    "start_time": convert_time(start_time_overall),
                    "end_time": convert_time(end_time_overall),
                    "duration_in_s": overall_time
                },
                "result": "spoofed",
                "confidence": confidence
            }
        else:
            res_success = {
                "reference_id": reference_id,
                "uid": "20210827142959-42f091f4",
                "status_code": 200,
                "processing_time": {
                    "start_time": convert_time(start_time_overall),
                    "end_time": convert_time(end_time_overall),
                    "duration_in_s": overall_time
                },
                "result": "real",
                "confidence": confidence
            }
        logger.info(res_success)
        return res_success, 200, headers

    except Exception:
        print(traceback.format_exc())
        end_time_overall = time.time()
        overall_time = end_time_overall - start_time_overall
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
