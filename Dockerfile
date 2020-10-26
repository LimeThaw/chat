# set base image (host OS)
FROM python:3.8

# set the working directory in the container
WORKDIR /build

# copy the dependencies file to the working directory
COPY requirements.txt .

# install dependencies
RUN pip install -r requirements.txt

# copy the content of the local src directory to the working directory
COPY src/ .
COPY ssl/ ssl/

# command to run on container start
CMD [ "python", "./server.py" ] 