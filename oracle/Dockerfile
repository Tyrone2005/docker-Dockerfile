# Docker for CentOS 7

#Base image
FROM oracle_11g:v1

#Who
MAINTAINER Tyrone "Tyrone_2013@hotmail.com"


#设置环境变量
ENV ORACLE_HOME=/home/oracle/app/oracle/product/11.2.0/dbhome_2
ENV ORACLE_SID=helowin
ENV PATH=$ORACLE_HOME/bin:$PATH

#创建软连接
RUN su 
RUN ln -s $ORACLE_HOME/bin/sqlplus /usr/bin
RUN su - oralce
#开启内部服务端口
EXPOSE 1521


RUN sqlplus /nolog
RUN conn /as sysdba
RUN alter user system identified by 000000;
RUN alter user sys identified by 000000;
RUN ALTER PROFILE DEFAULT LIMIT PASSWORD_LIFE_TIME UNLIMITED;