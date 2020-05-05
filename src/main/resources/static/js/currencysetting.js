$(document).ready(function () {

    $("#btnsave").click(function (e) {
        e.preventDefault();
        save();
    });

    function save() {
        $.post("/adminpanel/json/currencysetting/save", $('form.settingForm').serialize(), function (data) {
            if (data) {
                meshop.log("ok", "Setting is updated");
            } else {
                meshop.log("error", "There is a error while saving settings.");
            }

        }).fail(function (message) {
            meshop.log("error", "There is a error while saving settings.");
        });
    }

    $("#tabdil").click(function () {
        var lir = $("[name=lir]").val();
        var curr = $("[name=currency]").val();
        var rate = $("[name=currencyrate]").val();
        var vat = $("[name=vat]").val() / 100;
        var av = Math.round($("[name=addedvalue]").val());
        var mov = Math.round(lir * curr * rate);
        var temp = Math.round(vat * mov);
        var toman = mov + temp + av;
        $("[name=toman]").val(toman);
    });
});
$("#lir").keyup(function () {
    var lir = $("[name=lir]").val();
    var curr = $("[name=currency]").val();
    var rate = $("[name=currencyrate]").val();
    var vat = $("[name=vat]").val() / 100;
    var av = Math.round($("[name=addedvalue]").val());
    var mov = Math.round(lir * curr * rate);
    var temp = Math.round(vat * mov);
    var toman = mov + temp + av;
    $("[name=toman]").val(toman);
});
