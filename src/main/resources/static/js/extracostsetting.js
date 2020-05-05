$(document).ready(function () {

    $("#btnsave").click(function (e) {
        e.preventDefault();
        $.post("/adminpanel/json/extracostsetting/save", $('form.settingForm').serialize(), function (data) {
            if (data) {
                meshop.log("ok", "Setting is updated");
            } else {
                meshop.log("error", "There is a error while saving settings.");
            }

        }).fail(function (message) {
            meshop.log("error", "There is a error while saving settings.");
        });
    });

});
 