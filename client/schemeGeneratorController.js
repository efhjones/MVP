angular.module('colorPsychology', [])


.controller('schemeGeneratorController', function ($scope, $compile, $http, $window, ChooseColors){
  $scope.colors = [];
  $scope.color = "";
  $scope.scheme = false;
  $scope.canvas;
  $scope.addColor = function(){
    if ($scope.colors.length < 4){
      if($scope.color.length > 1){
        $scope.colors.push($scope.color);
        console.log($scope.colors);
      }
    }
    if ($scope.colors.length === 4){
      $scope.submitColors();
      $scope.display = "You chose " + $scope.colors.toString();
      $scope.colors = [];
    }
    if ($scope.colors.length === 1){
      $scope.clear();
    }


  }
   $scope.submitColors = function(){
    $scope.clear();
      ChooseColors.submit($scope.colors)
        .then(function(object){
          $scope.makeColorDiv(object.data.colors);
      });
    }

  $scope.makeColorDiv = function(colorArray){
    $scope.scheme = colorArray;
    var canvas = document.getElementById("colors");
    var ctx = canvas.getContext("2d");
    for (var i = 0; i < colorArray.length; i++){
      console.log('logging color', colorArray[i]);
      var ctx = canvas.getContext("2d");
      ctx.fillStyle = colorArray[i];
                  //x, y, width, height
      ctx.fillRect(i*70,0,50,300);
    }
    $scope.canvas = canvas;
    var newDirective = angular.element('<div class="label" ng-repeat="color in scheme track by $index">{{ color }}</div><button class="submit" ng-click="save()">Save</button>');
    angular.element(document.querySelector('.labels')).append(newDirective);
    $compile(newDirective)($scope);

    // var newDirective = angular.element('<div ng-repeat="color in scheme track by $index" style="background-color: {{ color }}" class="color">{{ color }}</div><button class="submit" ng-click="clear()">Clear</button>');
    // angular.element(document.querySelector('#colors')).append(newDirective);
    // $compile(newDirective)($scope);
  }

  $scope.clear = function(){
    angular.element('.colorContainer').html('<canvas id="colors"></canvas>');
    angular.element('.labels').html('');
  }
  $scope.save = function(){
    console.log('save clicked');
    var img = $scope.canvas.toDataURL("image/png");
    console.log("Image saved, ", img);
    document.write('<img src="'+img+'"/>');
  }

})

.factory('ChooseColors', function($http){

  var submit = function(data){
    return $http({
      method: 'POST',
      url: '/',
      data: data
    })
    .then(function(){
      var request = $http({
        method: 'GET',
        url: '/scheme'
      });
      return request;
    });
  }

  return {
    submit: submit
  }

});