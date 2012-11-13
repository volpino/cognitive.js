!function ($) {
  "use strict";

  var computeScore = function (given, right) {
    var score = 0
      , total = 0
      , key;
    for (key in right) {
      if (given[key.toLowerCase()] === right[key])
        score += 1;
      total += 1;
    }
    if (total > 0)
      return Math.round((score / total) * 100) / 100
    else
      return 0;
  }
  , getAnswers = function (obj) {
    var result = {}, tmp, key;

    for (key in obj) {
      if (key.indexOf("answer") === 0) {
        tmp = key.slice("answer".length);
        result[tmp] = obj[key] + "";
      }
    }
    return result;
  };

  $.fn.cognitive = function (method) {
      var methods = {
        init: function (opt) {
          this.each(function () {
            var $element = $(this)
              , $current
              , options = $.extend(true, {}, $.fn.cognitive.defaults, opt)
              , answers = {result: [], score: 0, total: 0, pastTime: 0}
              , timerId
              , $timer = $element.find(".cognitive-timer")
              , nextStep = function ($el) {
                var next;
                $el.hide();
                next = $el.data("next");
                if (next) {
                  $current = $(next);
                  $current.show();
                  bindStep($current);
                }
              }
              , bindStep = function ($el) {
                var timeout;

                $el.fadeIn();

                $el.find(".cognitive-skip").on("click", function () {
                  answers.result.push({});
                  answers.total += 1;
                  nextStep($el);
                });

                $el.find(".cognitive-form").on("submit", function (e) {
                  var $this = $(this)
                    , givenAnswer = $this.serializeObject()
                    , rightAnswer;

                  e.preventDefault();
                  e.stopPropagation();

                  answers.result.push(givenAnswer);
                  rightAnswer = getAnswers($this.data());
                  if (!$.isEmptyObject(rightAnswer)) {
                    answers.score += computeScore(givenAnswer, rightAnswer);
                  }
                  answers.total += 1;
                  nextStep($el);
                  return false;
                });

                timeout = window.parseFloat($el.data("timeout")) * 1000;
                if (timeout) {
                  window.setTimeout(function () {
                    answers.result.push({});
                    nextStep($el);
                  }, timeout);
                }

                $el.find(".cognitive-score").text(
                  answers.score + "/" + answers.total + "  (" + answers.pastTime + " sec)"
                );

                if (!$el.data("next")) {
                  clearInterval(timerId);
                }
              };

            timerId = window.setInterval(function () {
              $timer.text(answers.pastTime);
              answers.pastTime += 1;
            }, 1000);
            $element.find(".cognitive-content").children().hide();
            $current = $element.find(options.start).eq(0);
            bindStep($current);
          });
        }
      };

    if (methods[method])
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    else if (typeof method === 'object' || !method)
      return methods.init.apply(this, arguments);
    else
      $.error('Method ' + method + ' does not exist!');
  };

  $.fn.cognitive.defaults = {
    formSelector: ".cognitive-form",
    skipSelector: ".cognitive-skip"
  };

}($);
