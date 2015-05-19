/**
 * Created by ruby on 2014/11/23.
 */
var helper = {
  trim: function (v) {
    return v.replace(/$\s+/, '').replace(/\s+$/, '');
  },
  isEmpty: function (data) {
    var _this = this;
    if (typeof data == 'string') {
      if (_this.trim(data).length == 0) {
        return true;
      }
    } else if (Object.prototype.toString.call(data) == 'array') {
      if (data.length == 0) {
        return true;
      } else {
        return data.every(function (v) {
          if (_this.trim(v).length == 0) {
            return true;
          }
          return false;
        })
      }
    } else if (typeof data == 'object') {
      for (var i in data) {
        if (_this.trim(data[i]).length != 0) {
          return false;
        }
      }
      return true;
    }
    return false;
  }
}
function Validator(rule) {
  this.rule = rule;
}
Validator.prototype = {
  constructor: Validator,
  validate: function (data) {
    /*
     * 此模块完成数据验证工作
     * 处理'required'规则和其他规则的关系
     * 原则：
     * 允许为空：值为空时，不进行下面的规则判定
     * 不允许为空：按照并列规则处理
     * */
    //invoke the test method
    var validations = this.validations;
    this.result = [];
    for (var i in data) {
      var rule = this.rule[i];
      if(typeof rule=='undefined') return;
      if (rule.required != 'skip' && !rule.required && helper.isEmpty(data[i].value)) continue;
      for (var j in rule) {
        var feedback = validations[j].call(data[i], rule[j]);
        if (!feedback.status) {
          if (data[i].note) {
            this.noteInit(data[i].note, feedback.msg, false);
          }
          this.result.push({data: i, msg: feedback.msg});
          break;
        }
        if (data[i].note) {
          //如果被验证数据中含有提示信息位置设置
          this.noteInit(data[i].note, "验证通过！", true);
        }
      }
    }
    if (this.result.length < 1) {
      //全部验证通过
      return {
        passed: true
      };
    } else {
      return {
        passed: false,
        result: this.result
      };
    }
  },
  noteInit: function (c, m, status, icon) {
    var icon = '';
    if (status) {
      c.removeClass('wrong').addClass('right');
      icon = '<b class="icon">&radic;</b>';
    } else {
      c.removeClass('right').addClass('wrong');
      icon = '<b class="icon">&times;</b>';
    }
    if (icon) {
      c.html(icon + m);
    }

  },
  validations: {
    required: function (r) {
      if (r && r != 'skip') {
        if (helper.isEmpty(this.value)) {
          return {
            status: false,
            msg: "该值不能为空！"
          }
        }
      }
      return {
        status: true
      }

    },
    zhOnly: function (r) {
      if (r) {
        if (!/^[^u4e00-u9fa5]+$/.test(this.value)) {
          return {
            status: false,
            msg: "只能输入中文！"
          }
        }
      }
      return {
        status: true
      }

    },
    enOnly: function (r) {
      if (r) {
        if (!/^[a-z]+&/.test(this.value)) {
          return {
            status: false,
            msg: "只能输入英文！"
          }
        }
      }
      return {
        status: true
      }
    },
    numberOnly:function(r){
      if(r){
        if(!/^\d+$/g.test(this.value)){
          return{
            status:false,
            msg:'只能输入数字!'
          }
        }
      }
      return {
        status:true
      }
    },
    isPositiveInt: function (r) {
      if (r) {
        var v = this.value;
        if (v == parseInt(v) && v > 0) {
          return {
            status: true
          }
        } else {
          return {
            status: false,
            msg: '请输入大于0的整数!'
          }
        }
      } else {
        return {
          status: true
        }
      }

    },
    domain: function (r) {
      if (r) {
        if (/^(?:[^\W_](?:[^\W_]|-){0,61}[^\W_]\.)+[a-zA-Z]{2,6}\.?$/.test(this.value)) {
          return {
            status: true
          }
        } else {
          return {
            status: false,
            msg: '请输入正确的域名!'
          }
        }
      } else {
        return {
          status: true
        }
      }

    },
    port: function (r) {
      if (r) {
        if (/^\d+$/.test(this.value) && this.value < 65535) {
          return {
            status: true
          }
        } else {
          return {
            status: false,
            msg: '请输入正确的端口号'
          }
        }
      }
    },
    lengthLimit: function (range) {
      var fc = range.substr(0, 1),
        sc = range.substr(range.length - 1, 1),
        min = range.substring(1, range.indexOf(",")),
        max = range.substring(range.indexOf(",") + 1, range.length - 1),
        fe = fc == "(" ? this.value.length > min : this.value.length >= min,
        se = sc == ")" ? this.value.length < max : this.value.length <= max;
      if (!fe || !se) {
        return {
          status: false,
          msg: "请确认输入的字符长度在" + range + "之间!"
        }
      } else {
        return {
          status: true
        }
      }
    },
    numberLimit: function (range) {
      var value = 1*this.value;
      var fc = 1*range.substr(0, 1),
        sc = 1*range.substr(range.length - 1, 1),
        min = 1*range.substring(1, range.indexOf(",")),
        max = 1*range.substring(range.indexOf(",") + 1, range.length - 1),
        fe = (fc == "(") ? value > min : value > min || value == min,
        se = (sc == ")") ? value < max : value <= max || value == max;
      if (!fe || !se) {
        return {
          status: false,
          msg: "请确认输入大小在" + range + "之间的数字！"
        }
      } else {
        return {
          status: true
        }
      }
    },
    checkDate: function () {
      var begin = this.value[0],
        end = this.value[1];
      try {
        var beginDate = 1 * new Date(begin);
      } catch (e) {
        return {
          status: false,
          msg: '开始时间格式不正确!'
        }
      }
      try {
        var endDate = 1 * new Date(end);
      } catch (e) {
        return {
          status: false,
          msg: '结束时间格式不正确!'
        }
      }
      if (endDate - beginDate > 0) {
        return {
          status: true
        }
      } else {
        return {
          status: false,
          msg: '结束时间不得早于开始时间!'
        }
      }
    },
    check: function (option) {
      /*need jquery's support*/
      var url = option.url,
        cb = option.cb,
        checkResult = {},
        _this=this;
      $.ajax({
        url: url,
        type: 'post',
        async: false,
        data:_this.param,
        dataType: "json",
        success: cb(checkResult),
        error: function () {
          checkResult.status = false;
          checkResult.msg = "请求超时，请重试！"
        }
      })
      return checkResult;
    }
  },
  addValidation: function (name, fn, deep) {
    if (typeof fn == "function") {
      if (deep) {
        this.constructor.prototype.validations[name] = fn;
      }
      this.validations[name] = fn;
    }
  }
}
define(function (require, exports) {
  exports.Validator = Validator;
})
 //注：请将required规则放在第一位.required允许第三个值"skip",以保证跳过最初的验证而完全依赖自定义验证

/* var inputData = {
 ActivityName:activityName,
 GameCode:gameAbbr,
 ChannelID:channelId,
 BeginDate:beginDate,
 EndDate:endDate,
 RuleID:activityRule,
 RewardTypeID:rewardType,
 ActRewards:levels,
 TotalReward:rewardTotal,
 DailyReward:limitPreDay,
 SingleDailyReward:limitPreDayPrePerson,
 Description:activityDesc
 }
 var validator=new Validator({
 ActivityName:{
 required:true,
 lengthLimit:'(1,32)'
 },
 GameCode:{
 required:true,
 check:{
 url:'/data/activity/isexistbygamecode',
 data:{"gamecode":inputData.GameCode},
 cb:function(checkResult){
 return function(data){
 if(data.error){
 checkResult.status=false;
 checkResult.msg='查询请求出错!';
 }else{
 if(data.data){
 checkResult.status=true;
 }else{
 checkResult.status=false;
 checkResult.msg='没有相应的游戏!';
 }
 }
 }
 }
 }

 },
 ChannelID:{
 required:true,
 check:{
 url:'/data/activity/isexistchannel',
 data:{"gamecode":inputData.GameCode,"channelid":inputData.ChannelID},
 cb:function(checkResult){
 return function(data){
 if(data.error){
 checkResult.status=false;
 checkResult.msg='查询请求出错!';
 }else{
 if(data.data){
 checkResult.status=true;
 }else{
 checkResult.status=false;
 checkResult.msg='渠道号有误，请重新输入!';
 }
 }
 }
 }
 }
 },
 dates:{
 required:true,
 checkDate:true
 },
 ActRewards:{
 required:'skip',
 isActRewards:true
 },
 TotalReward:{
 required:true,
 numberLimit:'(0,99999999]'
 },
 DailyReward:{
 required:true,
 isPositiveInt:true
 },
 SingleDailyReward:{
 required:true,
 isPositiveInt:true
 },
 Description:{
 required:true,
 lengthLimit:'(0,1000]'
 }
 })
 validator.addValidation('isActRewards',function(r){
 if(r){
 var result=this.value.every(function(v,i,arr){
 v= v.RewardNum;
 if(parseInt(v)==v && v>0 && v<99999999 && arr[i-1].RewardNum<arr[i].RewardNum){
 return true;
 }else{
 return false;
 }
 })
 if(result){
 return {
 status:true
 }
 }else{
 return {
 status:false,
 msg:'等级中的限额要求为区间为(0,100000000)的整数,且限额逐级递增!'
 }
 }
 }
 });
 var dataToValidate={
 ActivityName:{
 value:inputData.ActivityName,
 note:$('#note_activityName')
 },
 GameCode:{
 value:inputData.GameCode,
 note:$('#note_gameAbbr')
 },
 ChannelID:{
 value:inputData.ChannelID,
 note:$('#note_channelId')
 },
 dates:{
 value:[inputData.BeginDate,inputData.EndDate],
 note:$('#note_date')
 },
 ActRewards:{
 value:inputData.ActRewards,
 note:$('#note_levels')
 },
 TotalReward:{
 value:inputData.TotalReward,
 note:$('#note_rewardTotal')
 },
 DailyReward:{
 value:inputData.DailyReward,
 note:$('#note_limitPreDay')
 },
 SingleDailyReward:{
 value:inputData.SingleDailyReward,
 note:$('#note_limitPreDayPrePerson')
 },
 Description:{
 value:inputData.Description,
 note:$('#note_activityDesc')
 }
 }
 console.log(dataToValidate)
 return validator.validate(dataToValidate).passed*/


