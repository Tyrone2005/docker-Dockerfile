
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

log info '正在启动Tracker...'
/etc/init.d/fdfs_trackerd start
isSuccess "Tracker启动" 
log info '正在启动Storaged...'
/etc/init.d/fdfs_storaged start
isSuccess "Storaged启动" 

log info '正在启动Nginx...'
/usr/local/nginx/sbin/nginx
isSuccess "Nginx启动" 