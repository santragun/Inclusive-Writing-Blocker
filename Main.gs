function Home(e) {
  // userProperties.deleteAllProperties();
  CheckConfigs();
  let timezoneId = e.userTimezone.id;
  userProperties.setProperty('timezone', timezoneId);
  let userLabel = userProperties.getProperty('labelName');
  let userLabelId = userProperties.getProperty('labelID');

  if (userLabel && userLabelId) {
    let backgroundScan = JSON.parse(userProperties.getProperty('backgroundScan'));
    if (backgroundScan == false) {
      return PopupCard().build();
    }
    else {

      try {
      let scan = Scanner();
      if (scan) {
        if (typeof (scan) == 'string' && scan.startsWith('authorize')) {
          let labelForButton = 'Authorize the Add-on to create your selected label, to filter inclusive messages from your inbox and move to your selected label.';
          return authorizeAction(labelForButton, scan.substring(10));
        }
      }
      AddTrigger();
      return HomeCard();
      } catch (e) {
        Logger.log('home error ' + e.message);
        return HomeCard();
      }

    }
  }
  else {
    if (userProperties.getProperty('tempLabel')) {
      let formInputs = {
        formInput: {
          labelNameField: userProperties.getProperty('tempLabel')
        }
      };
      userProperties.deleteProperty('tempLabel');
      SaveConfiguration(formInputs);
      if (userProperties.getProperty('tempLabel')) {
        return ConfigCard();
      }
      else {
        return HomeCard();
      }
    }
    else {
      return ConfigCard();
    }
  }
}

function SaveConfiguration(e) {
  try {
  let labelName = e.formInput.labelNameField.trim();
  let newLabelResponse = createGmailLabel(labelName);

  Logger.log(newLabelResponse);
  if (typeof (newLabelResponse) == 'string' && newLabelResponse.startsWith('authorize')) {
    userProperties.setProperty('tempLabel', labelName);
    let labelForButton = 'Authorize the Add-on to create your selected label, to filter inclusive messages from your inbox and move to your selected label..';
    return authorizeAction(labelForButton, newLabelResponse.substring(10));
  }
  else {
    if (labelName.toLowerCase() == newLabelResponse.toLowerCase()) {
      let triggers = ScriptApp.getProjectTriggers();
      if (triggers.length < 20) {
        ScriptApp.newTrigger("ScanNow")
          .timeBased()
          .everyHours(1)
          .create();
      }
      let initScan = Scanner();

      if (initScan) {
        if (typeof (initScan) == 'string' && initScan.startsWith('authorize')) {
          let labelForButton = 'Authorize the Add-on to create your selected label, to filter inclusive messages from your inbox and move to your selected label...';
          return authorizeAction(labelForButton, initScan.substring(10));
        }
      }
      return CardService.newNavigation().popToRoot().updateCard(HomeCard());
    }
    else {
      Logger.log('SaveConfiguration error: label name input: ' + labelName + ', new Label Response: ' + newLabelResponse);
      if (newLabelResponse.toString().includes('Label name exists')) {
        labelName += ', Le nom du libellé existe';
      }
      userProperties.setProperty('error', 'Impossible de créer le libellé ' + labelName);
      return ConfigCard();
    }
  }
  }
  catch ({ exception }) {
    Logger.log('SaveConfiguration exception: ' + exception);
  }
}

function BackToHome() {
  return CardService.newNavigation().popToRoot().updateCard(HomeCard());
}

function DeleteExceptionalEmail(parameter) {
  let index = parameter.parameters.column;
  let exceptionalsProperty = userProperties.getProperty('exceptional emails');
  let exceptionalEMails = [];
  if (exceptionalsProperty) {
    exceptionalEMails = JSON.parse(exceptionalsProperty);
  }
  if (exceptionalEMails.length > index) {
    exceptionalEMails.splice(index, 1);
    userProperties.setProperty('exceptional emails', JSON.stringify(exceptionalEMails));
  }
  return CardService.newNavigation().popToRoot().updateCard(HomeCard());
}

function AddExceptionalEmail(e) {
  let email = e.formInput.emailField.trim();
  let exceptionalsProperty = userProperties.getProperty('exceptional emails');
  let exceptionalEMails = [];
  if (exceptionalsProperty) {
    exceptionalEMails = JSON.parse(exceptionalsProperty);
  }
  if (!exceptionalEMails.includes(email)) {
    exceptionalEMails.push(email);
    userProperties.setProperty('exceptional emails', JSON.stringify(exceptionalEMails));
  }
  return CardService.newNavigation().popToRoot().updateCard(HomeCard());
}

function EditAutomaticResponse(e) {
  try {
    let automaticResponse = e.formInput.automaticResponseField.trim().replace(/\n/g, '<br>');
    userProperties.setProperty('automaticResponse', automaticResponse);
    return CardService.newNavigation().popToRoot().pushCard(ConfigCard());
  }
  catch (except) {
    Logger.log('Edit Automatic Response Error ' + except);
  }
}

function RestoreAutomaticResponse() {
  userProperties.setProperty('automaticResponse', userProperties.getProperty('defaultResponse'));
  return CardService.newNavigation().popToRoot().pushCard(ConfigCard());
}

function ToggleBackgroundScan(parameter) {
  let value = JSON.parse(parameter.parameters.clicked);
  if (value == false) {
    DeleteAllTriggers();
  }
  else {
    ScanNow();
  }
  userProperties.setProperty('backgroundScan', value);
  return CardService.newNavigation().popToRoot().updateCard(HomeCard());
}
