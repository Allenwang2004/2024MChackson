FROM pytorch/pytorch:1.13.1-cuda11.6-cudnn8-runtime

WORKDIR /home/docker/spoof_docker
COPY . .

#ENV NVIDIA_DRIVER_CAPABILITIES all

#RUN apt-get -y update \
#    && apt-get clean \
#    && apt-get install -y --no-install-recommends sox vim wget bzip2 unzip

RUN pip install -r requirements.txt

EXPOSE 8443
