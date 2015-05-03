'use strict'

;(function() {
  var durations = ['0', '1s', '5s', '2m', '5m', '20m', '1h']

  var createTimerButton = function(duration) {
    var button = document.createElement('div')
    button.setAttribute('class', 'timerButton')

    var innerDiv = document.createElement('div')
    innerDiv.innerHTML = duration

    button.appendChild(innerDiv)

    return button
  }

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

    var bellElement = document.createElement('audio')

    // Sound author: KeyKrusher from freesound.org
    // https://www.freesound.org/people/KeyKrusher/sounds/173000/
    bellElement.src = '173000__keykrusher__bicycle-bell-2.mp3'

    document.body.appendChild(bellElement)

    var bell = function() {
      bellElement.pause()
      bellElement.currentTime = 0
      bellElement.play()
    }

    durations.forEach(function(duration) {
      var button = createTimerButton(duration)
      document.body.appendChild(button)

      var targetTime = durationStringToMillis(duration)

      if (targetTime === 0) {
        button.addEventListener('click', bell)
        return
      }

      button.addEventListener('click', function() {
        var id = null

        return function() {
          if (!id) {
            button.setAttribute('class', 'timerButton timerActive')
            id = setPoissonTimeout(function() {
              id = null
              button.setAttribute('class', 'timerButton')
              bell()
            }, targetTime)
          }
          else {
            clearPoissonTimeout(id)
            id = null
            button.setAttribute('class', 'timerButton')
          }
        }
      }())

    })
  })
})()