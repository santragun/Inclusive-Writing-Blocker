// @ts-nocheck
var userProperties = PropertiesService.getUserProperties();
var whitespace = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
var banner = CardService.newImage()
  .setImageUrl('https://drive.google.com/uc?id=1pyEnC-m-GIfa3BrcfVpJ4wipJ8_gUmTd');
var bannerSection = CardService.newCardSection()
  .addWidget(banner);
var service = getOAuthService(['https://www.googleapis.com/auth/gmail.labels', 'https://www.googleapis.com/auth/gmail.modify']);
// service.reset();

const createGmailLabel = (labelName) => {
  try {
    if (service.hasAccess()) {
      let options = {
        method: "post",
        contentType: "application/json",
        muteHttpExceptions: true,
        headers: { Authorization: "Bearer " + service.getAccessToken() },
        payload: JSON.stringify({
          "name": labelName,
          "labelListVisibility": "labelShow",
          "messageListVisibility": "show"
        })
      };

      let labelCreateResponse = UrlFetchApp.fetch('https://gmail.googleapis.com/gmail/v1/users/' + Session.getEffectiveUser() + '/labels', options);

      let newLabel = JSON.parse(labelCreateResponse);
      if (newLabel.error) {
        if (newLabel.error.code == 409 && newLabel.error.message.includes('Label name exists or conflicts')) {
          options = {
            method: "get",
            contentType: "application/json",
            muteHttpExceptions: true,
            headers: { Authorization: "Bearer " + service.getAccessToken() },
          }
          let getAlllabels = UrlFetchApp.fetch('https://gmail.googleapis.com/gmail/v1/users/' + Session.getEffectiveUser() + '/labels', options);
          let allLabels = JSON.parse(getAlllabels);
          if (allLabels.labels) {
            for (let i = 0; i < allLabels.labels.length; i++) {
              if (allLabels.labels[i].type == 'user' && allLabels.labels[i].name.toLowerCase() == labelName.toLowerCase()) {
                userProperties.setProperty('labelName', allLabels.labels[i].name);
                userProperties.setProperty('labelID', allLabels.labels[i].id);
                newLabel = allLabels.labels[i].name;
              }
            }
          }
        }
        else if (newLabel.error.code == 403 && newLabel.error.message.includes('Request had insufficient authentication scopes')) {
          return 'authorize ' + service.getAuthorizationUrl();
        }
      }
      if (newLabel.name) {
        userProperties.setProperty('labelName', labelName);
        userProperties.setProperty('labelID', newLabel.id);
        newLabel = newLabel.name;
      }
      return newLabel;
    }
    else {
      return 'authorize ' + service.getAuthorizationUrl();
    }
  }
  catch ({ message }) {
    Logger.log('Create label Exception: ' + message);
  }
};


const MoveToLabel = (messageID) => {
  try {
    let parameters = {
      method: 'POST',
      muteHttpExceptions: true,
      headers: {
        'Authorization': "Bearer " + service.getAccessToken(),
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify({
        'addLabelIds': [
          userProperties.getProperty('labelID')
        ],
        'removeLabelIds': [
          'INBOX'
        ]
      }),
    };
    let requestURL = 'https://gmail.googleapis.com/gmail/v1/users/' + Session.getEffectiveUser() + '/messages/' + messageID + '/modify';

    let modifyResponse = UrlFetchApp.fetch(requestURL, parameters);
    Logger.log(modifyResponse);
  }
  catch ({ message }) {
    Logger.log('Move to label Exception: ' + message);
  }
};


const ReplyRefusalReply = (sender, subject, body, inclusiveWords) => {
  try {
    let automaticReplyContent = '<span style="color:red; font-size:13px">[' + inclusiveWords.join(', ') + ']</span><br><span style="font-size:15px">' + userProperties.getProperty('automaticResponse') + '</span><br><br><span style="font-size:15px"><b>Original Email:</b></span><br>' + body;

    if (sender.match(/no-reply|noreply|nonresponse|non-response/gi)) {
      sender = 'contact' + sender.substring(sender.indexOf('@'));
    }
    if (!subject.startsWith('Ecriture inclusive détectée - Mail refusé par le destinataire - ')) {
      subject = 'Ecriture inclusive détectée - Mail refusé par le destinataire - ' + subject;
      subject = subject.substring(0, 250);

      let parameters = {
        method: 'POST',
        muteHttpExceptions: true,
        headers: {
          'Authorization': "Bearer " + service.getAccessToken(),
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        payload: (JSON.stringify({
          raw: Utilities.base64EncodeWebSafe(
            convert(sender, 'me', subject, '<html><body>' + automaticReplyContent + '</body></html>')
          )
        })),

      };

      let requestURL = 'https://www.googleapis.com/gmail/v1/users/' + Session.getEffectiveUser() + '/messages/send';

      let sendResponse = UrlFetchApp.fetch(requestURL, parameters);
      Logger.log(sendResponse);
    }
  }
  catch ({ message }) {
    Logger.log('Reply Exception: ' + message);
  }
};

function convert(toEmail, fromEmail, subject, body) {
  try {
    body = Utilities.base64Encode(body, Utilities.Charset.UTF_8);
    subject = Utilities.base64Encode(subject, Utilities.Charset.UTF_8);
    const boundary = "boundaryboundary";
    const mailData = [
      "MIME-Version: 1.0",
      "To: " + toEmail,
      "From: " + fromEmail,
      "Subject: =?utf-8?B?" + subject + "?=",
      "Content-Type: multipart/alternative; boundary=" + boundary,
      "",
      "--" + boundary,
      "Content-Type: text/plain; charset=UTF-8",
      "",
      body,
      "",
      "--" + boundary,
      "Content-Type: text/html; charset=UTF-8",
      "Content-Transfer-Encoding: base64",
      "",
      body,
      "",
      "--" + boundary,
    ].join("\r\n");
    return mailData;
  }
  catch ({ message }) {
    Logger.log('Convert to mail Data format  Exception: ' + message);
  }
}

const prepareResultLabel = (count, caller) => {
  let text = '';
  if (caller == 'alltime') {
    if (count == 0) {
      text += 'Aucun email rejeté depuis l\'installation du bloqueur';
    }
    else if (count == 1) {
      text += 'Un email rejeté depuis l\'installation du bloqueur';
    }
    else if (count > 1) {
      text += count + ' emails rejetés depuis l\'installation du bloqueur';
    }
  }
  else {
    if (count == 0) {
      text += 'pas d\'email trouvé dans le dernier scan';
    }
    else if (count == 1) {
      text += 'Le dernier scan a détecté 1 e-mail et l\'a stocké dans le dossier ' + userProperties.getProperty('labelName');
    }
    else if (count > 1) {
      text += 'Le dernier scan a détecté ' + count + ' e-mails et les a stockés dans le dossier ' + userProperties.getProperty('labelName');
    }
  }

  return text;
};


