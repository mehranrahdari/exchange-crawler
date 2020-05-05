$(document).ready(function () {

    $("#tablecrawlers").meshop({
        // url : "/json/boutiques/load",
        //page : $('[data-id=table_page]'),
        data: "sitecrawlers",
        //pageWidth : 10,
        modifyJson: mdfJson,
        loop: loop,
        //filterForm : $('#filter-form'),
        get: true
    });

    function mdfJson(json) { // 1.modeifyjson
        json.trclass = json.active ? "success" : "";
        json.glyphclass = json.active ? "" : "hidden";
        json.btnclass = json.active ? "success" : "danger";

        json.lblclass = json.status == "STOPPED" ? "success" : "danger";
        // if (json.active) {
        // json.checked = "checked='true'";
        // }
        return json;
    }

    function loop(obj, json, mainObj) { // 2.loop
        obj.data('type', json.type);
        obj.data('id', json.id);

        obj.find(".btnstartcrawling").click(function (e) {
            e.preventDefault();
            var btn = $(this);
            btn.addClass("loading");
            $.post("/step1", $.param({
                website: json.id
            }), function () {

                $('.msg').val("");
                meshop.log("ok", "با موفقییت انجام شد");
                meshop.refresh($("#comTable"));

            }).fail(function (e) {
                meshop.log("fail", "خطا در سیستم");
            }).always(function () {
                btn.removeClass('loading');
            });
        });
    }

    function getURLParameter(name) {
        return decodeURI(
            (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [, null])[1]
        );
    }

    function getURLPage() {
        return decodeURI(
            ((location.href).split("/")[(location.href).split("/").length - 1])
        );
    }

    function getURLPage() {
        return decodeURI(
            ((location.href).split("/")[(location.href).split("/").length - 1])
        );
    }


});

	
