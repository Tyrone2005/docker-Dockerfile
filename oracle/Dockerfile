
# Docker for CentOS 7

#Base image
FROM oracle11g:v1

#Who
MAINTAINER Tyrone "Tyrone_2013@hotmail.com"

ENV ORACLE_HOME=/home/oracle/app/oracle/product/11.2.0/dbhome_2
ENV ORACLE_SID=helowin
ENV PATH=$ORACLE_HOME/bin:$PATH
ENV PATH=$PATH:$HOME/bin:/sbin:/usr/bin:/usr/sbin
ENV CREATE_USER_FILE="create_ns.sh"
ENV DMP_FILE="XHD20181015.dmp"
ENV LANG zh_CN.utf8
COPY ./${DMP_FILE} /tmp/${DMP_FILE}
COPY ./${CREATE_USER_FILE} /tmp/${CREATE_USER_FILE}
WORKDIR /tmp/

#开启内部服务端口
EXPOSE 1521



#在宿主机上运行
#mkdir /usr/local/data_temp
#chown -R 500.500 /usr/local/data_temp