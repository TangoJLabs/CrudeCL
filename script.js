$(document).ready(function() {
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
          if (series == 'CL') {
            dataArray.push(Math.round(parsedData[dataIndex][1] * 100) / 100)
          } else {
            dataArray.push(parsedData[dataIndex][1])
          }
        }
      }
    }
    return dataArray;
  }

  function combineDataArrays(arrayOfParsedDataArrays, labelArray, series) {
    var dataArray = []
    for (dateIndex in labelArray) {
      var arrayCount = 0
      var valueAtDate = 0
      for (arrayIndex in arrayOfParsedDataArrays) {
        for (dataIndex in arrayOfParsedDataArrays[arrayIndex]) {
          if (arrayOfParsedDataArrays[arrayIndex][dataIndex][0] == labelArray[dateIndex]) {
            valueAtDate += arrayOfParsedDataArrays[arrayIndex][dataIndex][1]
            arrayCount += 1
          }
        }
      }
      if (arrayCount == arrayOfParsedDataArrays.length) {
        dataArray.push(valueAtDate)
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
          console.log("FINISHED REQUEST");

          var response = JSON.parse(xhr.responseText);
          var labelArray = response['dates'];

          /*
            , ['PET.RWTC.D', 'WTI Spot Cushing ($)', 'USD']
            , ['STEO.PADI_OPEC.M', 'Unplanned Disruptions - OPEC (MBBL)', 'MMBPD']
            , ['STEO.PADI_NONOPEC.M', 'Unplanned Disruptions - Non-OPEC (MBBL)', 'MMBPD']
            , ['PET.WCRRIUS2.W', 'U.S. Refiner Net Input of Crude Oil (MBBL)', 'MBPM']
            , ['PET.MTTRX_NUS_1.M', 'U.S. Refinery Net Production of Crude Oil and Petroleum Products (MBBL)', 'MBPM']
            , ['PET.WOCLEUS2.W', 'U.S. Operable Crude Oil Distillation Capacity (MBBL)', 'MBPD']
            , ['PET.WPULEUS3.W', 'U.S. Utilization of Refinery Operable Capacity (%)', 'PctM']]
        */

          var clLabel = response['PET.RCLC1.D']['dataSeriesDescription']
          var clData = createDataArray(JSON.parse(response['PET.RCLC1.D']['data']), labelArray, 'CL');

          var prodLabel = 'U.S. Field and Offshore Crude Production'
          var prodArrays = [JSON.parse(response['PET.MCRFPUS1.M']['data']), JSON.parse(response['PET.MCRFP3FM1.M']['data']), JSON.parse(response['PET.MCRFP5F1.M']['data'])]
          var prodData = combineDataArrays(prodArrays, labelArray, 'USProd');

          var stockLabel = response['PET.WCESTUS1.W']['dataSeriesDescription']
          var stockData = createDataArray(JSON.parse(response['PET.WCESTUS1.W']['data']), labelArray, 'USStock');
          var importLabel = response['PET.WCEIMUS2.W']['dataSeriesDescription']
          var importData = createDataArray(JSON.parse(response['PET.WCEIMUS2.W']['data']), labelArray, 'USImports');
          var exportLabel = response['PET.WCREXUS2.W']['dataSeriesDescription']
          var exportData = createDataArray(JSON.parse(response['PET.WCREXUS2.W']['data']), labelArray, 'USExports');
          var refCapLabel = response['PET.WOCLEUS2.W']['dataSeriesDescription']
          var refCapData = createDataArray(JSON.parse(response['PET.WOCLEUS2.W']['data']), labelArray, 'USRefCap');
          var refInputLabel = response['PET.WCRRIUS2.W']['dataSeriesDescription']
          var refInputData = createDataArray(JSON.parse(response['PET.WCRRIUS2.W']['data']), labelArray, 'USRefInput');
          var refProdLabel = response['PET.MTTRX_NUS_1.M']['dataSeriesDescription']
          var refProdData = createDataArray(JSON.parse(response['PET.MTTRX_NUS_1.M']['data']), labelArray, 'USRefProd');



          var myChart = new Chart(chartCrude, {
              type: 'line',
              data: {
                  labels: labelArray,
                  datasets: [{
                      label: clLabel,
                      yAxisID: 'y-axis-right',
                      fill: false,
                      data: clData,
                      backgroundColor: 'rgba(51, 153, 102, 0.2)',
                      borderColor: 'rgba(51, 153, 102, 1)',
                      borderWidth: 1,
                      pointBorderColor: 'rgba(51, 153, 102, 1)',
                      pointBorderWidth: 1
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
                      label: refProdLabel,
                      yAxisID: 'y-axis-left',
                      fill: false,
                      data: refProdData,
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
                        },{
                          type:'linear'
                          , 'id':'y-axis-right'
                          , display:true
                          , position: 'right'
                        }
                      ]
                  },
                  hover: 'dataset'
              }
          });
      }
  }

});
