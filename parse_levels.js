function doExport() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var range = sheet.getDataRange();
    var values = range.getValues();
    var formulas = range.getFormulas();
    var types = {
      'A1': { element: 0 },
      'A2': { element: 4 },
      'A3': { element: 3 },
      'A4': { element: 2 },
      'A5': { element: 1 },
      'A6': { element: 17 },
      'A7': { element: 19 },
      'A8': { element: 18 },
      'B1': { element: 16 },
      'B2': { element: 15 },
      'B3': { element: 14 },
      'B4': { cell: 5 },
      'B5': { cell: 4 },
      'B6': { cell: 2 },
      'B7': { cell: 3 },
      'B8': { cell: 1 },
      'C1': { element: 11 },
      'C2': { element: 7 },
      'C3': { element: 6 },
      'C4': { element: 12 },
      'C5': { element: 5 },
      'C6': { element: 10 },
      'C7': { element: 13 },
      'D1': { cell: 2, element: 0 },
      'D2': { cell: 2, element: 4 },
      'D3': { cell: 2, element: 3 },
      'D4': { cell: 2, element: 2 },
      'D5': { cell: 2, element: 1 },
      'E1': { cell: 1, elment: 0 },
      'E2': { cell: 1, element: 4 },
      'E3': { cell: 1, element: 3 },
      'E4': { cell: 1, element: 2 },
      'E5': { cell: 1, element: 1 },
      'F1': { cell: 3, element: 0 },
      'F2': { cell: 3, element: 4 },
      'F3': { cell: 3, element: 3 },
      'F4': { cell: 3, element: 2 },
      'F5': { cell: 3, element: 1 }
    };
  
    var levels = {};
    
    var offset = 9;
    var step = 12;
    var pointer = offset;
    var field_size = 10;
  
    while(pointer < range.getWidth()) {
      var level = values[0][pointer];
  
      // parse targets
      var data = values[3][pointer].toString().split(';');
      var targets = data.map(function(target) {
        var data = target.split('-');
        return {
          count: data[0],
          type: types[data[1]]
        }
      });
  
      // parse busters
      var data = values[4][pointer].toString().split(';');
      var busters = {
        hammer: 0,
        spinning: 0,
        horizontal_rocket: 0,
        vertical_rocket: 0
      };
      
      data.forEach((formula) => {
        var data = formula.split('-');
        switch(data[1]) {
          case 'A9': busters.hammer = data[0]; break;
          case 'A10': busters.spinning = data[0]; break;
          case 'B9': busters.vertical_rocket = data[0]; break;
          case 'B10': busters.horizontal_rocket = data[0]; break;
        }
      });
  
      // add level
      levels[level] = {
        time: values[1][pointer] != "" ? values[1][pointer] : undefined,
        steps: values[2][pointer] != "" ? values[2][pointer] : undefined,
        targets: targets,
        busters: busters,
        coins: values[5][pointer],
        additional_element: (types[parse_formula(pointer, 6)] != undefined) ? types[parse_formula(pointer, 6)].element : undefined,
        exclude_element: (types[parse_formula(pointer, 7)] != undefined) ? types[parse_formula(pointer, 7)].element : undefined,
        field: []
      };
  
      var x_offset = pointer + 1;
      for(var y = 0; y < field_size; y++) {
        levels[level].field[y] = [];
        for(var x = x_offset; x < x_offset + field_size; x++) {
          var cell = values[y][x];
          var type = cell.valueType != undefined ? cell.valueType.toString() == 'IMAGE' ? parse_formula(x, y) : '' : cell;
          levels[level].field[y][x - x_offset] = types[type] ? types[type] : type;
        }
      }
  
      pointer += step;
    }
  
    print_block();
  
    function parse_formula(x, y) {
      return formulas[y][x].toString().replace(/[=$]/g, '');
    }
  
    function print_block() {
      var buffer = "";
      for(var i = 0; i <= (range.getWidth() - offset) / step; i++) {
        buffer += "\t" + JSON.stringify(levels[i + 1]) + ",\n";
        if(i % 5 == 0) {
          console.log(buffer);
          buffer = "";
        }
      }
      console.log(buffer);
    }
  }