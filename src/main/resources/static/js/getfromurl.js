$(document).ready(function () {

    $("[name=url]").on("change", function (e) {
        e.preventDefault();
        var txt = $(this);
        var url = txt.val();
        txt.addClass("loading");
        $.post("/json/crawler/product/fetchbyurl", $.param({url: url}), function (data) {

        }).fail(function (e) {
            meshop.log("fail", "خطا در سیستم");
        }).always(function () {
            btn.removeClass('loading');
        });
    });

});
