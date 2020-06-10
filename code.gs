var scores_row_offset = 2;
var scores_col_offset = 1;
var console_offset = 4;
var scores_offset = 24;

var honor_regex = new RegExp('^[0-9]{1}$|10|^m+[1-9]{0,1}');
var hand_regex = new RegExp('d|s|ms|10|^[0-9]$');
var ss = SpreadsheetApp.getActiveSpreadsheet();

var scores = ss.getSheetByName('scores'); //scores sheet 
var console_ = ss.getSheetByName('console'); //console sheet 

var game_number = console_.getRange(1, 3).getValue();
var current_dealer = scores.getRange(1, 1).getValue();
var ui = SpreadsheetApp.getUi();

function advance_dealer(){
  if (typeof current_dealer=='string'){
    throw "Current dealer not set. Please press 'Reset' to set dealer!"
  }
  var next_dealer = get_next_dealer();
  toggle_dealer(console_.getRange(5 + current_dealer, 2));
  toggle_dealer(console_.getRange(5 + next_dealer, 2));
  scores.getRange(1, 1).setValue(next_dealer); //set dealer
}

function get_next_dealer(){
  var direction_ = console_.getRange('G1').getValue();
  if (direction_ == 'clockwise') {
    var direction_ = 1;
  } 
  else if (direction_ == 'anti-clockwise') {
    var direction_ = -1;
  } 
  else {
    throw "Please set direction of play!"
  }
  var next = (10 + current_dealer + direction_) % 10
  var is_active = console_.getRange(5 + next, 8).getValue();
  while (is_active == false){
    next = (10 + next + direction_) % 10;
    is_active = console_.getRange(5 + next, 8).getValue();
  }
  return next;
}


function toggle_dealer(cell){
  try {
    cell.getBorder().getLeft();
    cell.setBorder(false, false, false, false, null, null);
  } catch(e){
    cell.setBorder(true, true, true, true, null, null, 'blue', SpreadsheetApp.BorderStyle.DOUBLE);
  }
}

function initialize_dealer(){
  var idx_list = []
  for (var idx = 0; idx < 10; idx ++){
    var cell = console_.getRange(5 + idx, 2);
    try {
      cell.getBorder().getLeft();
      toggle_dealer(cell);
    } catch(e){
      if (console_.getRange(5 + idx, 8).getValue()){
        idx_list.push(idx);
      }
    }
  }
  var selected_idx = Math.floor((Math.random() * idx_list.length) + 1);
  var cell = console_.getRange(5 + selected_idx, 2);
  toggle_dealer(cell);
  scores.getRange(1, 1).setValue(selected_idx); //set dealer
}

function prev_game() {
  if (game_number == 1) {
    throw "This is the first game. Cannot go before this!"
  }
  game_number -= 1;
  console_.getRange(1, 3).setValue(game_number);
  display_honor_hand();
  display_scores();
}

function next_game() { 
  if (game_number == 1000) {
    throw "This is the last game in this set. Cannot go beyond this!"
  } 
  game_number += 1;
  console_.getRange(1, 3).setValue(game_number);
  display_honor_hand();
  display_scores();
  advance_dealer();
}


function display_honor_hand() {
  for (var current_player_number = 1; console_.getRange(current_player_number + console_offset, 2).getDisplayValue().length > 0; current_player_number++) {
    var row = scores_row_offset + game_number;
    var col = 2 * (current_player_number - 1) + scores_col_offset;
    var honor = scores.getRange(row ,col + 1).getValue();
    var hand = scores.getRange(row,col + 2).getValue();
    console_.getRange(current_player_number + console_offset, 3).setValue(honor); 
    console_.getRange(current_player_number + console_offset, 4).setValue(hand);
  }
}

function display_scores() {
  
  for (var current_player_number = 1; console_.getRange(current_player_number + console_offset, 2).getDisplayValue().length > 0; current_player_number++) {
    var row = scores_row_offset + game_number;
    var col = 2 * (current_player_number - 1) + scores_offset;

    // score
    var score = scores.getRange(row ,col + 1).getValue();
    console_.getRange(current_player_number + console_offset, 5).setValue(score); 
    
    // cumulative_score
    var cum_score = scores.getRange(row,col + 2).getValue();
    console_.getRange(current_player_number + console_offset, 6).setValue(cum_score);
    
    // prev_score
    if (game_number == 1){
      var prev_score= '';  
    } else {
      var prev_score= scores.getRange(row - 1 ,col + 1).getValue();
    }  
    console_.getRange(current_player_number + console_offset, 7).setValue(prev_score);
  }
}

 
function is_arr_w(arr) {
  var res = arr[0].toString().toLowerCase() == "d";
  return res;
}

function validate_only_one_declare(ls) {
  var declare_count = ls.filter(is_arr_w).length;
  if (declare_count != 1) {
    throw "one person needs to declare, and only one person can declare!";
  } 
}

function validate_honor(x) {
  var res = honor_regex.exec(x);
  if (res == null){
    throw "invalid honor entered!";
  }
}

function validate_hand(x) {
  var res = hand_regex.exec(x);
  if (res == null){
    throw "invalid hand entered!";
  }
}


function validate_honor_hand_sanity(p, h) {
  if (p.length != h.length) {
    throw "uneven number of honors and hands!"
  }
  if (p.length < 2) {
    throw "more than one player needs to play a game!"
  }
  for (var idx = 0; idx < p.length; idx++) {
    validate_honor(p[idx]);
    validate_hand(h[idx]);
  }
}

function validate_sheet() {
  // conditions:
  // 1. number of 'd's' present in hand column should be 1
  // 2. length of honors and hands is same and at least 2 complete pairs are present
  // 3. validate individual honor and hand
  var honor_list = console_.getRange('C5:C14').getValues().filter(String);
  var hand_list = console_.getRange('D5:D14').getValues().filter(String);
  validate_only_one_declare(hand_list);
  validate_honor_hand_sanity(honor_list, hand_list);
}

function reload(){
  display_honor_hand();
  display_scores();
  display_measures();
}

function is_prev_score_empty(){
  var prev_score_list = console_.getRange('G5:G14').getValues().filter(Number);
  if (prev_score_list.length == 0){
    return true;
  }
  return false;
}


function update() {
  var direction_ = console_.getRange('G1').getValue();
  if (game_number > 1 && is_prev_score_empty()){
    throw "Break in game sequence detected!..Cannot update when previous game has not been recorded"
  }
  if (direction_ == null){
    throw "Please set direction of play!"
  }
  validate_sheet();
  update_honor_hand();
  if (game_number < 1000){
    next_game();
  }
  display_scores();
  display_measures();
}

function update_honor_hand() {
  var honor, hand;
  var insertable = [];
  for (var current_player_number = 1; console_.getRange(current_player_number + console_offset, 2).getDisplayValue().length > 0; current_player_number++) {
    honor = console_.getRange(current_player_number + console_offset, 3).getValue(); 
    hand = console_.getRange(current_player_number + console_offset, 4).getValue(); 
    insertable.push(honor);
    insertable.push(hand);
  }
  scores.getRange(scores_row_offset + game_number,2, 1, insertable.length).setValues([insertable]);
  console.info("Data Inserted");
};

function display_measures(){
  var measure = console_.getRange("I3").getValue();
  var offset = 1004;
  var idx = 0;
  switch (measure)  {
    case "Marriage":
      idx = 0;
      break;
    case "Honors":
      idx = 1;
      break;
    case "Declarations":
      idx = 2;
      break;
    case "No_Honor":
      idx = 3;
      break;  
    case "Surrenders":
      idx = 4;
      break;  
    default:
      throw "Invalid measurement selected!"
    }
  for (var i=0; i<19; i+=2){
    var row = 5 + i/2;
    if (typeof console_.getRange(row, 1).getValue() == 'number'){
      var value = scores.getRange(offset + idx, 2 + i).getValue();
      console_.getRange(row, 9).setValue(value);
    }
  }
}

function onEdit() {
  var cell = ss.getActiveCell()
  var cell_a1 = cell.getA1Notation();
  if(cell_a1 == "C1" || cell_a1 == "B18" || cell_a1 == "B19" || cell_a1 == "B22"){
    reload();
  }
  if(cell_a1 == "I3"){
    display_measures();
  }
  if (cell_a1 == "J1"){
    var value = cell.getValue();
    switch (value){
      case "Update!":
        update();
        break;
      case "Reset dealer":
        initialize_dealer();
        break;
      case "Skip dealer":
        advance_dealer();
        break;
      case "Previous game":
        prev_game();
        break;
      case "Next game":
        next_game();
        break;
      case "Refresh":
        reload();    
        break;
      case "Settle scores":
        display_scores();    
        break;
    }
    cell.clearContent();
  }
}

function get_player_final_scores(){
  var scores_ls = [];
  var row = 1002;
  var col = 24;
  for (var current_player_number = 1; console_.getRange(current_player_number + console_offset, 2).getDisplayValue().length > 0; current_player_number++) {
    var score = scores.getRange(row, 2 * current_player_number + col).getValue(); 
    var name = console_.getRange(current_player_number + console_offset, 2).getValue();
    scores_ls.push([name, score]);
  }
  return scores_ls;
}

function display_alert(input){
  var is_array = typeof input=="object" && input.length!=undefined;
  if (is_array){
    var arrayLength = input.length;
    var result = ""
    for (var i = 0; i < arrayLength; i++) {
      result += "\n" + input[i][0] + ": " + input[i][1]; 
    } 
  } else {
    var result = input;
  }
  ui.alert('Final Scores', result, ui.ButtonSet.OK);
}

function display_final_scores(){
  var scores_ls = get_player_final_scores();
  display_alert(scores_ls);
}

function archive_scores(){
  var names = []
  for (var current_player_number = 1; console_.getRange(current_player_number + console_offset, 2).getDisplayValue().length > 0; current_player_number++) { 
    var name = console_.getRange(current_player_number + console_offset, 2).getValue();
    names.push(name);
  }
  names.sort();
  names = names.join("_");
  var sheet = ss.getSheetByName(names);
  if (sheet){
    ui.alert('Sheet already exists!');
  } else {
    scores.copyTo(ss).setName(names);
  }
}

function reset_scores(){
  var response = ui.alert('Do you want to save scores?',ui.ButtonSet.YES_NO);
  if (response == ui.Button.YES){
    archive_scores();
  }
  scores.getRange("B3:U1002").clear({contentsOnly:true});
  scores.getRange("B1009:U1009").clear({contentsOnly:true});
}

function settle_scores(){
  console_.getRange("C1").setValue(1);
  display_final_scores();
  reset_scores();
  reload();
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();;
}

function restore_scores(){
  var response = ui.prompt('Enter the names of the players(separated by space)?',ui.ButtonSet.OK);
  response = response.getResponseText()
  var players = response.split(" ").map(capitalizeFirstLetter);
  players.sort();
  players = players.join("_");
  var source = ss.getSheetByName(players);
  if (!source){
    ui.alert('No previous games played with these players!');
  } else {
    var source_range = source.getRange("B3:U1002");
    var target_range = scores.getRange("B3:U1002");
    var values = source_range.getValues();
    target_range.setValues(values);
    ss.deleteSheet(source);
  }
  
}
