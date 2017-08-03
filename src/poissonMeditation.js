'use strict'

;(function() {
  var durations = ['0', '1s', '5s', '2m', '5m', '20m', '1h']

  var createTimerButton = function(opt) {
    var button = document.createElement('div')
    button.setAttribute('class', 'timerButton')
    button.style.position = 'absolute'
    button.style.left = opt.x - opt.r + 'px'
    button.style.top = opt.y - opt.r + 'px'
    button.style.width = 2 * opt.r + 'px'
    button.style.height = 2 * opt.r + 'px'

    var innerDiv = document.createElement('div')
    innerDiv.innerHTML = opt.duration

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

  var buildPage = function() {
    var container = document.getElementById('buttonContainer')
    container.innerHTML = ''

    var buttonOpts = (function(){
      var center = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      }

      var pageRadius = Math.min(window.innerHeight, window.innerWidth) / 2
      var margin = 0.1 * pageRadius

      var regionRadius = (pageRadius - 2 * margin) / (1 + Math.sqrt(3))

      var posGen = function(x, y) {
        return {
          x: center.x + regionRadius * x,
          y: center.y - regionRadius * y,
          r: 0.7 * regionRadius
        }
      }

      var rt3 = Math.sqrt(3)

      return [
        posGen(-1,  rt3),
        posGen( 1,  rt3),
        posGen(-2,    0),
        posGen( 0,    0),
        posGen( 2,    0),
        posGen(-1, -rt3),
        posGen( 1, -rt3)
      ]
    })()

    buttonOpts.forEach(function(opt, i) {
      opt.duration = durations[i] || '0'
    })

    var bellElement = document.createElement('audio')

    // Sound author: KeyKrusher from freesound.org
    // https://www.freesound.org/people/KeyKrusher/sounds/173000/
    bellElement.src = '173000__keykrusher__bicycle-bell-2.mp3'

    container.appendChild(bellElement)

    var bell = function() {
      bellElement.pause()
      bellElement.currentTime = 0
      bellElement.play()
    }

    buttonOpts.forEach(function(buttonOpt) {
      var button = createTimerButton(buttonOpt)

      container.appendChild(button)

      var targetTime = durationStringToMillis(buttonOpt.duration)

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
  }

  var limitCallsViaDelay = function(fn, ms) {
    var timerId = null

    return function() {
      if (timerId) {
        clearTimeout(timerId)
      }

      timerId = setTimeout(function() {
        timerId = null
        fn()
      }, ms)
    }
  }

  window.addEventListener('load', buildPage)
  window.addEventListener('resize', limitCallsViaDelay(buildPage, 250))
})()