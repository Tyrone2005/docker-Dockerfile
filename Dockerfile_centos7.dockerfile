# Docker for CentOS 7

#Base image
FROM centos:7

#Who
MAINTAINER Tyrone "Tyrone_2013@hotmail.com"


# OS环境配置
RUN yum install -y wget

# 安装JDK
RUN mkdir /var/tmp/jdk
RUN wget --no-check-certificate --no-cookies --header "Cookie: oraclelicense=accept-securebackup-cookie"  -P /var/tmp/jdk http://download.oracle.com/otn-pub/java/jdk/8u111-b14/jdk-8u111-linux-x64.tar.gz
RUN tar xzf /var/tmp/jdk/jdk-8u111-linux-x64.tar.gz -C /var/tmp/jdk && rm -rf /var/tmp/jdk/jdk-8u111-linux-x64.tar.gz

# 安装tomcat
RUN mkdir /var/tmp/tomcat
RUN wget -P  /var/tmp/tomcat http://archive.apache.org/dist/tomcat/tomcat-8/v8.0.50/bin/apache-tomcat-8.0.50.tar.gz
RUN tar xzf /var/tmp/tomcat/apache-tomcat-8.0.50.tar.gz -C /var/tmp/tomcat && rm -rf /var/tmp/tomcat/apache-tomcat-8.0.50.tar.gz

#设置环境变量
ENV JAVA_HOME /var/tmp/jdk/jdk1.8.0_111
ENV CATALINA_HOME /var/tmp/tomcat/apache-tomcat-8.0.50
ENV PATH $PATH:$JAVA_HOME/bin:$CATALINA_HOME/bin

#打包项目并拷贝到tomcat webapps目录
RUN mkdir /var/tmp/webapp
ADD ./  /var/tmp/webapp
RUN cd  /var/tmp/webapp  && cp /var/tmp/webapp/war/sm_new.war /var/tmp/tomcat/apache-tomcat-8.0.50/webapps/

#开启内部服务端口
EXPOSE 8080

#启动tomcat服务器
CMD ["./var/tmp/tomcat/apache-tomcat-8.0.50/bin/catalina.sh","run"] && tail -f /var/tmp/tomcat/apache-tomcat-8.0.50/logs/catalina.out
