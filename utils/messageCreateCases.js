const { showResultStatus } = require('./matchResultHelper')
const { showPlayerStatus } = require('./playerResultHelper')

function checkCases(message) {

    switch (message.content.trim()) {
        case "show-result":
            return showResultStatus(message);
    
        case "show-result erangle":
            return showResultStatus(message, "erangle");
        
        case "show-result miramar":
            return showResultStatus(message, "miramar");
    
        case "show-result rondo":
            return showResultStatus(message, "rondo");
    
        case "show-result T2":
            return showResultStatus(message, "rondo");
    
        case "show-result T3":
            return showResultStatus(message, "rondo");
    
        case "show-result others":
            return showResultStatus(message, "rondo");
    
        case "show-result sangwan":
            return showPlayerStatus(message, "sangwan");

        case "show-result mayank":
            return showPlayerStatus(message, "mayank");

        case "show-result sungod":
            return showPlayerStatus(message, "sungod");

        case "show-result jahir":
            return showPlayerStatus(message, "jahir");

        case "show-result contra":
            return showPlayerStatus(message, "contra");
      }
}

module.exports = { checkCases }