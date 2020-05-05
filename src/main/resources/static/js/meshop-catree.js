$(function () {

    $.get("/json/cattree/load", function (data) {
        var setting = {
            edit: {
//						drag : {
//							autoExpandTrigger : true,
//						},
                enable: false,
                //showRemoveBtn : true,
                //showRenameBtn : true,
//						renameTitle : "rename the node"
            },
            check: {
                enable: true,
                chkboxType: {"Y": "", "N": ""},
            },
            view: {
                //addHoverDom: addHoverDom,
                //removeHoverDom: removeHoverDom,
                selectedMulti: false,
                expandSpeed: "fast",
                //dblClickExpand: false

            },
            data: {
                simpleData: {
                    enable: true
                }
            },
            callback: {
                //beforeRename : catTreeRename,
                //beforeRemove: catTreeRemove,
                //beforeDrop: catTreeDrop,
                onRightClick: zTreeOnRightClick,
//					onClick: onClick
                beforeClick: onClick

            },
        }, zTreeNodes = data;
        zTreeObj = $.fn.zTree.init($('.ztree'), setting, zTreeNodes);
    });

    function zTreeOnRightClick(event, treeId, treeNode) {
        var children = "";
        $.each(treeNode.children, function (index, node) {
            children += node.name
        });
        alert(treeNode ? treeNode.tId + ", " + treeNode.id + ":::" + children : "isRoot");
    }

    function catTreeDrop(treeId, treeNodes, targetNode, moveType, isCopy) {
        $.each(treeNodes, function (index, node) {
            $("#" + node.tId + "_ico").addClass("ico_loading");
            if (isCopy) {
                $.post("/json/cattree/add", {
                    pid: "inner" == moveType ? targetNode.id : targetNode.pId,
                    name: node.name,
                    id: node.id
                }).done(function (data) {
                    node.id = eval(data);
                    $.get("/json/cattree/load", {id: eval(data)}, function (subcats) {
                        zTreeObj.addNodes("inner" == moveType ? targetNode : targetNode.getParentNode(), unminifyjson(subcats, ["id", "pId", "name"]), true);
                    });
                    $("#" + node.tId + "_ico").removeClass("ico_loading");
                    zTreeObj.refresh();
                }).fail(function () {
                    alert("failed");
                    zTreeObj.removeNode(node);
                });
                return false;
            } else {
                var oldpId = node.pId;
                $.post("/json/cattree/update", {
                    id: node.id,
                    pid: "inner" == moveType ? targetNode.id : targetNode.pId,
                    name: node.name
                }).done(function () {
                    $("#" + node.tId + "_ico").removeClass("ico_loading");
                }).fail(function () {
                    $("#" + node.tId + "_ico").removeClass("ico_loading");
                    node.pId = oldpId;
                    zTreeObj.updateNode(node);
                });
                return true;
            }
        });


    }

//	function catTreeRemove(treeId, treeNode) {
//		$("#" + treeNode.tId + "_ico").addClass("ico_loading");
//		var oldname = treeNode.name;
//		$.post("/json/cattree/remove", {
//			id : treeNode.id
//		}).done(function() {
//			$("#" + treeNode.tId + "_ico").removeClass("ico_loading");
//			zTreeObj.removeNode(treeNode);
//		}).fail(function() {
//			$("#" + treeNode.tId + "_ico").removeClass("ico_loading");
//		})
//
//	return false;
//}
//	function catTreeRename(treeId, treeNode, newName, isCancel) {
//		if (!isCancel && newName.trim().length > 0) {
//			$("#" + treeNode.tId + "_ico").addClass("ico_loading");
//			var oldname = treeNode.name;
//			$.post("/json/cattree/update", {
//				id : treeNode.id,
//				pid : treeNode.pId,
//				name : newName.trim()
//			}).done(function() {
//				$("#" + treeNode.tId + "_ico").removeClass("ico_loading");
//			}).fail(function() {
//				$("#" + treeNode.tId + "_ico").removeClass("ico_loading");
//				treeNode.name = oldname;
//				zTreeObj.updateNode(treeNode);
//			})
//
//		}
//		return true;
//	}
//	

//	function checkCatTree(id, pid, name) {
//		$.post("/json/cattree/update", {
//			id : id,
//			pid : pid,
//			name : name
//		}, function(data) {
//			return false;
//		});
//	}
//	;

//
//	function addHoverDom(treeId, treeNode) {
//		var sObj = $("#" + treeNode.tId + "_span");
//		if (treeNode.editNameFlag || $("#addBtn_"+treeNode.tId).length>0) return;
//		var addStr = "<span class='button add' id='addBtn_" + treeNode.tId
//			+ "' title='add node' onfocus='this.blur();'></span>";
//		sObj.after(addStr);
//		$("#addBtn_"+treeNode.tId).on("click", function(e){
//			e.preventDefault();
//			$.post("/json/cattree/add", {
//				pid : treeNode.id
//			}).done(function(data) {
//				zTreeObj.addNodes(treeNode, {id:eval(data), pId:treeNode.id, name:"new Category" });
//			})
//		});
//		
//	};
//	function removeHoverDom(treeId, treeNode) {
//		$("#addBtn_"+treeNode.tId).unbind().remove();
//	};


    function onClick(treeId, treeNode) {
        //zTreeObj.expandNode(treeNode);
        $("#catForm").meshop({
            url: "/adminpanel/json/category/load",
            params: {id: treeNode.id}
        });


//		console.log(treeNode.name);
    }


});