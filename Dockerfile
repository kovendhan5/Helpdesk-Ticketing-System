FROM ubuntu
RUN cat etc/*release*
EXPOSE 80
CMD ["sleep","10"]
