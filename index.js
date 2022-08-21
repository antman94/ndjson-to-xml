const fs = require('fs');
const readline = require('readline');

var rd = readline.createInterface({
  input: fs.createReadStream('./testdata.js'),
  console: false
});

var xml = '<people> \n \t';
var openTag = '';

rd.on('line', function(line) {
  xml += convertToXml(line);
  openTag = line[0] === 'P' || 'F' ? switchTag(openTag, line[0]) : openTag;
}).on('close', function(line) {
  xml += `\n \t </person> \n </people>`;
  sendToXMLBasedSystem(xml);
});

const convertToXml = (line) => {
  var splitLine = line.split('|');
  
  var x = '';

  switch(splitLine[0]) {
    case 'P': {
      // Assuming persons name is the first line
      if(xml.length > 12) { 
        x += '\n \t </person> \n \t <person>';
      }
      else {
        x += '\n \t <person>';
      }
      x += xmlify('firstname', splitLine[1], 2);
      x += xmlify('lastname', splitLine[2], 2);

      return x;
    }
    case 'T': {
      if(openTag === 'F') {
        var mobile = xmlify('mobile', splitLine[1], 4);
        var home = splitLine[2] ? xmlify('home', splitLine[2], 4) : '';
        x += xmlify('phone', mobile + home, 3, true);
  
        return x;
      }
      var mobile = xmlify('mobile', splitLine[1], 3);
      var home = splitLine[2] ? xmlify('home', splitLine[2], 3) : '';
      x += xmlify('phone', mobile + home, 2, true);

      return x;
    }
    case 'A': {
      if(openTag === 'F') {
        var street = xmlify('street', splitLine[1], 5);
        var city = xmlify('city', splitLine[2], 5);
        var zip = splitLine[3] ? xmlify('zip', splitLine[3], 5) : '';
  
        x += xmlify('address', street + city + zip, 4, true);
  
        return x;
      }
      var street = xmlify('street', splitLine[1], 3);
      var city = xmlify('city', splitLine[2], 3);
      var zip = splitLine[3] ? xmlify('zip', splitLine[3], 3) : '';

      x += xmlify('address', street + city + zip, 2, true);

      return x;
    }
    case 'F': {
      x += '\n \t \t <family>';
      x += xmlify('name', splitLine[1], 3);
      x += xmlify('born', splitLine[2], 4);

      return x;
    }
    default:
      return '';
  }
}

/**
 * 
 * @param {*} tag - XML tag to be generated
 * @param {*} value - Content of the tag
 * @param {*} tabs - Number of indentations
 * @param {*} closeOnNewline - Should current tag be closed on the same or a new line? Default = false
 * @returns XML tag with supplied content
 */
const xmlify = (tag, value, tabs, closeOnNewline = false) => {
  var xTabs = '\t'.repeat(tabs);
  return `\n ${xTabs} <${tag}>${value}${closeOnNewline ? `\n ${xTabs}` : ''}</${tag}>`
}

const switchTag = (current, newTag) => {
  // Check if input is the first line
  if(current === '') {
    return newTag;
  }
  // Close tag F , no need for P since it will only close on new P or EoF.
  if(current === 'F') {
    xml += closeTag('family', 2);
  }
  return newTag;
}

const closeTag = (tag, tabs) => {
  return `\n ${ tabs ? '\t'.repeat(tabs) : ''}</${tag}>`;
}

const sendToXMLBasedSystem = (xml) => {
  console.log(xml);
}