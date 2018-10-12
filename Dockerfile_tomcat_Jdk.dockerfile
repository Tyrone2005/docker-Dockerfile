# Docker for CentOS 7

#Base image
FROM centos:7

#Who
MAINTAINER Tyrone "Tyrone_2013@hotmail.com"

# OS环境配置
RUN yum install -y wget

# 安装JDK
RUN mkdir -p /opt/jdk
ADD ./jdk-8u181-linux-x64.tar.gz /opt/jdk


# 安装tomcat
RUN mkdir -p /usr/local/tomcat
ADD ./apache-tomcat-8.0.50.tar.gz /usr/local/tomcat

#RUN wget -P  /var/tmp/tomcat http://archive.apache.org/dist/tomcat/tomcat-8/v8.0.50/bin/apache-tomcat-8.0.50.tar.gz

#设置环境变量
ENV JAVA_HOME /opt/jdk/jdk1.8.0_181
ENV CATALINA_HOME /usr/local/tomcat/apache-tomcat-8.0.50
ENV PATH $PATH:$JAVA_HOME/bin:$CATALINA_HOME/bin

#打包项目并拷贝到tomcat webapps目录
RUN mkdir /usr/local/tomcat/webapp

WORKDIR  /opt/jdk
RUN rm  -rf  jdk-8u181-linux-x64.tar.gz
WORKDIR  /usr/local/tomcat
RUN rm  -rf  apache-tomcat-8.0.50.tar.gz
#开启内部服务端口
EXPOSE 8080

#启动tomcat服务器
#CMD ["/usr/local/tomcat/apache-tomcat-8.0.50/bin/catalina.sh","run","&&","tailf", "/usr/local/tomcat/apache-tomcat-8.0.50/logs/catalina.out" ]
ENTRYPOINT /usr/local/tomcat/apache-tomcat-8.0.50/bin/startup.sh && tail -F /usr/local/tomcat/apache-tomcat-8.0.50/logs/catalina.out



#docker run --name tomcat8 -p 8080:8080 -t   XXXXX-ID
