'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// 无限滚动的懒加载
var ScrollLoad = function () {
    function ScrollLoad(opt) {
        var _this = this;

        _classCallCheck(this, ScrollLoad);

        opt.scrollContanier = $(opt.scrollContanier);
        if (opt.listContanier != undefined) {
            opt.listContanier = $(opt.listContanier);
        }

        // 默认参数
        var DEFAULT = {
            maxload: 1000, //最大条数
            perload: 27, //每次分页条数
            isloading: false, //加载等待
            iscomplate: false, //最后一页数据加载完成
            currentPage: 1, //当前页
            listContanier: opt.scrollContanier, //list容器，默认等于scroll容器
            scrollContanier: opt.scrollContanier,
            cache: true //默认开启页面缓存，记录数据以及滚动条位置
        };

        opt = $.extend({}, DEFAULT, opt);

        // 将opt参数解构给this
        for (var key in opt) {
            if (opt.hasOwnProperty(key)) {
                this[key] = opt[key];
            }
        }

        // 创建loading
        this.loadEffect = $('\n            <div class="infinite-scroll-preloader">\n                <div class="preloader"></div>\n            </div>\n        ').appendTo(this.listContanier);

        // 调整最大页数
        if (this.perload > this.maxload) {
            this.perload = this.maxload;
        }

        // 监听滚动 - 到底部加载数据
        this.scrollContanier.on('scroll', function () {
            _this.scroll();
        });

        // 首次加载
        if (this.cache && history.state && history.state.data) {
            this.render(history.state.data);
        } else {
            this.ajax(function (data) {
                _this._ajax(data);
            });
        }
    }

    _createClass(ScrollLoad, [{
        key: '_ajax',
        value: function _ajax(data) {
            if (data.length) {
                this.currentPage++;
                this.render(data);
                if (data.length < this.perload) {
                    this.finish();
                }
            } else {
                this.finish();
            }
        }

        /**
         * 对数据进行缓存，返回页面时能记录render的数据以及滚动条位置
         * 
         * @param {Object} data
         * @returns {Object} newData
         * 
         * @memberOf ScrollLoad
         */

    }, {
        key: '_cache',
        value: function _cache(data) {

            if (!this.cache) {
                return data;
            }

            // 带有状态缓存的渲染
            var oldData = history.state.data || {};
            var ajaxData = data;
            var oldLen = oldData.length;
            var reData = void 0; //返回出去供render使用
            // console.log('oldData', oldData);
            // console.log('ajaxData', res.DATA);

            // 记录滚动条位置
            if (!this._cache.run) {
                var onscroll = false;
                this.scrollContanier.on('scroll click', function (e) {
                    var _this2 = this;

                    var saveScroll = function saveScroll() {
                        var scrollTop = $(_this2).scrollTop();
                        var data = Object.assign(history.state, {
                            scrollTop: scrollTop
                        });
                        history.replaceState(data, '', '');
                    };

                    if (!onscroll) {
                        onscroll = true;
                        setTimeout(function () {
                            onscroll = false;
                            if (e.type === 'scroll') saveScroll();
                        }, 300);
                        if (e.type === 'click') saveScroll();
                    }
                });
            }

            // 渲染老数据
            if (oldLen > 0 && !this._cache.run) {
                // 设置loader的当前页
                this.currentPage = history.state.currentPage;

                // 渲染老数据
                console.info('load cache data');
                reData = oldData;
            } else {
                //渲染新数据

                var saveData = void 0; //需要保持的 老数据+新数据
                if (oldLen > 0) {
                    saveData = Object.assign({}, oldData);
                    // 因为key重复，所以用此方法，将ajaxdata的对象值都追加到newData上
                    for (var i = 0; i < ajaxData.length; i++) {
                        saveData[oldLen] = ajaxData[i];
                        oldLen++;
                    }
                    saveData.length = oldLen;
                } else {
                    saveData = ajaxData;
                }

                // console.log('saveData', saveData);

                // 记录新数据
                history.replaceState({
                    data: saveData,
                    currentPage: this.currentPage,
                    scrollTop: this.scrollContanier.scrollTop()
                }, "", "");

                // 渲染新的ajax数据
                console.info('load ajax data');
                reData = ajaxData;
            }

            // 限制执行次数
            this._cache.run = true;
            return reData;
        }

        // 清空缓存的数据

    }, {
        key: 'cleanCache',
        value: function cleanCache() {
            history.replaceState({
                data: {},
                currentPage: 1,
                scrollTop: 0
            }, "", "");
        }

        // 滚动逻辑

    }, {
        key: 'scroll',
        value: function scroll() {
            var _this3 = this;

            // 如果正在加载，则退出
            if (this.isloading || this.iscomplate) return;

            // 滚动到接近底部时加载数据
            if (this.scrollContanier.scrollTop() + this.scrollContanier.height() + 100 < this.scrollContanier[0].scrollHeight) {
                return;
            }

            // 超出最大限制
            if (this.listContanier.children().length >= this.maxload) {
                this.finish();
                return;
            }

            // 设置flag
            this.isloading = true;

            this.ajax(function (data) {
                // 重置加载flag
                _this3.isloading = false;

                _this3._ajax(data);
            });
        }

        // 刷新数据

    }, {
        key: 'reload',
        value: function reload(reload_callbcak) {
            var _this4 = this;

            // 滚动条置顶
            this.scrollContanier[0].scrollTop = 0;

            // 还原loading的效果
            this.loadEffect.html('<div class="preloader"></div>');

            // 当前页从1开始
            this.currentPage = 1;

            // 重置状态
            this.isloading = false;
            this.iscomplate = false;

            this.ajax(function (data) {
                _this4.listContanier.empty();
                _this4._ajax(data);
                reload_callbcak();
            });
        }

        // 加载完成

    }, {
        key: 'finish',
        value: function finish() {
            // 设置状态 - 全部数据加载完成
            this.iscomplate = true;

            // 内容出现混动条时，才会显示已经到底
            var h1 = this.loadEffect[0].offsetTop;
            var h2 = this.listContanier.height() - parseInt(this.listContanier.css('padding-top'));
            if (h1 > h2 - 10) {
                this.loadEffect.text('已经到底了！');
            } else {
                this.loadEffect.text('');
            }
        }

        // 进行渲染

    }, {
        key: 'render',
        value: function render(data) {
            // 缓存过滤
            data = this._cache(data);

            // 根据每页条数限制data长度
            // 后台返回的数据，有可能超过自定分页长度
            // 缓存模式开启时，不限制。因为缓存功能会一次性加载多页数据
            if (this.perload < data.length && !this.cache) {
                data.length = this.perload;
            }
            var html = this.template(data);

            // 添加新条目
            this.listContanier.append(html);

            // 将loader移动到列表末
            this.loadEffect.appendTo(this.listContanier);

            // 如果有缓存，还原滚动条高度
            if (this.cache) {
                this.scrollContanier.scrollTop(history.state.scrollTop);
            }
        }
    }]);

    return ScrollLoad;
}();
// 注册 overscroll 容器


setTimeout(function () {
    var $el = $('.scroll');
    if ($el.length == 0) {
        return;
    }

    $el.on('touchstart', function (e) {
        var el = $(this)[0];
        var top = el.scrollTop,
            totalScroll = el.scrollHeight,
            currentScroll = top + el.offsetHeight;
        //If we're at the top or the bottom of the containers
        //scroll, push up or down one pixel.
        //
        //this prevents the scroll from "passing through" to
        //the body.
        if (top === 0) {
            el.scrollTop = 1;
        } else if (currentScroll === totalScroll) {
            el.scrollTop = top - 1;
        }
    });
    $el.on('touchmove', function (e) {
        var el = $(this)[0];
        //if the content is actually scrollable, i.e. the content is long enough
        //that scrolling can occur
        if (el.offsetHeight < el.scrollHeight) e._isScroller = true;
    });

    var $body = $('body').off('touchmove');
    $body.on('touchmove', function (e) {
        //In this case, the default behavior is scrolling the body, which
        //would result in an overflow.  Since we don't want that, we preventDefault.
        if (!e._isScroller) {
            e.preventDefault();
        }
    });
}, 100);

// 绑定事件=================
// 影视详情跳转
$(document).on('click', '.getMovie', function () {
    function _updateDetailsPage(res) {
        var $page = $('.movieDetails');
        $page.find('.pic').attr('src', res.MOVIE.poster);
    }

    var $this = $(this);
    var movieId = $this.attr('movieId');
    $.ajax({
        type: "get",
        url: "http://www.funying.cn/wx/rest/index/getMovie",
        data: {
            movieId: movieId
        },
        success: function success(res) {
            console.log(res);
            _updateDetailsPage(res);
        },
        error: function error(e) {
            console.log('影视详情页获取失败。', e);
        }
    });
});
// jq 对象新增方法 ==================

// dom加载ajax数据
$.fn.init = function (data) {

    if (data != null) {
        for (var i = 0; i < this.length; i++) {
            var thisJq = $(this[i]);
            // console.log(thisJq);
            if (this[i].localName === 'img') {
                thisJq.attr('src', data);
            } else if (thisJq.val() == undefined) {
                thisJq.text(data);
            } else {
                thisJq.val(data);
            }
            thisJq.removeClass('hide').css('visibility', 'visible').show();
        }
    } else {
        this.removeClass('hide').css('visibility', 'visible');
    }
};

// $ 下的公共方法 ==============

// 取queryString
$.GetQueryString = function (name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
};

// 获取初始openid
$.openId = $.GetQueryString('openid');
if ($.openId === null) {
    // from sessionStorage
    $.openId = sessionStorage.openId;
} else {
    // from queryString
    sessionStorage.openId = $.openId;
}

// 测试用
// if (!$.openId) {
//     $.openId = 'o-IOqxK0lxh9KSLbpxdU8QKILd9Q'
// }


// 生成影视详情的url
$.getMovDetails = function (id) {
    // http://localhost:3000/html/articleDetails.html?articleId=1&oldOpenId=123
    return './movieDetails.html?movieId=' + id + '&oldOpenId=' + $.openId;
};

// 生成文章详情
$.getArtDetails = function (id) {
    return './articleDetails.html?articleId=' + id + '&oldOpenId=' + $.openId;
};

$.msg = function (opts, timeout) {
    var text = opts.text || opts;
    var title = opts.title || '温馨提示';
    var callback = opts.callback;

    if (timeout === undefined) {
        timeout = opts.timeout || 2000;
    }

    var $tpl = $('\n        <div class="mask">\n            <div class="msg">\n                <p class="msg-title">' + title + '</p>\n                <p class="msg-text">' + text + '</p>\n            </div>\n        </div>\n    ');

    $('body').append($tpl);

    if (timeout) {
        setTimeout(function () {
            $tpl.remove();
            if (callback) {
                callback();
            }
        }, timeout);
    }
};

// 影片付款
$.payment = function (OPTS) {

    // 余额支付
    function _payByRecharge() {
        $.showPreloader('购买中，稍等...');
        $.ajax({
            url: "http://www.funying.cn/wx/rest/pay/payByRecharge",
            data: {
                openId: $.openId,
                movieId: OPTS.productId
            },
            success: function success(res) {
                console.log('余额支付接口', res);
                if (res.STATUS == 1) {
                    OPTS.success();
                } else {
                    // 支付失败
                    $.msg('账户余额不足，请充值或使用微信支付！', 5000);
                }
            },
            error: function error() {
                $.msg('系统繁忙，请稍后再尝试支付操作！');
            },
            complete: function complete() {
                $.hidePreloader();
            }
        });
    }

    var buttons = [{
        text: '账户余额支付',
        onClick: function onClick() {
            _payByRecharge();
        }
    }
    /*, {
            text: '微信支付',
            onClick: function () {
                OPTS.wxPay.productId = OPTS.productId
                $.wxPay(OPTS.wxPay, () => {
                    OPTS.success();
                })
             }
        }*/
    , {
        text: '取消'
    }];
    $.actions(buttons);
};

// 统一下单接口
$.wxPay = function (payOption, payCallback) {
    var data = {
        type: payOption.type, //充值类型 1,影片购买  2，充值
        title: payOption.title,
        openId: $.openId,
        productId: payOption.productId,
        url: location.href.split('#')[0]
    };
    console.log('统一下单接口参数', data);

    $.showIndicator();
    $.ajax({
        url: "http://www.funying.cn/movie/rest/pay/toPay",
        data: data,
        success: function success(res) {
            console.log('统一下单接口：', res);

            // 微信config接口注入权限验证配置
            wx.config({
                // debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                appId: res.appId, // 必填，公众号的唯一标识
                timestamp: res.timestamp, // 必填，生成签名的时间戳
                nonceStr: res.nonceStr, // 必填，生成签名的随机串
                signature: res.signature, // 必填，签名，见附录1
                jsApiList: ["chooseWXPay"] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
            });

            // 通过ready接口处理成功验证
            wx.ready(function () {
                // 发起一个微信支付请求
                wx.chooseWXPay({
                    appId: res.appId,
                    timestamp: res.timestamp, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符  
                    nonceStr: res.nonceStr, // 支付签名随机串，不长于 32 位  
                    package: 'prepay_id=' + res.prepay_id, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=***）  
                    signType: res.signType, // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'  
                    paySign: res.paySign, // 支付签名  
                    success: function success(res) {
                        // 支付成功后的回调函数  
                        if (res.errMsg == "chooseWXPay:ok") {

                            //支付成功  
                            payCallback();
                        } else {
                            alert(res.errMsg);
                        }
                    },
                    cancel: function cancel(res) {
                        //支付取消  
                        $.msg('支付取消');
                    },
                    fail: function fail() {
                        $.msg('充值失败，请小主稍后再试！', 5000);
                    }
                });
            });
        },
        error: function error(e) {
            $.alert('充值服务初始化失败，请稍后再试！');
            console.log('充值失败', e);
        },
        complete: function complete() {
            $.hideIndicator();
        }
    });
};

$.pageInit = function (opt) {

    // 点击入口进入模块
    $(opt.entry).one('click', function () {
        opt.init();
    });

    // 初始刷新已进入此模块
    if (location.hash.indexOf(opt.hash) > 0) {
        opt.init();
        $(opt.entry).off('click');
    }
};

// 格式化价格
$.formatAmount = function (num) {
    num = Number(num);
    if (num) {
        return num.toFixed(2);
    }
    return 0;
};

/**
 * @param updateStatus 更新状态 0更新中 1已完结
 * @param updateSite 更新到的集数
 * @return 返回更新状态字符串
 */
$.getUpdateStatus = function (updateStatus, updateSite) {
    if (updateStatus == 0) {
        return updateSite ? '\u7B2C' + updateSite + '\u96C6' : '\u66F4\u65B0\u4E2D';
    } else {
        return '\u5DF2\u5B8C\u7ED3';
    }
};

$.shareConfig = function (callback) {
    $.ajax({
        url: "http://www.funying.cn/wx/rest/pay/getSignConf",
        data: {
            url: location.href.split('#')[0]
        },
        success: function success(res) {
            callback(res);
        }
    });
};

// html过滤
$.htmlFilter = function (str) {
    str = str.replace(/<[^>]+>/g, ""); //去掉所有的html标记
    str = str.replace(/&nbsp;/ig, ''); //去掉&nbsp;
    return str;
};