//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    indicatorDots: true,
    autoplay: true,
    interval: 3000,
    duration: 1000,
    loadingHidden: false, // loading
    userInfo: {},
    swiperCurrent: 0,
    selectCurrent: 0,
    categories: [],
    activeCategoryId: 0,
    goods: [],
    scrollTop: 0,
    loadingMoreHidden: true,

    hasNoCoupons: true,
    coupons: [],
    searchInput: '',
  },
  tabClick: function (e) {
    this.setData({
      activeCategoryId: e.currentTarget.id
    });
    this.getGoodsList(this.data.activeCategoryId);
  },
  //事件处理函数
  swiperchange: function (e) {
    //console.log(e.detail.current)
    this.setData({
      swiperCurrent: e.detail.current
    })
  },
  toDetailsTap: function (e) {
    wx.navigateTo({
      url: "/pages/course-details/index?id=" + e.currentTarget.dataset.id
    })
  },
  tapBanner: function (e) {
    if (e.currentTarget.dataset.id != 0) {
      wx.navigateTo({
        url: "/pages/course-details/index?id=" + e.currentTarget.dataset.id
      })
    }
  },
  bindTypeTap: function (e) {
    this.setData({
      selectCurrent: e.index
    })
  },
  onLoad: function () {
    var that = this
    wx.setNavigationBarTitle({
      title: wx.getStorageSync('org_name')
    })
    wx.request({
      url: 'http://127.0.0.1:8069/' + app.globalData.subDomain + '/banner/list',
      
      data: {
        key: 'org_name'
      },
      header: {
        "Content-Type": "json"
      },
      success: function (res) {
        if (res.data.code == 404) {
          wx.showModal({
            title: '提示',
            content: '请在后台添加 banner 轮播图片',
            showCancel: false
          })
        } else {
          console.log("banner/list")
          console.log(res.data)
          that.setData({
            banners: res.data.data
          });
        }
      }
    }),
      wx.request({
        url: 'http://127.0.0.1:8069/' + app.globalData.subDomain + '/shop/courses/category/all',
      header: {
        "Content-Type": "json"
      },
        success: function (res) {
          var categories = [{ id: 0, name: "全部" }];
          if (res.data.code == 0) {
            console.log("/category/all")
            console.log(res.data)
            for (var i = 0; i < res.data.data.length; i++) {
              categories.push(res.data.data[i]);
            }
          }
          that.setData({
            categories: categories,
            activeCategoryId: 0
          });
          that.getGoodsList(0);
        }
      })
    //that.getCoupons();
    //that.getNotice();
  },
  onPageScroll(e) {
    let scrollTop = this.data.scrollTop
    this.setData({
      scrollTop: e.scrollTop
    })
  },
  getGoodsList: function (categoryId) {
    if (categoryId == 0) {
      categoryId = "";
    }
    console.log(categoryId)
    var that = this;
    wx.request({
      url: 'http://127.0.0.1:8069/' + app.globalData.subDomain + '/shop/courses/list',
      data: {
        categoryId: categoryId,
        nameLike: that.data.searchInput
      },
      header: {
        "Content-Type": "json"
      },
      success: function (res) {
        that.setData({
          goods: [],
          loadingMoreHidden: true
        });
        var goods = [];
        if (res.data.code != 0 || res.data.data.length == 0) {
          that.setData({
            loadingMoreHidden: false,
          });
          return;
        }
        for (var i = 0; i < res.data.data.length; i++) {
          goods.push(res.data.data[i]);
        }
        console.log("/courses/list")
        console.log(res.data)
        that.setData({
          goods: goods,
        });
      }
    })
  },
  /*
  getCoupons: function () {
    var that = this;
    wx.request({
      url: 'http://127.0.0.1:8069/' + app.globalData.subDomain + '/discounts/coupons',
      data: {
        type: ''
      },
      header: {
        "Content-Type": "json"
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            hasNoCoupons: false,
            coupons: res.data.data
          });
        }
      }
    })
  },
  */
  gitCoupon: function (e) {
    var that = this;
    wx.request({
      url: 'http://127.0.0.1:8069/' + app.globalData.subDomain + '/discounts/fetch',
      data: {
        id: e.currentTarget.dataset.id,
        token: wx.getStorageSync('token')
      },
      header: {
        "Content-Type": "json"
      },
      success: function (res) {
        console.log("/discounts/fetch")
        if (res.data.code == 20001 || res.data.code == 20002) {
          wx.showModal({
            title: '错误',
            content: '来晚了',
            showCancel: false
          })
          return;
        }
        if (res.data.code == 20003) {
          wx.showModal({
            title: '错误',
            content: '你领过了，别贪心哦~',
            showCancel: false
          })
          return;
        }
        if (res.data.code == 30001) {
          wx.showModal({
            title: '错误',
            content: '您的积分不足',
            showCancel: false
          })
          return;
        }
        if (res.data.code == 20004) {
          wx.showModal({
            title: '错误',
            content: '已过期~',
            showCancel: false
          })
          return;
        }
        if (res.data.code == 0) {
          wx.showToast({
            title: '领取成功，赶紧去下单吧~',
            icon: 'success',
            duration: 2000
          })
        } else {
          wx.showModal({
            title: '错误',
            content: res.data.msg,
            showCancel: false
          })
        }
      }
    })
  },
  onShareAppMessage: function () {
    return {
      title: wx.getStorageSync('org_name') + '——' + app.globalData.shareProfile,
      path: '/pages/index/index',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  /*
  getNotice: function () {
    var that = this;
    wx.request({
      url: 'http://127.0.0.1:8069/' + app.globalData.subDomain + '/notice/list',
      data: { pageSize: 5 },
      header: {
        "Content-Type": "json"
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            noticeList: res.data.data
          });
        }
      }
    })
  },
  */
  listenerSearchInput: function (e) {
    this.setData({
      searchInput: e.detail.value
    })

  },
  toSearch: function () {
    this.getGoodsList(this.data.activeCategoryId);
  }
  
})