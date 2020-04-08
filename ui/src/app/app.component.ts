import { Component, OnInit,NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';

declare function require(arg:string): any;
const environment = require('../assets/auth/token.json');
const polygonCountries = require('../assets/polygon/countries.json')
const link = 'https://s3.amazonaws.com/rawstore.datahub.io/23f420f929e0e09c39d916b8aaa166fb.geojson'
const restrictedData =require('../assets/restricted-travel-map/data.json')
declare var mapboxgl: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'mapbox';

  constructor(private http: HttpClient){}
  ngOnInit() {
    let tempArray = []
    mapboxgl.accessToken =environment.access_token;
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v10',
        center: [-96, 37.8],
        zoom: 1,
        minZoom: 1
      });
      map.on('load', function() {
        // hack to remove duplicate countries
        let tmp = polygonCountries.features;
        let tmpArray = [];
        let updatedSet = new Set();
        tmp.forEach(element => {
          if(updatedSet.has(element.properties.ISO_A3)){

          } else {
            updatedSet.add(element.properties.ISO_A3);
            tmpArray.push(element);
          }
        });
        // Add a source for the state polygons.
        tmpArray.forEach(element => {
          map.addSource(element.properties.ISO_A3, {
            'type': 'geojson',
            'data': element
          });

        // Add a layer showing the state polygons.
        map.addLayer({
            'id': element.properties.ISO_A3,
            'type': 'fill',
            'source': element.properties.ISO_A3,
            'paint': {
                'fill-color': '#da1e28',
                'fill-opacity': 0
            }
        })
          var popup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false
      });

        // When a click event occurs on a feature in the states layer, open a popup at the
        // location of the click, with description HTML from its properties.

        // setTimeout(() => {
        //   map.setPaintProperty(polygonCountries.features[104].properties.ISO_A3, 'fill-opacity', 0.5);
        // }, 4000);
        
        map.on('click', element.properties.ISO_A3, function(e) {
            restrictedData.forEach(element => {
                if (e.features[0].properties.ISO_A3 === element.ISO_A3) {
                  let tmpCountries = element.inboundRestrictedCountryNamesRaw;
                  let tmpCountriesArray = [];
                  try {
                    tmpCountriesArray = tmpCountries.split(',');
                  } catch (error) {
                    console.log(error);
                  }
                  if(tmpCountriesArray){
                    tmpCountriesArray.forEach(element => {
                      if(element){
                        element = element.trim();
                      let url = `http://localhost:3210/getPolygon?country=${element}`;
                      console.log(url);
                      fetch(url)
                      .then((response) => {
                        return response.json();
                      }).then((data) => {
                        if(data.ISO_A3!='notAvailable'){
                        tempArray.push(data.ISO_A3);
                        map.setPaintProperty(data.ISO_A3, 'fill-opacity', 0.5);
                        }
                      })
                    }
                  })
                }
                    let description = `<span>${e.features[0].properties.ADMIN}</span><ul><li>InBound:${element.isInboundRestricted}</li><li>Inbound land:${element.isInboundLandRestricted}</li><li>Inbound Complete:${element.isInboundCompletelyRestricted}</li><li>Countries restriction:${element.inboundRestrictedCountryNamesRaw}</li>`;
                    popup
                        .setLngLat(e.lngLat)
                        .setHTML(description)
                        .addTo(map);
                }
            });
        });

        // Change the cursor to a pointer when the mouse is over the states layer.
        map.on('mouseenter', element.properties.ISO_A3, function() {
            map.getCanvas().style.cursor = 'pointer';
        });

        // Change it back to a pointer when it leaves.
        map.on('mouseleave', element.properties.ISO_A3, function() {
          if(tempArray.length){
            console.log(tempArray.length);
          tempArray.forEach(element => {
            map.setPaintProperty(element, 'fill-opacity', 0);
          })
            tempArray.length = 0;
        }
            popup.remove();
            map.getCanvas().style.cursor = '';
        });
      });
    })
    // insert from 2nd comment
    }
  }
      // setTimeout(() => {
      //   map.setLayoutProperty(polygonCountries.features[104].properties.ISO_A3, 'visibility', 'none');
      // }, 14000);