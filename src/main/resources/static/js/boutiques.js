$(document).ready(function () {

    $("#tableboutiques").meshop({
        // url : "/json/boutiques/load",
        page: $('[data-id=table_page]'),
        params: {
            sitecrawlerid: $("sitecrawler").data('id')
        },
        data: "boutiques",
        pageWidth: 10,
        modifyJson: mdfJson,
        loop: loop,
        filterForm: $('#filter-form'),
        get: true
    });

    function mdfJson(json) { // 1.modeifyjson
        json.trclass = json.active ? "success" : "";
        json.glyphclass = json.active ? "" : "hidden";
        json.btnclass = json.active ? "success" : "danger";

        json.lblclass = json.status == "STOPPED" ? "success" : "danger";

        if (json.expdate == null)
            json.expdate = '';
        return json;
    }

    function loop(obj, json, mainObj) { // 2.loop
        obj.data('type', json.type);
        obj.data('id', json.id);

        obj.find(".btnfetch").click(function (e) {
            e.preventDefault();
            var btn = $(this);
            btn.addClass("loading");
            $.post("/json/crawler/fetch", $.param({
                boutique: json.id
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

});
