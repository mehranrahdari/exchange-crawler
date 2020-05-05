$(document).ready(function () {
    $("#btnsave").click(function (e) {
        e.preventDefault();
        save();
    });

    function save() {
        $.post("/adminpanel/json/crawlersetting/save", $('form.settingForm').serialize(), function (data) {
            if (data) {
                meshop.log("ok", "Setting is updated");
            } else {
                meshop.log("error", "There is a error while saving settings.");
            }

        }).fail(function (message) {
            meshop.log("error", "There is a error while saving settings.");
        });
    }

    $(".fetchdatafromsrc").on("click", function (e) {
        e.preventDefault();
        var btn = $(this);

        btn.addClass("loading");
        $.post("/json/crawler/updatesrcdata", function (data) {

            meshop.log("ok", "Src data is fetched from source website");

        }).fail(function (message) {
            meshop.log("error", "There is a error while fetching from source website.");
        }).always(function () {
            btn.removeClass('loading');
        });
    });

});
