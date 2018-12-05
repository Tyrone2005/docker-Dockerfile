var rowSelData;
var ue = UE.getEditor("editor");
var JosnList=[];
var tablefrom = "BH_FUNERALHOME_RATE";

$(function() {
	queryMetadata("SEACH_SHZT,CHECK_STATUS,INFOTYPE,ISPUBLISH",createSelectNode, init);

	document.onkeydown = function(e){ 
	    var ev = document.all ? window.event : e;
	    if(ev.keyCode==13) {
	    	selectCommInfo();
	     }
	};
});

function init(){
	
	pageInit();
	//查询
	$("#search").click(function() {
		selectCommInfo();
	});
	
	// 重置
	$("#reset").click(function(){
		 $(".seach_list input[type ='text'] ").each(function(){
				$(this).val('');
		 });
		 $(".seach_list select ").each(function(){
				$(this).attr('value','');
		 });
	})
	/**
	 * 配置添加对话框
	 */
	$("#zcgkDlg").dialog({
		autoOpen : false, // 是否自动弹出窗口
		modal : true, // 设置为模态对话框
		resizable : false,
		width :1000,
		height : 550,
		position : "center", // 窗口显示的位置
		close : function() {
			  setFormData(rowSelData,"add_form",false);
			  document.getElementById("add_form").reset(); 
			  $("#add_form").validate().resetForm();
			  ue.destroy();
			  $("#editor").remove();
			  $("#appendEditor").append(
					  '<script id="editor" type="text/plain" name="infoContent" '+
					  'style="width:750px;height:300px;"></script>');
			  if(JosnList.length>0){
					JosnList.splice(0,JosnList.length);	
			  };
			  $('#thelist').empty();
			  $("#picker").removeAttr("hidden");
			  //$("#ctlBtn").removeAttr("hidden");
		}
	});

	/**
	 * 配置审核对话框
	 */
	$("#checkSqJbxxDlg").dialog({
		autoOpen : false, // 是否自动弹出窗口
		modal : true, // 设置为模态对话框
		resizable : false,
		width : 770,
		height : 400,
		position : "center", // 窗口显示的位置
		close : function() {
			setFormData(rowSelData,"checkSqJbxx_form",false);
			document.getElementById("checkSqJbxx_form").reset(); 
			$("#checkSqJbxx_form").validate().resetForm();
		},
	});

	// 审核 
	$("#t_list1").on("click", "div#check_btn", function() {
		 var consoleDlg = $("#checkSqJbxxDlg");
		 var rows = $('#list1').jqGrid('getGridParam', 'selarrrow');
		 if (rows.length == 0) {
				jAlert('请选择要审核的数据！','提示');
				return;
			}
		 var ids = [];
		 for (var i = 0;i<rows.length;i++){
			 // 根据上面的rowid获得本行的所有数据
				var rowData = $("#list1").jqGrid("getRowData", rows[i]);
				if(rowData.shzt=='00'){
					jAlert('要审核的数据中包含未提交的数据，请确认提交之后再进行审核！','提示');
					return;
				}
				if(rowData.shzt=='10'||rowData.shzt=='11'){
					jAlert('要审核的数据中包含已审核过的数据，请重新选择需要审核的数据！','提示');
					return;
				}
				rowData.lrsj="";
				ids.push(rowData);
			 }
		 $("#auditStatus option:selected").attr("selected",false);
		 $("#auditStatus").children('option[value="0"]').wrap('<span>').hide(); 
	   	 consoleDlg.dialog('option', 'buttons', { "取消": function() {
	   		    $(this).dialog("close");
	   		 }, "确定": function(){checkSqfwptInfo(ids);}});
	   	 consoleDlg.dialog("option", "title", "审核信息").dialog("open");  
	});
	
}


/**
 * 审核
 * @param ids
 */
function checkSqfwptInfo(ids) {
	var flag=seachCheckData(ids,tablefrom,"check");
	if(flag){
		selectCommInfo();
		return;
	}
	if(!$('#checkSqJbxx_form').validate().form()){
		return;
	}
	var chdata=getFormData("checkSqJbxx_form");
	var data = {};
	var auditStatus=chdata.auditStatus;
	var auditOpinion=chdata.auditOpinion;
	if(ids.length>0){
		for(var i=0;i<ids.length;i++){
			var data = ids[i];
				data.shzt=auditStatus;
			    data.shyj=auditOpinion;
			    data.infoType='';
			    data.lrrid='';
		}
	}
	$.ajax({
		url : 'GsZdGgxxController/checkGgxxInfo',
		type : "POST",
		dataType : 'json',
		data : {
			ids : JSON.stringify(ids),
		},
		success : function(data) {
			if (data == "1") {
				jAlert("数据审核成功",'提示信息');
				$("#checkSqJbxxDlg").dialog("close");
				$("#list1").jqGrid('setGridParam', {}).trigger("reloadGrid");
			} else {
				jAlert("数据审核失败",'提示信息');
				$("#checkSqJbxxDlg").dialog("close");
				$("#list1").jqGrid('setGridParam', {}).trigger("reloadGrid");
			}
		}
	});
}
/**
 * 提交功能是将数据变成临时数据变成正式数据，并将审核状态置为待审核
 * */
function submitInfo(id){}
/**
 * 列表数据初始化
 */
function pageInit() {
	jQuery("#fhrtlist").jqGrid({
		url : 'GsZdGgxxController/showAllGsZdGgxx',
		datatype : "json",
		postData : {},
		height : $(window).height()-370,// 高度和宽度通过窗口大小定义
		width : $(window).width() - 240,
		toolbar : [ true, "top" ], // 添加工具条到表头
		colNames : [ 'id','标题','内容','信息类别','添加人','添加时间','审核状态','审核状态编码','审核意见',
		             '发布状态','发布状态编码','发布人','发布时间'],
		colModel : [ 
		     {name : 'id', index : 'id', width : 200, hidden: true}, 
		     {name : 'infoTitle', index: 'infoTitle', width : 200},
		     {name : 'infoContent', index : 'infoContent', width : 200, hidden: true}, 
		     {name : 'infoType', index : 'infoType', width : 200,
		    	 formatter : function(cellvalue, options,row) {
					 var newCellValue = "";
					 $.each(COMMON_DATA.METADATA.INFOTYPE,function(index, value) {
					     if (cellvalue == value.itemCode) {
						 	 newCellValue = value.itemName;
							 return false;
						 }
					 });
					 return newCellValue;
				 }},
		     {name : 'lrrid', index : 'lrrid', width : 200}, 
		     {name : 'lrsj', index : 'lrsj', width : 250, formatter : 'date',
		    	 formatoptions:{srcformat: 'u', newformat: 'Y-m-d'}}, 
		     {name : 'shzt', index : 'shzt',
				 formatter : function(cellvalue, options,row) {
					 var newCellValue = "";
					 $.each(COMMON_DATA.METADATA.SEACH_SHZT,function(index, value) {
					     if (cellvalue == value.itemCode) {
						 	 newCellValue = value.itemName;
							 return false;
						 }
					 });
					 return newCellValue;
				 }}, 
			 {name : 'shzt', index : 'shzt', hidden : true}, 
			 {name : 'shyj', index : 'shyj', hidden : true},
			 {name : 'isPublish', index : 'isPublish',
				 formatter : function(cellvalue, options,row) {
					 var newCellValue = "";
					 $.each(COMMON_DATA.METADATA.ISPUBLISH,function(index, value) {
					     if (cellvalue == value.itemCode) {
						 	 newCellValue = value.itemName;
							 return false;
						 }
					 });
					 return newCellValue;
				 }},
			 {name : 'isPublish', index : 'isPublish', hidden : true},
			 {name : 'publishUser', index : 'publishUser'},
			 {name : 'publishTime', index : 'publishTime', 
				 formatter : 'date',formatoptions:{srcformat: 'u', newformat: 'Y-m-d'}},
		],
		prmNames : {
			nd : null
		},
		jsonReader : {
			id : "id",// 设置返回参数中，表格ID的名字为blackId
			repeatitems : false
		},
		loadComplete:function(data){
			var rowNum = data.rows.length;
			var message="";
			if(rowNum==0){ //如果没有记录返回，追加提示信息，删除按钮不可用 
				if($("#norecords").html() == null){
					$("#list1").parent().append("<pre><div id='norecords'>没有查询记录！</div></pre>");
				}
				$(".ui-pg-input").val("0"); $("#norecords").show();
	        }else {
	        	 $("#norecords").hide();
	        }
		},
		page : 1,
		rowNum : 10,
		toolbar : [ true, "top" ],
		rownumbers : true,
		rowList : [ 10, 20, 30 ],
		pager : '#pager1',
		viewrecords : true,
		gridview: true,
		multiselect : true,
		scrollrows : true,
		shrinkToFit : true,
		ondblClickRow:viewPolicies,
		onSortCol: function (index, colindex, sortorder){	
            //列排序事件
			//获取当前页的page值
            $("#list1").jqGrid('setGridParam',{page:$(".ui-pg-input").val()});
        },
		gridComplete : function() {
			creatButton(COMMON_DATA.fUNCTION_STR);
		}
	});
}
/**
 * 条件查询
 */
function selectCommInfo(){
	$(".seach_list input").each(function(index, element) {
		var result = $(this).attr("value").replace(/(^\s*)|(\s*$)/g, "");
		$(this).attr("value", result);
	});
	var postData=	$('#list1').jqGrid("getGridParam", "postData");  
    $.each(postData, function (k, v) {  
        delete postData[k];  
    });
	var infoTitle = $("#search_infoTitle").val();
	var infoType = $("#srarch_infoType").val();
	var startTime = $("#startTime").val();
	var endTime=$("#endTime").val();
	$("#list1").jqGrid('setGridParam',{
				datatype : 'json',
				page : $(".ui-pg-input").val(),
				postData : {
					infoTitle:encodeURI(infoTitle),
					infoType:infoType,
					startTime : startTime,
					endTime : endTime
				},
				loadComplete : function(data) {
					if (data.records == 0) { // 如果没有记录返回，追加提示信息，删除按钮不可用
						if ($("#norecords").html() == null) {
							$("#list1")
									.parent()
									.append(
											"<pre><div id='norecords'>没有查询记录！</div></pre>");
						}
						$(".ui-pg-input").val("0");$("#norecords").show();
					} else {
						$("#norecords").hide();
					}
				},
			}).trigger("reloadGrid"); // 重新载入
}

/**
 * 根据不同角色配置工具条按钮
 * @param data
 */
function creatButton(funString) {}

/**
 * 打开新增模态框
 */
function openAddDialog(){}
/**
 * 新增通知公告
 */
function addPoliciesInfo() {}
/**
 * 打开修改模态框
 */
function openUpdateDialog(){}

/**
 * 查看详细消息
 * @param rowid
 */

function viewPolicies(rowid){
	 var consoleDlg = $("#zcgkDlg");
	 //var rowid = $('#list1').jqGrid('getGridParam', 'selrow');
	 if (rowid == null) {
			jAlert('请选择要查看的数据！',"提示信息");
			return;
	 }
	var rowLength = $('#list1').jqGrid('getGridParam', 'selarrrow');
	if(rowLength.length >1){
			 jAlert('请选择一行进行操作！','提示信息');
			 return;
	}
	var rowData = $("#list1").jqGrid("getRowData", rowid);
	ue = UE.getEditor("editor");
	 ue.addListener("ready", function () { 
		ue.setDisabled();
		ue.setContent(rowData.infoContent); 
	 });  
	 $.ajax({
			url : 'accessoryController/showAccessoryByApplyInfoId',
			type : "POST",
			dataType : 'json',
			data : {applyInfoId:rowData.id},
			success : function(data) {
				var infot;
				var cutfilename;
				for ( var int = 0; int < data.length; int++) {
					infot = data[int];
					var accessoryUrl=infot.accessoryUrl.replace(/\\/g,"/");
					if(infot.name.length>30){
						cutfilename = cutstr(infot.name);
					}else{
						cutfilename = infot.name;
					}
					$('#thelist').append( '<div id="' + infot.id + '" class="item" style="width:430px;">' +
					'<div class="shangchuan"><a href="/LsSociety/DownLoadFile.do?url='+accessoryUrl+'" name="'+ infot.name
					+'"><h4 style="width:350px;">' + cutfilename + '</h4></a></div>' );
				}
			}
	 });
	 $("#picker").attr("hidden","true");
	 $("#layout").attr("style","display: none;");
	setFormData(rowData,"add_form",true,true);
	rowSelData=rowData;
	$("#createTime").attr('disabled', 'true');
	$("#proType").attr('disabled', 'true');
	$("#dispatchName").attr('disabled', 'true');
	var consoleDlg = $("#zcgkDlg");
   	consoleDlg.dialog('option', 'buttons', { "关闭": function() {
   		    $(this).dialog("close");
   		 }});
    consoleDlg.dialog("option", "title", "查看公告信息").dialog("open"); 
}

/**
 * 根据数据字典创建下拉框
 * 
 * @param metadata
 */
function createSelectNode(metadata) {
	$.each(metadata.CHECK_STATUS, function(index, value) {
		$("#auditStatus").append(
				"<option value='" + value.itemCode + "'>" + value.itemName
				+ "</option>");
	});
	$.each(metadata.INFOTYPE, function(index, value) {
		$("#srarch_infoType,#infoType").append(
				"<option value='" + value.itemCode + "'>" + value.itemName
				+ "</option>");
	});
}


/**
 * 处理附件名称过长
 * wuguoliang
 * 2017/02/21
 */
function cutstr(str){
	var a=parseInt(str.lastIndexOf(".")) ;
	var b=parseInt(str.length);
	var c=str.substring(0, 23);
	var d=str.substring((a-2),b);
	return c+"..."+d;
	
}

/**
 * 去空格
 * @param str
 * @returns
 */
function btrim(str) {
	if(str&&str!=""){
		return str.replace(/(^\s*)|(\s*$)/g, "");
	 }
}
/**
 * 遍历数组
 */
if (!Array.prototype.forEach) {  
    Array.prototype.forEach = function(callback, thisArg) {  
        var T, k;  
        if (this == null) {  
            throw new TypeError(" this is null or not defined");  
        }  
        var O = Object(this);  
        var len = O.length >>> 0; // Hack to convert O.length to a UInt32  
        if ({}.toString.call(callback) != "[object Function]") {  
            throw new TypeError(callback + " is not a function");  
        }  
        if (thisArg) {  
            T = thisArg;  
        }  
        k = 0;  
        while (k < len) {  
            var kValue;  
            if (k in O) {  
                kValue = O[k];  
                callback.call(T, kValue, k, O);  
            }  
            k++;  
        }  
    };  
}  