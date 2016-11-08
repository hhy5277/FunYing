'use strict';

$('#feedbackSubmit').click(function () {

    $.ajax({
        url: "http://118.178.136.60:8001/rest/user/addFeedBack",
        data: {
            openId: $.openId,
            content: $('#feedbackText').val()
        },
        success: function success(res) {
            console.log(res);
            if (res.STATUS == 1) {
                $.msg({
                    text: '小编已接到圣旨，谢谢反馈！',
                    timeout: 3000,
                    callback: function callback() {
                        $.router.back();
                    }
                });
            } else {
                $.msg('反馈出现了问题，估计系统繁忙，请稍后试试！');
            }
        },
        error: function error(e) {
            console.log(e);
            $.msg('系统繁忙，请稍后试试！');
        }
    });
});
//# sourceMappingURL=feedback.js.map
