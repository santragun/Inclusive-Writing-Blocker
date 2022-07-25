function AddTrigger() {
  try {
    let triggers = ScriptApp.getProjectTriggers();
    Logger.log(triggers.length + 'User ' + Session.getEffectiveUser());
    
    if (triggers.length < 20) {
      ScriptApp.newTrigger('ScanNow')
        .timeBased()
        .everyHours(1)
        .create();
    }
  }
  catch (exception) {
    Logger.log('AddTrigger ' + exception);
  }
}

function DeleteAllTriggers() {
  let triggers = ScriptApp.getProjectTriggers();
  try{
    for (let i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }
  }catch(except){
    Logger.log('delete trigger exception: ' + except);
  }
  
}

function ScanNow() {
  try {
    Logger.log('triggers count ' + ScriptApp.getProjectTriggers().length + ' By user ' + Session.getEffectiveUser().getEmail());
    if (userProperties.getProperty('backgroundScan') == 'true') {
      for(let i = 0; i < 5; i++){
        AddTrigger();
      }
    }
    Scanner();
    return BackToHome();
  }
  catch (exception) {
    Logger.log('ScanNow ' + exception);
  }
}






