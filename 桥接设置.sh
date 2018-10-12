
read -t 30 -p "请输入需要设置的IP:" setIp
echo -e "\n"
echo  "您输入的IP为：$setIp"
sed -i '/^BOOTPROTO=/c BOOTPROTO=static' /etc/sysconfig/network-scripts/ifcfg-ens33
sed -i '/^ONBOOT=/c ONBOOT=yes' /etc/sysconfig/network-scripts/ifcfg-ens33
sed "/$/IPADDR=${setIp}\\n" /etc/sysconfig/network-scripts/ifcfg-ens33
sed "/$/NETMASK=255.255.255.0\\n" /etc/sysconfig/network-scripts/ifcfg-ens33
sed "/$/GATEWAY=192.168.0.1\\n" /etc/sysconfig/network-scripts/ifcfg-ens33
sed "/$/DNS1=218.30.19.50\\n" /etc/sysconfig/network-scripts/ifcfg-ens33
sed "/$/DNS2=192.168.0.123\\n" /etc/sysconfig/network-scripts/ifcfg-ens33

#关闭防火墙
systemctl disable firewalld.service
#重启网络服务
systemctl restart network.service

function checkIp(){




}

function findStrInFIle(){





}

#IPADDR=192.168.0.108
#NETMASK=255.255.255.0
#GATEWAY=192.168.0.1
#DNS1=218.30.19.50
#DNS2=192.168.0.123