$(function () {

    $("#directfetch").on("click", function (e) {
        e.preventDefault();
        var btn = $(this);
        btn.addClass('loading');
        var prm = $("[name=url]").serialize();
        $.post("/json/crawler/product/directfetch", prm, function (data) {

            meshop.log("ok", "با موفقیت آپدیت شد!")
        }).fail(function (e) {
            meshop.log("fail", "لطفا دوباره امتحان کنید");
        }).always(function () {
            btn.removeClass('loading');
        });
    });
});