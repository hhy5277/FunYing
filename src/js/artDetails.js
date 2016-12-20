// 文章详情

{

    $.showPreloader();

    let qs = {
        id: $.GetQueryString('id'),
        articleId: $.GetQueryString('articleId'),
        articleUrl: `http://www.funying.cn/wx/rest/index/getArticle`,
        messageUrl: `http://www.funying.cn/wx/rest/user/systemMsgDetail`

    }

    $.ajax({
        url: qs.id ? qs.messageUrl : qs.articleUrl,
        data: {
            id: qs.id,
            articleId: qs.articleId,
            openId: $.openId,
            oldOpenId: $.GetQueryString('oldOpenId')
        },
        success: function (res) {
            console.log('详情数据：', res);

            // 文章详情 系统消息
            if (res.STATUS == 1) {
                render(res)
                return
            }

            // 没有数据
            $.alert('文章详情不存在！', function () {
                $.router.back();
            })
        },
        error: (e) => {
            let str = `文章详情获取失败，稍后再试！`
            console.log(str, e);
            $.alert(str, function () {
                $.router.back()
            })
        },
        complete: () => {
            $.hidePreloader();
        }
    });

    function render(res) {
        const data = res.ARTICLE || res.DATA

        $('title').text(data.title)
        
        $('.text').append(data.context)
        $('.time').text(data.updateTime)
        $('.Title').text(data.title)

        if (qs.articleId) {
            // 加载二维码
            $('#qrcode').attr('src', data.QR_CODE)

            // 判断是否会员，然后隐藏二维码
            if (res.IS_SUBSCRIBE != 1) {
                $('#SUBSCRIBE').init()
            }
        }

    }
}