$(document).ready(function () {

    $("#directbtkfetch").on("click", function (e) {
        e.preventDefault();
        var btn = $(this);
        btn.addClass('loading');
        var prm = $("[name=url]").serialize();
        $.post("/json/crawler/boutique/directfetch", prm, function (data) {
            $(".showdirect").attr("href", "/sales/" + data);
            meshop.log("ok", "هورررااا!");
            meshop.refresh($("#tableboutiques"));
        }).fail(function (e) {
            meshop.log("fail", "لطفا دوباره امتحان کنید");
        }).always(function () {
            btn.removeClass('loading');
        });
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
    }

    $("#tableboutiques").meshop({
        data: "direcrboutiques",
        params: {
            type: 3
        },
        page: $('[data-id=Table_page]'),
        modifyJson: mdfJson,
        loop: loop,
        filterForm: $('#filter-form')
    });


});