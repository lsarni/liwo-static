import Vue from 'vue'
import L from '@/lib/leaflet-utils/leaf'

import '@/lib/leaflet-hack'
import mapConfig from '@/map.config'
import { EPSG_3857 } from '../../lib/leaflet-utils/projections'
import createCrs from '../../lib/leaflet-utils/create-crs'
import MapFillWindowControl from '../../components/MapFillWindowControl'
import MapImageControl from '../../components/MapImageControl'

const INITIAL_BASELAYER = mapConfig.tileLayers[0].title

export default function (el, vnode, config) {
  const tileLayerOptions = baseLayerOptions(config)
  const baseLayers = createBaseLayers(tileLayerOptions)
  const map = L.map(el, {
    ...config,
    crs: createCrs(config.projection),
    layers: [ baseLayers[INITIAL_BASELAYER] ]
  })

  // When we change the baselayer we want it to be in the back
  map.on('baselayerchange', (e) => e.layer.bringToBack())
  // map.addLayer(baseLayers[INITIAL_BASELAYER])
  map.setZoom(config.zoom || mapConfig.zoom)

  map.addControl(fillWindowControl())
  map.addControl(geoCoderControl(map))
  map.addControl(L.control.zoom({ position: 'topright' }))

  map.addControl(printControl())
  map.addControl(imageControl())

  map.addControl(layerControl(baseLayers))

  map.printPlugin = L.easyPrint({
    hidden: true,
    exportOnly: true,
    hideControlContainer: false,
    position: 'topright',
    filename: 'export',
    sizeModes: ['A4Portrait', 'A4Landscape', 'Current']
  }).addTo(map)

  map.on('browser-print-start', function (e) {
    // when printing starts emit an event to the containing element so that we can add a legend
    vnode.context.$emit('browser-print-start', e)
  })

  // Hack to make the map display
  setTimeout(() => { map.invalidateSize() }, 100)

  return map
}

function createBaseLayers (options) {
  let baseLayers = {}
  mapConfig.tileLayers.forEach(layer => {
    baseLayers[ layer.title ] = L.tileLayer(layer[options.projection].url, options)
  })
  return baseLayers
}

function baseLayerOptions (config) {
  const tms = config.baseLayer.tms
  let options = {
    attribution: config.attribution || mapConfig.attribution,
    maxZoom: config.maxZoom || mapConfig.maxZoom[config.projection],
    minZoom: config.minZoom || mapConfig.minZoom[config.projection],
    tms: config.projection === EPSG_3857 ? undefined : tms,
    continuousWorld: config.continuousWorld || mapConfig.continuousWorld,
    projection: config.projection
  }

  return options
}

// because leaflet provides no way of telling if the controls have rendered,
// we watch the control object until the dom element is created
function whenReady (Control, cb) {
  return new Proxy(Control, {
    set (target, key, value) {
      if (key === '_container') {
        cb(value)
      }

      target[key] = value
      return true
    }
  })
}

function geoCoderControl (map) {
  let containerListenerInitialized = false

  const Control = L.Control.geocoder({
    position: 'topright',
    defaultMarkGeocode: false,
    iconLabel: 'Start een nieuwe zoekopdracht',
    placeholder: 'Zoeken'
  })
    .on('markgeocode', function (e) {
      const bbox = e.geocode.bbox
      const poly = L.polygon([
        bbox.getSouthEast(),
        bbox.getNorthEast(),
        bbox.getNorthWest(),
        bbox.getSouthWest()
      ])
      map.fitBounds(poly.getBounds())
    })

  // add listeners for a11y
  function addListeners (el) {
    // make sure the listeners are only set once
    if (!containerListenerInitialized) {
      const button = el.querySelector('button')

      // the control does not expand when programmatically clicking the trigger button (with keyboard e.g.),
      // so we add a listener that expands the control on click
      button.addEventListener('click', () => {
        Control._expand()
      })

      // when the control is closed using the escape key, the focus should go back to the trigger button
      el.addEventListener('keydown', e => {
        if (e.key === 'Escape' || e.keyCode === 27) {
          button.focus()
        }
      })

      containerListenerInitialized = true
    }
  }

  return whenReady(Control, el => {
    addListeners(el)
  })
}

function printControl () {
  let Control = L.control.browserPrint({position: 'topright', printModes: ['auto']})

  function makeFocusable (el) {
    const trigger = el.querySelector('.leaflet-browser-print')

    // add a href attribute, otherwise the browser will nog recognize it as focusable
    trigger.setAttribute('href', '#')
  }

  return whenReady(Control, el => {
    makeFocusable(el)
  })
}

function layerControl (layers) {
  const Control = L.control.layers(layers)

  function addListener (el) {
    el.addEventListener('keydown', e => {
      if (e.key === 'Escape' || e.keyCode === 27) {
        Control.collapse()
      }
    })
  }

  return whenReady(Control, (el) => {
    addListener(el)
  })
}

function fillWindowControl () {
  const control = L.control({position: 'topright'})

  control.onAdd = function (map) {
    const div = L.DomUtil.create('div', '')

    // mount vue component as control
    const button = new Vue({
      render: h => h(MapFillWindowControl, {
        props: {
          map
        }
      })
    }).$mount(div)

    return button.$el
  }

  return control
}

function imageControl () {
  const control = L.control({position: 'topright'})

  control.onAdd = function (map) {
    const div = L.DomUtil.create('div', '')

    // mount vue component as control
    const button = new Vue({
      render: h => h(MapImageControl, {
        props: {
          map
        }
      })
    }).$mount(div)

    return button.$el
  }

  return control
}
