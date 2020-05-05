import L from '@/lib/leaflet-utils/leaf'

const LegendControl = L.Control.extend({
  onAdd: function (map) {
    var div = L.DomUtil.create('div', 'info legend')
    // make a copy  of hte legend and add it to the print map
    div.appendChild(this.options.el.cloneNode(true))
    return div
  }
})

function legendControl (options) {
  return new LegendControl(options)
}

export {
  legendControl
}
