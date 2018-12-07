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
function submitInfo(id){
	
	$("#fhrtlist").jqGrid('setGridParam', {postData：'"pguid":pguid'}).trigger("reloadGrid");
}
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
	
	
	$("#fhrtlist").jqGrid('setGridParam', {postData：'"pguid":pguid'}).trigger("reloadGrid");
	
	prmNames是jqGrid的一个重要选项，用于设置jqGrid将要向Server传递的参数名称。其默认值为：

prmNames : {

page:"page", // 表示请求页码的参数名称

rows:"rows", // 表示请求行数的参数名称

sort: "sidx", // 表示用于排序的列名的参数名称

order: "sord", // 表示采用的排序方式的参数名称

search:"_search", // 表示是否是搜索请求的参数名称

nd:"nd", // 表示已经发送请求的次数的参数名称

id:"id", // 表示当在编辑数据模块中发送数据时，使用的id的名称

oper:"oper", // operation参数名称

editoper:"edit", // 当在edit模式中提交数据时，操作的名称

addoper:"add", // 当在add模式中提交数据时，操作的名称

deloper:"del", // 当在delete模式中提交数据时，操作的名称

subgridid:"id", // 当点击以载入数据到子表时，传递的数据名称

npage: null,

totalrows:"totalrows" // 表示需从Server得到总共多少行数据的参数名称，参见jqGrid选项中的rowTotal

}

2.2 jsonReader选项

jsonReader是jqGrid的一个重要选项，用于设置如何解析从Server端发回来的json数据，如果Server返回的是xml数据，则对应的使用xmlReader来解析。jsonReader的默认值为：

jsonReader : {

root: "rows", // json中代表实际模型数据的入口

page: "page", // json中代表当前页码的数据

total: "total", // json中代表页码总数的数据

records: "records", // json中代表数据行总数的数据

repeatitems: true, // 如果设为false，则jqGrid在解析json时，会根据name来搜索对应的数据元素（即可以json中元素可以不按顺序）；而所使用的name是来自于colModel中的name设定。

cell: "cell",

id: "id",

userdata: "userdata",

subgrid: {

root:"rows",

repeatitems: true,

cell:"cell"

}

}
2.3 colModel的重要选项

colModel也有许多非常重要的选项，在使用搜索、排序等方面都会用到。这里先只说说最基本的。

name ：为Grid中的每个列设置唯一的名称，这是一个必需选项，其中保留字包括subgrid、cb、rn。
index ：设置排序时所使用的索引名称，这个index名称会作为sidx参数（prmNames中设置的）传递到Server。
label ：当jqGrid的colNames选项数组为空时，为各列指定题头。如果colNames和此项都为空时，则name选项值会成为题头。
width ：设置列的宽度，目前只能接受以px为单位的数值，默认为150。
sortable ：设置该列是否可以排序，默认为true。
search ：设置该列是否可以被列为搜索条件，默认为true。
resizable ：设置列是否可以变更尺寸，默认为true。
hidden ：设置此列初始化时是否为隐藏状态，默认为false。
formatter ：预设类型或用来格式化该列的自定义函数名。常用预设格式有：integer、date、currency、number等（具体参见文档 ）

三、 注意事项

1. 动态改变Add Form或者Edit Form中的select的内容，如：改变下图中的Comparator下拉中的内容。

clip_image002

$("#list_d").navGrid('#pager_d',{add:true,edit:true,del:true,search:false,refresh:false},

{

checkOnSubmit:false, closeAfterEdit: true,recreateForm:true,

beforeInitData:function(formid){

initComparator();

},

beforeShowForm: function(formid){

$("#list_d").jqGrid('setColProp', 'Name', { editrules:{required:false},});

$('#tr_Name', formid).hide();

}

}，//edit

{},//add

{}//del

）

beforeInitData, beforeShowForm在每次点击编辑的时候都会执行。initComparator的作用是通过ajax获取数据，然后利用$("#list_d").jqGrid('setColProp', 'Comparator', { editoptions: { value: valueString} });来设置Comparator下拉中的内容。其中valueString的格式如下’ equal to: equal to; not equal to: not equal to’。键值之间用冒号隔开，2项之间用分号隔开。注意：把recreateForm设为true，否则'setColProp'只在第一次调用时有效。

2. var rowNum = parseInt($(this).getGridParam("records"), 10); 得到数据条数。

3. jQuery("#list_d").clearGridData();清空数据。

4. jQuery("#list").getCell(ids,"Key");获取第ids行的key列。

5. $("#list").jqGrid('setSelection', "1");选中第一行。放在loadComplete：中在gird加载完成的时候自动选中第一行。loadComplete:function(data){$("#list").jqGrid('setSelection', "1");

}

6. 对于像1中的可编辑的字段，可以设定rule，参见http://www.trirand.com/jqgridwiki/doku.php?id=wiki:common_rules#editrules

7. 修改Option，以URL为例

jQuery("#list_d").jqGrid('setGridParam',{url:"xxx.aspx",page:1}).trigger('reloadGrid');

}  