$(document).ready(function() {
  var labelArray = [];

  function numberWithCommas(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  function addCommas(nStr) {
      nStr += '';
      x = nStr.split('.');
      x1 = x[0];
      x2 = x.length > 1 ? '.' + x[1] : '';
      var rgx = /(\d+)(\d{3})/;
      while (rgx.test(x1)) {
          x1 = x1.replace(rgx, '$1' + ',' + '$2');
      }
      return x1 + x2;
  }
  Chart.defaults.global.tooltipTemplate = "<%= addCommas(value) %>";
  Chart.defaults.global.scaleLabel = "<%= addCommas(value) %>";
  Chart.defaults.global.title.mode = 'label';
  var chartCrude = $("#chartCrude");

  function calcAlgorithm(labelArray, prodData) {

  }

  function createDataArray(parsedData, labelArray, series) {
    var dataArray = []
    for (dateIndex in labelArray) {
      for (dataIndex in parsedData) {
        if (parsedData[dataIndex][0] == labelArray[dateIndex]) {
          if (series == 'CL' || series == 'TWDI') {
            dataArray.push(Math.round(parsedData[dataIndex][1] * 100) / 100)
          } else if (series == 'M1') {
            dataArray.push(Math.round(parsedData[dataIndex][1]) / 100)
          } else {
            dataArray.push(parsedData[dataIndex][1])
          }
        }
      }
    }
    return dataArray;
  }

  function negateAllValues(array) {
    var dataArray = [];
    for (arrayIndex in array) {
      dataArray.push(array[arrayIndex] * -1);
    }
    return dataArray;
  }

  function addEqualArrays(equalArrays) {
    var newArray = [];
    for (i = 0; i < equalArrays[0].length; i++) {
      var positionValue = 0
      for (array in equalArrays) {
        positionValue += equalArrays[array][i]
      }
      newArray.push(positionValue);
    }
    return newArray;
  }

  function combineDataArrays(arrayOfParsedDataArrays, labelArray, series) {
    var dataArray = [];
    for (dateIndex in labelArray) {
      var arrayCount = 0;
      var valueAtDate = 0;
      for (arrayIndex in arrayOfParsedDataArrays) {
        for (dataIndex in arrayOfParsedDataArrays[arrayIndex]) {
          if (arrayOfParsedDataArrays[arrayIndex][dataIndex][0] == labelArray[dateIndex]) {
            valueAtDate += arrayOfParsedDataArrays[arrayIndex][dataIndex][1];
            arrayCount += 1;
          }
        }
      }
      if (arrayCount == arrayOfParsedDataArrays.length) {
        dataArray.push(valueAtDate);
      }
    }
    return dataArray;
  }

  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'https://iq9fufbegg.execute-api.us-east-1.amazonaws.com/dev/CrdGetData', true);
  xhr.send(JSON.stringify({key:'crudeCLKey'}));
  xhr.onreadystatechange = function() {
      if (xhr.readyState == XMLHttpRequest.DONE) {
          // alert(xhr.responseText);
          // console.log("FINISHED REQUEST");

          var response = JSON.parse(xhr.responseText);
          labelArray = response['dates'];

          /*
            , ['PET.RWTC.D', 'WTI Spot Cushing ($)', 'USD']
            , ['STEO.PADI_OPEC.M', 'Unplanned Disruptions - OPEC (MBBL)', 'MMBPD']
            , ['STEO.PADI_NONOPEC.M', 'Unplanned Disruptions - Non-OPEC (MBBL)', 'MMBPD']
            , ['PET.WCRRIUS2.W', 'U.S. Refiner Net Input of Crude Oil (MBBL)', 'MBPM']
            , ['PET.MTTRX_NUS_1.M', 'U.S. Refinery Net Production of Crude Oil and Petroleum Products (MBBL)', 'MBPM']
            , ['PET.WOCLEUS2.W', 'U.S. Operable Crude Oil Distillation Capacity (MBBL)', 'MBPD']
            , ['PET.WPULEUS3.W', 'U.S. Utilization of Refinery Operable Capacity (%)', 'PctM']]
        */

          var fLabel = 'Crude CL Price Target ($)';
          var fData = [];

          var clLabel = response['PET.RCLC1.D']['dataSeriesDescription'];
          var clData = createDataArray(JSON.parse(response['PET.RCLC1.D']['data']), labelArray, 'CL');

          var prodLabel = 'U.S. Field and Offshore Crude Production (MBBL)';
          var prodArrays = [JSON.parse(response['PET.MCRFPUS1.M']['data']), JSON.parse(response['PET.MCRFP3FM1.M']['data']), JSON.parse(response['PET.MCRFP5F1.M']['data'])];
          var prodData = combineDataArrays(prodArrays, labelArray, 'USProd');

          var stockLabel = response['PET.WCESTUS1.W']['dataSeriesDescription'];
          var stockData = createDataArray(JSON.parse(response['PET.WCESTUS1.W']['data']), labelArray, 'USStock');
          var importLabel = response['PET.WCEIMUS2.W']['dataSeriesDescription'];
          var importData = createDataArray(JSON.parse(response['PET.WCEIMUS2.W']['data']), labelArray, 'USImports');
          var exportLabel = response['PET.WCREXUS2.W']['dataSeriesDescription'];
          var exportData = createDataArray(JSON.parse(response['PET.WCREXUS2.W']['data']), labelArray, 'USExports');
          var refCapLabel = response['PET.WOCLEUS2.W']['dataSeriesDescription'];
          var refCapData = createDataArray(JSON.parse(response['PET.WOCLEUS2.W']['data']), labelArray, 'USRefCap');
          var refInputLabel = response['PET.WCRRIUS2.W']['dataSeriesDescription'];
          var refInputData = createDataArray(JSON.parse(response['PET.WCRRIUS2.W']['data']), labelArray, 'USRefInput');
          var refProdLabel = response['PET.MTTRX_NUS_1.M']['dataSeriesDescription'];
          var refProdData = createDataArray(JSON.parse(response['PET.MTTRX_NUS_1.M']['data']), labelArray, 'USRefProd');

          var supplyLabel = 'U.S. Crude Net Refinery Supply Available (MBBL)';
          var supplyData = addEqualArrays([prodData, importData, negateAllValues(exportData)]);

          var disruptLabel = 'International Unplanned Disruptions (MBBL)';
          var disruptArrays = [JSON.parse(response['STEO.PADI_OPEC.M']['data']), JSON.parse(response['STEO.PADI_NONOPEC.M']['data'])];
          var disruptData = combineDataArrays(disruptArrays, labelArray, 'OPECDisrupt');
          console.log(disruptData);

          var twdiLabel = response['TWEXB']['dataSeriesDescription'];
          var twdiData = createDataArray(JSON.parse(response['TWEXB']['data']), labelArray, 'TWDI');
          var m1Label = response['M1']['dataSeriesDescription'];
          var m1Data = createDataArray(JSON.parse(response['M1']['data']), labelArray, 'M1');

          var myChart = new Chart(chartCrude, {
              type: 'line',
              data: {
                  labels: labelArray,
                  datasets: [{
                      label: fLabel,
                      yAxisID: 'y-axis-right',
                      fill: false,
                      data: fData,
                      backgroundColor: 'rgba(0, 255, 0, 0.2)',
                      borderColor: 'rgba(0, 255, 0, 1)',
                      borderWidth: 1,
                      pointBorderColor: 'rgba(0, 255, 0, 0.5)',
                      pointBorderWidth: 1
                  },{
                      label: clLabel,
                      yAxisID: 'y-axis-right',
                      fill: false,
                      data: clData,
                      backgroundColor: 'rgba(51, 153, 102, 0.2)',
                      borderColor: 'rgba(51, 153, 102, 1)',
                      borderWidth: 1,
                      pointBorderColor: 'rgba(51, 153, 102, 0.5)',
                      pointBorderWidth: 1
                  },{
                      label: twdiLabel,
                      yAxisID: 'y-axis-right',
                      fill: false,
                      data: twdiData,
                      backgroundColor: 'rgba(153, 204, 0, 0.2)',
                      borderColor: 'rgba(153, 204, 0, 1)',
                      borderWidth: 1,
                      pointBorderColor: 'rgba(153, 204, 0, 0.2)',
                      pointBorderWidth: 0
                  },{
                      label: m1Label,
                      yAxisID: 'y-axis-right',
                      fill: false,
                      data: m1Data,
                      backgroundColor: 'rgba(0, 51, 0, 0.2)',
                      borderColor: 'rgba(0, 51, 0, 1)',
                      borderWidth: 1,
                      pointBorderColor: 'rgba(0, 51, 0, 0.2)',
                      pointBorderWidth: 0
                  },{
                      label: stockLabel,
                      yAxisID: 'y-axis-left',
                      fill: true,
                      data: stockData,
                      backgroundColor: 'rgba(0, 0, 0, 0.2)',
                      borderColor: 'rgba(0, 0, 0, 0)',
                      borderWidth: 1,
                      pointBorderColor: 'rgba(0, 51, 204, 0)',
                      pointBorderWidth: 0
                  },{
                      label: prodLabel,
                      yAxisID: 'y-axis-left',
                      fill: true,
                      data: prodData,
                      backgroundColor: 'rgba(0, 51, 204, 0.2)',
                      borderColor: 'rgba(0, 51, 204, 0)',
                      borderWidth: 1,
                      pointBorderColor: 'rgba(0, 51, 204, 0)',
                      pointBorderWidth: 0
                  },{
                      label: importLabel,
                      yAxisID: 'y-axis-left',
                      fill: true,
                      data: importData,
                      backgroundColor: 'rgba(255, 244, 102, 0.4)',
                      borderColor: 'rgba(55, 244, 102, 0)',
                      borderWidth: 1,
                      pointBorderColor: 'rgba(55, 244, 102, 0)',
                      pointBorderWidth: 0
                  },{
                      label: refCapLabel,
                      yAxisID: 'y-axis-left',
                      fill: true,
                      data: refCapData,
                      backgroundColor: 'rgba(255, 102, 0, 0.2)',
                      borderColor: 'rgba(255, 102, 0, 0)',
                      borderWidth: 1,
                      pointBorderColor: 'rgba(255, 102, 0, 0)',
                      pointBorderWidth: 0
                  },{
                      label: refInputLabel,
                      yAxisID: 'y-axis-left',
                      fill: false,
                      data: refInputData,
                      backgroundColor: 'rgba(102, 0, 102, 0.2)',
                      borderColor: 'rgba(102, 0, 102, 1)',
                      borderWidth: 1,
                      pointBorderColor: 'rgba(102, 0, 102, 0)',
                      pointBorderWidth: 0
                  },{
                      label: supplyLabel,
                      yAxisID: 'y-axis-left',
                      fill: false,
                      data: supplyData,
                      backgroundColor: 'rgba(255, 102, 0, 0.2)',
                      borderColor: 'rgba(255, 102, 0, 1)',
                      borderWidth: 1,
                      pointBorderColor: 'rgba(255, 102, 0, 0)',
                      pointBorderWidth: 0
                  }]
              },
              options: {
                  scales: {
                      yAxes: [
                        {
                          type:'linear'
                          , 'id':'y-axis-left'
                          , display:true
                          , position: 'left'
                          // , scaleLabel: {
                          //   display: true
                          //   , labelString: 'MBBL'
                          // }
                          , ticks: {
                              callback: function(value, index, values) {
                                  return addCommas(value);
                              }
                          }
                        },{
                          type:'linear'
                          , 'id':'y-axis-right'
                          , display:true
                          , position: 'right'
                          // , ticks: {
                          //     callback: function(value, index, values) {
                          //         return '$' + value;
                          //     }
                          // }
                        }
                      ]
                  },
                  hover: 'dataset',
                  // pan: {
                  //       enabled: true,
                  //       mode: 'xy'
                  //   },
                  // zoom: {
                  //     enabled: true,
                  //     mode: 'xy',
                  //     limits: {
                  //         max: 10,
                  //         min: 0.5
                  //     }
                  // }
              }
          });

          function updateAlgorithm() {
            var xhrCL = new XMLHttpRequest();
            xhrCL.open('POST', 'https://7gxtvhyqnj.execute-api.us-east-1.amazonaws.com/prod/CrdCalcAlgorithm', true);
            xhrCL.send(JSON.stringify({
              'twdiData': twdiData
              ,'m1Data': m1Data
              ,'stockData': stockData
              ,'prodData': prodData
              ,'refCapData': refCapData
              ,'disruptData': disruptData
            }));
            xhrCL.onreadystatechange = function() {
                if (xhrCL.readyState == XMLHttpRequest.DONE) {
                    // alert(xhrCL.responseText);
                    var responseData = JSON.parse(xhrCL.responseText);
                    for (index in responseData) {
                      responseData[index] = Math.round(responseData[index] * 100) / 100;
                    }
                    myChart.data.datasets[0].data = responseData;
                    // console.log(myChart.data.datasets);
                    myChart.update();
                    // console.log("FINISHED UPDATING: " + fData);
                }
            }
          }
          updateAlgorithm();

          // var mouseStillDown = false;
          // $("#chartCrude").mousedown(function(evt) {
          //     mouseStillDown = true;
          //     editData(evt);
          // });
          // $("#chartCrude").mouseup(function(evt) {
          //     mouseStillDown = false;
          // });
          //
          // var mousePositionY = 0;
          // var chartPositionY = 0;
          // var chartHeight = 0;
          // $("#chartCrude").mousemove(function(event) {
          //   mousePositionY = event.pageY;
          //   chartPositionY = $("#chartCrude").position().top;
          //   chartHeight = $("#chartCrude").height();
          //
          //   if (mouseStillDown) {
          //     var positionPercentOfChart = (mousePositionY - chartPositionY) / (chartHeight - chartPositionY);
          //     console.log("POSITION PERCENT OF CHART: " + positionPercentOfChart);
          //   }
          // });
          //
          // function editData(evt) {
          //     if (mouseStillDown) {
          //       var activePoint = myChart.getElementAtEvent(evt);
          //       console.log(activePoint);
          //       if (activePoint.length > 0) {
          //         console.log(activePoint[0]['_datasetIndex']);
          //         console.log(activePoint[0]['_index']);
          //
          //       }
          //     }
          // }

          for (i = 1; i <= 6; i++) {
            $("#selection_title_container").append(
              "<div class='selection_title_box' id='selection_title_box_" + i + "'>" +
        				"<a class='selection_title_box_text' id='selection_title_box_text_" + i + "'></a>" +
        			"</div>"
            )
          }
          for (i = 1; i <= 5; i++) {
            for (j = 1; j <= 6; j++) {
              $("#selection_container_" + i).append(
                "<div class='selection_box' id='selection_box_" + i + "-" + j + "'>" +
          				"<div class='arrow_up' id='arrow_up_" + i + "-" + j + "'></div>" +
          				"<a class='selection_box_text' id='selection_box_text_" + i + "-" + j + "'></a>" +
          				"<div class='arrow_down' id='arrow_down_" + i + "-" + j + "'></div>" +
          			"</div>"
              )
            }
          }

          for (i = 0; i <= 6; i++) {
              $("#selection_title_box_text_" + (i + 1)).text(labelArray[labelArray.length - (6 - i)]);
          }

          $("#selection_box_text_1-title").text(twdiLabel);
          $("#selection_box_text_2-title").text(m1Label);
          $("#selection_box_text_3-title").text(stockLabel);
          $("#selection_box_text_4-title").text(prodLabel);
          $("#selection_box_text_5-title").text(refCapLabel);
          // $("#selection_box_text_6-title").text(disruptionChangeLabel)
          for (i = 0; i <= 5; i++) {
              $("#selection_box_text_1-" + (i + 1)).text(addCommas(twdiData[stockData.length - (6 - i)]));
              $("#selection_box_text_2-" + (i + 1)).text(addCommas(m1Data[stockData.length - (6 - i)]));
              $("#selection_box_text_3-" + (i + 1)).text(addCommas(stockData[stockData.length - (6 - i)]));
              $("#selection_box_text_4-" + (i + 1)).text(addCommas(prodData[stockData.length - (6 - i)]));
              $("#selection_box_text_5-" + (i + 1)).text(addCommas(refCapData[stockData.length - (6 - i)]));
              // $("#selection_box_text_6-" + (i + 1)).text(addCommas(disruptionChangeData[stockData.length - (6 - i)]));
          }

          for (i = 0; i <= 6; i++) {
              add_click_listener(i)
          }
          function add_click_listener(i) {
            $("#arrow_up_1-" + (i + 1)).click(function() {
              twdiData[twdiData.length - (6 - i)] = twdiData[twdiData.length - (6 - i)] + 1;
              $("#selection_box_text_1-" + (i + 1)).text(addCommas(Math.round(twdiData[twdiData.length - (6 - i)] * 100) / 100));
              myChart.update();
              updateAlgorithm()
            });
            $("#arrow_down_1-" + (i + 1)).click(function() {
              twdiData[twdiData.length - (6 - i)] = twdiData[twdiData.length - (6 - i)] - 1;
              $("#selection_box_text_1-" + (i + 1)).text(addCommas(Math.round(twdiData[twdiData.length - (6 - i)] * 100) / 100));
              myChart.update();
              updateAlgorithm()
            });

            $("#arrow_up_2-" + (i + 1)).click(function() {
              m1Data[m1Data.length - (6 - i)] = m1Data[m1Data.length - (6 - i)] + 0.1;
              $("#selection_box_text_2-" + (i + 1)).text(addCommas(Math.round(m1Data[m1Data.length - (6 - i)] * 100) / 100));
              myChart.update();
              updateAlgorithm()
            });
            $("#arrow_down_2-" + (i + 1)).click(function() {
              m1Data[m1Data.length - (6 - i)] = m1Data[m1Data.length - (6 - i)] - 0.1;
              $("#selection_box_text_2-" + (i + 1)).text(addCommas(Math.round(m1Data[m1Data.length - (6 - i)] * 100) / 100));
              myChart.update();
              updateAlgorithm()
            });

            $("#arrow_up_3-" + (i + 1)).click(function() {
              stockData[stockData.length - (6 - i)] = stockData[stockData.length - (6 - i)] + 1000;
              $("#selection_box_text_3-" + (i + 1)).text(addCommas(Math.round(stockData[stockData.length - (6 - i)] * 100) / 100));
              myChart.update();
              updateAlgorithm()
            });
            $("#arrow_down_3-" + (i + 1)).click(function() {
              stockData[stockData.length - (6 - i)] = stockData[stockData.length - (6 - i)] - 1000;
              $("#selection_box_text_3-" + (i + 1)).text(addCommas(Math.round(stockData[stockData.length - (6 - i)] * 100) / 100));
              myChart.update();
              updateAlgorithm()
            });

            $("#arrow_up_4-" + (i + 1)).click(function() {
              prodData[prodData.length - (6 - i)] = prodData[prodData.length - (6 - i)] + 1000;
              $("#selection_box_text_4-" + (i + 1)).text(addCommas(Math.round(prodData[prodData.length - (6 - i)] * 100) / 100));
              myChart.update();
              updateAlgorithm()
            });
            $("#arrow_down_4-" + (i + 1)).click(function() {
              prodData[prodData.length - (6 - i)] = prodData[prodData.length - (6 - i)] - 1000;
              $("#selection_box_text_4-" + (i + 1)).text(addCommas(Math.round(prodData[prodData.length - (6 - i)] * 100) / 100));
              myChart.update();
              updateAlgorithm()
            });

            $("#arrow_up_5-" + (i + 1)).click(function() {
              refCapData[refCapData.length - (6 - i)] = refCapData[refCapData.length - (6 - i)] + 1000;
              $("#selection_box_text_5-" + (i + 1)).text(addCommas(Math.round(refCapData[refCapData.length - (6 - i)] * 100) / 100));
              myChart.update();
              updateAlgorithm()
            });
            $("#arrow_down_5-" + (i + 1)).click(function() {
              refCapData[refCapData.length - (6 - i)] = refCapData[refCapData.length - (6 - i)] - 1000;
              $("#selection_box_text_5-" + (i + 1)).text(addCommas(Math.round(refCapData[refCapData.length - (6 - i)] * 100) / 100));
              myChart.update();
              updateAlgorithm()
            });
          }
      }
  }

  if ($('body').width() < 600) {

  }

  $('#info_screen').css('display', 'block');
  $('#info_box').css('display', 'block');
  // $('#info_screen').click(function() {
  //   $('#info_screen').css('display', 'none');
  //   $('#info_box').css('display', 'none');
  // });



});
