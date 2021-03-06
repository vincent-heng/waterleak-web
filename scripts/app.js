var app = angular.module('app',['ngRoute']);

app.config(function($routeProvider){
	$routeProvider
	.when("/", {
		templateUrl: "index.html",
		controller: "IndexCtrl"
	});
});

app.factory('socket', function ($rootScope) {
  var socket = io.connect();
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
});

app.controller("IndexCtrl", function($scope, socket){
	// Socket listeners
	// ================
	socket.on('refresh_info_event', function(data) {
		$scope.infos = JSON.parse(data);
		$scope.infos.flowRate = parseFloat($scope.infos.flowRate);
		$scope.infos.flowCount = parseInt($scope.infos.flowCount);
		$scope.infos.state = parseInt($scope.infos.state);
		$scope.infos.waterState = parseInt($scope.infos.waterState);

		var currentWaterFlow = {
			time : (new Date()).toISOString(),
			flowCount : $scope.infos.flowCount
		};

		if (waterFlowArray == undefined) {
			initWaterFlowChart(currentWaterFlow);
		} else {
			waterFlowArray.push(currentWaterFlow);
			updateChart(waterFlowArray);
		}
	});
	
	// Internal functions
	// ==================
	var sendToggleValve = function() {
		socket.emit('toggle_valve_event');
	}

	var waterFlowArray;
	var waterFlowChart;

	var initWaterFlowChart = function(firstWaterFlow) {
		waterFlowArray = new Array();
		waterFlowArray.push(firstWaterFlow);

		waterFlowChart = new Morris.Line({
			// ID of the element in which to draw the chart.
			element: 'waterFlowChart',
			// Chart data records -- each entry in this array corresponds to a point on
			// the chart.
			data: waterFlowArray,
			// The name of the data record attribute that contains x-values.
			xkey: 'time',
			xLabels: 'minute',
			// A list of names of data record attributes that contain y-values.
			ykeys: ['flowCount'],
			// Labels for the ykeys -- will be displayed when you hover over the
			// chart.
			labels: ['flow']
		});
	};



	var updateChart = function(data) {
		waterFlowChart.setData(data);
	}

	// Methods published to the scope
	// ==============================
	$scope.receiveNotifications = true;
	$scope.leakState = false;
	$scope.infos = {};
	$scope.infos.flowRate = 0;
	$scope.infos.flowCount = 0;
	$scope.infos.waterState = 0;

	$scope.toggleNotifications = function() {
		$scope.receiveNotifications = !$scope.receiveNotifications;
	}

	$scope.toggleValve = function() {
		sendToggleValve();
		$scope.infos.waterState = ($scope.infos.waterState+1)%2;
	}


});