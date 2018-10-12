

yum update
yum remove docker  docker-common docker-selinux docker-engine
yum install -y yum-utils device-mapper-persistent-data lvm2
yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
yum list docker-ce --showduplicates | sort -r
yum install -y docker-ce
#sudo yum install docker-ce-17.12.0.ce

sudo systemctl start docker
sudo systemctl enable docker

docker version


#sudo yum erase docker-common-2:1.12.6-68.gitec8512b.el7.centos.x86_64

rpm --import http://mirrors.163.com/centos/RPM-GPG-KEY-CentOS-7

docker run hello-world

docker pull nginx
docker images nginx


mkdir -p ~/nginx/www ~/nginx/logs ~/nginx/conf


docker run -p 80:80 --name Tnginx -v $PWD/www:/www -v $PWD/conf/nginx.conf:/etc/nginx/nginx.conf -v $PWD/logs:/wwwlogs  -d nginx

#tomcat
docker run -p 8081:8080 docker.io/tomcat  

docker run -d -v /usr/docker_file/NginxDemo.war:/usr/local/tomcat/webapps/NginxDemo.war -p 8080:8080 docker.io/tomcat 

docker  run  -d -v /usr/local/tyrone_dev/tomcat/nv.war:/usr/local/tomcat/webapps/nv.war -p 8080:8080 tomcat:7.0.88


#mysql
docker  exec -it   3cb492a27475   /bin/bash 

docker run -p 3306:3306 --name mysql -v $PWD/conf:/etc/mysql/conf.d -v $PWD/logs:/logs -v $PWD/data:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=123456 -d mysql:5.6

docker exec -it mysql5.7  mysql  -u root -p

CREATE USER 'hd'@'%' IDENTIFIED BY '000000';

#redis
docker run --name redis -p 6379:6379 -v $PWD/data:/data  -d redis:3.2 redis-server --appendonly yes
docker exec -it ff9faa2c7421 redis-cli

#python
docker run --name python -v $PWD:/usr/src/myapp  -w /usr/src/myapp python:3.5 python helloworld.py


#weblogic
docker run -d -p 49163:7001 -p 49164:7002 -p 49165:5556 ismaleiva90/weblogic12:latest
在浏览器中访问weblogic：  http://172.150.19.40:49163/console


docker run --name weblogic12 -v $PWD/nv:/u01/oracle/weblogic/user_projects/domains/base_domain/autodeploy/nv  -d -p 7001:7001 -p 7002:7002 -p 5556:5556 ismaleiva90/weblogic12:latest

docker run --name weblogic12  -d -p 7001:7001 -p 7002:7002 -p 5556:5556 ismaleiva90/weblogic12:latest




{ 
"registry-mirrors": ["https://docker.mirrors.ustc.edu.cn"] 
}

{ 
"registry-mirrors": ["http://hub-mirror.c.163.com"] 
}

{ 
"registry-mirrors": ["http://hub-mirror.c.163.com"] 
}

#更改镜像源
vi /etc/docker/daemon.json

{
  "storage-driver":"devicemapper"
}
{ 
"registry-mirrors": ["http://hub-mirror.c.163.com"] 
}

$ echo "DOCKER_OPTS=\"\$DOCKER_OPTS --registry-mirror=http://f2d6cb40.m.daocloud.io\"" | sudo tee -a /etc/default/docker
$ sudo service docker restart