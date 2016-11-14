// $ 下的公共方法 ==============

// 取queryString
$.GetQueryString = function (name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}

// 获取初始openid
$.openId = $.GetQueryString('openid')
if ($.openId === null) { // from sessionStorage
    $.openId = sessionStorage.openId

} else { // from queryString
    sessionStorage.openId = $.openId
}

// 测试用
$.openId = 'o-IOqxK0lxh9KSLbpxdU8QKILd9Q'




// 生成影视详情的url
$.getMovDetails = function (id) {
    // http://localhost:3000/html/articleDetails.html?articleId=1&oldOpenId=123
    return `./movieDetails.html?movieId=${id}&oldOpenId=${$.openId}`
}

// 生成文章详情
$.getArtDetails = function (id) {
    return `./articleDetails.html?articleId=${id}&oldOpenId=${$.openId}`
}


$.msg = function (opts, timeout) {
    let text = opts.text || opts
    let title = opts.title || '温馨提示'
    let callback = opts.callback

    if (timeout === undefined) {
        timeout = opts.timeout || 2000
    }

    let $tpl = $(`
        <div class="mask">
            <div class="msg">
                <p class="msg-title">${title}</p>
                <p class="msg-text">${text}</p>
            </div>
        </div>
    `);

    $('body').append($tpl)

    if (timeout) {
        setTimeout(function () {
            $tpl.remove()
            if (callback) {
                callback()
            }
        }, timeout);
    }
}

// 付款
$.payment = function (movieId, paySuccess_callback) {

    // 余额支付
    function _payByRecharge() {
        $.showPreloader('购买中，稍等...');
        $.ajax({
            url: "http://wechat.94joy.com/wx/rest/pay/payByRecharge",
            data: {
                openId: $.openId,
                movieId: movieId
            },
            success: (res) => {
                console.log('余额支付接口', res);
                if (res.STATUS == 1) {
                    paySuccess_callback();

                } else { // 支付失败
                    $.msg('账户余额不足，请充值或使用微信支付！', 5000)
                }
            },
            error: () => {
                $.msg('系统繁忙，请稍后再尝试支付操作！')
            },
            complete: () => {
                $.hidePreloader();
            }
        });
    }

    var buttons = [{
        text: '账户余额支付',
        onClick: function () {
            _payByRecharge()
        }
    }, {
        text: '微信支付',
        onClick: function () {
            $.alert("你选择了“微信支付“");
        }
    }, {
        text: '取消'
    }];
    $.actions(buttons);
}


// jq 对象新增方法 ==================

// dom加载ajax数据
$.fn.init = function (data) {

    for (let i = 0; i < this.length; i++) {
        let thisJq = $(this[i])
            // console.log(thisJq);
        if (this[i].localName === 'img') {
            thisJq.attr('src', data)
        } else if (thisJq.val() == undefined) {
            thisJq.text(data)
        } else {
            thisJq.val(data)
        }
        thisJq.removeClass('hide').show()
    }

}