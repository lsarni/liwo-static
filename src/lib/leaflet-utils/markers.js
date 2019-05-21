import L from '@/lib/leaflet-utils/leaf'

import {BREACH_PRIMARY, BREACH_REGIONAL, BREACH_OUTSIDE_DIKE, BREACH_FLOODING} from '@/lib/liwo-identifiers'

import blackIconUrl from '../../img/markers/marker-icon-black.png'
import blackRetinaIconUrl from '../../img/markers/marker-icon-2x-black.png'
import greenIconUrl from '../../img/markers/marker-icon-green.png'
import greenRetinaIconUrl from '../../img/markers/marker-icon-2x-green.png'
import iconShadowUrl from '../../img/markers/marker-shadow.png'
import redIconUrl from '../../img/markers/marker-icon-red.png'
import redRetinaIconUrl from '../../img/markers/marker-icon-2x-red.png'

export const defaultIcon = new L.Icon.Default()

export const blackIcon = L.icon({
  iconUrl: blackIconUrl,
  iconRetinaUrl: blackRetinaIconUrl,
  shadowUrl: iconShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
})

export const greenIcon = L.icon({
  iconUrl: greenIconUrl,
  iconRetinaUrl: greenRetinaIconUrl,
  shadowUrl: iconShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
})

export const redIcon = L.icon({
  iconUrl: redIconUrl,
  iconRetinaUrl: redRetinaIconUrl,
  shadowUrl: iconShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
})

export const iconsByLayerType = {
  [BREACH_PRIMARY]: defaultIcon,
  [BREACH_REGIONAL]: greenIcon,
  [BREACH_OUTSIDE_DIKE]: blackIcon,
  [BREACH_FLOODING]: blackIcon,
  default: defaultIcon
}
