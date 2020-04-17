import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';


declare function require(arg:string): any;
const environment = require('../assets/auth/token.json');
const polygonCountries = require('../assets/polygon/countries.json')
const restrictedData =require('../assets/restricted-travel-map/data.json')
declare var mapboxgl: any;
declare var ApexCharts: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  confirmed = 0;
  recovered = 0;
  deaths = 0;
  country: string;
  inbound: string;
  inboundLand: string;
  inboundComplete: string;
  countries: string;
  title = 'mapbox';
  radius: number = 10;
  color: string;
  reason = '';
  aggregatedDate= [];
  aggregatedConfirmed= [];
  aggregatedRecovered= [];
  aggregatedDeaths= [];
  aggregatedData;

  constructor(private http: HttpClient){}

  ngOnInit() {
    // Load data for counter
    let counterUrl = `${environment.url}worldwide-aggregated`;
    document.getElementById("navbar").style.visibility = "hidden";
    fetch(counterUrl)
    .then((response) => {
      return response.json();
    }).then((data) => {
      let length = data.length - 1;
      this.confirmed = data[length].Confirmed;
      this.recovered = data[length].Recovered;
      this.deaths = data[length].Deaths;
      if(length>25){
        this.aggregatedData = data.splice(-20,20);
        console.log(this.aggregatedData);
        this.aggregatedData.forEach(element => {
          this.aggregatedDate.push(element.Date);
          this.aggregatedConfirmed.push(element.Confirmed);
          this.aggregatedRecovered.push(element.Recovered);
          this.aggregatedDeaths.push(element.Deaths)
        });

        var options = {
          series: [{
          name: 'Confirmed',
          data: this.aggregatedConfirmed
        }, {
          name: 'Recovered',
          data: this.aggregatedRecovered
        }, {
          name: 'Deaths',
          data: this.aggregatedDeaths
        }],
          chart: {
          type: 'bar',
          height: 150
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '55%',
            endingShape: 'rounded'
          },
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          show: true,
          width: 2,
          colors: ['transparent']
        },
        xaxis: {
          categories: this.aggregatedDate,
        },
        yaxis: {
          title: {
            text: 'Total'
          }
        },
        fill: {
          opacity: 1
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return val
            }
          }
        }
        };
    
        var chart = new ApexCharts(document.querySelector("#chart"), options);
        chart.render();
      }
    });

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
                      let url = `${environment.url}getPolygon?country=${element}`;
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
                document.getElementById("country").innerHTML = e.features[0].properties.ADMIN;
                document.getElementById("inbound").innerHTML = `Inbound: ` + element.isInboundRestricted;
                document.getElementById("inboundLand").innerHTML = 'Inbound Land: ' + element.isInboundLandRestricted;
                document.getElementById("inboundComplete").innerHTML = 'Inbound Complete: ' + element.isInboundCompletelyRestricted;
                document.getElementById("countries").innerHTML = 'Restricted countries: ' + element.inboundRestrictedCountryNamesRaw;
                // document.getElementById("navbar").classList.remove("hidden");
                // document.getElementById("navbar").classList.add("visible");
                document.getElementById("navbar").style.visibility = "visible";
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
          tempArray.forEach(element => {
            map.setPaintProperty(element, 'fill-opacity', 0);
          })
            tempArray.length = 0;
        }
        // document.getElementById("navbar").style.opacity = "0.7";
        // document.getElementById("navbar").classList.remove("visible");
        // document.getElementById("navbar").classList.add("hidden");
        document.getElementById("navbar").style.visibility = "hidden";
            map.getCanvas().style.cursor = '';
        });
      })
    })
    }
  }