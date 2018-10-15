#!/bin/bash
# ./user.sh oracle /u01/app/oracle/data_01.dbf /u01/app/oracle/index_01.dbf
 
sqlplus -s system/helowin <<EOF
 alter user system identified by 000000;
 alter user sys identified by 000000;
 ALTER PROFILE DEFAULT LIMIT PASSWORD_LIFE_TIME UNLIMITED;
CREATE SMALLFILE 
    TABLESPACE "HD" 
    LOGGING 
    DATAFILE '/home/oracle/app/oracle/oradata/helowin/HD.DBF' 
    SIZE 512M 
    REUSE 
    AUTOEXTEND 
    ON NEXT 128M 
    MAXSIZE 1024M 
    EXTENT MANAGEMENT LOCAL 
    SEGMENT SPACE MANAGEMENT AUTO;
--创建临时表空间
CREATE SMALLFILE 
    TEMPORARY TABLESPACE "HD_TEMP" 
    TEMPFILE '/home/oracle/app/oracle/oradata/helowin/HD_TEMP.DBF' 
    SIZE 512M 
    REUSE 
    AUTOEXTEND 
    ON NEXT 128M 
    MAXSIZE 1024M 
    EXTENT MANAGEMENT LOCAL 
    UNIFORM SIZE 1024K; 
--创建用户并指定表空间 
create user HD identified by 000000 default tablespace HD temporary tablespace HD_TEMP;
--用户授权
grant connect,resource,dba to HD;


CREATE SMALLFILE 
    TABLESPACE "FRONT" 
    LOGGING 
    DATAFILE '/home/oracle/app/oracle/oradata/helowin/FRONT.DBF' 
    SIZE 512M 
    REUSE 
    AUTOEXTEND 
    ON NEXT 128M 
    MAXSIZE 1024M 
    EXTENT MANAGEMENT LOCAL 
    SEGMENT SPACE MANAGEMENT AUTO;
--创建临时表空间
CREATE SMALLFILE 
    TEMPORARY TABLESPACE "FRONT_TEMP" 
    TEMPFILE '/home/oracle/app/oracle/oradata/helowin/FRONT_TEMP.DBF' 
    SIZE 512M 
    REUSE 
    AUTOEXTEND 
    ON NEXT 128M 
    MAXSIZE 1024M 
    EXTENT MANAGEMENT LOCAL 
    UNIFORM SIZE 1024K; 
--创建用户并指定表空间 
create user FRONT identified by 000000 default tablespace FRONT temporary tablespace FRONT_TEMP;
--用户授权
grant connect,resource,dba to FRONT;


CREATE SMALLFILE 
    TABLESPACE "ETP" 
    LOGGING 
    DATAFILE '/home/oracle/app/oracle/oradata/helowin/ETP.DBF' 
    SIZE 512M 
    REUSE 
    AUTOEXTEND 
    ON NEXT 128M 
    MAXSIZE 1024M 
    EXTENT MANAGEMENT LOCAL 
    SEGMENT SPACE MANAGEMENT AUTO;
--创建临时表空间
CREATE SMALLFILE 
    TEMPORARY TABLESPACE "ETP_TEMP" 
    TEMPFILE '/home/oracle/app/oracle/oradata/helowin/ETP_TEMP.DBF' 
    SIZE 512M 
    REUSE 
    AUTOEXTEND 
    ON NEXT 128M 
    MAXSIZE 1024M 
    EXTENT MANAGEMENT LOCAL 
    UNIFORM SIZE 1024K; 
--创建用户并指定表空间 
create user ETP identified by 000000 default tablespace ETP temporary tablespace ETP_TEMP;
--用户授权
grant connect,resource,dba to ETP;


CREATE SMALLFILE 
    TABLESPACE "DBCENTER" 
    LOGGING 
    DATAFILE '/home/oracle/app/oracle/oradata/helowin/DBCENTER.DBF' 
    SIZE 512M 
    REUSE 
    AUTOEXTEND 
    ON NEXT 128M 
    MAXSIZE 1024M 
    EXTENT MANAGEMENT LOCAL 
    SEGMENT SPACE MANAGEMENT AUTO;
--创建临时表空间
CREATE SMALLFILE 
    TEMPORARY TABLESPACE "DBCENTER_TEMP" 
    TEMPFILE '/home/oracle/app/oracle/oradata/helowin/DBCENTER_TEMP.DBF' 
    SIZE 512M 
    REUSE 
    AUTOEXTEND 
    ON NEXT 128M 
    MAXSIZE 1024M 
    EXTENT MANAGEMENT LOCAL 
    UNIFORM SIZE 1024K; 
--创建用户并指定表空间 
create user DBCENTER identified by dbcenter default tablespace DBCENTER temporary tablespace DBCENTER_TEMP;
--用户授权
grant connect,resource,dba to DBCENTER;



ALTER DATABASE DATAFILE '/home/oracle/app/oracle/oradata/helowin/ETP.DBF' AUTOEXTEND ON NEXT 1G MAXSIZE 10G;
ALTER DATABASE DATAFILE '/home/oracle/app/oracle/oradata/helowin/FRONT.DBF' AUTOEXTEND ON NEXT 1G MAXSIZE 10G;
ALTER DATABASE DATAFILE '/home/oracle/app/oracle/oradata/helowin/DBCENTER.DBF' AUTOEXTEND ON NEXT 1G MAXSIZE 10G;
ALTER DATABASE DATAFILE '/home/oracle/app/oracle/oradata/helowin/HD.DBF' AUTOEXTEND ON NEXT 1G MAXSIZE 10G;
EOF
