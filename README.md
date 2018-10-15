# docker-Dockerfile
dockerfiles

tomcat8：     
基于apache-tomcat-8.0.50.tar.gz ，jdk-8u181-linux-x64.tar.gz 创建的tomcat基础镜像，tomcat的server已添加修改为
export JAVA_OPTS="-server -Xms1024m -Xmx2048m -XX:PermSize=256m -XX:MaxPermSize=512m"
