(function() {
  'use strict';
  /*globals angular, moment, jQuery */
  /*jslint vars:true */

  /**
   * @license angular-bootstrap-datetimepicker  v0.2.4
   * (c) 2013 Knight Rider Consulting, Inc. http://www.knightrider.com
   * License: MIT
   */

  /**
   *
   *    @author       dzuch, Dale "Ducky" Lotts
   *    @since        2013-Jul-8
   */

  angular
      .module('ui.bootstrap.datetimepicker', [])
      .constant('dateTimePickerConfig', {
        dropdownSelector: null,
        minuteStep: 5,
        maxView: 'year',
        minView: 'minute',
        startView: 'day',
        weekStart: 0
      })
      .directive('cnDatetimepicker', cnDatetimepicker)
      .directive('cnDatetimeConfig', cnDatetimeConfig)
      .directive('datetimepicker', datetimepicker);


  // Order of the elements in the validViews array is significant.
  const validViews = ['minute', 'hour', 'day', 'month', 'year'];

  function cnDatetimepicker() {
    return {
      restrict: 'E',
      require: 'ngModel',
      template: `
          <div dropdown class="dropdown">
            <div class="input-group" data-target="#" id="{{inputId}}-container"
                 dropdown-toggle ng-disabled="{{isDisabled}}">
              <input type="text"
                     class="form-control"
                     id="{{inputId}}"
                     name="{{inputId}}"
                     ng-model="ngModel"
                     ng-blur="lostFocus()"
                     cn-datetime-config="inputConfig"
                     ng-disabled="isDisabled"
                     ng-required="required"
                     placeholder="{{placeholder}}">
              <span class="input-group-btn">
                <button class="btn" ng-disabled="isDisabled">
                  <i class="{{iconClass}}"></i>
                </button>
              </span>
            </div>
            <ul class="dropdown-menu cn-datetimepicker-dropdown" role="menu">
              <li>
                <datetimepicker
                  ng-model="ngModel"
                  min-date="minDate"
                  max-date="maxDate"
                  default-time="defaultTime"
                  model-formatter="modelFormatter"
                  model-parser="modelParser"
                  datetimepicker-config="{ dropdownSelector: '#' + inputId + '-container', minView: minView || 'minute', maxView: maxView || 'year' }">
                </datetimepicker>
              </li>
            </ul>
          </div>`,
      scope: {
        ngModel: '=',
        minDate: '=',
        maxDate: '=',
        defaultTime: '=',
        maxView: '@',
        minView: '@',
        isDisabled: '=',
        inputId: '@',
        formatString: '@',
        modelType: '@',
        //modelFormat: '@',
        modelFormatter: '=?',
        modelParser: '=?',
        viewFormatter: '=?',
        viewParser: '=?',
        required: '=cnDateRequired',
        onChange: '&'
      },
      compile: () => ({pre: Link})
      //link: Link
    };

    function Link($scope, elem, attrs, ctrl) {

      let input = elem.find('input');

      //$scope.required = attrs.required;
      $scope.iconClass = attrs.iconClass || 'fa fa-calendar';
      $scope.modelFormat = 'YYYY-MM-DD HH:mm:ss';
      $scope.modelFormatter = $scope.modelFormatter || formatModel;
      $scope.modelParser = $scope.modelParser || (val => val);
      $scope.viewFormatter = $scope.viewFormatter || formatView;
      $scope.viewParser = $scope.viewParser || parseView;
      $scope.placeholder = attrs.placeholder;
      $scope.modelType = $scope.modelType || 'string';

      $scope.inputConfig = {
        viewFormatter: $scope.viewFormatter,
        viewParser: $scope.viewParser
      };

      //////////

      $scope.lostFocus = () => {
        console.log('Focus Lost');
      }

      $scope.$watch('ngModel', function(newVal, prevVal) {
        console.log(newVal, prevVal)
        if(typeof newVal !== $scope.modelType) {
          $scope.ngModel = formatModel(newVal);
          return;
        }
        if($scope.onChange) {
          $scope.onChange({$value: newVal});
        }
        ctrl.$setValidity('schemaForm', true);
        if($scope.required) {
          ctrl.$setValidity('tv4-302', !!($scope.ngModel || $scope.ngModel === 0));
        }
        if(!angular.equals(newVal, prevVal)) {
          ctrl.$setDirty();
        }
      });

      if ($scope.maxView !== "hour") {
        input.blur(function() {
          let date = moment($scope.ngModel);
          if (date.year() < 2000) $scope.ngModel = date.year(date.year() + 2000);
        });
      }

      function formatModel(val) {
        if(!val) return val;

        console.log('formatModel')
        let date = moment(val);
        console.log('va', val);
        console.log('date.toDate()', date.toDate());
        console.log('date.format($scope.modelFormat)', date.format($scope.modelFormat));
        return $scope.modelType === 'string' ? date.format($scope.modelFormat) : date.toDate();
      }

      function formatView(val) {
        if(!val) return val;

        return moment(val).format($scope.formatString || 'M/DD/YYYY h:mm a');
      }

      function parseView(val) {
        if(!val) return val;

        let m = moment(val, $scope.formatString || 'M/DD/YYYY h:mm a');
        let update = $scope.modelType === 'string' ? m.format($scope.modelFormat) : m.toDate();

        return update;
      }
    }
  }

  function cnDatetimeConfig() {
    return {
      restrict: 'A',
      require: 'ngModel',
      priority: 9000,
      scope: {
        config: '=cnDatetimeConfig'
      },
      link: Link
    };

    function Link($scope, elem, attrs, ctrl) {
      ctrl.$formatters.unshift($scope.config.viewFormatter);
      ctrl.$parsers.unshift($scope.config.viewParser);
    }
  }

  datetimepicker.$inject = ['dateTimePickerConfig'];
  function datetimepicker(defaultConfig) {

    var validateConfiguration = function(configuration) {
      var validOptions = [
        'startView', 'maxView', 'minView', 'minuteStep', 'dropdownSelector', 'weekStart'
      ];

      for(var prop in configuration) {
        if(configuration.hasOwnProperty(prop)) {
          if(validOptions.indexOf(prop) < 0) {
            throw ("invalid option: " + prop);
          }
        }
      }

      if(configuration.maxView && validViews.indexOf(configuration.maxView) < validViews.indexOf(configuration.startView)) {
        configuration.startView = configuration.maxView;
      }

      if(validViews.indexOf(configuration.startView) < 0) {
        throw ("invalid startView value: " + configuration.startView);
      }

      if(validViews.indexOf(configuration.minView) < 0) {
        throw ("invalid minView value: " + configuration.minView);
      }

      if(validViews.indexOf(configuration.minView) > validViews.indexOf(configuration.startView)) {
        throw ("startView must be greater than minView");
      }

      if(!angular.isNumber(configuration.minuteStep)) {
        throw ("minuteStep must be numeric");
      }
      if(configuration.minuteStep <= 0 || configuration.minuteStep >= 60) {
        throw ("minuteStep must be greater than zero and less than 60");
      }
      if(configuration.dropdownSelector !== null && !angular.isString(configuration.dropdownSelector)) {
        throw ("dropdownSelector must be a string");
      }

      if(!angular.isNumber(configuration.weekStart)) {
        throw ("weekStart must be numeric");
      }
      if(configuration.weekStart < 0 || configuration.weekStart > 6) {
        throw ("weekStart must be greater than or equal to zero and less than 7");
      }
    };

    return {
      restrict: 'E',
      require: 'ngModel',
      template: `
      <div class='datetimepicker'>
        <table class='table table-condensed'>
          <thead>
          <tr>
            <th class='left'
                data-ng-click='changeView(data.currentView, data.leftDate, $event)'>
              <i class='glyphicon glyphicon-arrow-left'/>
            </th>
            <th class='switch'
                ng-class="{'disabled': !showView(data.previousView)}"
                colspan='5'
                data-ng-click='changeView(data.previousView, data.currentDate, $event, !showView(data.previousView))'>
                {{ data.title }}
            </th>
            <th class='right'
                data-ng-click='changeView(data.currentView, data.rightDate, $event)'>
              <i class='glyphicon glyphicon-arrow-right'/>
            </th>
          </tr>
          <tr>
            <th class='dow' data-ng-repeat='day in data.dayNames'>{{ day }}</th>
          </tr>
          </thead>
          <tbody>
          <tr data-ng-class="{ hide: data.currentView == 'day' }">
            <td colspan='7' >
              <span class='{{ data.currentView }}'
                    data-ng-repeat='dateValue in data.dates'
                    data-ng-class='{active: dateValue.active, past: dateValue.past, future: dateValue.future, disabled: dateValue.disabled}'
                    data-ng-click="changeView(data.nextView, dateValue.date, $event, dateValue.disabled, true)">
                {{ dateValue.display }}
              </span>
            </td>
          </tr>
          <tr data-ng-show='data.currentView == "day"' data-ng-repeat='week in data.weeks'>
            <td data-ng-repeat='dateValue in week.dates'
                data-ng-click='changeView(data.nextView, dateValue.date, $event, dateValue.disabled, true)'
                class='day'
                data-ng-class='{active: dateValue.active, past: dateValue.past, future: dateValue.future, disabled: dateValue.disabled}'>
              {{ dateValue.display }}
            </td>
          </tr>
          </tbody>
        </table>
      </div>`,
      scope: {
        ngModel: "=",
        onSetTime: "=",
        minDate: '=',
        maxDate: '=',
        defaultTime: '=',
        modelFormatter: '=?',
        modelParser: '=?',
        datetimepickerConfig: "=?"
      },
      replace: true,
      link: function(scope, element, attrs, ctrl) {

        var noop = val => val;

        scope.modelFormatter = scope.modelFormatter || noop;
        scope.modelParser = scope.modelParser || noop;
        scope.showView = showView;

        var directiveConfig = {};

        if(scope.datetimepickerConfig) {
          directiveConfig = scope.datetimepickerConfig;
        }
        else if(attrs.datetimepickerConfig) {
          directiveConfig = scope.$eval(attrs.datetimepickerConfig);
        }

        var configuration = {};

        angular.extend(configuration, defaultConfig, directiveConfig);

        validateConfiguration(configuration);

        var dataFactory = {
          year: function(unixDate) {
            var selectedDate = moment(unixDate).startOf('year');
            // View starts one year before the decade starts and ends one year after the decade ends
            // i.e. passing in a date of 1/1/2013 will give a range of 2009 to 2020
            // Truncate the last digit from the current year and subtract 1 to get the start of the decade
            var startDecade = (parseInt(selectedDate.year() / 10, 10) * 10);
            var startDate = moment(selectedDate).year(startDecade - 1).startOf('year');
            var activeYear = scope.ngModel ? moment(scope.modelParser(scope.ngModel)).year() : 0;

            var result = {
              'currentView': 'year',
              'nextView': configuration.minView === 'year' ? 'setTime' : 'month',
              'title': startDecade + '-' + (startDecade + 9),
              'leftDate': moment(startDate).subtract(9, 'year').valueOf(),
              'rightDate': moment(startDate).add(11, 'year').valueOf(),
              'dates': [],
              'setUnits': ['year']
            };

            for(var i = 0; i < 12; i++) {
              var yearMoment = moment(startDate).add(i, 'years');
              var dateValue = {
                'date': yearMoment.valueOf(),
                'display': yearMoment.format('YYYY'),
                'past': yearMoment.year() < startDecade,
                'future': yearMoment.year() > startDecade + 9,
                'active': yearMoment.year() === activeYear,
                'disabled': (scope.minDate && yearMoment.year() < moment(scope.minDate).year()) ||
                            (scope.maxDate && yearMoment.year() > moment(scope.maxDate).year())
              };

              result.dates.push(dateValue);
            }

            return result;
          },

          month: function(unixDate) {

            var startDate = moment(unixDate).startOf('year');

            var activeDate = scope.ngModel ? moment(scope.modelParser(scope.ngModel)).format('YYYY-MMM') : 0;

            var result = {
              'previousView': 'year',
              'currentView': 'month',
              'nextView': configuration.minView === 'month' ? 'setTime' : 'day',
              'currentDate': startDate.valueOf(),
              'title': startDate.format('YYYY'),
              'leftDate': moment(startDate).subtract(1, 'year').valueOf(),
              'rightDate': moment(startDate).add(1, 'year').valueOf(),
              'dates': [],
              'setUnits': ['year', 'month']
            };

            for(var i = 0; i < 12; i++) {
              var monthMoment = moment(startDate).add(i, 'months');
              var dateValue = {
                'date': monthMoment.valueOf(),
                'display': monthMoment.format('MMM'),
                'active': monthMoment.format('YYYY-MMM') === activeDate,
                'disabled': (scope.minDate && monthMoment.add(1, 'month').isBefore(scope.minDate)) ||
                            (scope.maxDate && monthMoment.subtract(1, 'month').isAfter(scope.maxDate))
              };

              result.dates.push(dateValue);
            }

            return result;
          },

          day: function(unixDate) {

            var selectedDate = moment(unixDate);
            var startOfMonth = moment(selectedDate).startOf('month');
            var endOfMonth = moment(selectedDate).endOf('month');

            var startDate = moment(startOfMonth).subtract(Math.abs(startOfMonth.weekday() - configuration.weekStart), 'days');

            var activeDate = scope.ngModel ? moment(scope.modelParser(scope.ngModel)).format('YYYY-MMM-DD') : '';

            var result = {
              'previousView': 'month',
              'currentView': 'day',
              'nextView': configuration.minView === 'day' ? 'setTime' : 'hour',
              'currentDate': selectedDate.valueOf(),
              'title': selectedDate.format(`MMM${showView('year') ? ' YYYY' : ''}`),
              'leftDate': moment(startOfMonth).subtract(1, 'months').valueOf(),
              'rightDate': moment(startOfMonth).add(1, 'months').valueOf(),
              'dayNames': [],
              'weeks': [],
              'setUnits': ['year', 'month', 'date']
            };


            for(var dayNumber = configuration.weekStart; dayNumber < configuration.weekStart + 7; dayNumber++) {
              result.dayNames.push(moment().weekday(dayNumber).format('dd'));
            }

            for(var i = 0; i < 6; i++) {
              var week = { dates: [] };
              for(var j = 0; j < 7; j++) {
                var monthMoment = moment(startDate).add((i * 7) + j, 'days');
                var dateValue = {
                  'date': monthMoment.valueOf(),
                  'display': monthMoment.format('D'),
                  'active': monthMoment.format('YYYY-MMM-DD') === activeDate,
                  'past': monthMoment.isBefore(startOfMonth),
                  'future': monthMoment.isAfter(endOfMonth),
                  'disabled': (scope.minDate && monthMoment.add(1, 'days').isBefore(scope.minDate)) ||
                              (scope.maxDate && monthMoment.subtract(1, 'days').isAfter(scope.maxDate))
                };
                week.dates.push(dateValue);
              }
              result.weeks.push(week);
            }

            return result;
          },

          hour: function(unixDate) {
            var selectedDate = moment(unixDate).hour(0).minute(0).second(0);

            var activeFormat = scope.ngModel ? moment(scope.modelParser(scope.ngModel)).format('YYYY-MM-DD H') : '';

            var result = {
              'previousView': 'day',
              'currentView': 'hour',
              'nextView': configuration.minView === 'hour' ? 'setTime' : 'minute',
              'currentDate': selectedDate.valueOf(),
              'title': showView('day') ? selectedDate.format(`${showView('month') ? 'MMM ' : ''}DD${showView('year') ? ' YYYY' : ''}`) : 'Hour',
              'leftDate': moment(selectedDate).subtract(1, 'days').valueOf(),
              'rightDate': moment(selectedDate).add(1, 'days').valueOf(),
              'dates': [],
              'setUnits': ['year', 'month', 'date', 'hour']
            };

            for(var i = 0; i < 24; i++) {
              var hourMoment = moment(selectedDate).add(i, 'hours');
              var dateValue = {
                'date': hourMoment.valueOf(),
                'display': hourMoment.format('h a'),
                'active': hourMoment.format('YYYY-MM-DD H') === activeFormat,
                'disabled': (scope.minDate && hourMoment.add(1, 'hours').isBefore(scope.minDate)) ||
                            (scope.maxDate && hourMoment.subtract(1, 'hours').isAfter(scope.maxDate))
              };

              result.dates.push(dateValue);
            }

            return result;
          },

          minute: function(unixDate) {
            var selectedDate = moment(unixDate).minute(0).second(0);

            var activeFormat = scope.ngModel ? moment(scope.modelParser(scope.ngModel)).format('YYYY-MM-DD H:mm') : '';

            var result = {
              'previousView': 'hour',
              'currentView': 'minute',
              'nextView': 'setTime',
              'currentDate': selectedDate.valueOf(),
              'title': selectedDate.format(`${showView('month') ? 'MMM ' : ''}${showView('day') ? 'DD ' : ''}${showView('year') ? ' YYYY ' : ''}h:mm a`),
              'leftDate': moment(selectedDate).subtract(1, 'hours').valueOf(),
              'rightDate': moment(selectedDate).add(1, 'hours').valueOf(),
              'dates': [],
              'setUnits': ['year', 'month', 'date', 'hour', 'minute']
            };

            var limit = 60 / configuration.minuteStep;

            for(var i = 0; i < limit; i++) {
              var hourMoment = moment(selectedDate).add(i * configuration.minuteStep, 'minute');
              var dateValue = {
                'date': hourMoment.valueOf(),
                'display': hourMoment.format('h:mm'),
                'active': hourMoment.format('YYYY-MM-DD H:mm') === activeFormat,
                'disabled': (scope.minDate && hourMoment.subtract(1, 'minutes').isBefore(scope.minDate)) ||
                            (scope.maxDate && hourMoment.add(1, 'minutes').isAfter(scope.maxDate))
              };

              result.dates.push(dateValue);
            }

            return result;
          },

          setTime: function(unixDate, keepDropdown) {
            var tempDate = new Date(unixDate);
            var newDate = new Date(tempDate.getTime()/* + (tempDate.getTimezoneOffset() * 60000)*/);
            if(configuration.dropdownSelector && !keepDropdown) {
              jQuery(configuration.dropdownSelector).dropdown('toggle');
            }
            if(angular.isFunction(scope.onSetTime)) {
              scope.onSetTime(newDate, scope.ngModel);
            }
            ctrl.$setViewValue(scope.modelFormatter(newDate));
            //scope.ngModel = newDate;
            return dataFactory[scope.data.currentView](unixDate);
          }
        };

        var getUTCTime = function() {
          var tempDate = (scope.ngModel ? moment(scope.modelParser(scope.ngModel)).toDate() : new Date());
          return tempDate.getTime()/* - (tempDate.getTimezoneOffset() * 60000)*/;
        };

        scope.changeView = function(viewName, unixDate, event, invalid, setTime) {
          //unixDate = unixDate && _.isDate(unixDate) ? unixDate : scope.modelParser(unixDate).toDate();
          if(event) {
            event.stopPropagation();
            event.preventDefault();
          }

          if(invalid) return;

          if(viewName && (unixDate > -Infinity) && dataFactory[viewName]) {
            if(setTime && viewName !== 'setTime') {
              var newDate = moment(unixDate),
                  curDate;

              if (scope.ngModel) { curDate = moment(scope.modelParser(scope.ngModel)); }
              else if (scope.defaultTime) { curDate = moment(scope.defaultTime, "H:mm:ss"); }
              else { curDate = moment().startOf('hour'); }

              _.each(scope.data.setUnits, function(unit) {
                var setVal = newDate[unit](),
                    setDate = curDate[unit](setVal).valueOf();

                dataFactory.setTime(setDate, true);
              });
            }
            scope.data = dataFactory[viewName](unixDate);
          }
        };

        scope.changeView(configuration.startView, getUTCTime());

        scope.$watch('ngModel', function(cur, prev) {
          if(cur !== prev) {
            scope.changeView(scope.data.currentView, getUTCTime());
          }
        });

        function showView(view) {
          return validViews.indexOf(configuration.maxView) >= validViews.indexOf(view);
        }
      }
    };
  }
})();
