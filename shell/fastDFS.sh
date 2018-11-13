###!/bin/bash

#设置日志级别
loglevel=0 #debug:0; info:1; warn:2; error:3
logfile=$0".log"
function log {
    local msg;local logtype
    logtype=$1
    msg=$2
    datetime=`date +'%F %H:%M:%S'`
    logformat="[${logtype}]\t${datetime}\tfuncname: ${FUNCNAME[@]/log/}\t[line:`caller 0 | awk '{print$1}'`]\t${msg}"
    {  
    case $logtype in 
        debug)
            [[ $loglevel -le 0 ]] && echo -e "\033[30m${logformat}\033[0m" ;;
        info)
            [[ $loglevel -le 1 ]] && echo -e "\033[32m${logformat}\033[0m" ;;
        warn)
            [[ $loglevel -le 2 ]] && echo -e "\033[33m${logformat}\033[0m" ;;
        error)
            [[ $loglevel -le 3 ]] && echo -e "\033[31m${logformat}\033[0m" ;;
    esac
    } | tee -a $logfile
}

#set -x  # activate debugging from here
set +x  # stop debugging from here

function isSuccess {

    if [ $? -eq 0 ]; then 
         log info "$@-----执行成功"
    else 
        log error "$@-----执行失败"
        exit
    fi
}

#检测网络
ping -c 3 -w 5 www.baidu.com
isSuccess "检测网络是否正常"

#修改复制默认提示覆盖的别名设置
sed -i '6s/^/#&/g' ~/.bashrc
isSuccess "修改复制默认提示覆盖的别名设置"

#获取当前主机IP，存入变量
local_ip=`ifconfig -a|grep -o -e 'inet [0-9]\{1,3\}.[0-9]\{1,3\}.[0-9]\{1,3\}.[0-9]\{1,3\}'|grep -v "127.0.0"|grep -v "172.17.0"|awk '{print $2}'`
#redhat6.5
#local_ip=`ip addr|grep -o -e 'inet [0-9]\{1,3\}.[0-9]\{1,3\}.[0-9]\{1,3\}.[0-9]\{1,3\}'|grep -v "127.0.0"|grep -v "172.17.0"|awk '{print $2}'`
log info "本机IP为：${local_ip}"
filearray=(FastDFS_v5.05.tar.gz apache-tomcat-7.0.47.tar.gz fastdfs-nginx-module_v1.16.tar.gz libfastcommon-master.zip nginx-1.6.2.tar.gz nginx-1.6.2.tar.gz WTS.jpg nginx.conf)
#判断准备的文件是否存在，准备文件
if test -d /usr/local/software
then
    log info '/usr/local/software文件夹------OK!'
    cd /usr/local/software
    file_num=`ls -l | grep "^-" | wc -l`
    log warn "应存在文件数量：${#filearray[@]}  实际存在文件数量：${file_num}"
    if [ ${file_num} -lt ${#filearray[@]} ]
    then log error '文件不全.正在查找缺失文件...'
        #检查具体不存在的文件
        flag=0;
        for i in ${filearray[@]}
        do
            if test -e  $i;
             then
                 flag=`expr ${flag} + 1`;
            else
                log error "缺少文件【$i】";
            fi
        done
        if [ ${flag}!=${#filearray[@]} ]
                then log error "结束脚本.";exit
        fi
    fi
else
    mkdir /usr/local/software
    log error '/usr/local/software 文件夹不存在!已自动创建'
    log error '请拷贝相关安装软件包到/usr/local/software目录下.'
    exit
fi


#关闭防火墙，不然NGINX访问不到
log warn "正在关闭防火墙"
systemctl stop firewalld.service

#redhat6.5  
#service iptables stop

isSuccess "关闭防火墙" | log info


#安装相关依赖
log info "正在安装所需要的工具..."
yum install -y vim-enhanced 
yum install -y make cmake gcc gcc-c++
yum install -y zip unzip 
yum install -y wget 

#解压
cd /usr/local/software && unzip -o libfastcommon-master.zip -d /usr/local/fast/
isSuccess "解压libfastcommon-master.zip"

#进入目录并且编译
cd /usr/local/fast/libfastcommon-master/
./make.sh
./make.sh install

#创建软链接
ln -s /usr/lib64/libfastcommon.so /usr/local/lib/libfastcommon.so
ln -s /usr/lib64/libfastcommon.so /usr/lib/libfastcommon.so
ln -s /usr/lib64/libfdfsclient.so /usr/local/lib/libfdfsclient.so
ln -s /usr/lib64/libfdfsclient.so /usr/lib/libfdfsclient.so

#解压tar
cd /usr/local/software && tar -zxvf FastDFS_v5.05.tar.gz -C /usr/local/fast/
isSuccess "解压FastDFS_v5.05.tar.gz"
#编译 安装
cd /usr/local/fast/FastDFS/
./make.sh
./make.sh install

#检查
cd /etc/init.d/ && ls | grep fdfs
cd /etc/fdfs/ && ll

#编辑
log info "开始修改/etc/init.d/fdfs_storaged"
sed -i 's+/usr/local/bin+/usr/bin+g' /etc/init.d/fdfs_storaged
isSuccess "修改/etc/init.d/fdfs_storaged"
log info "开始修改/etc/init.d/fdfs_trackerd"
sed -i 's+/usr/local/bin+/usr/bin+g' /etc/init.d/fdfs_trackerd
isSuccess "修改/etc/init.d/fdfs_trackerd"

cd /etc/fdfs/ && cp tracker.conf.sample tracker.conf

log info "开始修改/etc/fdfs/tracker.conf"
sed -i '/^base_path=/c base_path=/fastdfs/tracker' /etc/fdfs/tracker.conf
isSuccess "修改/etc/fdfs/tracker.conf"

mkdir -p /fastdfs/tracker

log info "启动fdfs_trackerd"
/etc/init.d/fdfs_trackerd start
isSuccess "启动fdfs_trackerd"
cd /etc/fdfs/ &&  cp storage.conf.sample storage.conf

#然后修改
log info "开始修改/etc/fdfs/storage.conf"
sed -i '/^base_path=/c base_path=/fastdfs/storage' /etc/fdfs/storage.conf
sed -i '/^store_path0=/c store_path0=/fastdfs/storage' /etc/fdfs/storage.conf
sed -i "/^tracker_server=/c tracker_server=${local_ip}:22122" /etc/fdfs/storage.conf
sed -i '/^http.server_port=/c http.server_port=8888' /etc/fdfs/storage.conf

#
mkdir -p /fastdfs/storage
#
log info "fdfs_storaged"
/etc/init.d/fdfs_storaged start
isSuccess "fdfs_storaged"

#查看
#cd /fastdfs/storage && ll
#ps -ef | grep fdfs
#cd /fastdfs/storage/data/ && ls

cd /etc/fdfs && cp client.conf.sample client.conf

sed -i '/^base_path=/c base_path=/fastdfs/tracker' /etc/fdfs/client.conf
sed -i "/^tracker_server=/c tracker_server=${local_ip}:22122" /etc/fdfs/client.conf

#cd /usr/bin/ && ls | grep fdfs

cd /usr/local/software

#下载Nginx
#wget http://nginx.org/download/nginx-1.6.2.tar.gz

#安装相关依赖
yum install -y pcre pcre-devel
yum install -y zlib zlib-devel
yum install -y openssl openssl-devel
#解压
tar -zxvf nginx-1.6.2.tar.gz -C /usr/local/
cd  /usr/local/nginx-1.6.2 && ./configure --prefix=/usr/local/nginx

#编译
make && make install

#查看
#/usr/local/nginx/sbin/nginx
#isSuccess "启动nginx"
#ps -ef | grep nginx

#http://192.168.0.129/    访问NGINX页面，若不通，关闭防火墙试试。systemctl stop firewalld.service

cd /usr/local/software/ && tar -zxvf fastdfs-nginx-module_v1.16.tar.gz -C /usr/local/fast/
isSuccess "解压fastdfs-nginx-module_v1.16.tar.gz"
cd /usr/local/fast/ && ll
cd fastdfs-nginx-module/src/ && ll

#把文件的第四行配置中的/usr/local/include都改为/usr/include，共两处
sed -i 's+/usr/local/include+/usr/include+g' config
isSuccess "修改config"

cd /usr/local && rm -rf nginx/
isSuccess "删除nginx/"
cd nginx-1.6.2/
./configure --add-module=/usr/local/fast/fastdfs-nginx-module/src/
isSuccess "加载模块"
make && make install

cd /usr/local/fast/fastdfs-nginx-module/src/ 
cp /usr/local/fast/fastdfs-nginx-module/src/mod_fastdfs.conf /etc/fdfs/
cd /etc/fdfs 
#
sed -i '/^connect_timeout=/c connect_timeout=10' mod_fastdfs.conf
isSuccess "修改mod_fastdfs1"
sed -i "/^tracker_server=/c tracker_server=${local_ip}:22122" mod_fastdfs.conf
isSuccess "修改mod_fastdfs2"
#注意：文件中此行等号前有空格，许特殊处理
sed -i '/^url_have_group_name[[:space:]]=/c url_have_group_name=true '  /etc/fdfs/mod_fastdfs.conf
#sed -i '/^url_have_group_name=/c url_have_group_name=true' mod_fastdfs.conf
isSuccess "修改mod_fastdfs3"
sed -i '/^store_path0=/c store_path0=/fastdfs/storage' mod_fastdfs.conf
isSuccess "修改mod_fastdfs4"

cd /usr/local/fast/FastDFS/conf/ && cp  -f http.conf mime.types /etc/fdfs
ln -s /fastdfs/storage/data/ /fastdfs/storage/data/M00
isSuccess "创建软链接"
cd /usr/local/software && cp nginx.conf /usr/local/nginx/conf/

log info '正在启动Tracker...'
/etc/init.d/fdfs_trackerd start
isSuccess "Tracker启动" 
log info '正在启动Storaged...'
/etc/init.d/fdfs_storaged start
isSuccess "Storaged启动" 

log info '正在启动Nginx...'
/usr/local/nginx/sbin/nginx
isSuccess "Nginx启动" 

#测试文件上传
testFilePath=`/usr/bin/fdfs_upload_file /etc/fdfs/client.conf /usr/local/software/WTS.jpg`
echo "$testFilePath"
log info "请复制链接到浏览器，检查安装结果：  http://${local_ip}:8888/${testFilePath}"
