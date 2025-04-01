FROM ubuntu
RUN cat etc/*release*
EXPOSE 80
ENTRYPOINT["sleep","10"]
