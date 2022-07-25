function CheckConfigs() {
  if (!userProperties.getProperty('defaultResponse')) {
    userProperties.setProperty('defaultResponse', 'Bonjour,<br>Mon antivirus a été programmé pour détecter et effacer les messages contenant de l’écriture inclusive.<br>Or, vous venez de m’adresser un message qui en contient. Je n’ai donc pas pu le lire.<br>Bien sûr, si vous me le renvoyez en écriture académique, je me ferais un plaisir d’en prendre connaissance.<br>Cordialement.');
  }
  if (!userProperties.getProperty('automaticResponse')) {
    userProperties.setProperty('automaticResponse', userProperties.getProperty('defaultResponse'));
  }
  if (!userProperties.getProperty('backgroundScan')) {
    userProperties.setProperty('backgroundScan', true);
  }
  if (!userProperties.getProperty('allTimeResult')) {
    userProperties.setProperty('allTimeResult', 0);
  }
}


function Scanner() {
  try {
    if (service.hasAccess()) {
      let options = {
        method: "get",
        contentType: "application/json",
        muteHttpExceptions: true,
        headers: { Authorization: "Bearer " + service.getAccessToken() }
      };
      let unreads = GetAllUnreadMessages(options);
      Logger.log(unreads);
      if (typeof (unreads) == 'string' && unreads.startsWith('authorize')) {
        return unreads;
      }

      else {
        let checkedMessages = CheckInclusives(options, unreads);

        for (let i = 0; i < checkedMessages.length; i++) {
          let [id, sender, subject, body, matches] = checkedMessages[i];
          // Logger.log(userProperties.getProperty('labelID'));
          // Logger.log(sender);
          // Logger.log(subject);
          // Logger.log(matches);

          MoveToLabel(id);
          ReplyRefusalReply(sender, subject, body, matches);

        }
        let lastScan = Utilities.formatDate(new Date(), userProperties.getProperty('timezone'), "dd/MM/yyyy HH:mm:ss");
        let nextScan = Utilities.formatDate(new Date(Date.now() + 1000 * 60 * 10),
          userProperties.getProperty('timezone'), 'dd/MM/yyyy HH:mm:ss');
        let result = checkedMessages.length;
        let allTimeResult = +userProperties.getProperty('allTimeResult') + result;
        userProperties.setProperty('lastScan', lastScan);
        userProperties.setProperty('nextScan', nextScan);
        userProperties.setProperty('scan result', result.toString());
        userProperties.setProperty('allTimeResult', allTimeResult.toString());
      }
    }
    else {
      Logger.log('authorize ' + service.getAuthorizationUrl());
      return 'authorize ' + service.getAuthorizationUrl();
    }
  }
  catch ({ message }) {
    Logger.log('Scanner Exception: ' + message);
  }
}

function GetAllUnreadMessages(parameters) {
  try{
  var unreadMessages = [];

  let date = new Date();
  let now = date.getTime() / 1000;

  let requestURL = 'https://gmail.googleapis.com/gmail/v1/users/' + Session.getEffectiveUser() + '/messages?q=in:inbox is:unread after:' + (now - 84000).toFixed().toString();
  let newEmailsResponse = UrlFetchApp.fetch(requestURL, parameters);
  newEmailsResponse = JSON.parse(newEmailsResponse);
  if (newEmailsResponse.error) {
    let error = newEmailsResponse.error;
    if (error.code == 403 && error.message.includes('Request had insufficient authentication scopes')) {
      return 'authorize ' + service.getAuthorizationUrl();
    }
  }
  else {
    let newEmails = newEmailsResponse.messages;
    if (newEmails) {
      for (let i = 0; i < newEmails.length; i++) {
        unreadMessages.push(newEmails[i].id);
      }
    }
  }
  return unreadMessages;
  }
  catch ({ message }) {
    Logger.log('Get Unread Messages Exception: ' + message);
  }
}


function CheckInclusives(parameters, messageIDs) {
  let exceptionalEMails = userProperties.getProperty('exceptional emails');
  let emailsList = ['none'];
  if (exceptionalEMails) {
    emailsList = JSON.parse(exceptionalEMails);
  }
  var inclusivesMails = [];
  try {
  for (let i = 0; i < messageIDs.length; i++) {

    let requestURL = 'https://gmail.googleapis.com/gmail/v1/users/' + Session.getEffectiveUser() + '/messages/' + messageIDs[i];
    let getMessage = UrlFetchApp.fetch(requestURL, parameters);

    let message = JSON.parse(getMessage);
    let headers = message.payload.headers;
    let sender = subject = mimeType = messageBody = '';

    for (let i = 0; i < headers.length; i++) {
      if (headers[i].name == 'From') {
        sender = headers[i].value;
      }
      else if (headers[i].name == 'Subject') {
        subject = headers[i].value;
      }
    }
    sender = sender.replace(/^.+<([^>]+)>$/, "$1");
    Logger.log(message);
    if (!emailsList.includes(sender)) {
      if (message.payload.mimeType == 'text/html') {
        messageBody = message.payload.body.data;
        mimeType = message.payload.mimeType;
      }
      else {
        if (message.payload.parts) {
          messageBody = message.payload.parts[0].body.data;
          mimeType = message.payload.parts[0].mimeType;
        }
        else {
          messageBody = message.payload.body.data;
          mimeType = message.payload.mimeType;
        }
      }

      messageBody = Utilities.newBlob(Utilities.base64DecodeWebSafe(messageBody)).getDataAsString();
      if (mimeType == 'text/html') {
        $ = Cheerio.load(messageBody);
        messageBody = $('body').first().text();
      }

      let messageBodyWithoutUrlsandEmails = messageBody.replace(/(https?:[\/][\/]|www.)([a-z]|[A-Z]|[0-9]|[\/.]|[~\-_]|[=?&%])*/gi, '');
      messageBodyWithoutUrlsandEmails = messageBodyWithoutUrlsandEmails.replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi, '');

      let includesMidDot = CheckMidDot(messageBodyWithoutUrlsandEmails);
      if (includesMidDot) {
        inclusivesMails.push([messageIDs[i], sender, subject, messageBody, includesMidDot]);
      }
      else {
        let includesRuleTwo = CheckRuleTwo(messageBodyWithoutUrlsandEmails);
        if (includesRuleTwo) {
          inclusivesMails.push([messageIDs[i], sender, subject, messageBody, includesRuleTwo]);
        }
      }
    }
  }
  } catch (except) {
    Logger.log('check inclusives ' + except);
  }
  return inclusivesMails;
}

function CheckMidDot(message) {
  let regex = /[\w]*[a-z]+·[a-z]+[\w]*/g;
  let match = message.match(regex);
  return match;
}

function CheckRuleTwo(message) {
  var regex = /\w*[a-z]+((\(ne\)|\.e\.|-ne-|-e-|\(te\)|\(trice\)|\(ve\)|\.le\.|\(le\)|\.ne\.|\(sse\))[a-z]*\w*|(\.e|-e|\.le|\-trice)[\s])/g;    // \(e\), -le-, -le  REMOVED 

  const isIE = (currentValue) => currentValue === 'i.e.';
  let match = message.match(regex);
  if (match) {
    if (match.every(isIE)) {
      match = null;
    }
  }
  return match;
}

