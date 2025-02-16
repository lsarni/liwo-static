<template>
  <div class="viewer" :class="{'viewer--has-notificaton': currentNotifications.length}">
    <div class="viewer__map-wrapper">
      <liwo-map
        :projection="projection"
        :layers="selectedLayers"
        :clusterMarkers="false"
        @initMap="setMapObject"
      >
        <template v-slot:legend>
          <legend-panel
            :layers="[selectedLayer]"
            v-if="selectedLayer"
          />
        </template>
      </liwo-map>
      <notification-bar :notifications="currentNotifications"  />
      <layer-panel v-if="layerSet">
        <template v-slot:default>
          <layer-panel-item
            :layers="layerSet.layers"
            :selectedLayer="selectedLayer"
            @update:layers="updateLayers(layerSet, $event)"
            @select:layer="selectLayer"
            @select:variant="selectVariant"
          />
        </template>
        <template v-slot:actions>
          <button
            class="layer-panel__action"
            @click="showExport = true"
            v-test="'init-export-button'"
            >
            <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
              <path fill="none" d="M0 0h24v24H0z"/>
              <path d="M18 17v2H6v-2H3v4c0 .6.4 1 1 1h16c.6 0 1-.4 1-1v-4h-3z"/>
              <path d="M11 16.5a1.4 1.4 0 0 0 2 0l5.8-7.3a1.4 1.4 0 0 0-1.7-2l-3.1 2V3.4c0-1-1-1.4-2-1.4s-2 .3-2 1.4v5.8l-3-2a1.4 1.4 0 0 0-1.8 2l5.7 7.3z"/>
            </svg>
            Kaart exporteren
          </button>

        </template>

      </layer-panel>
      <export-popup
        v-if="showExport"
        :map-object="mapObject"
        :map-layers="selectedLayers"
        @close="showExport = false"
        />
    </div>
  </div>
</template>

<script>

import { mapGetters } from 'vuex'
import _ from 'lodash'

import ExportPopup from '@/components/ExportPopup'
import LayerPanel from '@/components/LayerPanel'
import LayerPanelItem from '@/components/LayerPanelItem'
import LiwoMap from '@/components/LiwoMap'
import LegendPanel from '@/components/LegendPanel'
import NotificationBar from '@/components/NotificationBar.vue'
import { flattenLayerSet } from '@/lib/layer-parser'
import { extractUnit } from '@/lib/load-layersets'

import { EPSG_28992 } from '@/lib/leaflet-utils/projections'
import { showLayerInfoPopup } from '@/lib/leaflet-utils/popup'

export default {
  name: 'Viewer',
  components: {
    ExportPopup,
    LayerPanel,
    LayerPanelItem,
    LegendPanel,
    LiwoMap,
    NotificationBar
  },
  props: {
    id: {
      type: Number,
      required: true
    }
  },
  data () {
    return {
      isMounted: false,
      showExport: false,
      projection: EPSG_28992,
      // allows to select a layer (for the unit panel)
      selectedLayerId: null
    }
  },
  async mounted () {
    this.$store.commit('setLayerSetId', this.id)
    this.$store.dispatch('loadLayerSetById', { id: this.id })
  },
  computed: {
    ...mapGetters([
      'layerSet',
      'currentNotifications'
    ]),
    selectedVariantId () {
      const variantIndex = _.get(this.selectedLayer, 'properties.selectedVariant', 0)
      const variant = _.get(this.selectedLayer, ['variants', variantIndex])
      const id = _.get(variant, 'layer')
      return id
    },
    selectedLayers () {
      if (!this.layerSet) {
        return []
      }
      let result = flattenLayerSet(this.layerSet)
      result = result.filter(layer => {
        const result = _.get(layer.layerObj.properties, 'visible', true)
        return result
      })
      return result
    },
    selectedLayer () {
      // return the selected layer
      // return null if we have no layerSet yet
      if (_.isNil(this.layerSet)) {
        return null
      }
      // if we have not selected a layer, no layer is set
      if (_.isNil(this.selectedLayerId)) {
        return null
      }
      // if we have both, search for the layer  and return it
      const result = _.find(this.layerSet.layers, ['id', this.selectedLayerId])

      return result
    }
  },
  methods: {
    setMapObject (mapObject) {
      // add a tooltip if the map is clicked
      this.mapObject = mapObject
      this.mapObject.on('click', (event) => {
        let unit = '[-]'
        if (_.has(this.selectedLayer, 'legend.title')) {
          unit = extractUnit(this.selectedLayer.legend.title)
        }
        showLayerInfoPopup({
          map: mapObject,
          // TODO: make consistent, here we mix up two types of layers.
          layerId: this.selectedVariantId,
          unit: unit,
          selectedLayer: this.selectedLayer,
          position: event.containerPoint,
          latlng: event.latlng
        })
      })
    },
    updateLayers (layerSet, layers) {
      // store the new layers
      this.$store.commit('setLayersByLayerSetId', { id: layerSet.id, layers })
    },
    selectLayer (layer) {
      this.selectedLayerId = layer.id
    },
    selectVariant ({ layer, index }) {
      // store the index of the active variant in the layer
      this.$set(layer.properties, 'selectedVariant', index)
      // update the  layer in the layerSet
      this.updateLayers(this.layerSet, this.layerSet.layers)
    }
  }
}
</script>

<style>
@import '../components/variables.css';
@import  './viewer.css';
</style>
