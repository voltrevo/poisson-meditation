'use strict'

;(function() {
  var setPoissonTimeout = function(callback, ms) {
    var samplingInterval = (ms < 60000 ? 50 : 1000)
    var p = samplingInterval / ms

    var start = new Date()

    var lowest = 1

    var intervalId = setInterval(function() {
      var rand = Math.random()

      if (rand < lowest) {
        lowest = rand
        var progress = p / lowest
        var now = new Date()

        console.log(
          'watermark: ' + Math.floor(progress * ms) + ', ' +
          'actual: ' + Math.floor(now - start)
        )
      }

      if (lowest < p) {
        callback()
        clearInterval(intervalId)
      }
    }, samplingInterval)

    return intervalId
  }

  var clearPoissonTimeout = function(id) {
    clearInterval(id)
  }

  var durationStringToMillis = function(str) {
    if (str === '0') {
      return 0
    }

    var n = +str.substring(0, str.length - 1)
    var suffix = str[str.length - 1]

    var suffixMultiplier = {
      's': 1000,
      'm': 60000,
      'h': 3600000
    }[suffix]

    return n * suffixMultiplier
  }

  window.addEventListener('load', function() {

    var bellElement = document.getElementById('bellSound')

    var bell = function() {
      bellElement.pause()
      bellElement.currentTime = 0
      bellElement.play()
    }

    var buttonArray = Array.prototype.slice.apply(
      document.getElementById('startTimerButtons').children
    )

    buttonArray.forEach(function(buttonWrapper) {

      var button = buttonWrapper.firstChild

      var text = button.firstChild.innerHTML

      var targetTime = durationStringToMillis(text)

      if (targetTime === 0) {
        button.addEventListener('click', bell)
        return
      }

      button.addEventListener('click', function() {
        var id = null

        return function() {
          if (!id) {
            button.setAttribute('class', 'buttonActive')
            id = setPoissonTimeout(function() {
              id = null
              button.setAttribute('class', '')
              bell()
            }, targetTime)
          }
          else {
            clearPoissonTimeout(id)
            id = null
            button.setAttribute('class', '')
          }
        }
      }())

    })
  })
})()