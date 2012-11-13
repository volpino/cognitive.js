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
  , extractAnswers = function (obj) {
    var result = {}, tmp, key;

    for (key in obj) {
      if (key.indexOf("answer") === 0) {
        tmp = key.slice("answer".length);
        result[tmp] = obj[key] + "";
      }
    }
    return result;
  };

  var Cognitive = function ($element, opt) {
    var self = this
      , defaults = {
      formSelector: ".cognitive-form",
      skipSelector: ".cognitive-skip",
      scoreSelector: ".cognitive-score"
    };
    this.$current = null;
    this.$element = $element;
    this.options = $.extend(true, {}, defaults, opt);
    this.answers = {result: [], score: 0, total: 0, pastTime: 0};
    this.timerId = null;
    this.$timer = $element.find(".cognitive-timer");

    this.timerId = window.setInterval(function () {
      self.$timer.text(self.answers.pastTime);
      self.answers.pastTime += 1;
    }, 1000);

    this.$element.find(".cognitive-content").children().hide();
    this.$current = $element.find(this.options.start).eq(0);
    this.bindStep(this.$current);

  };

  Cognitive.prototype.getAnswers = function () {
    return this.answers;
  }

  Cognitive.prototype.nextStep = function ($el) {
    var next;
    $el.hide();
    next = $el.data("next");
    if (next) {
      this.$current = $(next);
      this.$current.show();
      this.bindStep(this.$current);
    }
  }

  Cognitive.prototype.bindStep = function ($el) {
    var timeout
      , self = this;

    $el.fadeIn();

    $el.find(this.options.skipSelector).on("click", function () {
      self.answers.result.push({});
      self.answers.total += 1;
      self.nextStep($el);
    });

    $el.find(this.options.formSelector).on("submit", function (e) {
      var $this = $(this)
        , givenAnswer = $this.serializeObject()
        , rightAnswer;

      e.preventDefault();
      e.stopPropagation();

      self.answers.result.push(givenAnswer);
      rightAnswer = extractAnswers($this.data());
      if (!$.isEmptyObject(rightAnswer)) {
        self.answers.score += computeScore(givenAnswer, rightAnswer);
      }
      self.answers.total += 1;
      self.nextStep($el);
      return false;
    });

    timeout = window.parseFloat($el.data("timeout")) * 1000;
    if (timeout) {
      window.setTimeout(function () {
        self.answers.result.push({});
        self.nextStep($el);
      }, timeout);
    }

    $el.find(this.options.scoreSelector).text(
      self.answers.score + "/" + self.answers.total + "  (" + self.answers.pastTime + " sec)"
    );

    if (!$el.data("next")) {
      clearInterval(self.timerId);
    }
  };

  window.Cognitive = Cognitive;
}($);
