/**********************************
**                               **
**         Page Handling         **
**                               **
**********************************/

var _Page = _Page || {};

// variables
_Page.pages = document.getElementsByClassName("page");
_Page.digits = null;
_Page.max = null;
_Page.url = "https://griffis.edumedia.ca/mad9014/lotto/nums.php";
_Page.infoBox = document.getElementById("infoBox");
_Page.listContainer = document.getElementsByClassName("num_list")[0];
// Duplicate checker variables
_Page.duplicateCheckAmount = 0;
_Page.duplicateDotAmount = 0;

// Methods
_Page.init = function () {
  document.getElementById("btnSend").addEventListener("click", GenerateNumbers);
  document.getElementById("btnBack").addEventListener("click", function () {
    _Page.Clear();
    _Page.DisplayMessage("");
    _Page.listContainer.classList.remove("jackpot");
    _Page.Navigate(0); 
  });
};

_Page.Navigate = function (page) {
  if (page <= _Page.pages.length) {
    for (var i = 0; i < _Page.pages.length; i++) {
      if (page == i) {
          _Page.pages[i].classList.add("active");
      } else {
          _Page.pages[i].classList.remove("active");
      }
    }
  }
};

_Page.Duplicate = function () {
    _Page.listContainer.classList.add("duplicate");
    _Page.listContainer.classList.remove("jackpot");
};

_Page.Unique = function () {
    _Page.listContainer.classList.add("jackpot");
    _Page.listContainer.classList.remove("duplicate");
};

_Page.Clear = function () {
  while (_Page.listContainer.firstChild) {
    _Page.listContainer.removeChild(_Page.listContainer.firstChild);
  }
};

_Page.DisplayMessage = function (message, type) {
  if (type == 1) {
    // Error
    _Page.infoBox.classList.add("error");
    _Page.infoBox.textContent = message;
  } else {
    // Normal
    _Page.infoBox.classList.remove("error");
    _Page.infoBox.textContent = message;
  }
};


/**********************************
**                               **
**        Number Handling        **
**                               **
**********************************/

var _Numbers = _Numbers || {};

_Numbers.queue = {
  list: [],
  add: function (nums) {
    var tempNumGroup = new _Numbers.Group(nums);
    tempNumGroup.Create();
    this.list.push(tempNumGroup);
    delete tempNumGroup;
    this.check();
  },
  remove: function () {
    for (var i = 0; i < this.list.length; i++) {
      if (this.list[i].status.complete) {
        this.list.splice(i, 1);
        this.check();
      }
    }
  },
  check: function () {
        var CheckedNumbers = 0;
        for (var i = 0; i < this.list.length; i++) {
            if (this.list[i].status.complete) {
              if (this.list[i].hasDuplicates()) {
                GenerateNumbers();
              } else {
                  document.getElementById("btnBack").classList.remove("busy");
              }
                this.remove();
            } else if (this.list[i].status.spinning) {
                return 0;
            } else {
                CheckedNumbers++;
                document.getElementById("btnBack").classList.add("busy");
            }
        }
        
        if (CheckedNumbers == this.list.length && this.list.length > 0) {
            this.list[0].Spin();
        }
  }
};

/**
  *
  * Creates a Group of Numbers
  * @param {Int Array} list
  * @return {Void}
  *
  **/
_Numbers.Group = function (list) {
  this.numbers = [];
  this.status = {
    complete: false,
    spinning: false
  };
  
  // Create the group
  this.Create = function () {
    for (var i = 0; i < list.length; i++) {
      var tempNum = new _Numbers.Number(list[i], (i + 1), 0);
      this.numbers.push(tempNum); 
    }
    // Clean up when we are done
    delete tempNum;
    
    // Check for any bugs
    if (this.numbers.length < 1) {
      _Page.DisplayMessage("Error creating number group");
    }
  };
  
  // Spin each Number in the group
  this.Spin = function () {
    // Tell each number to spin
      this.Display();
    for (var i = 0; i < this.numbers.length; i++) {
      this.numbers[i].status.spinning = true;
      this.numbers[i].Spin();
    }
  };
  
  // Check if the Numbers are done spinning
this.CheckStatus = function () {
    for (var i = 0; i < this.numbers.length; i++) {
        if (this.numbers[i].status.complete) {
            this.status.complete = true;
        } else {
            this.status.complete = false;
        }

        if (this.numbers[i].status.spinning) {
            this.status.spinning = true;
        } else {
            this.status.spinning = false;
        }
    }

    if (this.status.spinning && this.status.complete) {
        this.status.spinning = false;
        _Numbers.queue.check();
    }
};
/**
  *
  * Populates the num list
  * @return void
  *
  **/
  this.Display = function () {
    // Clear the list before doing stuff to it
    _Page.Clear();
      
    for (var i = 0; i < this.numbers.length; i++) {
        var listItem = document.createElement('li');
        listItem.textContent = this.numbers[i];
        listItem.setAttribute("id", "num" + this.numbers[i].index);
        
        _Page.listContainer.appendChild(listItem);
    }
  };
    
  /**
  *
  * Checks for duplicate numbers contained in the group
  * @return {BOOL}
  *
  **/
  this.hasDuplicates = function () {
    
    var info = "Loading";
    
    for (var k = 0; k < _Page.duplicateDotAmount; k++) {
        info += ".";
    }
    
    if (_Page.duplicateDotAmount > 5) {
        _Page.duplicateDotAmount = 0;
    }
    
    for (var i = 0; i < (this.numbers.length - 1); i++) {
      if (this.numbers[i].val === this.numbers[i + 1].val) {
        // Duplicate
        _Page.DisplayMessage(info);
        _Page.duplicateDotAmount++;
        _Page.duplicateCheckAmount++;
        _Page.Duplicate();
        return true;
      }
    }

    // If it made it here then theres no problem
    _Page.DisplayMessage("It took " + _Page.duplicateCheckAmount + " attempt" + (_Page.duplicateCheckAmount > 1 || _Page.duplicateCheckAmount < 1 ? "s ":" ") + "to remove all duplicate numbers.");
    _Page.duplicateCheckAmount = 0;
    _Page.duplicateDotAmount = 0;
    _Page.Unique();
    return false;
  };
};


/**
  *
  * Creates a Number Object
  * @param {Int} val
  * @param {Int} index
  * @return {Void}
  *
  **/
_Numbers.Number = function (val, index) {
    this.currentVal = 0;
    this.val = val;
    this.index = index;
    this.status = {
        spinning: false,
        complete: false
    };
    this.Display = function () {
        if (document.getElementById("num" + this.index)) {
            var myID = document.getElementById("num" + this.index);
            // Update the element
            myID.textContent = this.currentVal;
        }
    };
    this.Spin = function () {
      // Spin until its done and then set to true
        if (!this.status.complete) {
         var _this = this;
        if (_this.currentVal > _this.val) {
            _this.currentVal--;
        } else if (_this.currentVal < _this.val) {
            _this.currentVal++;
        }
        
        this.Display();
        
        // Recursive!
        setTimeout(function () { _this.Spin();}, 50);   
        }
        
        if (this.currentVal === this.val) {
            this.status.complete = true;
            if (_Numbers.queue.list.length > 0) {
                _Numbers.queue.list[0].CheckStatus();
            }
        }
    };
};

// Handle the spinning

function GenerateNumbers () {
    var formdata = new FormData();
    
    _Page.digits = document.getElementById("digits").value;
    _Page.max = document.getElementById("max").value;
    
    formdata.append("digits", _Page.digits);
    formdata.append("max", _Page.max);
    
    var options = { 
                    method: 'post',
                    mode: 'cors',
                    body: formdata
                  };
    
    var req = new Request(_Page.url, options);
    fetch(req).then(function(response) {
        return response.json();
    })
    .then(function(data) {
          if (data.code == 0) {
            _Numbers.queue.add(data.numbers);
            _Page.Navigate(1);
          } else if (data.code == 522) {
            _Page.DisplayMessage("You need to fill in both options.", 1);
          }
      })
    .catch(function(error) {
        alert('There has been a problem with your fetch operation: ' + error.message);
    });   
}

_Page.init();