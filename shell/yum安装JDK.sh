#rpm -qa|grep java 
#rpm -e --allmatches --nodeps XXXXXXXXXXXXXXXXXXXX
#rpm -e --allmatches --nodeps XXXXXXXXXXXXXXXXXXXX

#yum -y list java*
#yum search jdk

通过yum默认安装的路径为

  /usr/lib/jvm



vi /etc/profile

#set java environment
JAVA_HOME=/usr/lib/jvm/jre-1.8.0-openjdk-1.8.0.181-3.b13.el7_5.x86_64
PATH=$PATH:$JAVA_HOME/bin
CLASSPATH=.:$JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar
export JAVA_HOME CLASSPATH PATH


. /etc/profile
