<%@ page language="java" import="java.util.*" contentType="text/html; charset=utf-8" pageEncoding="UTF-8"%>
<%@include file="/context/mytags.jsp"%>
<%
    ResourceBundle resource = ResourceBundle.getBundle("sysConfig");
    String url = resource.getString("superMapUrl");
%>
<!DOCTYPE HTML>
<html>
<meta charset="utf-8">
<head>
<title>SuperMap iClient for JavaScript:TiledDynamicRESTLayer</title>
<script type="text/javascript" src="plug-in/supermap/libs/SuperMap.Include.js"></script>
<h:base type="jquery-hp,hplus,hplisttools"></h:base>
<style>
body {
	margin: 10px;
}

.demo-carousel {
	height: 200px;
	line-height: 200px;
	text-align: center;
}

</style>

</head>

<body onload="init()">
	<input id="applyid" name="applyid" hidden="true" value="${param.id}">
	<div id="toolbar">
		<input type="button" value="定位" onclick="userLocation();" /> <input
			type="button" value="清除标记" onclick="clearMarks();" />
	</div>
	<div id="map"
		style="position: absolute; left: 0px; right: 0px; width: 100%; height: 95%;">
	</div>
</body>
<script type="text/javascript">
	//声明全局变量
	var map, mapLayer, markerlayers, lon, lat, applyid = $("#applyid").val(),regionLevel,infowin = null;
	var  url = '<%=url %>';
	var buttonHtml = '';
	//初始化
	function init() {
		map = new SuperMap.Map("map");
		map.addControl(new SuperMap.Control.MousePosition(),new SuperMap.Pixel(800, 720), {prefix : "pos:"});
		map.addControl(new SuperMap.Control.ScaleLine());
		map.addControl(new SuperMap.Control.LayerSwitcher());
		map.addControl(new SuperMap.Control.OverviewMap());
		markerlayers = new SuperMap.Layer.Markers("Markers", {});
		map.addLayer(markerlayers);

		map.events.on({
			"click" : mapClick,
			//"moveend" : moveend
			"zoomend" : zoomend
		});

		mapLayer = new SuperMap.Layer.TiledDynamicRESTLayer("normal", url, null, {
			maxResolution : "auto"
		});

		mapLayer.events.on({
			"layerInitialized" : addLayer
		});

	}

	//添加基础图层
	function addLayer() {
		map.addLayer(mapLayer);
		map.setCenter(new SuperMap.LonLat(0, 0), 2, null, true);
		userLocation();
	}

	//地图点击事件
	function mapClick(e) {
		var point = new SuperMap.Pixel(e.xy.x, e.xy.y);
		var geopoint = map.getLonLatFromPixel(point);
		clearMarks();
		addPin(geopoint.lon, geopoint.lat);
	}

	//移动事件
	function moveend() {
		var level = map.getzoom;
		map.setCenter(new SuperMap.LonLat(lon, lat));
	}

	//缩放事件
	function zoomend() {
		var level = map.getzoom;
		map.setCenter(new SuperMap.LonLat(lon, lat));
	}

	//添加标记
	function addPin(x, y) {
		lon = x ;
		lat = y ;
		var size = new SuperMap.Size(44, 33);
		var offset = new SuperMap.Pixel(-(size.w / 2), -size.h);
		var icon = new SuperMap.Icon(
				"plug-in/supermap/theme/images/cluster1.png", size, offset);
		var marker = new SuperMap.Marker(new SuperMap.LonLat(x, y), icon);
		markerlayers.addMarker(marker);
		marker.events.on({
			"rightclick" : clearMark,
			"click" : mouseClickHandler,
			//"mousemove":mouseClickHandler,
			//"mouseout":closeInfoWin,
			"scope" : marker
		});
	}

	//移除标记
	function removePin(x, y) {
		markerlayers.removeMarker(marker);
	}

	function removeMarkers() {
		var layers1 = map.getLayersByName("Markers");
		map.removeLayer(layers1, false);
	}

	//定位
	function userLocation() {

		//从基础数据库中获取userLocation,定位并设置标记，
		//如果没有数据，手动定位
		var userlon, userlat, userRegionLevel, zoomLevel;
		$.ajax({
			async : false,
			cache : false,
			type : 'POST',
			data : {},
			url : 'bhGisBaseController.do?getGisInfo',// 请求的action路径
			error : function() {// 请求失败处理函数
				alert('定位失败!!');
			},
			success : function(data) {
				var data = $.parseJSON(data);
				if (data.success == true) {
					//定位结束给相关变量赋值。
					lon = data.obj.lon;
					lat = data.obj.lat;
					zoomLevel = data.obj.zoomLevel;
					regionLevel = data.obj.regionLevel;
					if (markerlayers.markers.length == '0') {
						 addPin(lon, lat);
					}
					map.setCenter(new SuperMap.LonLat(lon, lat),
							zoomLevel, null, true);
				} else {
					//layer.msg('数据库没有基础数据，请手动定位。');
					alert('数据库没有基础数据，请手动定位。');
				}
			}
		});

	}

	//删除全部标记
	function clearMarks() {
		var markers = markerlayers.markers;
		for (var i = 0; i < markers.length; i + 1) {
			markerlayers.removeMarker(markers[i]);
		}
	}
	
	//删除单个标记标记
	function clearMark() {
		var marker = this ;
		markerlayers.removeMarker(marker);
	}
	
	var infowin = null;
    //定义mouseClickHandler函数，触发click事件会调用此函数
    function mouseClickHandler(event){
        closeInfoWin();
        //初始化popup类
        popup = new SuperMap.Popup(
                "info",
                this.getLonLat(),
                new SuperMap.Size(220,140),
                '<div style="width: 280px;height: 160px;padding: 10px;">' + 
                '<p style="margin:5px;">姓&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;名：<input class="popMenu" id="applyname" disabled="disabled"  type="text" style="width: 180px;" value="'+applyid+'"/></p>' +
                '<p style="margin:5px;">电&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;话：<input class="popMenu" id="contact" disabled="false"  type="text"  style="width: 180px;"/></p>' +
                '<p style="margin:5px;">家庭住址：<input class="popMenu" id="address" disabled="false" type="text"  style="width: 180px;"/></p>' +
                '<p style="margin:5px;">户籍地址：<input class="popMenu" id="household" disabled="false" type="text"  style="width: 180px;"/></p><div style="width: 100%;text-align: right;height: 30px;">' +
                '<button type="button" onclick="editInfo();">编辑</button>' +
                '<button type="button" onclick="saveGisInfo();" style="margin-right: 11px;">保存</button></div></div>',
                true,
                null
        );
        popup.autoSize=true;
        infowin = popup;
        //添加弹窗到map图层
        map.addPopup(popup);
    }

    function closeInfoWin(){
        if(infowin){
            try{
                infowin.hide();
                infowin.destroy();
            }
            catch(e){}
        }
    }
    
    
	//查看信息
	function viewInfo() {
		var  LonLat =this.getLonLat();
	    //applyid = $("#applyid").val();
		alert('经度:' + LonLat.lon + ',纬度:' + LonLat.lat + ",id:" + applyid);
		
		//获取申请人姓名：
		
		
	}
	
	//编辑信息
	function editInfo(e) {
		//var markers = markerlayers.markers;
		$(".popMenu").attr("disabled",false);
	}
	
	//保存
    function saveGisInfo(){
    	$(".popMenu").attr("disabled",true);
    	//applyid = $("#applyid").val();
    	var contact = $("#contact").val();
    	var address = $("#address").val();
    	var household = $("#household").val();
    	
    	var params= {"applyid":applyid,"lon":lon,"lat":lat,"regionLevel":regionLevel,"contact":contact,"address":address,"household":household};
    	
		$.ajax({
			async : false,
			cache : false,
			type : 'POST',
			data : params,
			url : 'bhGisBaseController.do?saveGisInfo',// 请求的action路径
			error : function() {// 请求失败处理函数
				layer.msg('保存地理信息异常!!');
			},
			success : function(data) {
				var data = $.parseJSON(data);
				if (data.success == true) {
					 layer.msg('保存成功!!');
				} else {
					layer.msg('保存地理信息失败!!');
				}
			}
		});
    }
    
</script>
</html>
