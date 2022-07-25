function EditAutomaticResponseCard() {
  let cardFooter1Button1Action1 = CardService.newAction()
    .setFunctionName('EditAutomaticResponse');
  let cardFooter1Button1 = CardService.newTextButton()
    .setText('Ajouter')
    .setBackgroundColor('#2b5ee1')
    .setOnClickAction(cardFooter1Button1Action1);
  let cardFooter1Button2Action1 = CardService.newAction()
    .setFunctionName('ConfigCard');
  let cardFooter1Button2 = CardService.newTextButton()
    .setText('Retour')
    .setOnClickAction(cardFooter1Button2Action1);
  let cardFooter1 = CardService.newFixedFooter()
    .setPrimaryButton(cardFooter1Button1)
    .setSecondaryButton(cardFooter1Button2);

  let cardSection1AutomaticResponseInput = CardService.newTextInput()
    .setFieldName('automaticResponseField')
    .setValue(userProperties.getProperty('automaticResponse'))
    .setMultiline(true);
  let cardSection1 = CardService.newCardSection()
    .setHeader('<font color="#2a5278">Texte de la réponse automatique</font>')
    .setCollapsible(false)
    .addWidget(cardSection1AutomaticResponseInput);

  let card = CardService.newCardBuilder()
    .addSection(bannerSection)
    .setFixedFooter(cardFooter1)
    .addSection(cardSection1)
    .build();
  return card;
}

function AddExceptionCard() {
  let cardFooter1Button1Action1 = CardService.newAction()
    .setFunctionName('AddExceptionalEmail');
  let cardFooter1Button1 = CardService.newTextButton()
    .setText('Ajouter')
    .setBackgroundColor('#2b5ee1')
    .setOnClickAction(cardFooter1Button1Action1);
  let cardFooter1Button2Action1 = CardService.newAction()
    .setFunctionName('BackToHome');
  let cardFooter1Button2 = CardService.newTextButton()
    .setText('Retour')
    .setOnClickAction(cardFooter1Button2Action1);
  let cardFooter1 = CardService.newFixedFooter()
    .setPrimaryButton(cardFooter1Button1)
    .setSecondaryButton(cardFooter1Button2);
  let cardSection1EmailInput = CardService.newTextInput()
    .setFieldName('emailField')
    .setValue('johndoe@example.com')
    .setHint('Entrez l\'adresse e-mail des expéditeurs dont vous souhaitez recevoir les e-mails même  contienant des mots inclusifs')
    .setMultiline(false);

  let cardSection1 = CardService.newCardSection()
    .setHeader('<font color="#2a5278">Saisissez une adresse e-mail que vous ne souhaitez pas filtrer</font>')
    .setCollapsible(false)
    .addWidget(cardSection1EmailInput);

  let card = CardService.newCardBuilder()
    .addSection(bannerSection)
    .setFixedFooter(cardFooter1)
    .addSection(cardSection1)
    .build();
  return card;
}

function PopupCard() {
  let cardSection1ButtonList1YesButtonAction1 = CardService.newAction()
    .setFunctionName('ToggleBackgroundScan')
    .setParameters({ 'clicked': 'true' });
  let cardSection1ButtonList1YesButton = CardService.newTextButton()
    .setText(whitespace + 'Oui' + whitespace)
    .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
    .setBackgroundColor('#228B22')
    .setOnClickAction(cardSection1ButtonList1YesButtonAction1);
  let cardSection1ButtonList1NoButtonAction1 = CardService.newAction()
    .setFunctionName('BackToHome');
  let cardSection1ButtonList1NoButton = CardService.newTextButton()
    .setText(whitespace + 'Non' + whitespace)
    .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
    .setBackgroundColor('#FF0000')
    .setOnClickAction(cardSection1ButtonList1NoButtonAction1);
  let cardSection1ButtonList = CardService.newButtonSet()
    .addButton(cardSection1ButtonList1YesButton)
    .addButton(cardSection1ButtonList1NoButton);
  let backgroundScanLabel = CardService.newDecoratedText()
    .setText('<font color="#2a5278">Vous avez désactivé le filtre anti écriture inclusive. Voulez-vous le réactiver ?</font>')
    .setWrapText(true);
  let cardSection1 = CardService.newCardSection()
    .addWidget(backgroundScanLabel)
    .addWidget(cardSection1ButtonList);

  let card = CardService.newCardBuilder()
    .addSection(bannerSection)
    .addSection(cardSection1);
  return card;
}

function ConfigCard() {
  let cardFooter1Button1Action1 = CardService.newAction()
    .setFunctionName('SaveConfiguration');
  let cardFooter1Button1 = CardService.newTextButton()
    .setText('Sauver')
    .setBackgroundColor('#2b5ee1')
    .setOnClickAction(cardFooter1Button1Action1);
  let cardFooter1Button2Action1 = CardService.newAction()
    .setFunctionName('BackToHome');
  let cardFooter1Button2 = CardService.newTextButton()
    .setText('Retour')
    .setOnClickAction(cardFooter1Button2Action1);
  let cardFooter1 = CardService.newFixedFooter()
    .setPrimaryButton(cardFooter1Button1);
  if (userProperties.getProperty('labelName')) {
    cardFooter1.setSecondaryButton(cardFooter1Button2);
  }

  let currentLabelName = userProperties.getProperty('labelName');
  if (!currentLabelName) {
    currentLabelName = 'Mails Inclusifs';
  }
  let cardSection1LabelInput = CardService.newTextInput()
    .setFieldName('labelNameField')
    .setValue('<font color="#ea9999">' + currentLabelName + '</font>')
    .setMultiline(false);
  let cardSection1 = CardService.newCardSection()
    .addWidget(CardService.newTextParagraph().setText('(Facultatif) Choisissez un autre dossier cible pour les mails inclusifs (par défaut :' + currentLabelName + ')'))
    .addWidget(cardSection1LabelInput)
    .setCollapsible(false);

  if (userProperties.getProperty('error')) {
    cardSection1.addWidget(CardService.newTextParagraph().setText('<font color="#ff0000">' + userProperties.getProperty('error') + '</font>'));
    userProperties.deleteProperty('error');
  }

  let onEditResponse = CardService.newAction()
    .setFunctionName("EditAutomaticResponseCard")
    .setLoadIndicator(CardService.LoadIndicator.SPINNER);
  let editResponseBtn = CardService.newImageButton()
    .setIconUrl('https://www.gstatic.com/images/icons/material/system/1x/edit_googblue_48dp.png')
    .setOnClickAction(onEditResponse);
  let cardSection2EditResponseText = CardService.newDecoratedText()
    .setText('<font color="#2a5278">Texte de la réponse automatique (modifiable en appuyant sur le crayon)</font>')
    .setWrapText(true)
    .setButton(editResponseBtn);
  let cardSection2ViewResponseText = CardService.newDecoratedText()
    .setText(userProperties.getProperty('automaticResponse'))
    .setWrapText(true);
  let onRestoreResponse = CardService.newAction()
    .setFunctionName("RestoreAutomaticResponse")
    .setLoadIndicator(CardService.LoadIndicator.SPINNER);
  let restoreResponseBtn = CardService.newImageButton()
    .setIconUrl('https://www.gstatic.com/images/icons/material/system/1x/restore_googblue_48dp.png')
    .setOnClickAction(onRestoreResponse);
  let cardSection2RestoreResponseText = CardService.newDecoratedText()
    .setText('<font color="#2a5278">restaurer le texte par défaut</font>')
    .setWrapText(true)
    .setButton(restoreResponseBtn);

  let cardSection2 = CardService.newCardSection()
    .addWidget(cardSection2EditResponseText)
    .addWidget(cardSection2ViewResponseText)
    .addWidget(cardSection2RestoreResponseText)
    .setCollapsible(false);

  let card = CardService.newCardBuilder()
    .addSection(bannerSection)
    .setFixedFooter(cardFooter1)
    .addSection(cardSection1)
    .addSection(cardSection2);
  card.setName('configCard');
  return card.build();
}

function HomeCard() {
  let cardHeader1 = CardService.newCardHeader()
    .setTitle('Configuration')
    .setImageUrl(
      'https://drive.google.com/uc?id=1_Wj1iZPXjfyjYLfZPzOSYNBNWSoTb6lc')
    .setImageStyle(CardService.ImageStyle.CIRCLE);

  let cardSection1LabelName = CardService.
    newKeyValue()
    .setMultiline(true)
    .setIconUrl('https://www.gstatic.com/images/icons/material/system/1x/label_googblue_48dp.png')
    .setContent('<font color="#ff6f1d"><b>' + userProperties.getProperty('labelName') + '</b></font><font color="#2a5278">  : nom du dossier de réception des e-mails avec écriture inclusive</font>');
  let cardSection1LastScan = CardService
    .newKeyValue()
    .setIconUrl('https://www.gstatic.com/images/icons/material/system/1x/pageview_googblue_48dp.png')
    .setContent('Dernier Scan: ' + userProperties.getProperty('lastScan')).setMultiline(true);
  let cardSection1NextScan = CardService
    .newKeyValue()
    .setIconUrl('https://www.gstatic.com/images/icons/material/system/1x/schedule_googblue_48dp.png')
    .setContent('Analyse planifiée: ' + userProperties.getProperty('nextScan')).setMultiline(true);

  let cardSection1CurrentScanResult = CardService
    .newKeyValue()
    .setIconUrl('https://www.gstatic.com/images/icons/material/system/1x/summarize_googblue_48dp.png')
    .setContent(prepareResultLabel(+userProperties.getProperty('scan result'), 'previous'))
    .setMultiline(true);

  let cardSection1AllTimeResult = CardService
    .newKeyValue()
    .setIconUrl('https://www.gstatic.com/images/icons/material/system/1x/summarize_googblue_48dp.png')
    .setContent(prepareResultLabel(+userProperties.getProperty('allTimeResult'), 'alltime'))
    .setMultiline(true);

  let backgroundScan = JSON.parse(userProperties.getProperty('backgroundScan'));
  let onEnableBackgroundScanClicked = CardService.newAction()
    .setFunctionName("ToggleBackgroundScan")
    .setParameters({ 'clicked': JSON.stringify(true) })
    .setLoadIndicator(CardService.LoadIndicator.SPINNER);
  let onDisableBackgroundScanClicked = CardService.newAction()
    .setFunctionName("ToggleBackgroundScan")
    .setParameters({ 'clicked': JSON.stringify(false) })
    .setLoadIndicator(CardService.LoadIndicator.SPINNER);

  let enableBackgroundScanBtn = CardService.newImageButton().setAltText('Reactive le filtre automatique que vous avez précédemment désactivé. Lorsque vous rouvrirez Gmail, l\'add-on vous demandera si vous souhaiter réactiver le filtre').setOnClickAction(onEnableBackgroundScanClicked)
    .setIconUrl('https://icon-library.com/images/on-icon/on-icon-21.jpg');

  let disableBackgroundScanBtn = CardService.newImageButton()
    .setAltText('Permet en cas de besoin de désactiver le filtre automatique tout en conservant l\'add-on. Le filtre restera désactivé jusqu\'à nouvel ordre de votre part')
    .setOnClickAction(onDisableBackgroundScanClicked)
    .setIconUrl('https://icon-library.com/images/logout-icon-png/logout-icon-png-8.jpg');

  let cardSection1BackgroundScanText = CardService.newDecoratedText()
    .setText(whitespace + '&nbsp;&nbsp;désactiver le filtrage')
    .setButton(disableBackgroundScanBtn)
    .setWrapText(true);
  if (backgroundScan == false) {
    cardSection1BackgroundScanText = CardService.newDecoratedText()
      .setText(whitespace + '&nbsp;&nbsp;réactiver le filtrage')
      .setButton(enableBackgroundScanBtn)
      .setWrapText(true);
  }

  let cardSection1 = CardService.newCardSection()
    .setCollapsible(false)
    .addWidget(cardSection1LabelName)
    .addWidget(cardSection1LastScan)
    .addWidget(cardSection1NextScan)
    .addWidget(cardSection1CurrentScanResult)
    .addWidget(cardSection1AllTimeResult)
    .addWidget(CardService.newDivider())
    .addWidget(cardSection1BackgroundScanText);

  let onAddEmail = CardService.newAction()
    .setFunctionName("AddExceptionCard")
    .setLoadIndicator(CardService.LoadIndicator.SPINNER);
  let addEmailBtn = CardService.newImageButton()
    .setIconUrl('https://www.gstatic.com/images/icons/material/system/1x/add_googblue_48dp.png')
    .setOnClickAction(onAddEmail);
  let cardSection2AddEmailText = CardService.newDecoratedText()
    .setText('<font color="#566573">Indiquez les adresses mails des expéditeurs dont vous ne souhaitez pas filtrer les messages</font>')
    .setWrapText(true)
    .setButton(addEmailBtn);

  let cardSection2 = CardService.newCardSection()
    .addWidget(cardSection2AddEmailText)
    .setCollapsible(false);
  let exceptionalEMails = userProperties.getProperty('exceptional emails');
  if (exceptionalEMails) {
    let emailsList = JSON.parse(exceptionalEMails);
    for (let i = 0; i < emailsList.length; i++) {
      let onDeleteClicked = CardService.newAction()
        .setFunctionName('DeleteExceptionalEmail')
        .setParameters({ 'column': i.toString() })
        .setLoadIndicator(CardService.LoadIndicator.SPINNER);
      let deleteBtn = CardService.newImageButton()
        .setAltText('Delete')
        .setIconUrl('https://icon-library.com/images/delete-icon-ios/delete-icon-ios-17.jpg')
        .setOnClickAction(onDeleteClicked);
      cardSection2.addWidget(CardService.newDecoratedText()
        .setText(emailsList[i])
        .setWrapText(true)
        .setIconUrl('https://icon-library.com/images/png-email-icon/png-email-icon-1.jpg')
        .setButton(deleteBtn));
    }
  }

  let cardFooter1Button1Action1 = CardService.newAction()
    .setFunctionName('ScanNow');
  let cardFooter1Button1 = CardService.newTextButton()
    .setText('Scanner maintenant')
    .setBackgroundColor('#2b5ee1')
    .setOnClickAction(cardFooter1Button1Action1);
  let cardFooter1Button2Action1 = CardService.newAction()
    .setFunctionName('ConfigCard');
  let cardFooter1Button2 = CardService.newTextButton()
    .setText('Autres paramètres')
    .setBackgroundColor('#2b5ee1')
    .setOnClickAction(cardFooter1Button2Action1);
  let cardFooter1 = CardService.newFixedFooter()
    .setPrimaryButton(cardFooter1Button1)
    .setSecondaryButton(cardFooter1Button2);

  let card = CardService.newCardBuilder()
    .addSection(bannerSection)
    .setFixedFooter(cardFooter1)
    .addSection(cardSection1)
    .addSection(cardSection2);
  card.setName('home');
  return card.build();
}
