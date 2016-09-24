function XML_to_JSON(xml) { 
  var doc = XmlService.parse(xml);
  var result = {};
  var root = doc.getRootElement();
  result[root.getName()] = elementToJSON(root);
  return result;
}

function elementToJSON(element) {
  var result = {};
  // Attributes.
  element.getAttributes().forEach(function(attribute) {
    result[attribute.getName()] = attribute.getValue();
  });
  // Child elements.
  element.getChildren().forEach(function(child) {
    var key = child.getName();
    var value = elementToJSON(child);
    if (result[key]) {
      if (!(result[key] instanceof Array)) {
        result[key] = [result[key]];
      }
      result[key].push(value);
    } else {
      result[key] = value;
    }
  });
  // Text content.
  if (element.getText()) {
    result['Text'] = element.getText();
  }
  return result;
}

function getZeroDigit2(num) {
  if (num < 10) num = "0" + num;
  return num;
}

function shuffle(array) {
  var n = array.length, t, i;

  while (n) {
    i = Math.floor(Math.random() * n--);
    t = array[n];
    array[n] = array[i];
    array[i] = t;
  }

  return array;
}